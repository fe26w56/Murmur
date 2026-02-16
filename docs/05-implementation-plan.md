# Murmur - MVP実装計画書

> 対象: Phase 1 MVP（01-requirements.md Section 8）
> 参照: [要件定義書](./01-requirements.md) / [設計書](./03-system-design.md) / [画面設計書](./04-screen-design.md) / [API調査レポート](./02-api-research.md) / [デザインカンプ](../screen.pen)

---

## 1. 実装方針

### 1.1 基本原則

- **垂直スライス優先**: 各スプリントで「動くもの」を作り、横断的な仕上げは最後に行う
- **リスクの早期検証**: 最も技術的リスクが高いライブ翻訳パイプラインを早期に検証する
- **依存関係の最小化**: 外部サービス（Deepgram, Gemini）との接続を早期に確立し、モック依存を避ける
- **デザイン準拠**: UI実装時は `screen.pen`（Pencilデザインカンプ）のカラー・タイポグラフィ・レイアウトを忠実に再現する。デザイントークンは `04-screen-design.md` の「デザインカンプ」セクションを参照
- **型安全**: 全コードTypeScriptで記述。API境界にはZodスキーマバリデーションを使用
- **テスト左シフト**: コアロジックのユニットテストは該当スプリント内で書く（Sprint 5に先送りしない）
- **パス規約**: 03-system-design.md に従い全ファイルは `src/` 配下に配置する（本計画では `src/` プレフィックスを省略して記載）

### 1.2 MVPスコープの確認

01-requirements.md Phase 1 から以下を実装する:

| # | 機能 | 対応するユーザーストーリー |
|---|------|------------------------|
| F1 | ユーザー認証（Google OAuth + メール） | US6 |
| F2 | プリセットテンプレートからのコンテキスト登録 | US1 |
| F3 | シンプルなコンテキスト手動登録 | US2 |
| F4 | リアルタイム音声文字起こし（Deepgram Nova-3） | US3 |
| F5 | リアルタイム翻訳表示（3段階ティア） | US3, US4 |
| F6 | スライディングウィンドウ翻訳 | US3 |
| F7 | コンテキストを翻訳プロンプトに反映 | US3 |
| F8 | Deepgramキーワードブースト | US3 |
| F9 | セッション保存・履歴閲覧 | US5 |
| F10 | 簡易プライバシーポリシー・利用規約 | — |

### 1.3 MVPスコープ外（Phase 2以降）

以下は明示的にMVPから除外する。**タスク表にこれらの項目は含まれない。** 設計書のディレクトリ構成・API一覧には記載があるが、いずれも `（Phase 2）` / `（Phase 3）` 注記付き。

**Phase 2:**
- AI自動調査（Tavily + Firecrawl）
  - コンテキスト調査APIルート（`app/api/contexts/[id]/research/route.ts`）
  - 調査進捗UI（`ResearchProgress.tsx`）
  - 調査エージェント（`lib/research-agent.ts`）
- コンテキストのプレビュー・編集UI
- Gemini Context Caching
- 音声認識の誤り補正（コンテキストベース）
- セッション履歴のテキスト検索
- 課金機能

**Phase 3:**
- PWA対応
- ダークモード手動切替
- セッションエクスポート（`app/api/sessions/[id]/export/route.ts`）

---

## 2. 前提条件・環境構築

### 2.1 必要なアカウント・APIキー

| サービス | 用途 | 取得先 | 無料枠 |
|----------|------|--------|--------|
| **Supabase** | DB, Auth, Edge Functions | supabase.com | Free plan（500MB DB, 50K MAU） |
| **Deepgram** | 音声認識 | deepgram.com | $200クレジット |
| **Google AI Studio** | Gemini 3 Flash / 2.5 Flash-Lite | aistudio.google.com | 無料枠あり |
| **Anthropic** | Claude Sonnet 4.5（premiumティア） | console.anthropic.com | $5クレジット |
| **Vercel** | ホスティング | vercel.com | Hobby plan（$0） |
| **GitHub** | ソースコード管理 | github.com | 無料 |

### 2.2 ローカル開発環境

```
Node.js 22.x LTS
pnpm 10.x（パッケージマネージャ）
Supabase CLI（ローカルDB開発）
```

### 2.3 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Deepgram
DEEPGRAM_API_KEY=

# Gemini
GEMINI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=
```

---

## 3. スプリント計画

### 全体タイムライン

```
Sprint 0  ██ プロジェクト基盤構築
Sprint 1  ████ 認証 + DB + レイアウト
Sprint 2  ████ コンテキスト管理（テンプレート + 手動登録）
Sprint 3  ██████ ライブ翻訳パイプライン（コア機能）
Sprint 4  ████ セッション管理 + 統合
Sprint 5  ████ エラーハンドリング + テスト + デプロイ
──────────────────────────────────────────────────
```

---

### Sprint 0: プロジェクト基盤構築

**目標**: 開発可能な状態を構築する

#### タスク

| # | タスク | 成果物 |
|---|--------|--------|
| 0-1 | Next.js 15 プロジェクト作成（App Router, TypeScript, Tailwind CSS 4, pnpm） | `package.json`, `next.config.ts` |
| 0-2 | shadcn/ui 初期設定 + テーマ設定（OSダーク/ライトモード追従） | `components/ui/`, `globals.css` |
| 0-3 | ESLint + Prettier 設定 | `.eslintrc.json`, `.prettierrc` |
| 0-4 | Supabaseプロジェクト作成 + CLI初期化 | `supabase/` ディレクトリ |
| 0-5 | Supabase マイグレーション作成（全テーブル + RLS + トリガー）。`context_status` ENUMは Phase 2（researching/error）に備え定義するが、MVPでは `ready` のみ使用 | `supabase/migrations/` |
| 0-6 | テンプレートシードデータ投入スクリプト（`data/disney-templates.json` から INSERT生成） | `supabase/seed.sql` |
| 0-7 | Supabase クライアント（ブラウザ/サーバー）初期化 | `lib/supabase/client.ts`, `lib/supabase/server.ts` |
| 0-8 | 型定義（Supabase CLI型自動生成 + アプリ固有型） | `types/database.ts`, `types/*.ts` |
| 0-9 | Vercelプロジェクト作成 + GitHub連携 | Vercel Dashboard |
| 0-10 | 環境変数設定（Vercel + ローカル `.env.local`） | `.env.local`, Vercel env |
| 0-11 | Zustand ストア初期設定 | `stores/*.ts` |

#### DB マイグレーション順序

```
001_create_profiles.sql        -- profiles + トリガー + RLS
002_create_contexts.sql        -- ENUMs + contexts + RLS + インデックス
003_create_sessions.sql        -- ENUM + sessions + RLS + インデックス
004_create_transcripts.sql     -- transcripts + RLS + インデックス
005_create_templates.sql       -- context_templates + RLS + インデックス
006_create_usage_function.sql  -- get_monthly_usage RPC関数
```

#### 完了条件

- [ ] `pnpm dev` でローカル開発サーバーが起動する
- [ ] `supabase start` でローカルSupabaseが起動する
- [ ] マイグレーションが正常に適用される
- [ ] シードデータ（ディズニー26テンプレート）が投入される
- [ ] Vercelにデプロイされ、空のページが表示される

---

### Sprint 1: 認証 + 基本レイアウト

**目標**: ログイン/ログアウトが動作し、認証付きページナビゲーションが完成する

#### タスク

| # | タスク | 成果物 | 関連機能 |
|---|--------|--------|----------|
| 1-1 | Supabase Auth 設定（Google OAuth プロバイダー + メール認証） | Supabase Dashboard設定 | F1 |
| 1-2 | ログインページ（Google + メールフォーム + 新規登録モード切替 + メール確認待ち状態）。デザインは `screen.pen` S1を参照 | `app/auth/login/page.tsx` | F1 |
| 1-3a | OAuth コールバック: サーバーサイドのコード交換・Cookie確立・リダイレクト | `app/auth/callback/route.ts` | F1 |
| 1-3b | OAuth コールバック: ローディング/エラー表示。デザインは `screen.pen` S1aを参照 | `app/auth/callback/page.tsx` | F1 |
| 1-4 | AuthGuard コンポーネント（未認証→リダイレクト） | `components/layout/AuthGuard.tsx` | F1 |
| 1-5 | Next.js Middleware（認証チェック） | `middleware.ts` | F1 |
| 1-6 | ルートレイアウト（SupabaseProvider, ヘッダー, BottomNav）。デザインは `screen.pen` S2のHeader/BottomNavを参照 | `app/layout.tsx` | — |
| 1-7 | ヘッダーコンポーネント（ロゴ, ユーザーメニュー, ログアウト）。デザインは `screen.pen` S2 Headerを参照 | `components/layout/Header.tsx` | — |
| 1-8 | ボトムナビゲーション（ホーム, コンテキスト, ライブ翻訳）。デザインは `screen.pen` S2 BottomNavを参照 | `components/layout/BottomNav.tsx` | — |
| 1-9 | ホーム画面（空状態 + セッション一覧プレースホルダ）。デザインは `screen.pen` S2を参照 | `app/page.tsx` | — |
| 1-10 | API Route 認証ヘルパー（Supabase JWT検証） | `lib/auth.ts` | — |
| 1-11 | 簡易プライバシーポリシー・利用規約ページ | `app/legal/page.tsx` | F10 |

#### 完了条件

- [ ] Google OAuth でログイン/ログアウトが動作する
- [ ] メールアドレス認証でログイン/ログアウトが動作する
- [ ] 新規登録モードで `signUp()` が動作し、メール確認待ち状態が表示される
- [ ] OAuthコールバック画面でローディング/エラー状態が正しく表示される
- [ ] ログイン後 `profiles` テーブルに自動レコード作成される
- [ ] 未認証ユーザーがログインページにリダイレクトされる
- [ ] ボトムナビゲーションで画面遷移できる
- [ ] Vercelにデプロイし、本番環境でOAuth動作確認

---

### Sprint 2: コンテキスト管理

**目標**: プリセットテンプレートからの選択と、手動でのコンテキスト作成が動作する

#### タスク

| # | タスク | 成果物 | 関連機能 |
|---|--------|--------|----------|
| 2-1 | テンプレート一覧API（`sort_order` 昇順ソート） | `app/api/templates/route.ts` | F2 |
| 2-2 | テンプレート詳細API（`description` 含むレスポンス） | `app/api/templates/[id]/route.ts` | F2 |
| 2-3 | テンプレートからコンテキスト作成API（テンプレートID は TEXT スラッグ。例: `"wdw-mk-haunted-mansion"`） | `app/api/templates/[id]/use/route.ts` | F2 |
| 2-4 | コンテキスト CRUD API（一覧は offset-based pagination: `limit=20&offset=0`） | `app/api/contexts/route.ts`, `[id]/route.ts` | F3 |
| 2-5 | テンプレート選択UI（パーク別分類、検索）。デザインは `screen.pen` S4テンプレートタブを参照 | `components/contexts/TemplatePicker.tsx` | F2 |
| 2-6 | コンテキスト登録画面（タブ: テンプレート / 手動作成）。デザインは `screen.pen` S4を参照 | `app/contexts/new/page.tsx` | F2, F3 |
| 2-7 | コンテキスト手動作成フォーム（種別, タイトル, URL, 自由テキスト）。デザインは `screen.pen` S4手動作成タブを参照 | `components/contexts/ContextForm.tsx` | F3 |
| 2-8 | コンテキスト一覧画面。デザインは `screen.pen` S3を参照 | `app/contexts/page.tsx` | F2, F3 |
| 2-9 | コンテキストカードコンポーネント。デザインは `screen.pen` S3のカードを参照 | `components/contexts/ContextCard.tsx` | F2, F3 |
| 2-10 | コンテキスト詳細・編集画面（「このコンテキストで翻訳開始」ボタン → `/live?contextId=[id]`）。デザインは `screen.pen` S5を参照 | `app/contexts/[id]/page.tsx` | F3 |
| 2-11 | 用語集エディタ（手動追加/編集/削除、最大20件。上限時は追加ボタン無効化+メッセージ表示）。デザインは `screen.pen` S5の用語集セクションを参照 | `components/contexts/GlossaryEditor.tsx` | F3 |
| 2-12 | コンテキスト状態管理ストア | `stores/contextStore.ts` | F2, F3 |

#### 手動コンテキスト作成のMVP仕様

MVPではAI自動調査（Phase 2）を行わない。ユーザーは以下を手動入力する:

- 種別（theme_park / museum / theater / other）
- タイトル（必須）
- URL（任意、Phase 2で自動調査に使用）
- 用語集（EN/JP ペア、手動追加）
- キーワード（Deepgramブースト用、用語集のEN側から自動抽出）

ステータスは `ready` で固定（AIリサーチがないため）。DDLの DEFAULT は `pending` だが、MVPでは INSERT 時に `status = 'ready'` を明示的に指定する。

#### 完了条件

- [ ] テンプレート一覧がパーク別に表示される
- [ ] テンプレートをタップするとコンテキストが作成される
- [ ] 手動でコンテキストを作成・編集・削除できる
- [ ] 用語集を手動で追加・編集できる
- [ ] RLSにより他ユーザーのコンテキストは表示されない
- [ ] コンテキスト一覧でoffset-basedページネーションが動作する（「もっと見る」ボタン）
- [ ] コンテキスト一覧から詳細画面に遷移できる
- [ ] コンテキスト詳細から「このコンテキストで翻訳開始」でライブ翻訳画面に遷移できる
- [ ] 用語集が最大20件まで登録でき、上限時にメッセージが表示される

---

### Sprint 3: ライブ翻訳パイプライン（コア機能）

**目標**: マイクから英語を入力し、リアルタイムで日本語字幕が表示される

> このスプリントが技術的に最も複雑で、プロダクトの核心部分。

#### タスク

| # | タスク | 成果物 | 関連機能 |
|---|--------|--------|----------|
| 3-1 | Deepgram一時トークンAPI | `app/api/deepgram-token/route.ts` | F4 |
| 3-2 | マイク入力フック（getUserMedia + MediaRecorder + Wake Lock）。`audio/webm;codecs=opus` を優先し、非対応時は `audio/mp4` にフォールバック。AudioCapture UIコンポーネント（音量インジケータ、5秒無音検知アラート） | `hooks/useAudioCapture.ts`, `components/live/AudioCapture.tsx` | F4 |
| 3-3 | Deepgram直接WebSocket接続フック（接続/再接続/キーワードブースト） | `hooks/useDeepgramLive.ts` | F4, F8 |
| 3-4 | UtteranceBufferフック（発話結合判定、15-50トークン、2秒無音タイムアウトで強制flush） | `hooks/useUtteranceBuffer.ts` | F4 |
| 3-5 | 翻訳API（POST→SSE、ティア切替、3モデル対応） | `app/api/translate/route.ts` | F5, F7 |
| 3-6 | LLM翻訳クライアント（Gemini 3 Flash / 2.5 FL / Claude Sonnet 4.5） | `lib/translation.ts` | F5 |
| 3-7 | 翻訳プロンプトテンプレート（基本 + スライディングウィンドウ）。MVPではAI自動調査がないため、Layer 1/2は省略しglossary+メタ情報から直接CompactContext（Layer 3相当）を構築する | `lib/prompts/translation.ts` | F6, F7 |
| 3-8 | SSE翻訳ストリーミングフック（sequenceNumber順序制御含む） | `hooks/useTranslation.ts` | F5, F6 |
| 3-9 | ライブセッション統合フック（上記3-2〜3-8を統合） | `hooks/useLiveSession.ts` | F4, F5 |
| 3-10 | 字幕表示コンポーネント（ストリーミング表示、フェードアウト）。デザインは `screen.pen` S6bの字幕エリアを参照 | `components/live/SubtitleDisplay.tsx` | F5 |
| 3-11 | 中間文字起こし表示（Deepgramの非確定テキスト）。デザインは `screen.pen` S6bの半透明テキストを参照 | `components/live/TranscriptLog.tsx` | F4 |
| 3-12 | ライブ翻訳操作UI（録音開始/停止, ティア切替, コンテキスト選択, 設定ドロワー, 録音中×閉じる確認ダイアログ）。デザインは `screen.pen` S6a/S6bを参照 | `components/live/LiveControls.tsx` | F4, F5 |
| 3-13 | コンテキストセレクタ（ライブ画面用）。デザインは `screen.pen` S6aのドロップダウンを参照 | `components/live/ContextSelector.tsx` | F7 |
| 3-14 | ライブ翻訳画面（全コンポーネント統合）。`/live?contextId=[id]` でコンテキスト事前選択対応。暗環境配慮: 初回利用時ダークモード推奨ガイダンス表示。デザインは `screen.pen` S6a（開始前）/ S6b（録音中ダーク）を参照 | `app/live/page.tsx` | F4-F8 |
| 3-15 | ライブ翻訳状態ストア（Zustand）。録音中のティア変更は `liveStore` で管理し、次の utterance から適用。セッションの `translation_tier` には最後に使用されたティアを記録 | `stores/liveStore.ts` | — |
| 3-16 | ユニットテスト: UtteranceBuffer（結合・タイムアウト判定） | `tests/unit/utterance-buffer.test.ts` | — |
| 3-17 | ユニットテスト: TranslationOrderBuffer（sequenceNumber順序制御） | `tests/unit/translation-order-buffer.test.ts` | — |
| 3-18 | ユニットテスト: 翻訳プロンプトビルダー（コンテキスト・ウィンドウ合成） | `tests/unit/prompt-builder.test.ts` | — |
| 3-19 | 利用時間上限のセッション中動作（残り5分で黄色警告バナー、上限到達で自動録音停止→セッション保存→トースト→ホーム遷移） | `hooks/useLiveSession.ts` 更新 | — |

#### Deepgram接続のトークンリフレッシュフロー

```
1. セッション開始 → POST /api/deepgram-token → トークン取得
2. wss://api.deepgram.com/v1/listen に接続
3. MediaRecorder → 250msごとにAudioChunk送信
4. 無音区間では KeepAlive メッセージ（JSON: {"type":"KeepAlive"}）を5秒間隔で送信
5. 9分経過（TTL 600秒の90%）→ 新トークン取得
6. 古い接続を CloseStream → 新トークンで再接続
7. 再接続中は音声をバッファリング
```

#### 翻訳APIの内部フロー

```
POST /api/translate
├── 1. Supabase JWT認証
├── 2. リクエストバリデーション（Zod）
├── 3. ティアに応じたLLMクライアント選択
│   ├── lite → Gemini 2.5 Flash-Lite
│   ├── standard → Gemini 3 Flash
│   └── premium → Claude Sonnet 4.5
├── 4. プロンプト構築（コンテキスト + 履歴 + utterance）
├── 5. LLMストリーミング呼び出し
├── 6. SSEストリーミング応答
└── 7. 完了時にtranscriptsテーブルに保存（SSE close前に完了）
```

#### 完了条件

- [ ] マイクから音声入力が取得される
- [ ] Deepgramに音声が送信され、文字起こし結果が返る
- [ ] UtteranceBufferで短い発話が適切に結合される
- [ ] 文字起こし結果が日本語に翻訳され、字幕として表示される
- [ ] 3段階ティア（lite/standard/premium）の切替が動作する
- [ ] コンテキストの用語集が翻訳プロンプトに反映される
- [ ] Deepgramキーワードブーストが動作する
- [ ] スライディングウィンドウで一貫性のある翻訳が出力される
- [ ] sequenceNumberによる翻訳表示順序が保証される
- [ ] Deepgramトークンの自動リフレッシュが動作する
- [ ] Wake Lockで画面が消灯しない
- [ ] UtteranceBuffer / TranslationOrderBuffer / プロンプトビルダーのユニットテストが通る
- [ ] `/live?contextId=[id]` でコンテキストが事前選択される
- [ ] 録音中の×閉じるで確認ダイアログが表示され、「保存して終了」でセッションが正しく保存される
- [ ] 設定ドロワーで文字サイズ・原文表示・ティアの変更が動作する
- [ ] 利用時間残り5分で黄色警告バナーが表示される
- [ ] 利用時間上限到達で自動停止→保存→ホーム遷移が動作する

---

### Sprint 4: セッション管理 + 統合

**目標**: セッションの作成・終了・履歴閲覧が動作し、全画面が連携する

#### タスク

| # | タスク | 成果物 | 関連機能 |
|---|--------|--------|----------|
| 4-1 | セッション作成API（POST /api/sessions）。`title` 未指定時はコンテキスト名 + 日時から自動生成 | `app/api/sessions/route.ts` | F9 |
| 4-2 | セッション更新API（PATCH /api/sessions/[id]） | `app/api/sessions/[id]/route.ts` | F9 |
| 4-3 | セッション一覧API + 詳細API（GET、一覧は offset-based pagination: `limit=20&offset=0`） | 同上 | F9 |
| 4-4 | セッション削除API（DELETE） | 同上 | F9 |
| 4-5 | ライブ翻訳フローにセッション統合（作成→録音→終了） | `hooks/useLiveSession.ts` 更新 | F9 |
| 4-6 | セッション中のハートビート（5分毎に ended_at 更新） | `hooks/useLiveSession.ts` 更新 | F9 |
| 4-7 | ホーム画面のセッション一覧表示 | `app/page.tsx` 更新 | F9 |
| 4-8 | セッションカードコンポーネント（日時, ティア, コンテキスト名）。デザインは `screen.pen` S2のセッションカードを参照 | `components/sessions/SessionCard.tsx` | F9 |
| 4-9 | セッション履歴詳細画面（トランスクリプト閲覧）。デザインは `screen.pen` S7を参照 | `app/sessions/[id]/page.tsx` | F9 |
| 4-10 | トランスクリプト閲覧コンポーネント（タイムスタンプ付き、原文表示トグル: `settingsStore.showOriginal` 参照）。デザインは `screen.pen` S7のトランスクリプト一覧を参照 | `components/sessions/TranscriptViewer.tsx` | F9 |
| 4-11 | 月間利用時間表示 + 残量警告。表示: 60分未満は「○分」、60分以上は「○時間○分」。残量10分未満で黄色警告、残量ゼロで赤色+無効化メッセージ | ホーム画面に組み込み | — |
| 4-12 | ユーザー設定ストア（文字サイズ, 原文表示, デフォルトティア） | `stores/settingsStore.ts` | — |

#### ライブ翻訳→セッション統合フロー

```
1. ユーザーが「新しいセッション」をタップ
2. コンテキスト選択 + ティア選択
3. POST /api/sessions → セッション作成（started_at = now()）
4. POST /api/deepgram-token → トークン取得
5. WebSocket接続 → 録音開始
6. [リアルタイム翻訳ループ]
   - Deepgram → UtteranceBuffer → POST /translate → 字幕表示
   - 翻訳完了時に transcripts テーブルにINSERT（SSE close前に完了）
   - 5分毎に PATCH /api/sessions/[id] で ended_at 更新
7. ユーザーが「停止」をタップ
8. WebSocket切断 → PATCH /api/sessions/[id]（ended_at 最終確定）
```

#### 完了条件

- [ ] ライブ翻訳画面で録音開始するとセッションが自動作成される
- [ ] 録音停止でセッションが完了状態になる
- [ ] ホーム画面に過去のセッション一覧が表示される
- [ ] セッション詳細から文字起こし・翻訳ログが閲覧できる
- [ ] セッションを削除するとトランスクリプトもCASCADE削除される
- [ ] 月間利用時間が表示される（60分未満/以上の表示切替、残量警告）
- [ ] セッション一覧でoffset-basedページネーションが動作する（「もっと見る」ボタン）
- [ ] セッション履歴詳細で原文表示トグルが動作する
- [ ] ハートビートが正常に動作する（5分毎の ended_at 更新）

---

### Sprint 5: エラーハンドリング + テスト + デプロイ

**目標**: 本番環境で安定動作する品質を達成する

#### タスク

| # | タスク | 成果物 |
|---|--------|--------|
| 5-1 | Deepgram接続断の自動再接続（最大3回、指数バックオフ） | `hooks/useDeepgramLive.ts` 更新 |
| 5-2 | 翻訳LLMのフォールバック（standard→lite→原文表示） | `lib/translation.ts` 更新 |
| 5-3 | マイク権限拒否の処理 + ガイダンスUI | `hooks/useAudioCapture.ts` 更新 |
| 5-4 | ネットワーク断検知 + 通知UI | `components/live/NetworkStatus.tsx` |
| 5-5 | Deepgramトークン429エラー時のバックオフ | `app/api/deepgram-token/route.ts` 更新 |
| 5-6 | Loading / Empty / Error 状態のUI + トースト通知統一設定（画面上部、3秒自動消去、最大3件スタック）（全画面） | 各画面更新 |
| 5-7 | APIルートのZodバリデーション追加 | 各APIルート更新 |
| 5-8 | E2Eテスト（Playwright: 認証→コンテキスト作成→ライブ翻訳→履歴閲覧） | `tests/e2e/` |
| 5-9 | 翻訳パイプラインの統合テスト（モックDeepgram→翻訳→表示） | `tests/integration/` |
| 5-10 | モバイルレスポンシブ最終調整（iOS Safari, Android Chrome） | CSS調整 |
| 5-11 | パフォーマンス計測（音声入力→字幕表示の遅延測定） | 計測ログ |
| 5-12 | Vercel本番デプロイ + ドメイン設定 | Vercel設定 |
| 5-13 | Supabase本番環境マイグレーション + シードデータ投入 | Supabase Dashboard |

#### テスト戦略

| レベル | ツール | 対象 | 実施時期 |
|--------|--------|------|----------|
| ユニット | Vitest | UtteranceBuffer, TranslationOrderBuffer, プロンプトビルダー | **Sprint 3**（該当ロジック実装と同時） |
| 統合 | Vitest + MSW | 翻訳APIルート（LLMモック）、セッションCRUD | Sprint 5 |
| E2E | Playwright | 認証→コンテキスト→ライブ翻訳→履歴の主要フロー | Sprint 5 |
| 手動 | 実機 | iOS Safari + Android Chrome でのライブ翻訳動作確認 | Sprint 3（早期検証） + Sprint 5 |

#### 完了条件

- [ ] Deepgram切断時に自動再接続し、ユーザーに「再接続中」と表示される
- [ ] 翻訳APIエラー時にフォールバックティアに切り替わる
- [ ] ネットワーク切断時にオフライン通知が表示される
- [ ] E2Eテストが通る
- [ ] iOS Safari 15+ でライブ翻訳が動作する（実機確認）
- [ ] Android Chrome 90+ でライブ翻訳が動作する（実機確認）
- [ ] 音声入力から字幕表示まで2秒以内（Deepgram + LLM TTFT）
- [ ] Vercel本番環境にデプロイ完了

---

## 4. 技術的な実装詳細

### 4.1 主要パッケージ

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.6",
    "@google/genai": "^1",
    "@anthropic-ai/sdk": "^0",
    "zustand": "^5",
    "zod": "^3",
    "tailwindcss": "^4",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^3",
    "@playwright/test": "^1",
    "msw": "^2",
    "supabase": "^2",              // Supabase CLI（ローカルDB・マイグレーション・型生成に使用）
    "eslint": "^9",
    "prettier": "latest"
  }
}
```

### 4.2 APIルート実装パターン

全APIルートで共通の認証・エラーハンドリングパターンを使用する:

```typescript
// lib/auth.ts
import { createClient } from '@/lib/supabase/server';

export async function getAuthUser(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return { supabase, user };
}
```

### 4.3 翻訳API SSE実装パターン

```typescript
// app/api/translate/route.ts
export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser(request);
  const body = translateRequestSchema.parse(await request.json());

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const llmStream = await translateWithLLM(body);

      for await (const chunk of llmStream) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`)
        );
      }

      // DB保存をcloseの前に実行（Vercel Hobbyはレスポンス完了後に即終了するため）
      await supabase.from('transcripts').insert({...});

      // 完了イベント送信後にclose
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ text: fullText, done: true, original: body.utterance, sequenceNumber: body.sequenceNumber })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 4.4 Deepgram WebSocket接続パターン

MIMEタイプとDeepgramパラメータの対応:
- `audio/webm;codecs=opus` / `audio/mp4` はいずれもコンテナ化されたフォーマットであり、Deepgramがコンテナヘッダーからコーデック情報を自動検出する。`encoding` / `sample_rate` パラメータは**指定しない**。

```typescript
// hooks/useDeepgramLive.ts
function connectToDeepgram(token: string, keywords: string[]) {
  // audio/webm, audio/mp4 はコンテナフォーマットのため encoding/sample_rate は不要
  // Deepgramがコンテナヘッダーから自動検出する
  const params = new URLSearchParams({
    model: 'nova-3',
    language: 'en',
    smart_format: 'true',
    interim_results: 'true',
    utterance_end_ms: '1000',
    vad_events: 'true',
    channels: '1',
  });

  keywords.forEach(kw => params.append('keywords', `${kw}:2`));

  const ws = new WebSocket(
    `wss://api.deepgram.com/v1/listen?${params}`,
    ['token', token]
  );

  return ws;
}
```

---

## 5. リスクと対策（実装固有）

| リスク | 影響 | 対策 |
|--------|------|------|
| Deepgram WebSocket接続がiOS Safariで不安定 | 高 | Sprint 3で早期に実機検証。問題があればAudioWorklet経由に切替 |
| MediaRecorder の `audio/webm;codecs=opus` がiOS Safariで未対応 | 高 | `MediaRecorder.isTypeSupported()` で確認。非対応の場合は `audio/mp4` にフォールバック |
| Gemini 3 Flash のSSEストリーミングがVercel Hobby 10秒制限に抵触 | 中 | CompactContext（コンテキスト部分）を500トークン以下に維持し、プロンプト全体で~1000トークン以内に収めることで2-3秒で完了するよう設計。premiumティア（Claude Sonnet 4.5）はTTFTが長めのため、プロンプト長に特に注意 |
| Deepgram一時トークンの250個/日制限 | 中 | 開発中は1日40セッション以内に制限。本番ではGrowth Plan検討 |
| Supabase Free planの接続数制限 | 低 | MVP段階では十分。ユーザー増加時にPro plan移行 |

### iOS Safari 互換性の早期検証チェックリスト

Sprint 3開始時に以下を実機で確認する:

- [ ] `navigator.mediaDevices.getUserMedia({ audio: true })` が動作する
- [ ] `MediaRecorder.isTypeSupported('audio/webm;codecs=opus')` の結果確認
- [ ] `new WebSocket('wss://...')` がバックグラウンドで維持される
- [ ] `navigator.wakeLock.request('screen')` が動作する

---

## 6. デプロイ戦略

### 6.1 環境構成

| 環境 | URL | 用途 |
|------|-----|------|
| ローカル | localhost:3000 | 開発 |
| Preview | *.vercel.app（PR毎） | PRレビュー |
| Production | murmur.vercel.app | 本番 |

### 6.2 CI/CD

```
GitHub Push / PR
    │
    ├── Vercel Auto Deploy（Preview or Production）
    │
    └── GitHub Actions（任意）
        ├── Lint + Type Check
        ├── Unit Tests（Vitest）
        └── E2E Tests（Playwright、PRのみ）
```

### 6.3 Supabaseマイグレーション運用

- ローカル開発: `supabase db reset` でクリーンリセット
- 本番デプロイ: `supabase db push` でマイグレーション適用
- シードデータ: `supabase db seed` で初回投入。以降はマイグレーションで更新

---

## 7. 実装順序の依存関係図

```
Sprint 0: 基盤
    │
    ├── Supabase (DB + Auth設定)
    │   │
    │   ├── Sprint 1: 認証 + レイアウト
    │   │   │
    │   │   ├── Sprint 2: コンテキスト管理
    │   │   │   │
    │   │   │   └── Sprint 3: ライブ翻訳パイプライン ← コア機能
    │   │   │       │
    │   │   │       └── Sprint 4: セッション管理 + 統合
    │   │   │           │
    │   │   │           └── Sprint 5: エラーハンドリング + テスト
    │   │   │
    │   │   └── Sprint 4: セッション一覧（一部並行可能）
    │   │
    │   └── Vercel (デプロイ基盤)
    │
    └── APIキー取得 (Deepgram, Gemini, Anthropic)
```

> **注意**: Sprint 3（ライブ翻訳）はSprint 2（コンテキスト管理）に依存する。
> コンテキスト未選択でもライブ翻訳自体は動作するため、Sprint 3の前半（3-1〜3-6）は
> Sprint 2と並行して進めることが可能。
