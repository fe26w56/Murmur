import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests the core utterance buffering algorithm used by useUtteranceBuffer.
 * The hook's internal logic mirrors this: accumulate final transcripts,
 * emit when token count >= 50 or after 2s silence.
 * This tests the algorithm, not the React hook lifecycle.
 */

// Same estimateTokens function as in useUtteranceBuffer.ts
function estimateTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

describe('estimateTokens (shared utility)', () => {
  it('counts space-separated words', () => {
    expect(estimateTokens('hello world')).toBe(2);
    expect(estimateTokens('one two three four five')).toBe(5);
  });

  it('handles empty string', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('   ')).toBe(0);
  });

  it('handles single word', () => {
    expect(estimateTokens('hello')).toBe(1);
  });
});

describe('Utterance buffering algorithm', () => {
  let handler: ReturnType<typeof vi.fn>;
  let buffer: string[];
  let timer: ReturnType<typeof setTimeout> | null;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = vi.fn();
    buffer = [];
    timer = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    if (timer) clearTimeout(timer);
  });

  function emitUtterance() {
    const text = buffer.join(' ').trim();
    if (text) {
      handler(text);
      buffer = [];
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function resetTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(emitUtterance, 2000);
  }

  // Mirrors useUtteranceBuffer.addText (isFinal=true only)
  function addText(text: string) {
    buffer.push(text);
    const combined = buffer.join(' ');
    const tokens = estimateTokens(combined);

    if (tokens >= 50) {
      emitUtterance();
    } else {
      resetTimer();
    }
  }

  it('emits immediately when token count reaches 50', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    addText(words);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(words);
  });

  it('emits after 2 second silence', () => {
    addText('hello world');
    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('hello world');
  });

  it('combines multiple texts before threshold', () => {
    addText('hello');
    addText('world');
    addText('test');

    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);
    expect(handler).toHaveBeenCalledWith('hello world test');
  });

  it('resets timer on new input', () => {
    addText('hello');
    vi.advanceTimersByTime(1500);
    expect(handler).not.toHaveBeenCalled();

    addText('world');
    vi.advanceTimersByTime(1500);
    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledWith('hello world');
  });

  it('flush emits immediately', () => {
    addText('pending text');
    expect(handler).not.toHaveBeenCalled();

    emitUtterance(); // flush
    expect(handler).toHaveBeenCalledWith('pending text');
  });
});
