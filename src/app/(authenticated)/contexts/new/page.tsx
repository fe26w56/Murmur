"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TemplatePicker } from "@/components/contexts/TemplatePicker";
import { ContextForm } from "@/components/contexts/ContextForm";
import type { ContextType, GlossaryEntry } from "@/types/database";

type Tab = "template" | "manual";

export default function NewContextPage() {
  const [tab, setTab] = useState<Tab>("template");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleTemplateSelect = async (templateId: string) => {
    setLoading(true);
    const { data: template } = await supabase
      .from("context_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (!template) {
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: context } = await supabase
      .from("contexts")
      .insert({
        user_id: user.id,
        type: template.type,
        title: template.title,
        researched_data: template.researched_data,
        glossary: template.glossary,
        keywords: template.keywords,
        status: "ready" as const,
      })
      .select()
      .single();

    if (context) {
      router.push(`/contexts/${context.id}`);
    }
    setLoading(false);
  };

  const handleManualCreate = async (data: {
    type: ContextType;
    title: string;
    source_url: string;
    glossary: GlossaryEntry[];
  }) => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: context } = await supabase
      .from("contexts")
      .insert({
        user_id: user.id,
        type: data.type,
        title: data.title,
        source_url: data.source_url || null,
        glossary: data.glossary,
        keywords: data.glossary.map((g) => g.en),
        status: "ready" as const,
      })
      .select()
      .single();

    if (context) {
      router.push(`/contexts/${context.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
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
        <h2 className="font-display text-lg font-bold text-text-primary">
          コンテキスト追加
        </h2>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-bg-card p-1">
        <button
          onClick={() => setTab("template")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "template"
              ? "bg-primary text-primary-foreground"
              : "text-text-secondary"
          }`}
        >
          テンプレート
        </button>
        <button
          onClick={() => setTab("manual")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "manual"
              ? "bg-primary text-primary-foreground"
              : "text-text-secondary"
          }`}
        >
          手動作成
        </button>
      </div>

      {/* Content */}
      {tab === "template" ? (
        <TemplatePicker onSelect={handleTemplateSelect} loading={loading} />
      ) : (
        <ContextForm onSubmit={handleManualCreate} loading={loading} />
      )}
    </div>
  );
}
