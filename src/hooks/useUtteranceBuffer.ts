'use client';

import { useCallback, useRef } from 'react';

interface UseUtteranceBufferReturn {
  addText: (text: string, isFinal: boolean) => void;
  onUtterance: (handler: (utterance: string) => void) => void;
  flush: () => void;
}

// Simple token count estimation (split by spaces)
function estimateTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function useUtteranceBuffer(): UseUtteranceBufferReturn {
  const bufferRef = useRef<string[]>([]);
  const handlerRef = useRef<((utterance: string) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitUtterance = useCallback(() => {
    const text = bufferRef.current.join(' ').trim();
    if (text) {
      handlerRef.current?.(text);
      bufferRef.current = [];
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(emitUtterance, 2000); // 2s silence timeout
  }, [emitUtterance]);

  const addText = useCallback(
    (text: string, isFinal: boolean) => {
      if (!isFinal) return; // Only process final transcripts

      bufferRef.current.push(text);
      const combined = bufferRef.current.join(' ');
      const tokens = estimateTokens(combined);

      if (tokens >= 50) {
        // Max token limit reached, emit
        emitUtterance();
      } else if (tokens >= 15) {
        // Min threshold reached, start/reset timer
        resetTimer();
      } else {
        // Below min threshold, wait for more
        resetTimer();
      }
    },
    [emitUtterance, resetTimer],
  );

  const flush = useCallback(() => {
    emitUtterance();
  }, [emitUtterance]);

  const onUtterance = useCallback((handler: (utterance: string) => void) => {
    handlerRef.current = handler;
  }, []);

  return { addText, onUtterance, flush };
}
