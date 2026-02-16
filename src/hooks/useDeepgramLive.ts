'use client';

import { useCallback, useRef, useState } from 'react';

interface DeepgramResult {
  text: string;
  isFinal: boolean;
}

interface UseDeepgramLiveReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  connect: (keywords?: string[]) => Promise<void>;
  disconnect: () => void;
  sendAudio: (data: Blob) => void;
  onTranscript: (handler: (result: DeepgramResult) => void) => void;
  onError: (handler: (error: string) => void) => void;
}

const MAX_RECONNECT_ATTEMPTS = 3;

export function useDeepgramLive(): UseDeepgramLiveReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef<((result: DeepgramResult) => void) | null>(null);
  const errorHandlerRef = useRef<((error: string) => void) | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keywordsRef = useRef<string[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const disconnectedManuallyRef = useRef(false);
  const reconnectingRef = useRef(false); // Prevents concurrent reconnect loops

  const getToken = async (): Promise<string> => {
    const res = await fetch('/api/deepgram-token', { method: 'POST' });
    if (res.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (!res.ok) throw new Error('Failed to get Deepgram token');
    const data = await res.json();
    return data.token;
  };

  const getTokenWithBackoff = async (): Promise<string> => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await getToken();
      } catch (err) {
        if (err instanceof Error && err.message === 'RATE_LIMIT') {
          attempts++;
          const delay = Math.pow(2, attempts) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw new Error('Token request failed after retries');
  };

  const connectWs = useCallback(async (token: string) => {
    const keywords = keywordsRef.current;
    let url = 'wss://api.deepgram.com/v1/listen?model=nova-3&language=en&punctuate=true&interim_results=true&utterance_end_ms=2000';

    if (keywords.length > 0) {
      const keywordParam = keywords.map((k) => `${encodeURIComponent(k)}:2`).join('&keyterm=');
      url += `&keyterm=${keywordParam}`;
    }

    return new Promise<WebSocket>((resolve, reject) => {
      console.log('[Murmur] Connecting to Deepgram...', url.slice(0, 80));
      const ws = new WebSocket(url, ['bearer', token]);

      ws.onopen = () => {
        console.log('[Murmur] WebSocket OPEN');
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        reconnectingRef.current = false;
        resolve(ws);
      };

      let msgCount = 0;
      ws.onmessage = (event) => {
        msgCount++;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Metadata') {
            console.log('[Murmur] Deepgram ready, model:', data.model_info?.name);
            return;
          }
          const transcript = data?.channel?.alternatives?.[0]?.transcript;
          if (msgCount <= 3 || transcript) {
            console.log('[Murmur] msg#' + msgCount, transcript ? `"${transcript.slice(0, 40)}"` : '(empty)', 'final:', data.is_final);
          }
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

      ws.onerror = (e) => {
        console.log('[Murmur] WebSocket ERROR', e);
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = (e) => {
        console.log('[Murmur] WebSocket CLOSED code=' + e.code, 'reason=' + e.reason, 'msgs=' + msgCount);
        setIsConnected(false);
        // Only trigger reconnect from onclose if not already reconnecting
        // and not manually disconnected
        if (
          !disconnectedManuallyRef.current &&
          !reconnectingRef.current &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          attemptReconnect();
        }
      };
    });
  }, []);

  const attemptReconnect = useCallback(async () => {
    // Prevent concurrent reconnect loops
    if (reconnectingRef.current) return;
    reconnectingRef.current = true;

    reconnectAttemptsRef.current++;
    setIsReconnecting(true);

    const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
    await new Promise((r) => setTimeout(r, delay));

    if (disconnectedManuallyRef.current) {
      setIsReconnecting(false);
      reconnectingRef.current = false;
      return;
    }

    try {
      const token = await getTokenWithBackoff();
      if (disconnectedManuallyRef.current) {
        setIsReconnecting(false);
        reconnectingRef.current = false;
        return;
      }
      reconnectingRef.current = false; // Allow onclose to work for the new WS
      const ws = await connectWs(token);
      wsRef.current = ws;
    } catch {
      reconnectingRef.current = false;
      if (disconnectedManuallyRef.current) {
        setIsReconnecting(false);
        return;
      }
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        attemptReconnect();
      } else {
        setIsReconnecting(false);
        errorHandlerRef.current?.('接続を復旧できませんでした。ページを再読み込みしてください。');
      }
    }
  }, [connectWs]);

  const connect = useCallback(async (keywords?: string[]) => {
    keywordsRef.current = keywords ?? [];
    disconnectedManuallyRef.current = false;
    reconnectAttemptsRef.current = 0;
    reconnectingRef.current = false;

    const token = await getTokenWithBackoff();
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
        const newToken = await getTokenWithBackoff();
        // Mark as manual close so onclose doesn't trigger reconnect
        disconnectedManuallyRef.current = true;
        ws.send(JSON.stringify({ type: 'CloseStream' }));
        ws.close();
        // Connect new WS, then reset manual flag
        const newWs = await connectWs(newToken);
        wsRef.current = newWs;
        disconnectedManuallyRef.current = false;
      } catch {
        // Reset manual flag and attempt reconnect for recovery
        disconnectedManuallyRef.current = false;
        reconnectAttemptsRef.current = 0;
        attemptReconnect();
      }
    }, 9 * 60 * 1000);
  }, [connectWs, attemptReconnect]);

  const disconnect = useCallback(() => {
    disconnectedManuallyRef.current = true;
    reconnectingRef.current = false;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      wsRef.current.close();
    }
    wsRef.current = null;
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);

  const audioChunkCountRef = useRef(0);
  const sendAudio = useCallback((data: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      audioChunkCountRef.current++;
      if (audioChunkCountRef.current <= 3) {
        console.log('[Murmur] sendAudio chunk#' + audioChunkCountRef.current, 'size=' + data.size, 'type=' + data.type);
      }
      data.arrayBuffer().then((buf) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(buf);
        }
      });
    }
  }, []);

  const onTranscript = useCallback((handler: (result: DeepgramResult) => void) => {
    handlerRef.current = handler;
  }, []);

  const onError = useCallback((handler: (error: string) => void) => {
    errorHandlerRef.current = handler;
  }, []);

  return { isConnected, isReconnecting, connect, disconnect, sendAudio, onTranscript, onError };
}
