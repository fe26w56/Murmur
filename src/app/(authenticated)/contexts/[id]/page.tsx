"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlossaryEditor } from "@/components/contexts/GlossaryEditor";
import type { Context, ContextType, GlossaryEntry } from "@/types/database";

const typeLabels: Record<string, string> = {
  theme_park: "テーマパーク",
  museum: "博物館",
  theater: "演劇",
  other: "その他",
};

export default function ContextDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const id = params.id as string;

  const [context, setContext] = useState<Context | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchContext() {
      const { data } = await supabase
        .from("contexts")
        .select("*")
        .eq("id", id)
        .single<Context>();
      if (data) {
        setContext(data);
        setTitle(data.title);
        setSourceUrl(data.source_url || "");
        setGlossary(data.glossary as GlossaryEntry[]);
      }
      setLoading(false);
    }
    fetchContext();
  }, [id, supabase, refreshKey]);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("contexts")
      .update({
        title,
        source_url: sourceUrl || null,
        glossary,
        keywords: glossary.map((g) => g.en),
      })
      .eq("id", id);
    setSaving(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!confirm("このコンテキストを削除しますか？")) return;
    await supabase.from("contexts").delete().eq("id", id);
    router.push("/contexts");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-text-muted">コンテキストが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/contexts" className="text-text-secondary">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary">
            コンテキスト詳細
          </h2>
          <p className="text-xs text-text-muted">
            {typeLabels[context.type as ContextType]}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            参考URL
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <GlossaryEditor glossary={glossary} onChange={setGlossary} />

        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="w-full rounded-xl bg-primary py-[13px] text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>

          <Link
            href={`/live?contextId=${context.id}`}
            className="flex w-full items-center justify-center rounded-xl border border-primary py-[13px] text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            このコンテキストで翻訳開始
          </Link>

          <button
            onClick={handleDelete}
            className="w-full rounded-xl py-[13px] text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
          >
            コンテキストを削除
          </button>
        </div>
      </div>
    </div>
  );
}
