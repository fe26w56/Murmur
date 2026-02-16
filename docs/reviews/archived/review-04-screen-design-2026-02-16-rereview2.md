# 04-screen-design.md 再レビュー2（2026-02-16）

対象ファイル: `docs/04-screen-design.md`
参照整合: `docs/05-implementation-plan.md`

## Findings

### 1. OAuth callback を `page.tsx` 完結とする設計は認証方式と高リスクで衝突しうる
- 重要度: Major
- 該当箇所: `docs/04-screen-design.md:58`, `docs/04-screen-design.md:265`, `docs/04-screen-design.md:957`
- 内容: S1aでは `page.tsx` 側で `exchangeCodeForSession` 実行としている一方、全体は `middleware.ts` 連携のサーバーサイド認証チェック前提。
- 影響: 実装方式次第で、callback直後に認証Cookieが確立せずリダイレクトループ/未認証扱いを誘発する可能性がある。
- 修正案:
  - 方針A（推奨）: `route.ts` でコード交換 + リダイレクト、`page.tsx` は表示専用または省略。
  - 方針B: `page.tsx` 完結を維持するなら、`middleware` とセッション永続化戦略（Cookie同期）を明記。

### 2. 「不使用 route.ts」を仕様表に残しており実装判断ノイズになる
- 重要度: Minor
- 該当箇所: `docs/04-screen-design.md:266`
- 内容: 実装責務表に `route.ts` 行を残しつつ「不使用」と記載している。
- 影響: 初見実装者が「ファイルを作るべきか」を判断しづらい。
- 修正案: 不使用なら表から削除し、注記1行に集約する。

## 結論

S1a以外は整合性が高い。callback認証方式を確定し、その方式に合わせてS1a仕様を一本化すればレビューを収束できる。

## 対応状況

- [x] 指摘1: S1aの実装方式を `route.ts`（サーバーサイドのコード交換・Cookie確立・リダイレクト）+ `page.tsx`（ローディング/エラー表示）に確定。画面一覧・S1a詳細の両方を統一。middleware連携の根拠説明も追記
- [x] 指摘2: 不使用 `route.ts` 行を削除し、正しい責務を記載した行に置換
