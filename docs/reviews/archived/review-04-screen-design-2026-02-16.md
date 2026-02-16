# 04-screen-design.md レビュー（2026-02-16）

対象ファイル: `docs/04-screen-design.md`

## 指摘事項

### 1. OAuthコールバック画面の実装責務が曖昧
- 重要度: Major
- 該当箇所: `docs/04-screen-design.md:58`, `docs/04-screen-design.md:274`, `docs/04-screen-design.md:278`
- 内容: S1aで「ローディング表示」を画面仕様として定義しつつ、「`route.ts` でリダイレクト処理」と記載している。`route.ts` はUI描画を担当しないため、責務分離が文面上で不明瞭。
- 影響: 実装時に `page.tsx` と `route.ts` の分担が曖昧になり、S1aの状態表示（認証中/失敗）が欠落するリスクがある。
- 修正案: S1aに「表示は `app/auth/callback/page.tsx`、セッション交換とリダイレクトは `app/auth/callback/route.ts`」を明記する。

## 総評

画面仕様の網羅性は高い。S1aの実装責務だけ明文化すれば、実装フェーズの迷いはほぼ解消できる。

## 対応状況

- [x] 指摘1: S1aに `page.tsx`（ローディング/エラー表示 + セッション交換・リダイレクト）と `route.ts`（不使用）の責務分離表を追記。画面一覧の概要欄も修正
