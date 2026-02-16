import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test the token estimation and buffering logic directly
// (Testing the hook logic without React)

function estimateTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

describe('estimateTokens', () => {
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

describe('UtteranceBuffer logic', () => {
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

  it('emits when token count reaches 50', () => {
    // Add 50 words
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
