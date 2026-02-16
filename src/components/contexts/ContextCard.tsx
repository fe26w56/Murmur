"use client";

import Link from "next/link";
import type { Context } from "@/types/database";

const typeLabels: Record<string, string> = {
  theme_park: "テーマパーク",
  museum: "博物館",
  theater: "演劇",
  other: "その他",
};

export function ContextCard({ context }: { context: Context }) {
  return (
    <Link
      href={`/contexts/${context.id}`}
      className="block rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-bg-input"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-text-primary">
            {context.title}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {typeLabels[context.type] || context.type}
          </p>
        </div>
        <span className="ml-2 shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          {context.status}
        </span>
      </div>
      {Array.isArray(context.glossary) &&
        (context.glossary as Array<{ en: string }>).length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            用語: {(context.glossary as Array<{ en: string }>).length}件
          </p>
        )}
    </Link>
  );
}
