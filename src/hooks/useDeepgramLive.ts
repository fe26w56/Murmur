'use client';

import { useCallback, useRef, useState } from 'react';

interface DeepgramResult {
  text: string;
  isFinal: boolean;
}

interface UseDeepgramLiveReturn {
  isConnected: boolean;
  connect: (keywords?: string[]) => Promise<void>;
  disconnect: () => void;
  sendAudio: (data: Blob) => void;
  onTranscript: (handler: (result: DeepgramResult) => void) => void;
}

export function useDeepgramLive(): UseDeepgramLiveReturn {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef<((result: DeepgramResult) => void) | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keywordsRef = useRef<string[]>([]);

  const getToken = async (): Promise<string> => {
    const res = await fetch('/api/deepgram-token', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to get Deepgram token');
    const data = await res.json();
    return data.token;
  };

  const connectWs = useCallback(async (token: string) => {
    const keywords = keywordsRef.current;
    let url = 'wss://api.deepgram.com/v1/listen?model=nova-3&language=en&punctuate=true&interim_results=true&utterance_end_ms=2000';

    if (keywords.length > 0) {
      const keywordParam = keywords.map((k) => `${encodeURIComponent(k)}:2`).join('&keywords=');
      url += `&keywords=${keywordParam}`;
    }

    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url, ['token', token]);

      ws.onopen = () => {
        setIsConnected(true);
        resolve(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transcript = data?.channel?.alternatives?.[0]?.transcript;
          if (transcript) {
            handlerRef.current?.({
              text: transcript,
              isFinal: data.is_final === true,
            });
          }
        } catch {
          // Skip invalid messages
        }
      };

      ws.onerror = () => reject(new Error('WebSocket connection failed'));
      ws.onclose = () => setIsConnected(false);
    });
  }, []);

  const connect = useCallback(async (keywords?: string[]) => {
    keywordsRef.current = keywords ?? [];
    const token = await getToken();
    const ws = await connectWs(token);
    wsRef.current = ws;

    // KeepAlive every 5s
    keepAliveRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 5000);

    // Token refresh at 9 minutes (90% of TTL)
    tokenTimerRef.current = setTimeout(async () => {
      try {
        const newToken = await getToken();
        // Close old connection
        ws.send(JSON.stringify({ type: 'CloseStream' }));
        ws.close();
        // Reconnect with new token
        const newWs = await connectWs(newToken);
        wsRef.current = newWs;
      } catch {
        // Token refresh failed, connection will eventually timeout
      }
    }, 9 * 60 * 1000);
  }, [connectWs]);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      wsRef.current.close();
    }
    wsRef.current = null;
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
    setIsConnected(false);
  }, []);

  const sendAudio = useCallback((data: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const onTranscript = useCallback((handler: (result: DeepgramResult) => void) => {
    handlerRef.current = handler;
  }, []);

  return { isConnected, connect, disconnect, sendAudio, onTranscript };
}
