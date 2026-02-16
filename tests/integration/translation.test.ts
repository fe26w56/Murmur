import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateStream } from '@/lib/translation';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock env vars
vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key');
vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key');

function createSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('translateStream', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('streams Gemini translation for lite tier', async () => {
    const sseData = [
      'data: {"candidates":[{"content":{"parts":[{"text":"こんにちは"}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":"世界"}]}}]}\n\n',
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(sseData),
    });

    const chunks: string[] = [];
    for await (const chunk of translateStream({
      utterance: 'Hello world',
      tier: 'lite',
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['こんにちは', '世界']);
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][0]).toContain('gemini-2.5-flash-lite');
  });

  it('streams Anthropic translation for premium tier', async () => {
    const sseData = [
      'data: {"type":"content_block_delta","delta":{"text":"こんにちは"}}\n\n',
      'data: {"type":"content_block_delta","delta":{"text":"世界"}}\n\n',
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(sseData),
    });

    const chunks: string[] = [];
    for await (const chunk of translateStream({
      utterance: 'Hello world',
      tier: 'premium',
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['こんにちは', '世界']);
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][1]?.headers?.['x-api-key']).toBe('test-anthropic-key');
  });

  it('falls back to lower tier on API error before any output', async () => {
    // First call (standard) fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'API Error',
    });

    // Fallback call (lite) succeeds
    const sseData = [
      'data: {"candidates":[{"content":{"parts":[{"text":"フォールバック翻訳"}]}}]}\n\n',
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createSSEStream(sseData),
    });

    const chunks: string[] = [];
    for await (const chunk of translateStream({
      utterance: 'Test fallback',
      tier: 'standard',
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['フォールバック翻訳']);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('yields raw text when all tiers fail', async () => {
    // lite tier fails (only fallback for lite is raw text)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error',
    });

    const chunks: string[] = [];
    for await (const chunk of translateStream({
      utterance: 'Raw text fallback',
      tier: 'lite',
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Raw text fallback']);
  });

  it('does not fallback if partial output was already yielded then stream errors', async () => {
    // Simulate a stream that yields one chunk then throws a read error
    let readerCallCount = 0;
    const encoder = new TextEncoder();
    const mockBody = {
      getReader: () => ({
        read: async () => {
          readerCallCount++;
          if (readerCallCount === 1) {
            return {
              done: false,
              value: encoder.encode(
                'data: {"candidates":[{"content":{"parts":[{"text":"部分"}]}}]}\n\n',
              ),
            };
          }
          // Second read throws to simulate network error mid-stream
          throw new Error('Network error mid-stream');
        },
      }),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: mockBody,
    });

    const chunks: string[] = [];
    for await (const chunk of translateStream({
      utterance: 'Partial test',
      tier: 'standard',
    })) {
      chunks.push(chunk);
    }

    // Should get the partial output, no fallback attempt
    expect(chunks).toEqual(['部分']);
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
