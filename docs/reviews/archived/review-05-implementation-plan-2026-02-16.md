# 05-implementation-plan.md レビュー（2026-02-16）

対象ファイル: `docs/05-implementation-plan.md`

## 指摘事項

### 1. Sprint 1-3 の成果物定義がUI要件と不整合
- 重要度: Major
- 該当箇所: `docs/05-implementation-plan.md:164`, `docs/05-implementation-plan.md:179`
- 内容: タスク1-3の成果物が `app/auth/callback/route.ts` のみだが、完了条件では「OAuthコールバック画面でローディング/エラー表示」を要求している。`route.ts` 単体では画面表示を提供できない。
- 影響: Sprint完了条件を満たせない計画になっており、実装後に手戻りが発生する可能性が高い。
- 修正案: 1-3の成果物に `app/auth/callback/page.tsx` を追加し、`route.ts` はセッション交換/リダイレクト専用と明記する。

### 2. 成果物パスの記載粒度が一部不統一
- 重要度: Minor
- 該当箇所: `docs/05-implementation-plan.md:127`
- 内容: `lib/supabase/client.ts` に対してサーバー側が `server.ts` とだけ記載され、同一ディレクトリ想定かが文面から読み取りづらい。
- 影響: 初期ディレクトリ作成時にファイル配置が揺れる可能性がある。
- 修正案: `lib/supabase/server.ts` に統一表記する。

## 総評

全体計画は実行可能だが、Sprint 1のOAuthコールバック成果物の定義を先に修正してから着手した方が安全。

## 対応状況

- [x] 指摘1: タスク1-3の成果物を `route.ts` → `page.tsx` に変更。タスク説明も「コールバック画面（ローディング/エラー表示 + セッション交換・リダイレクト）」に修正
- [x] 指摘2: タスク0-7の `server.ts` を `lib/supabase/server.ts` にフルパス統一
- [x] 追加対応: 本文中の `:id` 記法（タスク4-2、統合フロー説明）も `[id]` に統一
