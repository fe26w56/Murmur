# Murmur - Codex Review Guide

## プロジェクト概要

**Murmur** は、海外旅行中にディズニーのアトラクション、博物館の展示解説、演劇などの英語音声をリアルタイムで文字起こし・翻訳し、スマートフォン画面上に字幕表示するWebアプリケーション。

技術スタック: Next.js 15 (App Router) + TypeScript strict + Tailwind CSS 4 + shadcn/ui + Zustand 5 + Supabase (PostgreSQL + Auth) + Deepgram Nova-3 + Gemini/Claude LLM + Vercel Hobby

## ★ レビュー前の必須準備

**レビューを始める前に、必ず以下の2つを読むこと:**

1. **実装計画**: `docs/05-implementation-plan.md` を読んで、実装の全体設計を把握する
   - スプリント構成（Sprint 0〜5）
   - 各タスクの成果物・受け入れ条件
   - コードパターン（API Routes, Zustand Store, コンポーネント構成）
   - アーキテクチャ制約（Vercel Hobby 10秒タイムアウト、WebSocket非対応）

2. **対象issue**: PRに紐づくissue番号を確認し、`gh issue view XX` でissueの詳細仕様を把握する
   - 完了条件を満たしているか
   - 実装計画のコード例と一致しているか

**実装計画に記載された設計判断に反する変更は「問題（要修正）」として指摘すること。**

## 関連ドキュメント

| ドキュメント | 用途 |
|-------------|------|
| `docs/01-requirements.md` | 要件定義（ユーザーストーリー、MVPスコープ） |
| `docs/02-api-research.md` | Deepgram / Gemini / Claude API仕様 |
| `docs/03-system-design.md` | アーキテクチャ、データモデル、API設計 |
| `docs/04-screen-design.md` | 全画面のレイアウト・コンポーネント構成 |
| `docs/05-implementation-plan.md` | スプリント計画、タスク一覧、コードパターン |

## レビュー基準

### 必須チェック項目
1. **実装計画との整合性**: `docs/05-implementation-plan.md` の設計・パターンに準拠しているか
2. **issue完了条件**: issueに記載されたチェックリストを全て満たしているか
3. **型安全性**: TypeScript strict mode準拠。`any` 型の使用は不可
4. **既存パターンとの一貫性**: 実装済みコンポーネント・API Routes のコード構造を踏襲しているか
5. **エラーハンドリング**: API失敗時の適切なフォールバックがあるか
6. **セキュリティ**: XSS、インジェクション等のOWASP Top 10リスクがないか

### コード品質
- 不要な抽象化やover-engineeringがないか
- コンポーネントの責務が明確か（Server Component vs Client Component の使い分け）
- Zustand ストアの適切な分割

### UI/UX
- 日本語UIテキストが正しいか
- ローディング・エラー・空状態のハンドリングがあるか
- モバイルファーストのレスポンシブデザインか（Tailwind CSS）
- `screen.pen`（デザインカンプ）のレイアウトを踏襲しているか

### Next.js App Router
- Server Component / Client Component の適切な使い分け
- `'use client'` ディレクティブの正しい配置
- API Routes のレスポンス形式（NextResponse.json）

### Supabase
- RLS（Row Level Security）ポリシーが適切か
- `createClient` の使い分け（サーバー: `lib/supabase/server.ts` / クライアント: `lib/supabase/client.ts`）
- 認証フロー（OAuth callback の route.ts + middleware.ts の連携）

### ライブ翻訳パイプライン固有チェック（Sprint 3以降）
- Deepgram WebSocket 接続がクライアント側で行われているか（Vercel経由しない）
- 一時トークン方式（POST /api/deepgram/token）でAPIキーがクライアントに露出しないか
- SSE レスポンスが10秒以内に完結するか（Vercel Hobby制約）
- UtteranceBuffer のトークン結合ロジック（15-50トークン）
- sequenceNumber による字幕順序保証

## ファイル構成
```
src/
  app/
    layout.tsx              — ルートレイアウト
    page.tsx                — ホーム画面（S2）
    auth/
      login/page.tsx        — ログイン画面（S1）
      callback/
        route.ts            — OAuth コード交換 + Cookie確立
        page.tsx            — ローディング/エラー表示（S1a）
    live/page.tsx           — ライブ翻訳画面（S3）
    contexts/
      page.tsx              — コンテキスト一覧（S4）
      new/page.tsx          — コンテキスト登録（S5）
      [id]/page.tsx         — コンテキスト詳細（S6）
    sessions/[id]/page.tsx  — セッション詳細（S7）
    settings/page.tsx       — 設定画面（S8）
    api/
      deepgram/token/route.ts   — Deepgram一時トークン発行
      translate/route.ts        — 翻訳API（POST→SSE）
      templates/route.ts        — テンプレート一覧
      templates/[id]/route.ts   — テンプレート詳細
      contexts/route.ts         — コンテキストCRUD
      contexts/[id]/route.ts    — コンテキスト個別操作
      sessions/route.ts         — セッションCRUD
      sessions/[id]/route.ts    — セッション個別操作
  components/
    layout/                 — ヘッダー、BottomNav
    live/                   — ライブ翻訳関連UI
    contexts/               — コンテキスト関連UI
    sessions/               — セッション関連UI
    ui/                     — shadcn/ui コンポーネント
  stores/                   — Zustand ストア
  lib/
    supabase/
      client.ts             — クライアント用Supabaseクライアント
      server.ts             — サーバー用Supabaseクライアント
      middleware.ts          — 認証ミドルウェア用
    deepgram/               — Deepgram接続ユーティリティ
    translate/              — 翻訳パイプラインロジック
  types/                    — 型定義
supabase/
  migrations/               — DBマイグレーション
  seed.sql                  — シードデータ
data/
  disney-templates.json     — テンプレートプリセット（26件）
```

## レビュー出力フォーマット
レビュー結果は以下の形式で出力してください:

```
## レビュー結果: PR #XX

### 問題（要修正）
- [ファイル名:行番号] 問題の説明 → 修正案

### 提案（任意）
- [ファイル名:行番号] 改善の説明

### 良い点
- 良かった点の列挙

### 総合判定
✅ LGTM / ⚠️ 軽微な修正後マージ可 / ❌ 要修正
```
