"use client";

import { useState } from "react";
import type { ContextType, GlossaryEntry } from "@/types/database";
import { GlossaryEditor } from "./GlossaryEditor";

interface ContextFormProps {
  onSubmit: (data: {
    type: ContextType;
    title: string;
    source_url: string;
    glossary: GlossaryEntry[];
  }) => void;
  loading: boolean;
}

const typeOptions: { value: ContextType; label: string }[] = [
  { value: "theme_park", label: "テーマパーク" },
  { value: "museum", label: "博物館" },
  { value: "theater", label: "演劇" },
  { value: "other", label: "その他" },
];

export function ContextForm({ onSubmit, loading }: ContextFormProps) {
  const [type, setType] = useState<ContextType>("other");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, title, source_url: sourceUrl, glossary });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          種別
        </label>
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                type === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-bg-card text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          タイトル *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="例: Haunted Mansion"
          className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* URL */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          参考URL（任意）
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Glossary */}
      <GlossaryEditor glossary={glossary} onChange={setGlossary} />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full rounded-xl bg-primary py-[13px] text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "作成中..." : "コンテキストを作成"}
      </button>
    </form>
  );
}
