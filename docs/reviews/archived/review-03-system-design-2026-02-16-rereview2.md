# 03-system-design.md 再レビュー2（2026-02-16）

対象ファイル: `docs/03-system-design.md`
参照整合: `docs/04-screen-design.md`, `docs/05-implementation-plan.md`

## Findings

### 1. Phase 2/3 API がディレクトリ構成図で未注記
- 重要度: Minor
- 該当箇所: `docs/03-system-design.md:718`, `docs/03-system-design.md:732`
- 内容: API一覧表では `research`（Phase 2）と `export`（Phase 3）にフェーズ注記があるが、ディレクトリ構成図では通常機能と同列に見える。
- 影響: MVP実装時にスコープ外APIを着手対象と誤認しやすい。
- 修正案: 構成図コメントにも `（Phase 2）` / `（Phase 3）` を追記。

### 2. OAuth callback の実装方式が他ドキュメント依存で曖昧
- 重要度: Minor
- 該当箇所: `docs/03-system-design.md:708`
- 内容: `page.tsx` でセッション交換すると記載されているが、本書単体では cookie ベースSSR認証との関係が説明されていない。
- 影響: 実装者が `page.tsx` 単独方式を採用した際、認証状態の保持戦略を誤るリスクがある。
- 修正案: callback方針（`route.ts` 交換 or `page.tsx` 交換）を明示し、認証Cookieとの関係を1段落追記。

## 結論

前回指摘（API記法統一/PWA注記）は解消済み。残件は「MVPスコープの視認性」と「callback方式の説明補強」の2点。

## 対応状況

- [x] 指摘1: ディレクトリ構成図の `research/`（Phase 2）、`export/`（Phase 3）にPhase注記を追記
- [x] 指摘2: 認証フローセクションにOAuth callbackとCookieの関係を説明する段落+シーケンス図を追加。ディレクトリ構成も `route.ts`（コード交換）+ `page.tsx`（表示）の2ファイル構成に修正
