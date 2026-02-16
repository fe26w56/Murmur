'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlossaryEditor, type GlossaryEntry } from './GlossaryEditor';

type ContextType = 'theme_park' | 'museum' | 'theater' | 'other';

const contextTypes: { value: ContextType; label: string }[] = [
  { value: 'theme_park', label: 'テーマパーク' },
  { value: 'museum', label: '博物館' },
  { value: 'theater', label: '演劇' },
  { value: 'other', label: 'その他' },
];

interface ContextFormProps {
  mode: 'create' | 'edit';
  initialValues?: {
    title: string;
    context_type: ContextType;
    source_url: string | null;
    glossary: GlossaryEntry[];
  };
  contextId?: string;
  onSaved?: () => void;
}

export function ContextForm({ mode, initialValues, contextId, onSaved }: ContextFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [contextType, setContextType] = useState<ContextType>(
    initialValues?.context_type ?? 'other',
  );
  const [sourceUrl, setSourceUrl] = useState(initialValues?.source_url ?? '');
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(initialValues?.glossary ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      context_type: contextType,
      source_url: sourceUrl || null,
      glossary,
    };

    const url = mode === 'create' ? '/api/contexts' : `/api/contexts/${contextId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'エラーが発生しました');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'create') {
      const created = await res.json();
      router.push(`/contexts/${created.id}`);
    } else {
      onSaved?.();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Context type segment control */}
      <div>
        <label className="mb-2 block text-sm font-medium">コンテンツ種別</label>
        <div className="flex rounded-[22px] bg-muted p-1">
          {contextTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setContextType(ct.value)}
              className={`flex-1 rounded-[18px] py-2 text-xs font-medium transition-colors ${
                contextType === ct.value
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          タイトル *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          className="bg-input border-border h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="例: Haunted Mansion"
        />
      </div>

      {/* Source URL */}
      <div>
        <label htmlFor="sourceUrl" className="mb-1 block text-sm font-medium">
          URL（任意）
        </label>
        <input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="bg-input border-border h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://..."
        />
        <p className="mt-1 text-xs text-muted-foreground">※ Phase 2でAI自動調査に使用</p>
      </div>

      {/* Glossary */}
      <div>
        <label className="mb-2 block text-sm font-medium">用語集</label>
        <GlossaryEditor entries={glossary} onChange={setGlossary} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : mode === 'create' ? (
          '作成する'
        ) : (
          '保存する'
        )}
      </button>
    </form>
  );
}
