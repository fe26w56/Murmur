# 03-system-design.md レビュー（2026-02-16）

対象ファイル: `docs/03-system-design.md`

## 指摘事項

### 1. APIパス記法が他ドキュメントと不統一
- 重要度: Major
- 該当箇所: `docs/03-system-design.md:383`, `docs/03-system-design.md:384`, `docs/03-system-design.md:387`, `docs/03-system-design.md:390`, `docs/03-system-design.md:394`
- 内容: API一覧が `:id` 記法（例: `/api/contexts/:id`）で記載されている一方、他ドキュメントは Next.js の実装記法に合わせて `[id]` を使用している。
- 影響: 実装者がルート設計時にドキュメント間で読み替えを強いられ、仕様認識のブレが発生する。
- 修正案: 本書のAPI一覧も `[id]` 形式へ統一（例: `/api/contexts/[id]`）。

### 2. PWAがMVPスコープ内に見える記載
- 重要度: Minor
- 該当箇所: `docs/03-system-design.md:13`, `docs/03-system-design.md:82`
- 内容: アーキテクチャ図と技術スタックに PWA / `next-pwa` が通常機能として記載されているが、実装計画書では PWA は Phase 3（MVP外）。
- 影響: MVP実装時に不要なセットアップが入り、スプリント見積もりが膨らむ可能性がある。
- 修正案: 「Phase 3」注記を明示するか、MVP対象欄と将来対象欄を分離する。

## 総評

設計内容自体は実装可能な粒度だが、MVP実装時の誤読を防ぐために「記法統一」と「Phase注記の明示」を先に整えるのがよい。

## 対応状況

- [x] 指摘1: APIパス記法を `:id` → `[id]` に統一（エンドポイント一覧・本文中の全箇所）。ディレクトリ構成の `auth/callback/route.ts` も `page.tsx` に修正
- [x] 指摘2: アーキテクチャ図のPWAに「※Phase 3」注記を追加、技術スタック表に「※ Phase 3 で導入（MVP対象外）」を追記
