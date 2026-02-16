'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ContextForm } from '@/components/contexts/ContextForm';

const typeConfig: Record<string, { icon: string; label: string }> = {
  theme_park: { icon: '\u{1F3F0}', label: 'テーマパーク' },
  museum: { icon: '\u{1F3DB}\uFE0F', label: '博物館' },
  theater: { icon: '\u{1F3AD}', label: '演劇' },
  other: { icon: '\u{1F4C4}', label: 'その他' },
};

interface ContextData {
  id: string;
  title: string;
  context_type: 'theme_park' | 'museum' | 'theater' | 'other';
  source_url: string | null;
  glossary: { en: string; ja: string }[];
  created_at: string;
}

export default function ContextDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [context, setContext] = useState<ContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contexts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setContext(data);
        setIsLoading(false);
      })
      .catch(() => {
        router.replace('/contexts');
      });
  }, [id, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/contexts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.replace('/contexts');
    }
    setIsDeleting(false);
  };

  if (isLoading || !context) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const config = typeConfig[context.context_type] ?? typeConfig.other;

  return (
    <div className="mx-auto max-w-lg">
      {/* Sub-header */}
      <div className="flex items-center border-b border-border px-4 py-3">
        <Link href="/contexts" className="text-sm text-muted-foreground hover:text-foreground">
          ← 戻る
        </Link>
        <span className="flex-1 text-center text-sm font-medium">コンテキスト詳細</span>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {/* Header info */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">{context.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.icon} {config.label}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            作成日: {new Date(context.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>

        <div className="border-t border-border pt-6">
          {/* Edit form */}
          <ContextForm
            mode="edit"
            contextId={context.id}
            initialValues={{
              title: context.title,
              context_type: context.context_type,
              source_url: context.source_url,
              glossary: Array.isArray(context.glossary) ? context.glossary : [],
            }}
            onSaved={() => {
              setSaveMessage('変更を保存しました');
              setTimeout(() => setSaveMessage(null), 3000);
            }}
          />

          {saveMessage && (
            <p className="mt-3 text-center text-sm text-success">{saveMessage}</p>
          )}

          {/* Start translation with this context */}
          <Link
            href={`/live?contextId=${context.id}`}
            className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            このコンテキストで翻訳開始
          </Link>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 w-full py-3 text-center text-sm text-destructive"
          >
            このコンテキストを削除
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <h3 className="text-lg font-semibold">本当に削除しますか？</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              「{context.title}」を削除すると元に戻せません。
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
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
