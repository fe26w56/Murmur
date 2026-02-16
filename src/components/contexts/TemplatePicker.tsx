"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextTemplate } from "@/types/database";

interface TemplatePickerProps {
  onSelect: (templateId: string) => void;
  loading: boolean;
}

export function TemplatePicker({ onSelect, loading }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<ContextTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTemplates() {
      const { data } = await supabase
        .from("context_templates")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setTemplates(data);
      setFetchLoading(false);
    }
    fetchTemplates();
  }, [supabase]);

  const grouped = useMemo(() => {
    const filtered = templates.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.park.toLowerCase().includes(search.toLowerCase()),
    );
    const groups: Record<string, ContextTemplate[]> = {};
    for (const t of filtered) {
      if (!groups[t.park]) groups[t.park] = [];
      groups[t.park].push(t);
    }
    return groups;
  }, [templates, search]);

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="テンプレートを検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
      />

      {Object.entries(grouped).map(([park, items]) => (
        <div key={park}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {park}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {items.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template.id)}
                disabled={loading}
                className="rounded-lg border border-border bg-bg-card p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <p className="text-sm font-medium text-text-primary">
                  {template.title}
                </p>
                {template.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                    {template.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <p className="py-8 text-center text-sm text-text-muted">
          テンプレートが見つかりません
        </p>
      )}
    </div>
  );
}
