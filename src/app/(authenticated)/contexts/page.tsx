"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ContextCard } from "@/components/contexts/ContextCard";
import type { Context } from "@/types/database";

const PAGE_SIZE = 20;

export default function ContextsPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchContexts = useCallback(
    async (offset = 0) => {
      setLoading(true);
      const { data, count } = await supabase
        .from("contexts")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (data) {
        if (offset === 0) {
          setContexts(data);
        } else {
          setContexts((prev) => [...prev, ...data]);
        }
      }
      if (count !== null) setTotal(count);
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-text-primary">
          コンテキスト
        </h2>
      </div>

      {loading && contexts.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : contexts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center py-12 text-center">
          <p className="text-sm text-text-muted">
            コンテキストがありません。
            <br />
            テンプレートから追加するか、手動で作成しましょう。
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {contexts.map((context) => (
            <ContextCard key={context.id} context={context} />
          ))}

          {contexts.length < total && (
            <button
              onClick={() => fetchContexts(contexts.length)}
              disabled={loading}
              className="w-full rounded-lg border border-border py-3 text-sm text-text-secondary hover:bg-bg-card disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "もっと見る"}
            </button>
          )}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/contexts/new"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        <svg
          width="24"
          height="24"
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
      </Link>
    </div>
  );
}
