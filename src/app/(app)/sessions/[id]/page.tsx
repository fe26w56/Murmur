'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TranscriptViewer } from '@/components/sessions/TranscriptViewer';
import { useSettingsStore } from '@/stores/settingsStore';

interface Transcript {
  id: string;
  original_text: string;
  translated_text: string;
  timestamp_ms: number;
}

interface SessionDetail {
  id: string;
  title: string;
  translation_tier: 'lite' | 'standard' | 'premium';
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcripts: Transcript[];
}

const tierLabels = {
  lite: 'Lite',
  standard: 'Standard',
  premium: 'Premium',
};

export default function SessionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { fontSize, showOriginal, setFontSize, setShowOriginal } = useSettingsStore();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessions/${id}`);
        if (res.ok) {
          setSession(await res.json());
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = useCallback(async () => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    router.push('/');
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">セッションが見つかりません</p>
        <button onClick={() => router.push('/')} className="text-sm text-primary">
          ホームに戻る
        </button>
      </div>
    );
  }

  const date = new Date(session.started_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const time = new Date(session.started_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const duration = session.duration_seconds
    ? `${Math.round(session.duration_seconds / 60)}分`
    : '進行中';

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Back button */}
      <button onClick={() => router.back()} className="mb-4 text-sm text-muted-foreground">
        ← 戻る
      </button>

      {/* Session info */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold">{session.title}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{date}</span>
          <span>{time}</span>
          <span>{tierLabels[session.translation_tier]}</span>
          <span>{duration}</span>
        </div>
      </div>

      {/* Display settings */}
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-card p-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">文字サイズ</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showOriginal}
            onChange={(e) => setShowOriginal(e.target.checked)}
            className="rounded"
          />
          原文表示
        </label>
      </div>

      {/* Transcripts */}
      <TranscriptViewer
        transcripts={session.transcripts}
        startedAt={session.started_at}
      />

      {/* Delete button */}
      <div className="mt-8 border-t border-border pt-4">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full rounded-xl border border-destructive py-3 text-sm font-medium text-destructive"
        >
          セッションを削除
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <h3 className="text-lg font-semibold">セッションを削除しますか？</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              この操作は取り消せません。トランスクリプトも削除されます。
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-medium text-destructive-foreground"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
