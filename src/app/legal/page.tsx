'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'privacy' | 'terms';

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>('privacy');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background sticky top-0 z-50 flex h-14 items-center border-b px-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 戻る
        </Link>
        <span className="flex-1 text-center text-sm font-medium">法的情報</span>
        <div className="w-10" />
      </header>

      <div className="mx-auto w-full max-w-lg p-4">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-[22px] bg-muted p-1">
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 rounded-[18px] py-2.5 text-sm font-medium transition-colors ${
              tab === 'privacy' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            プライバシーポリシー
          </button>
          <button
            onClick={() => setTab('terms')}
            className={`flex-1 rounded-[18px] py-2.5 text-sm font-medium transition-colors ${
              tab === 'terms' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            利用規約
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-foreground">
          {tab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
        </div>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <h2 className="font-heading text-lg font-bold">プライバシーポリシー</h2>
      <p className="text-xs text-muted-foreground">最終更新日: 2026年2月16日</p>

      <h3 className="mt-6 text-sm font-semibold">1. 収集する情報</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        本アプリ「Murmur」は以下の情報を収集します:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        <li>メールアドレス（認証用）</li>
        <li>音声データ（リアルタイム処理のみ。サーバーに保存しません）</li>
        <li>文字起こし・翻訳テキスト（セッション履歴として保存）</li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold">2. 音声データの取り扱い</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        音声データはお使いのデバイスから直接音声認識サービス（Deepgram）に送信され、リアルタイムで処理されます。音声データはサーバーに保存されません。
      </p>

      <h3 className="mt-6 text-sm font-semibold">3. 第三者サービスへのデータ送信</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        本アプリは以下の第三者サービスを利用します:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        <li>Deepgram（音声認識）: 音声データをリアルタイムで送信</li>
        <li>Google Gemini / Anthropic Claude（翻訳）: 文字起こしテキストを送信</li>
        <li>Supabase（データベース・認証）: ユーザー情報とセッションデータを保存</li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold">4. データの保存と削除</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        セッション履歴（文字起こし・翻訳テキスト）はユーザーがいつでも削除できます。アカウント削除をご希望の場合は、お問い合わせください。
      </p>

      <h3 className="mt-6 text-sm font-semibold">5. お問い合わせ</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        プライバシーに関するご質問は、アプリ内のフィードバック機能からお問い合わせください。
      </p>
    </>
  );
}

function TermsOfService() {
  return (
    <>
      <h2 className="font-heading text-lg font-bold">利用規約</h2>
      <p className="text-xs text-muted-foreground">最終更新日: 2026年2月16日</p>

      <h3 className="mt-6 text-sm font-semibold">1. サービスの概要</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Murmur（以下「本サービス」）は、英語音声のリアルタイム文字起こし・翻訳を提供するWebアプリケーションです。
      </p>

      <h3 className="mt-6 text-sm font-semibold">2. 利用条件</h3>
      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        <li>本サービスの利用にはアカウント登録が必要です</li>
        <li>月間利用時間には上限があります（無料プラン: 60分/月）</li>
        <li>翻訳の正確性は保証されません。重要な場面での唯一の情報源としての使用は推奨しません</li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold">3. 禁止事項</h3>
      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        <li>不正アクセスや本サービスの妨害行為</li>
        <li>著作権で保護されたコンテンツの無断録音・翻訳の再配布</li>
        <li>商業目的での無断利用</li>
      </ul>

      <h3 className="mt-6 text-sm font-semibold">4. 免責事項</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        本サービスは「現状のまま」提供されます。翻訳の正確性、サービスの可用性、データの安全性について一切の保証はいたしません。
      </p>

      <h3 className="mt-6 text-sm font-semibold">5. 規約の変更</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        本規約は予告なく変更される場合があります。変更後も本サービスを利用した場合、変更後の規約に同意したものとみなします。
      </p>
    </>
  );
}
