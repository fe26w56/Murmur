# 05-implementation-plan.md 再レビュー2（2026-02-16）

対象ファイル: `docs/05-implementation-plan.md`
参照整合: `docs/04-screen-design.md`, `docs/03-system-design.md`

## Findings

### 1. Sprint 1 のOAuth callback実装タスクが認証基盤方針と衝突しうる
- 重要度: Major
- 該当箇所: `docs/05-implementation-plan.md:164`, `docs/05-implementation-plan.md:166`, `docs/05-implementation-plan.md:450`
- 内容: タスク1-3は `app/auth/callback/page.tsx` でセッション交換前提だが、同計画は `middleware.ts` とサーバー側 `createClient()` を軸にした認証運用を前提としている。
- 影響: callback処理を誤ると、API認証（`getAuthUser`）やページ保護が不安定になり得る。
- 修正案:
  - 方式を明文化してタスク分割する。
  - 例: `1-3a route.tsでコード交換`, `1-3b page.tsxでローディング/エラー表示`。

### 2. 主要パッケージ定義が実運用には粗い
- 重要度: Minor
- 該当箇所: `docs/05-implementation-plan.md:420`, `docs/05-implementation-plan.md:435`
- 内容:
  - `@supabase/ssr` が `^0` 指定で範囲が広く、将来の非互換差分を拾いやすい。
  - `supabase`（CLI系）の扱いが devDependency のみで、利用意図（CLIとして使う）が記述されていない。
- 影響: 初期セットアップでバージョン差異や導入手順のブレが発生しやすい。
- 修正案:
  - `@supabase/ssr` はメジャー/マイナーを明示して固定。
  - `supabase` は「CLI利用」の注記を追加するか、環境構築節にインストール手順を統合。

### 3. MVP除外機能の実装対象がタスク表で判別しづらい箇所が残る
- 重要度: Minor
- 該当箇所: `docs/05-implementation-plan.md:42`
- 内容: 除外リストには記載があるが、読者がタスク表だけを追うとPhase外との対応が見えづらい。
- 影響: Sprint着手時の作業切り分けに余計な確認コストがかかる。
- 修正案: タスク表の該当行に `（Phase 2）` / `（Phase 3）` 注記を併記する運用に統一。

## 結論

主要な残件はOAuth callback方式の仕様固定。ここを確定すると、実装計画の実行リスクが大きく下がる。

## 対応状況

- [x] 指摘1: タスク1-3を `1-3a`（route.ts: コード交換・Cookie確立）と `1-3b`（page.tsx: ローディング/エラー表示）に分割
- [x] 指摘2: `@supabase/ssr` を `^0.6` に固定。`supabase` devDependencyにCLI用途の注記を追加
- [x] 指摘3: MVPスコープ外リストをPhase 2 / Phase 3に分類し、タスク表との関係を明記する説明文を追加
