"use client";

import { useState } from "react";
import type { GlossaryEntry } from "@/types/database";

const MAX_GLOSSARY_ENTRIES = 20;

interface GlossaryEditorProps {
  glossary: GlossaryEntry[];
  onChange: (glossary: GlossaryEntry[]) => void;
}

export function GlossaryEditor({ glossary, onChange }: GlossaryEditorProps) {
  const [newEn, setNewEn] = useState("");
  const [newJa, setNewJa] = useState("");

  const isAtLimit = glossary.length >= MAX_GLOSSARY_ENTRIES;

  const handleAdd = () => {
    if (!newEn.trim() || !newJa.trim() || isAtLimit) return;
    onChange([...glossary, { en: newEn.trim(), ja: newJa.trim() }]);
    setNewEn("");
    setNewJa("");
  };

  const handleRemove = (index: number) => {
    onChange(glossary.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: "en" | "ja",
    value: string,
  ) => {
    const updated = [...glossary];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-text-secondary">
          用語集（{glossary.length}/{MAX_GLOSSARY_ENTRIES}）
        </label>
      </div>

      {/* Existing entries */}
      {glossary.length > 0 && (
        <div className="mb-3 space-y-2">
          {glossary.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={entry.en}
                onChange={(e) => handleUpdate(index, "en", e.target.value)}
                className="flex-1 rounded-lg border border-border bg-bg-input px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                placeholder="English"
              />
              <input
                type="text"
                value={entry.ja}
                onChange={(e) => handleUpdate(index, "ja", e.target.value)}
                className="flex-1 rounded-lg border border-border bg-bg-input px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                placeholder="日本語"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="shrink-0 rounded-lg p-1.5 text-text-muted hover:text-destructive"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new entry */}
      {isAtLimit ? (
        <p className="text-xs text-warning">
          用語集の上限（{MAX_GLOSSARY_ENTRIES}件）に達しています
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            placeholder="English"
            className="flex-1 rounded-lg border border-border bg-bg-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={newJa}
            onChange={(e) => setNewJa(e.target.value)}
            placeholder="日本語"
            className="flex-1 rounded-lg border border-border bg-bg-input px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newEn.trim() || !newJa.trim()}
            className="shrink-0 rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
