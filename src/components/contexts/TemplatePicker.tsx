'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  title: string;
  context_type: string;
  park_name: string | null;
  glossary: { en: string; ja: string }[];
  keywords: string[];
  sort_order: number;
}

export function TemplatePicker() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmTemplate, setConfirmTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setIsLoading(false);
      });
  }, []);

  const filtered = templates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by park
  const grouped = filtered.reduce<Record<string, Template[]>>((acc, t) => {
    const park = t.park_name ?? 'その他';
    if (!acc[park]) acc[park] = [];
    acc[park].push(t);
    return acc;
  }, {});

  const handleUseTemplate = async (template: Template) => {
    setIsCreating(true);
    const res = await fetch(`/api/templates/${template.id}/use`, { method: 'POST' });
    if (res.ok) {
      const context = await res.json();
      router.push(`/contexts/${context.id}`);
    }
    setIsCreating(false);
    setConfirmTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="テンプレートを検索..."
        className="bg-input border-border h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Template groups */}
      {Object.entries(grouped).map(([park, parkTemplates]) => (
        <div key={park}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">{park}</h3>
          <div className="grid grid-cols-2 gap-3">
            {parkTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setConfirmTemplate(t)}
                className="rounded-xl bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium leading-tight">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  用語{Array.isArray(t.glossary) ? t.glossary.length : 0}件
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          テンプレートが見つかりません
        </p>
      )}

      {/* Confirmation dialog */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <h3 className="text-lg font-semibold">「{confirmTemplate.title}」を追加</h3>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                用語集: {Array.isArray(confirmTemplate.glossary) ? confirmTemplate.glossary.length : 0}件
              </p>
              <p>キーワード: {confirmTemplate.keywords?.length ?? 0}件</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleUseTemplate(confirmTemplate)}
                disabled={isCreating}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isCreating ? '作成中...' : 'コンテキストに追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
