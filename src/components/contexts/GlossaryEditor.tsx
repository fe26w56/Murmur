'use client';

import { useState } from 'react';

export interface GlossaryEntry {
  en: string;
  ja: string;
}

interface GlossaryEditorProps {
  entries: GlossaryEntry[];
  onChange: (entries: GlossaryEntry[]) => void;
  maxEntries?: number;
}

export function GlossaryEditor({ entries, onChange, maxEntries = 20 }: GlossaryEditorProps) {
  const [en, setEn] = useState('');
  const [ja, setJa] = useState('');

  const handleAdd = () => {
    if (!en.trim() || !ja.trim()) return;
    if (entries.length >= maxEntries) return;
    onChange([...entries, { en: en.trim(), ja: ja.trim() }]);
    setEn('');
    setJa('');
  };

  const handleRemove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={en}
          onChange={(e) => setEn(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="EN"
          className="bg-input border-border h-10 flex-1 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          value={ja}
          onChange={(e) => setJa(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="JA"
          className="bg-input border-border h-10 flex-1 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!en.trim() || !ja.trim() || entries.length >= maxEntries}
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          追加
        </button>
      </div>

      {entries.length >= maxEntries && (
        <p className="text-xs text-muted-foreground">用語は最大{maxEntries}件まで登録できます</p>
      )}

      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm"
            >
              <span>
                {entry.en} → {entry.ja}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="ml-2 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
