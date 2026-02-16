'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useDeepgramLive } from '@/hooks/useDeepgramLive';
import { useUtteranceBuffer } from '@/hooks/useUtteranceBuffer';
import { useTranslation } from '@/hooks/useTranslation';
import { SubtitleDisplay } from '@/components/live/SubtitleDisplay';
import { LiveControls } from '@/components/live/LiveControls';
import { ContextSelector } from '@/components/live/ContextSelector';
import { useLiveStore } from '@/stores/liveStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface ContextData {
  id: string;
  title: string;
  context_type: string;
  glossary: { en: string; ja: string }[];
  keywords: string[];
}

export default function LivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextIdParam = searchParams.get('contextId');

  const { isRecording, currentTier, sessionId, setRecording, setSessionId, setCurrentTier, setElapsedSeconds, elapsedSeconds, reset } = useLiveStore();
  const { defaultTier } = useSettingsStore();

  const [selectedContext, setSelectedContext] = useState<ContextData | null>(null);
  const [interimText, setInterimText] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audio = useAudioCapture();
  const deepgram = useDeepgramLive();
  const buffer = useUtteranceBuffer();
  const translation = useTranslation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set initial tier from settings
  useEffect(() => {
    if (!isRecording) {
      setCurrentTier(defaultTier);
    }
  }, [defaultTier, isRecording, setCurrentTier]);

  // Load context from URL param
  useEffect(() => {
    if (contextIdParam) {
      fetch(`/api/contexts/${contextIdParam}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setSelectedContext(data);
        });
    }
  }, [contextIdParam]);

  // Wire deepgram transcripts to utterance buffer
  useEffect(() => {
    deepgram.onTranscript((result) => {
      if (result.isFinal) {
        setInterimText('');
        buffer.addText(result.text, true);
      } else {
        setInterimText(result.text);
      }
    });
  }, [deepgram, buffer]);

  // Wire utterance buffer to translation
  useEffect(() => {
    buffer.onUtterance((utterance) => {
      if (!sessionId) return;
      translation.translate({
        utterance,
        tier: currentTier,
        sessionId,
        context: selectedContext
          ? {
              title: selectedContext.title,
              type: selectedContext.context_type,
              glossary: selectedContext.glossary,
            }
          : undefined,
      });
    });
  }, [buffer, translation, sessionId, currentTier, selectedContext]);

  const handleStart = useCallback(async () => {
    setError(null);
    try {
      // Create session
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextId: selectedContext?.id,
          translationTier: currentTier,
        }),
      });

      if (!res.ok) throw new Error('Failed to create session');
      const session = await res.json();
      setSessionId(session.id);

      // Connect to Deepgram
      await deepgram.connect(selectedContext?.keywords);

      // Start audio capture
      await audio.startCapture((data) => deepgram.sendAudio(data));

      setRecording(true);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev: number) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '開始に失敗しました');
    }
  }, [selectedContext, currentTier, deepgram, audio, setRecording, setSessionId, setElapsedSeconds]);

  const handleStop = useCallback(async () => {
    // Stop audio and deepgram
    audio.stopCapture();
    deepgram.disconnect();
    buffer.flush();

    if (timerRef.current) clearInterval(timerRef.current);

    // End session
    if (sessionId) {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endedAt: new Date().toISOString() }),
      });
    }

    reset();
    translation.clearTranslations();
    router.push('/');
  }, [audio, deepgram, buffer, sessionId, reset, translation, router]);

  const handleCloseRequest = () => {
    if (isRecording) {
      setShowCloseConfirm(true);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <button onClick={handleCloseRequest} className="text-sm text-muted-foreground">
          {isRecording ? '× 閉じる' : '← 戻る'}
        </button>
        <span className="text-sm font-medium">
          {isRecording
            ? selectedContext?.title ?? 'フリーセッション'
            : 'ライブ翻訳'}
        </span>
        <div className="w-10" />
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {!isRecording && (
          <div className="space-y-4 p-4">
            {/* Context selector */}
            <div>
              <label className="mb-2 block text-sm font-medium">コンテキスト</label>
              <ContextSelector
                selectedId={selectedContext?.id ?? null}
                onChange={setSelectedContext}
              />
            </div>
          </div>
        )}

        {/* Subtitle display area */}
        {isRecording && (
          <SubtitleDisplay
            translations={translation.translations}
            interimText={interimText}
          />
        )}

        {/* Silence warning */}
        {audio.silenceWarning && isRecording && (
          <div className="mx-4 mb-2 rounded-lg bg-warning/20 p-3 text-center text-sm text-warning">
            音声が検出されません。マイクを確認してください
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-destructive/20 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Controls */}
        <LiveControls
          isRecording={isRecording}
          tier={currentTier}
          elapsedSeconds={elapsedSeconds}
          volume={audio.volume}
          onStart={handleStart}
          onStop={handleStop}
          onTierChange={setCurrentTier}
        />
      </div>

      {/* Close confirmation dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <h3 className="text-lg font-semibold">セッションを終了しますか？</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              録音中のデータは保存されます。
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  handleStop();
                }}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground"
              >
                保存して終了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
