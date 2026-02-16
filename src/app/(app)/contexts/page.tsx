'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ContextCard } from '@/components/contexts/ContextCard';

interface Context {
  id: string;
  title: string;
  context_type: 'theme_park' | 'museum' | 'theater' | 'other';
  glossary: { en: string; ja: string }[];
  template_id: string | null;
}

export default function ContextsPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/contexts?limit=${limit}&offset=${offset}`)
      .then((res) => res.json())
      .then((result) => {
        if (offset === 0) {
          setContexts(result.data ?? []);
        } else {
          setContexts((prev) => [...prev, ...(result.data ?? [])]);
        }
        setTotal(result.total ?? 0);
        setIsLoading(false);
      });
  }, [offset]);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-4 text-lg font-semibold">マイコンテキスト</h1>

      {isLoading && contexts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : contexts.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/50"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          <p className="mt-4 text-sm text-muted-foreground">
            コンテキストがありません。
            <br />
            コンテキストを作成して、翻訳精度を向上させましょう。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contexts.map((ctx) => (
            <ContextCard key={ctx.id} {...ctx} />
          ))}
          {contexts.length < total && (
            <button
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={isLoading}
              className="w-full py-3 text-center text-sm text-primary"
            >
              {isLoading ? '読み込み中...' : 'もっと見る'}
            </button>
          )}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/contexts/new"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="新規作成"
      >
        +
      </Link>
    </div>
  );
}
