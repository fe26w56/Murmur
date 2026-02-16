'use client';

import { useEffect, useState } from 'react';

interface Context {
  id: string;
  title: string;
  context_type: string;
  glossary: { en: string; ja: string }[];
  keywords: string[];
}

interface ContextSelectorProps {
  selectedId: string | null;
  onChange: (context: Context | null) => void;
  disabled?: boolean;
}

export function ContextSelector({ selectedId, onChange, disabled }: ContextSelectorProps) {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/contexts?limit=50')
      .then((res) => res.json())
      .then((result) => setContexts(result.data ?? []));
  }, []);

  const selected = contexts.find((c) => c.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-input px-4 text-sm disabled:opacity-50"
      >
        <span>{selected?.title ?? 'フリーセッション（コンテキストなし）'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-accent"
            >
              フリーセッション（コンテキストなし）
            </button>
            {contexts.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => {
                  onChange(ctx);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-accent ${
                  ctx.id === selectedId ? 'bg-accent' : ''
                }`}
              >
                {ctx.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
