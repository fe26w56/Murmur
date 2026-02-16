---
name: review-pr
description: PRのdiffを読んでレビューし、結果をPRコメントに投稿する
argument-hint: "[PR番号]"
user-invocable: true
allowed-tools: Bash(gh *), Read, Grep, Glob
---

# PR Review

PR #$0 をレビューし、結果をPRコメントに投稿します。

## レビュー手順

### 1. PR情報の取得
以下を並列で実行:
- `gh pr view $0 --json title,body,files,additions,deletions` でPR概要を取得
- `gh pr diff $0` で差分を取得

### 2. 関連コードの調査
diffで変更されたファイルに加え、以下を確認する:
- 変更ファイルがimportしている依存先の型・関数
- 既存の類似パターン（実装済みコンポーネント・API Routes）との一貫性
- `src/types/` 配下の関連する型定義
- `src/lib/supabase/` のクライアント設定
- `docs/05-implementation-plan.md` のコードパターン

### 3. レビュー基準

#### 必須チェック項目
1. **型安全性**: TypeScript strict mode準拠。`any` 型の使用は不可
2. **既存パターンとの一貫性**: 実装済みコンポーネント・API Routes のコード構造を踏襲しているか
3. **エラーハンドリング**: API失敗時の適切なフォールバックがあるか
4. **セキュリティ**: XSS、インジェクション等のOWASP Top 10リスクがないか

#### コード品質
- 不要な抽象化やover-engineeringがないか
- コンポーネントの責務が明確か（Server Component vs Client Component）
- Zustand ストアの適切な分割

#### UI/UX（UIコンポーネントの場合）
- 日本語テキストが正しいか
- ローディング・エラー・空状態のハンドリングがあるか
- モバイルファーストのレスポンシブデザインか（Tailwind CSS）

#### Next.js App Router
- Server Component / Client Component の適切な使い分け
- API Routes のレスポンス形式（NextResponse.json）
- Zod によるリクエストバリデーション

#### Supabase（DB操作の場合）
- RLS ポリシーとの整合性
- `createClient` の使い分け（サーバー / クライアント）

#### ライブ翻訳（Sprint 3以降）
- Deepgram WebSocket がクライアント側直接接続か
- SSE が10秒以内に完結するか（Vercel Hobby制約）
- sequenceNumber による字幕順序保証

### 4. レビュー結果の出力

以下のフォーマットでレビュー結果を出力する:

```
## レビュー結果: PR #$0

### 問題（要修正）
- [ファイル名:行番号] 問題の説明 → 修正案

### 提案（任意）
- [ファイル名:行番号] 改善の説明

### 良い点
- 良かった点の列挙

### 総合判定
✅ LGTM / ⚠️ 軽微な修正後マージ可 / ❌ 要修正
```

### 5. PRコメントへの投稿
レビュー結果を `gh pr comment $0` でPRコメントに投稿する。
