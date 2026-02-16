'use client';

import { useCallback, useRef, useState } from 'react';

export interface TranslationEntry {
  sequenceNumber: number;
  original: string;
  translated: string;
  isStreaming: boolean;
}

interface TranslateParams {
  utterance: string;
  context?: {
    title?: string;
    type?: string;
    description?: string;
    glossary?: { en: string; ja: string }[];
  };
  tier: 'lite' | 'standard' | 'premium';
  sessionId: string;
}

interface UseTranslationReturn {
  translations: TranslationEntry[];
  translate: (params: TranslateParams) => void;
  clearTranslations: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const seqRef = useRef(0);
  const historyRef = useRef<{ original: string; translated: string }[]>([]);

  const translate = useCallback((params: TranslateParams) => {
    const sequenceNumber = seqRef.current++;

    // Add placeholder entry
    setTranslations((prev) => [
      ...prev,
      { sequenceNumber, original: params.utterance, translated: '', isStreaming: true },
    ]);

    // Build history (sliding window of last 3)
    const history = historyRef.current.slice(-3);

    // Start SSE request
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        sequenceNumber,
        history,
      }),
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        setTranslations((prev) =>
          prev.map((t) =>
            t.sequenceNumber === sequenceNumber
              ? { ...t, translated: '(翻訳エラー)', isStreaming: false }
              : t,
          ),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              // Final message
              setTranslations((prev) =>
                prev.map((t) =>
                  t.sequenceNumber === sequenceNumber
                    ? { ...t, translated: data.text, isStreaming: false }
                    : t,
                ),
              );
              // Add to history
              historyRef.current.push({
                original: params.utterance,
                translated: data.text,
              });
            } else if (data.text) {
              // Streaming chunk - append
              setTranslations((prev) =>
                prev.map((t) =>
                  t.sequenceNumber === sequenceNumber
                    ? { ...t, translated: t.translated + data.text }
                    : t,
                ),
              );
            }
          } catch {
            // Skip malformed data
          }
        }
      }
    });
  }, []);

  const clearTranslations = useCallback(() => {
    setTranslations([]);
    seqRef.current = 0;
    historyRef.current = [];
  }, []);

  return { translations, translate, clearTranslations };
}
