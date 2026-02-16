"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LegalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "terms" ? "terms" : "privacy";
  const [tab, setTab] = useState<"privacy" | "terms">(initialTab);

  return (
    <div className="min-h-screen bg-bg-page">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-bg-page px-4">
        <Link href="/auth/login" className="text-text-secondary">
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
        <h1 className="ml-3 font-display text-base font-bold text-text-primary">
          法的情報
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("privacy")}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            tab === "privacy"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted"
          }`}
        >
          プライバシーポリシー
        </button>
        <button
          onClick={() => setTab("terms")}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            tab === "terms"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted"
          }`}
        >
          利用規約
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {tab === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
      <h2 className="font-display text-base font-bold text-text-primary">
        プライバシーポリシー
      </h2>
      <p>最終更新日: 2026年2月16日</p>

      <h3 className="font-semibold text-text-primary">1. 収集する情報</h3>
      <p>
        本サービスでは以下の情報を収集します：
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>メールアドレス（アカウント作成時）</li>
        <li>Google アカウント情報（OAuth ログイン時）</li>
        <li>翻訳セッションの文字起こし・翻訳テキスト</li>
        <li>利用時間の記録</li>
      </ul>

      <h3 className="font-semibold text-text-primary">2. 音声データについて</h3>
      <p>
        音声データはリアルタイムストリーミング処理のみに使用され、サーバーへの保存は一切行いません。
        音声データは端末から直接 Deepgram（音声認識サービス）に送信されます。
      </p>

      <h3 className="font-semibold text-text-primary">3. データの利用目的</h3>
      <ul className="ml-4 list-disc space-y-1">
        <li>リアルタイム翻訳サービスの提供</li>
        <li>翻訳履歴の保存・閲覧</li>
        <li>利用時間の管理</li>
      </ul>

      <h3 className="font-semibold text-text-primary">4. 第三者サービス</h3>
      <p>
        本サービスは以下の第三者サービスを利用しています：
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>Supabase（認証・データベース）</li>
        <li>Deepgram（音声認識）</li>
        <li>Google AI / Anthropic（翻訳）</li>
        <li>Vercel（ホスティング）</li>
      </ul>

      <h3 className="font-semibold text-text-primary">5. データの削除</h3>
      <p>
        アカウントを削除すると、関連するすべてのデータ（プロフィール、コンテキスト、セッション、翻訳履歴）が完全に削除されます。
      </p>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
      <h2 className="font-display text-base font-bold text-text-primary">
        利用規約
      </h2>
      <p>最終更新日: 2026年2月16日</p>

      <h3 className="font-semibold text-text-primary">1. サービス概要</h3>
      <p>
        Murmur（以下「本サービス」）は、英語音声をリアルタイムで文字起こし・翻訳し、日本語字幕として表示するWebアプリケーションです。
      </p>

      <h3 className="font-semibold text-text-primary">2. 利用条件</h3>
      <ul className="ml-4 list-disc space-y-1">
        <li>無料プランでは月間60分までご利用いただけます</li>
        <li>翻訳の精度は保証しません</li>
        <li>商用利用は禁止します</li>
      </ul>

      <h3 className="font-semibold text-text-primary">3. 禁止事項</h3>
      <ul className="ml-4 list-disc space-y-1">
        <li>著作権のあるコンテンツの無断複製・配布</li>
        <li>サービスの不正利用やリバースエンジニアリング</li>
        <li>他のユーザーへの迷惑行為</li>
      </ul>

      <h3 className="font-semibold text-text-primary">4. 免責事項</h3>
      <p>
        本サービスは「現状有姿」で提供され、翻訳の正確性、サービスの中断なき運用について保証しません。
        本サービスの利用によって生じたいかなる損害についても責任を負いません。
      </p>

      <h3 className="font-semibold text-text-primary">5. 変更</h3>
      <p>
        本規約は予告なく変更される場合があります。重要な変更がある場合は、サービス内で通知します。
      </p>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LegalContent />
    </Suspense>
  );
}
