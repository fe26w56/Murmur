# Murmur - 開発ルール

## プロジェクト概要

**Murmur** は、海外旅行中にディズニーのアトラクション、博物館の展示解説、演劇などの英語音声をリアルタイムで文字起こし・翻訳し、スマートフォン画面上に字幕表示するWebアプリケーション。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript (strict mode) |
| UI | Tailwind CSS 4 + shadcn/ui |
| 状態管理 | Zustand 5 |
| DB / 認証 | Supabase (PostgreSQL + Auth + Edge Functions) |
| 音声認識 | Deepgram Nova-3 (クライアント→WebSocket直接接続) |
| 翻訳 LLM | Gemini 2.5 Flash-Lite / Gemini 3 Flash / Claude Sonnet 4.5 |
| ホスティング | Vercel Hobby ($0) |
| パッケージマネージャ | pnpm |
| ランタイム | Node.js 22.x LTS |

## ドキュメント

実装前に必ず以下を参照すること:

| ドキュメント | 内容 |
|-------------|------|
| `docs/01-requirements.md` | 要件定義書（ユーザーストーリー、コア機能、MVPスコープ） |
| `docs/02-api-research.md` | API調査レポート（Deepgram, Gemini, Claude等の仕様） |
| `docs/03-system-design.md` | 設計書（アーキテクチャ、データモデル、API設計） |
| `docs/04-screen-design.md` | 画面設計書（全画面のレイアウト・コンポーネント構成） |
| `docs/05-implementation-plan.md` | 実装計画書（スプリント計画、タスク一覧、コードパターン） |
| `screen.pen` | デザインカンプ（Pencilファイル。全画面S1〜S8のビジュアルデザイン） |
| `data/disney-templates.json` | ディズニーアトラクション26件のプリセットテンプレートデータ |

## ブランチ戦略

```
main ← develop ← feature/sprint-X-task-description
```

- **main**: 本番デプロイ用。develop からのマージのみ
- **develop**: 開発統合ブランチ。全 feature PR のマージ先
- **feature/sprint-X-***: 各タスク用の作業ブランチ。develop から切る

## Git Worktree 構成（2トラック並列開発）

```
Murmur/            → main（本番 + ドキュメント管理）
Murmur-track-a/    → Track A: Backend/API 作業用
Murmur-track-b/    → Track B: Frontend/UI 作業用
```

### ルール

- **feature ブランチは各 worktree 内で切る**。他の worktree のブランチを checkout しない
- **develop へのマージ**は `gh pr merge` で行う（worktree 間の衝突を避ける）
- マージ後は作業中の worktree で `git fetch origin && git rebase origin/develop` して最新化
- **ファイル編集は必ず対応する worktree 内で行う**。Track A の作業を Track B ディレクトリで行わない

## 開発フロー

### 1. ブランチ作成（worktree 内で実行）
```bash
# Track A の場合（Murmur-track-a/ 内で実行）
git fetch origin develop
git rebase origin/develop
git checkout -b feature/sprint-X-task-description
```

### 2. 実装 → コミット → PR作成
- Conventional Commits 形式でコミット（例: `feat: add deepgram token API`）
- PR は **develop** ブランチに対して作成する
- PR本文に `Closes #XX` を記載（Issue 自動クローズ）
- PR本文に対応するスプリントとタスク番号を記載

### 3. Codex CLIでレビュー（自動）
**PR作成後、確認なしで即座に `/codex-review PR番号` を実行すること。** ユーザーに「レビューしますか？」と聞かない。

### 4. レビュー指摘の修正
- 指摘をもとに**同じブランチで修正コミット**を追加
- push後、**必ず再度 Codex レビューを実行**する
- **LGTM が出るまでマージしない**

### 5. マージ → 次のタスクへ
```bash
# PR をマージ
gh pr merge PR番号 --merge

# worktree を develop ベースに戻す
git checkout track-a/workspace   # または track-b/workspace
git fetch origin develop
git rebase origin/develop

# 次の feature ブランチを切る
git checkout -b feature/sprint-X-next-task
```

### 6. develop → main のマージ（リリース時）
```bash
gh pr create --base main --head develop --title "release: Sprint X"
```

## スプリント計画

| Sprint | 内容 | 主な成果物 |
|--------|------|-----------|
| 0 | プロジェクト基盤構築 | Next.js初期化, Supabaseマイグレーション, シードデータ |
| 1 | 認証 + 基本レイアウト | ログイン/ログアウト, AuthGuard, BottomNav |
| 2 | コンテキスト管理 | テンプレート選択, 手動作成, 用語集エディタ |
| 3 | ライブ翻訳パイプライン | Deepgram接続, 翻訳API(SSE), 字幕表示 |
| 4 | セッション管理 + 統合 | セッションCRUD, 履歴閲覧, 全画面連携 |
| 5 | エラーハンドリング + テスト + デプロイ | E2Eテスト, 本番デプロイ |

詳細は `docs/05-implementation-plan.md` を参照。

## Issue ワークフロー

- GitHub Issues で全タスクを管理。各 Issue には `sprint:X` ラベルと `track:backend` / `track:frontend` ラベルを付与
- 1つの Issue = 1つの feature ブランチ + 1つの PR
- PR 本文には必ず `Closes #XX` を記載し、マージ時に Issue を自動クローズする
- Issue 間の依存関係は Issue 本文の「依存関係」セクションに記載

## コーディング規約

- **言語**: TypeScript strict mode。`any` の使用禁止
- **UI**: Tailwind CSS + shadcn/ui コンポーネント
- **状態管理**: Zustand ストア（`stores/` 配下）
- **API**: Next.js API Routes（`app/api/` 配下）。バリデーションには Zod を使用
- **テキスト**: 日本語 UI テキスト、コード・コメントは英語
- **パス規約**: 全ファイルは `src/` 配下に配置（ドキュメントでは `src/` を省略して記載）
- **コンポーネント構成**: 画面ごとに `components/` 配下にサブディレクトリ（`live/`, `contexts/`, `sessions/`, `layout/`）

## アーキテクチャ上の重要ポイント

### Vercel Hobby の制約回避
- WebSocket 非対応 → クライアントから Deepgram に直接 WebSocket 接続（一時トークン方式）
- 関数タイムアウト 10秒 → 翻訳は個別 POST → SSE（各2-3秒で完結）
- 音声データは Vercel を経由しない（帯域節約）

### 翻訳パイプライン
```
マイク → MediaRecorder (250ms chunks)
  → Deepgram WebSocket (直接接続、Nova-3)
  → UtteranceBuffer (15-50トークンで結合)
  → POST /api/translate (SSE)
  → LLM翻訳 (ティアに応じてモデル選択)
  → 字幕表示 (sequenceNumber で順序保証)
```

### 3段階翻訳ティア
| ティア | モデル | 用途 |
|--------|--------|------|
| lite | Gemini 2.5 Flash-Lite | 案内板・簡単な説明 |
| standard | Gemini 3 Flash | アトラクション・一般翻訳 |
| premium | Claude Sonnet 4.5 | 演劇・文学的翻訳 |
