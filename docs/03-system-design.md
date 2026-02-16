# Murmur - 設計書

## 1. システムアーキテクチャ

### 1.1 全体構成図

> **設計方針**: Vercel Hobby（無料）の制約（WebSocket非対応、関数タイムアウト10秒）を回避するため、
> 音声認識はクライアントからDeepgramに直接WebSocket接続し、翻訳は個別のHTTPリクエスト（POST→SSE）で処理する。
> これにより月額ホスティングコスト $0 を実現。

```
┌──────────────────────────────────────────────────────────────────────┐
│                    クライアント（ブラウザ / PWA）                          │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐   │
│  │ マイク入力  │  │ UtteranceBuffer│ │ SlidingWindow │  │ セッション  │   │
│  │(getUserMedia)│ │ (発話結合)     │  │ (翻訳履歴)    │  │  履歴画面  │   │
│  └─────┬────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘   │
│        │              │                  │                │          │
│        │ WebSocket    │ POST+SSE         │                │ REST     │
│        │ (直接接続)    │ (utterance毎)    │                │          │
└────────┼──────────────┼──────────────────┼────────────────┼──────────┘
         │              │                  │                │
         │         ─────┼──────────────────┼────────────────┼──── HTTPS
         │              │                  │                │
         │      ┌───────▼──────────────────▼────────────────▼──────────┐
         │      │            Next.js API Routes (Vercel Hobby, 無料)    │
         │      │                                                       │
         │      │  ┌──────────────────┐  ┌──────────────────────┐      │
         │      │  │/api/deepgram-token│  │ /api/contexts         │      │
         │      │  │ POST(一時トークン) │  │ /api/sessions         │      │
         │      │  └──────────────────┘  │ /api/templates        │      │
         │      │                        └──────────┬───────────┘      │
         │      │  ┌──────────────┐                 │                  │
         │      │  │/api/translate │                 │                  │
         │      │  │ POST→SSE    │                 │                  │
         │      │  └──────┬──────┘                 │                  │
         │      └─────────┼────────────────────────┼──────────────────┘
         │                │                        │
    ┌────▼────────┐  ┌────▼──────────────┐  ┌─────▼──────┐
    │  Deepgram   │  │ 翻訳 LLM          │  │ Supabase   │
    │  Nova-3     │  │ ├ Gemini 3 Flash  │  │ (PostgreSQL│
    │  (WS直接)   │  │ ├ Gemini 2.5 FL   │  │  Auth      │
    └─────────────┘  │ └ Claude Son. 4.5 │  │  Storage   │
                     └───────────────────┘  │  Edge Func)│
    ┌───────────────────────────┐           └────────────┘
    │ 事前調査（Supabase Edge Func）│
    │ ├─ Tavily Search           │
    │ └─ Firecrawl               │
    └───────────────────────────┘
```

### 1.2 ホスティング選定

| 候補 | WebSocket | 関数タイムアウト | 月額 | 判定 |
|------|----------|---------------|------|------|
| **Vercel Hobby** | ❌ 非対応 | 10秒 | **$0** | ✅ 採用（クライアント直接接続で回避） |
| Vercel Pro | ❌ 非対応 | 300秒 | $20 | ❌ コスト |
| Cloudflare Pages | ✅ Workers | 300秒CPU | $0 | 次善案（OpenNext要学習） |
| Railway Hobby | ✅ ネイティブ | 制限なし | $5 | 代替案 |

**Vercel Hobby（無料）の制約と回避策:**

| 制約 | 回避策 |
|------|--------|
| WebSocket非対応 | クライアント→Deepgram直接接続（一時トークン方式） |
| 関数タイムアウト10秒 | 翻訳を個別POST→SSE（各2-3秒で完了） |
| 帯域100GB/月 | 音声データはDeepgramへ直接送信、Vercelを経由しない |
| コンテキスト調査が10秒超 | Supabase Edge Functions（500K回/月無料、長時間実行可）に委譲 |
| Deepgram一時トークン250個/日 | 1セッション≈6個（10分毎×1時間）。1日最大40セッション程度が上限。Growth Plan以上で緩和可能 |

### 1.3 技術スタック

#### フロントエンド

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| UI | Tailwind CSS + shadcn/ui | 4.x / latest |
| 状態管理 | Zustand | 5.x |
| PWA | next-pwa | latest |
| 音声キャプチャ | Web Audio API + MediaStream | ブラウザネイティブ |

#### バックエンド

| 項目 | 技術 | 選定理由 |
|------|------|----------|
| ランタイム | Next.js API Routes | Vercelとの親和性、フロントと統合 |
| 音声認識 | **Deepgram Nova-3** (クライアント直接WebSocket) | 騒音環境WER 6.84%、<300ms、$0.46/hr |
| 翻訳（標準） | **Gemini 3 Flash** | SimpleQA 68.7%で固有名詞に強い、$0.50/$3.00/1M tokens |
| 翻訳（低コスト） | Gemini 2.5 Flash-Lite | $0.10/$0.40/1M tokens、シンプルな翻訳向け |
| 翻訳（高品質） | Claude Sonnet 4.5 | EN→JP翻訳品質トップクラス、演劇向け |
| 事前調査 | Tavily + Firecrawl（Supabase Edge Functions上） | Web検索 + スクレイピング |
| 通信（音声上り） | WebSocket（クライアント→Deepgram直接） | 一時トークン方式でAPIキー保護 |
| 通信（翻訳下り） | POST→SSE（utterance毎の個別リクエスト） | Vercel 10秒制限内で完結 |

#### データストア

| 項目 | 技術 |
|------|------|
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (Google / Email) |
| ファイルストレージ | Supabase Storage |

#### インフラ

| 項目 | 技術 | コスト |
|------|------|--------|
| ホスティング | Vercel Hobby | **$0/月** |
| CDN | Vercel Edge Network | 含む |
| 長時間処理 | Supabase Edge Functions | $0/月（500K回無料） |
| 監視 | Vercel Analytics + Supabase Dashboard | $0/月 |
| ドメイン | Vercel Domains | $0（*.vercel.app）|

---

## 2. データモデル

### 2.1 ER図

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   profiles   │     │    contexts      │     │    sessions      │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK/FK)   │◄──┐ │ id (PK)          │◄──┐ │ id (PK)          │
│ display_name │   │ │ user_id (FK)─────┘   │ │ user_id (FK)─────┘
│ created_at   │   │ │ type             │   │ │ context_id (FK)──┘
│ updated_at   │   │ │ title            │   │ │ title            │
└──────────────┘   │ │ source_url       │   │ │ translation_tier │
                   │ │ researched_data  │   │ │ started_at       │
                   │ │ glossary         │   │ │ ended_at         │
                   │ │ keywords         │   │ │ created_at       │
                   │ │ status           │   │ └──────────────────┘
                   │ │ error_message    │   │         │
                   │ │ created_at       │   │         │
                   │ │ updated_at       │   │         │ 1:N
                   │ └──────────────────┘   │         │
                   │                        │ ┌───────▼──────────┐
                   │                        │ │   transcripts    │
                   │                        │ ├──────────────────┤
                   │                        │ │ id (PK)          │
                   │                        └─│ session_id (FK)  │
                   │                          │ original_text    │
                   │                          │ translated_text  │
                   │                          │ confidence       │
                   │                          │ timestamp_ms     │
                   │                          │ created_at       │
                   │                          └──────────────────┘
                   │
                   └──── 1:N ────────────────────────────────────
```

### 2.2 テーブル定義

#### users

Supabase Auth が管理。`auth.users` を参照。

```sql
-- profiles テーブル（auth.users の拡張）
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- auth.users 作成時に自動で profile を作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### contexts

```sql
CREATE TYPE context_type AS ENUM ('theme_park', 'museum', 'theater', 'other');
CREATE TYPE context_status AS ENUM ('pending', 'researching', 'ready', 'error');

CREATE TABLE public.contexts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            context_type NOT NULL DEFAULT 'other',
  title           TEXT NOT NULL,
  source_url      TEXT,
  researched_data JSONB DEFAULT '{}',
  glossary        JSONB DEFAULT '[]',
  keywords        TEXT[] DEFAULT '{}',
  status          context_status NOT NULL DEFAULT 'pending',
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own contexts"
  ON public.contexts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_contexts_user_id ON public.contexts(user_id);
CREATE INDEX idx_contexts_status ON public.contexts(status);
```

**glossary JSONB構造:**

```json
[
  { "en": "Haunted Mansion", "ja": "ホーンテッドマンション", "category": "attraction" },
  { "en": "Ghost Host", "ja": "ゴーストホスト", "category": "character" },
  { "en": "Doom Buggy", "ja": "ドゥームバギー", "category": "term" }
]
```

**researched_data JSONB構造:**

```json
{
  "summary": "アトラクションの概要テキスト",
  "script_fragments": ["Welcome, foolish mortals...", "..."],
  "characters": ["Ghost Host", "Madame Leota"],
  "themes": ["supernatural", "humor", "gothic"],
  "source_urls": ["https://..."],
  "researched_at": "2026-02-14T00:00:00Z"
}
```

#### sessions

```sql
CREATE TYPE translation_tier AS ENUM ('standard', 'lite', 'premium');

CREATE TABLE public.sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_id       UUID REFERENCES public.contexts(id) ON DELETE SET NULL,
  title            TEXT NOT NULL DEFAULT '',
  translation_tier translation_tier NOT NULL DEFAULT 'standard',
  started_at       TIMESTAMPTZ,              -- 録音開始時に設定
  ended_at         TIMESTAMPTZ,              -- 録音終了時に設定（セッション中は定期更新で最終確認時刻としても使用）
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_context_id ON public.sessions(context_id);
```

#### transcripts

```sql
CREATE TABLE public.transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  original_text   TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  confidence      REAL,
  timestamp_ms    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transcripts"
  ON public.transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = transcripts.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transcripts"
  ON public.transcripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = transcripts.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE INDEX idx_transcripts_session_id ON public.transcripts(session_id);
CREATE INDEX idx_transcripts_timestamp ON public.transcripts(session_id, timestamp_ms);
```

### 2.3 プリセットテンプレート

ディズニーの主要アトラクションなど、公開情報が豊富なコンテンツについて**用語集・概要・主要フレーズ**を**プリセットテンプレート**としてアプリに同梱する（台本全文は著作権リスクのため含めない）。ユーザーはワンタップで利用可能。

#### テーブル定義

```sql
CREATE TABLE public.context_templates (
  id              TEXT PRIMARY KEY,        -- "wdw-mk-haunted-mansion" 等（人間可読なスラッグ）
  type            context_type NOT NULL,
  park            TEXT NOT NULL,           -- "WDW - Magic Kingdom", "DLR - Disneyland" 等
  title           TEXT NOT NULL,           -- "Haunted Mansion"
  description     TEXT,                    -- テンプレートの日本語説明文
  researched_data JSONB NOT NULL DEFAULT '{}',
  glossary        JSONB NOT NULL DEFAULT '[]',
  keywords        TEXT[] NOT NULL DEFAULT '{}',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- テンプレートは全ユーザーに公開（RLS不要、読み取り専用）
ALTER TABLE public.context_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read templates"
  ON public.context_templates FOR SELECT
  USING (true);

CREATE INDEX idx_templates_park ON public.context_templates(park);
CREATE INDEX idx_templates_type ON public.context_templates(type);
```

#### ユーザーフロー

```
[コンテキスト登録画面]
    │
    ├── 「テンプレートから選ぶ」 ← プリセット一覧
    │     ├── WDW - Magic Kingdom
    │     │    ├── Haunted Mansion       ← ワンタップで context に複製
    │     │    ├── Pirates of the Caribbean
    │     │    ├── Jungle Cruise
    │     │    └── ...
    │     ├── WDW - EPCOT
    │     ├── DLR - Disneyland
    │     └── DLR - California Adventure
    │
    └── 「自分で作成」 ← 従来の手動入力 + AI調査
```

テンプレートを選択すると、`context_templates` の内容が `contexts` テーブルにコピーされ、ユーザーはそこから自由に編集・カスタマイズできる。

#### データファイル

プリセットデータは `data/disney-templates.json` に管理し、Supabase のシードデータとして投入する。

---

## 3. API設計

### 3.1 エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/api/deepgram-token` | Deepgram一時トークン発行（TTL 600秒） | Bearer Token |
| POST | `/api/translate` | utterance翻訳（SSEストリーミング応答） | Bearer Token |
| GET | `/api/templates` | プリセットテンプレート一覧取得 | Bearer Token |
| GET | `/api/templates/:id` | テンプレート詳細取得 | Bearer Token |
| POST | `/api/templates/:id/use` | テンプレートからコンテキスト作成 | Bearer Token |
| POST | `/api/contexts` | コンテキスト作成 | Bearer Token |
| GET | `/api/contexts` | コンテキスト一覧取得 | Bearer Token |
| GET | `/api/contexts/:id` | コンテキスト詳細取得 | Bearer Token |
| PUT | `/api/contexts/:id` | コンテキスト更新 | Bearer Token |
| DELETE | `/api/contexts/:id` | コンテキスト削除 | Bearer Token |
| POST | `/api/contexts/:id/research` | AI事前調査を開始（Supabase Edge Function呼出）**（Phase 2）** | Bearer Token |
| GET | `/api/contexts/:id/research/status` | 調査進捗確認 **（Phase 2）** | Bearer Token |
| POST | `/api/sessions` | セッション作成 | Bearer Token |
| GET | `/api/sessions` | セッション一覧取得 | Bearer Token |
| GET | `/api/sessions/:id` | セッション詳細（トランスクリプト含む）取得 | Bearer Token |
| PATCH | `/api/sessions/:id` | セッション更新（終了時刻の記録等） | Bearer Token |
| DELETE | `/api/sessions/:id` | セッション削除 | Bearer Token |
| GET | `/api/sessions/:id/export` | セッションエクスポート（テキスト/PDF）**（Phase 3）** | Bearer Token |

### 3.2 ライブ翻訳フロー（クライアント直接接続方式）

> **重要**: VercelはWebSocket非対応のため、音声ストリーミングはクライアントからDeepgramに直接接続する。
> 翻訳はutteranceごとに独立したHTTPリクエスト（POST→SSE）で処理する。

```
Client (Browser)             Vercel API           Deepgram         LLM
  │                              │                    │               │
  │── POST /deepgram-token ─────►│                    │               │
  │   {supabaseToken}            │                    │               │
  │◄─ {token, expiresIn} ───────│                    │               │
  │                              │                    │               │
  │── WS Connect (直接) ────────────────────────────►│               │
  │   wss://api.deepgram.com     │                    │               │
  │   protocol: ['token', temp]  │                    │               │
  │   params: {nova-3, en,       │                    │               │
  │            keywords:[...]}   │                    │               │
  │◄─ WS Connected ──────────────────────────────────│               │
  │                              │                    │               │
  │── Audio Chunk (binary) ─────────────────────────►│               │
  │── Audio Chunk (binary) ─────────────────────────►│               │
  │◄─ Transcript ────────────────────────────────────│               │
  │   {text, confidence, is_final}                    │               │
  │                              │                    │               │
  │   [UtteranceBuffer: 発話結合判定]                  │               │
  │   [SlidingWindow: 直近3件の履歴付与]               │               │
  │                              │                    │               │
  │── POST /translate ──────────►│                    │               │
  │   {utterance, context,       │── Stream ─────────────────────────►│
  │    history[], tier}          │◄─ SSE Response ───────────────────│
  │◄─ SSE: 翻訳テキスト ─────────│                    │               │
  │   data: "ようこそ..."        │                    │               │
  │                              │                    │               │
  │   [字幕表示 + 履歴に追加]（DB保存はサーバー側SSE内で完了）         │
  │                              │                    │               │
  │── WS CloseStream ──────────────────────────────►│               │
```

### 3.3 API仕様

#### POST `/api/deepgram-token` — 一時トークン発行

```typescript
// リクエスト: Bearer Token (Supabase JWT) で認証
// レスポンス:
interface DeepgramTokenResponse {
  token: string;       // Deepgram一時トークン（JWT）
  expiresIn: number;   // 有効期限（秒）
}

// サーバー実装:
// POST https://api.deepgram.com/v1/auth/grant
// TTL: 600秒（10分）、セッション中に再取得可能
// スコープ: usage::write（listen/speakのみ、管理APIは不可）
// レート制限: 250トークン/日（Deepgram側制限）
```

#### POST `/api/translate` — utterance翻訳（SSEストリーミング）

```typescript
// リクエスト
interface TranslateRequest {
  utterance: string;         // 翻訳対象テキスト
  sequenceNumber: number;    // 表示順序保証用の連番（クライアント側で採番）
  context: CompactContext;   // コンパクトコンテキスト (~500 tokens)
  history: {                 // スライディングウィンドウ (直近3件)
    original: string;
    translated: string;
  }[];
  tier: 'standard' | 'lite' | 'premium';
  sessionId: string;         // DB保存用
}

// レスポンス: SSE ストリーム
// event: chunk
data: {"text": "ようこそ", "done": false}

// event: chunk
data: {"text": "、愚かなる人間どもよ", "done": false}

// event: done
data: {"text": "ようこそ、愚かなる人間どもよ", "done": true, "original": "Welcome, foolish mortals", "sequenceNumber": 1}
```

> **翻訳表示の順序保証**: 並行リクエストでutterance 4が3より先に返却される場合がある。
> クライアント側でsequenceNumberに基づく順序制御を行う:
> - 後続の翻訳が先に到着した場合、バッファに保持
> - 前の翻訳が完了した時点で、バッファ内の翻訳を順番に表示
> - 詳細はhooks/useTranslation.ts の TranslationOrderBuffer で実装

#### クライアント側のDeepgramメッセージ仕様

```typescript
// Deepgramからの文字起こし結果（クライアントで直接受信）
interface DeepgramTranscript {
  channel: {
    alternatives: [{
      transcript: string;
      confidence: number;
    }];
  };
  is_final: boolean;
  speech_final: boolean;
}

// 音声データ: MediaRecorder → audio/webm;codecs=opus → Deepgram直接送信
//   iOS Safari で audio/webm 非対応の場合は audio/mp4 にフォールバック
//   いずれもコンテナフォーマットのため encoding/sample_rate パラメータは不要（自動検出）
// KeepAlive: 5秒ごとに {"type": "KeepAlive"} を送信（無音時の切断防止）
// 切断: {"type": "CloseStream"} を送信
```

#### POST `/api/sessions` — セッション作成

```typescript
// リクエスト
interface CreateSessionRequest {
  contextId?: string;         // 使用するコンテキスト（任意）
  title?: string;             // セッション名（省略時は自動生成）
  translationTier: 'standard' | 'lite' | 'premium';
}

// レスポンス
interface CreateSessionResponse {
  id: string;                 // セッションID (UUID)
  title: string;
  translationTier: string;
  startedAt: string;          // ISO 8601
}
```

#### PATCH `/api/sessions/:id` — セッション更新（終了等）

```typescript
// リクエスト
interface UpdateSessionRequest {
  endedAt?: string;           // セッション終了時刻（ISO 8601）
  title?: string;             // タイトル変更
}

// レスポンス: 更新後のセッションオブジェクト
```

#### セッション状態遷移

```
[active] ──── 録音停止 ──→ [completed]
   │                          │
   │ ← 録音再開 ─────────────┘
   │
(started_at が設定済み,       (ended_at が最終確定)
 ended_at は定期更新中)
```

- **active**: 録音中。`POST /api/sessions` でセッション作成と同時に `started_at` を設定。セッション中は5分毎に `ended_at` を現在時刻に更新（ハートビート兼用。ブラウザが異常終了した場合でも最終確認時刻が残る）
- **completed**: 録音完了。`PATCH /api/sessions/:id` で `ended_at` を最終確定。以降の更新は行わない
- 状態はDBカラム（`started_at`, `ended_at`）から導出。専用statusカラムは不要
- 判定ロジック: `started_at IS NOT NULL AND (ended_at IS NULL OR ended_at > now() - INTERVAL '10 minutes')` → active

### 3.4 コンテキスト事前調査 API

> **注意**: コンテキスト調査はTavily + Firecrawl + LLM要約を含むため10秒超の処理時間が必要。
> Vercel Hobbyの10秒タイムアウト制限に抵触するため、**実際の調査処理はSupabase Edge Functionsに委譲**する。
> Next.js API (`/api/contexts/:id/research`) は調査の開始トリガーと進捗ポーリング用の薄いラッパーとして機能する。

#### POST `/api/contexts/:id/research` — 調査開始

```typescript
// Next.js API Route（Vercel上、10秒以内で完了）
// 1. Supabase Edge Function を非同期呼出し
// 2. context.status を 'researching' に更新
// 3. 即座にレスポンスを返す

// レスポンス:
interface ResearchStartResponse {
  status: 'researching';
  message: 'AI調査を開始しました';
}
```

#### GET `/api/contexts/:id/research/status` — 進捗確認

```typescript
// クライアントがポーリングで進捗を確認（5秒間隔推奨）

// レスポンス:
interface ResearchStatusResponse {
  status: 'researching' | 'ready' | 'error';
  step?: 'searching' | 'scraping' | 'analyzing';  // researching時のみ
  message?: string;
  error_message?: string;  // error時のみ
}

// status が 'ready' になったらクライアントが context を再取得
```

#### Supabase Edge Function: `research-context`

```typescript
// Supabase Edge Functions上で実行（タイムアウト制限なし）
// 1. Tavily で Web検索
// 2. Firecrawl で関連ページをスクレイピング
// 3. LLM で構造化（researched_data, glossary, keywords を生成）
// 4. contexts テーブルを更新（status: 'ready'）
// エラー時は status: 'error' + error_message を設定
```

**コンテンツ種別ごとの取得可能データと情報ソース:**

| 種別 | 取得できるもの | 主な情報ソース | 取得難度 |
|------|-------------|-------------|---------|
| テーマパーク | **台本ほぼ全文**、キャラ名、用語 | ファンサイト（[Disney Parks Script Central](https://www.disneyparkscripts.com/) 等）、YouTube ride-through字幕 | 低（公開情報が豊富） |
| 博物館 | 展示概要、作品名、解説の要約 | 公式サイト展示ページ、Wikipedia、ブログ記事 | 中（音声ガイドの全文は非公開） |
| 演劇 | あらすじ、登場人物、有名台詞、歌詞（ミュージカル） | Wikipedia、公式サイト、ファンサイト、レビュー | 中〜高（台本全文は著作権で非公開） |
| その他 | 場所・イベントの概要、関連用語 | Web検索結果 | 可変 |

> **重要な発見**: ディズニーアトラクションの台本は、ファンコミュニティが精密に書き起こしたものが複数のサイトで公開されている。
> Haunted Mansion、Pirates of the Caribbean、Tower of Terror 等の主要アトラクションはほぼ全セリフが公開済み。

**調査エージェントの処理フロー（種別ごとに戦略を切替）:**

```
1. コンテンツ種別に応じた検索クエリを生成
   ├── theme_park:
   │   ├── Tavily: "{title} ride script transcript full text"
   │   ├── Tavily: "{title} attraction dialogue characters"
   │   └── 既知のファンサイト（disneyparkscripts.com 等）を Firecrawl で取得
   │
   ├── museum:
   │   ├── Tavily: "{title} exhibition guide highlights"
   │   ├── Tavily: "{title} collection famous works"
   │   └── source_url があれば Firecrawl で公式展示ページを取得
   │
   ├── theater:
   │   ├── Tavily: "{title} plot summary characters"
   │   ├── Tavily: "{title} famous quotes iconic lines"
   │   ├── Tavily: "{title} lyrics" (ミュージカルの場合)
   │   └── Wikipedia のあらすじページを Firecrawl で取得
   │
   └── other:
       └── Tavily: "{title} guide explanation overview"

2. YouTube 字幕抽出（テーマパーク向け、オプション）
   ├── Tavily: "{title} ride through full youtube"
   ├── youtube-transcript-api でYouTube動画の自動字幕を取得
   └── 自動字幕は精度が低いため、ファンサイトの台本と照合して補完

3. source_url が指定されている場合
   └── Firecrawl で URL のコンテンツを markdown 抽出

4. 収集したテキストを LLM で構造化
   ├── researched_data:
   │   ├── summary (200字以内の概要)
   │   ├── script_fragments (台本・セリフの断片、見つかった場合)
   │   ├── characters (登場人物・キャラクター一覧)
   │   └── themes (テーマ・雰囲気のキーワード)
   ├── glossary (EN/JP 用語対応表、LLMが生成)
   └── keywords (Deepgram キーターム用)

5. Supabase に保存、status を 'ready' に更新
```

**コンテキスト品質の期待値（種別ごと）:**

```
テーマパーク  ████████████████████ 90-95%  ← 台本全文が取れることが多い
博物館       ████████████░░░░░░░░ 50-60%  ← 展示概要と作品名は取れる
演劇         ██████████░░░░░░░░░░ 40-50%  ← あらすじ・有名台詞のみ
その他       ██████░░░░░░░░░░░░░░ 20-30%  ← 一般情報のみ
```

> テーマパークが最も効果的。演劇やその他は、コンテキストが少なくても
> 用語集（固有名詞の対訳）だけで翻訳精度は大幅に改善する。

**ユーザー補完の仕組み:**

コンテキスト品質が低い場合、ユーザー自身が情報を追加できるUIを提供する:

- AI調査結果をプレビューし、不足情報を手動で追記
- 用語集（glossary）を手動で追加・編集
- 自分のメモやガイドブックの内容をテキストで貼り付け
- 過去のセッションの文字起こし結果を次回のコンテキストに再利用

---

## 4. コンポーネント設計

### 4.1 ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx                  # ルートレイアウト
│   ├── page.tsx                    # ホーム画面（セッション一覧）
│   ├── live/
│   │   └── page.tsx                # ライブ翻訳画面
│   ├── contexts/
│   │   ├── page.tsx                # コンテキスト一覧
│   │   ├── new/
│   │   │   └── page.tsx            # コンテキスト登録
│   │   └── [id]/
│   │       └── page.tsx            # コンテキスト詳細・編集
│   ├── sessions/
│   │   └── [id]/
│   │       └── page.tsx            # セッション履歴詳細
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx            # ログイン
│   │   └── callback/
│   │       └── route.ts            # OAuth コールバック
│   └── api/
│       ├── deepgram-token/
│       │   └── route.ts            # Deepgram一時トークン発行
│       ├── translate/
│       │   └── route.ts            # utterance翻訳（POST→SSE）
│       ├── contexts/
│       │   ├── route.ts            # 一覧・作成
│       │   └── [id]/
│       │       ├── route.ts        # 詳細・更新・削除
│       │       └── research/
│       │           ├── route.ts    # AI事前調査開始（Edge Func呼出）
│       │           └── status/
│       │               └── route.ts # 調査進捗確認
│       ├── templates/
│       │   ├── route.ts            # テンプレート一覧
│       │   └── [id]/
│       │       ├── route.ts        # テンプレート詳細
│       │       └── use/
│       │           └── route.ts    # テンプレートからコンテキスト作成
│       └── sessions/
│           ├── route.ts            # 一覧
│           └── [id]/
│               ├── route.ts        # 詳細・削除
│               └── export/
│                   └── route.ts    # エクスポート
├── components/
│   ├── ui/                         # shadcn/ui コンポーネント
│   ├── live/
│   │   ├── SubtitleDisplay.tsx     # 字幕表示エリア
│   │   ├── AudioCapture.tsx        # マイク入力制御
│   │   ├── LiveControls.tsx        # 録音開始/停止・設定
│   │   ├── ContextSelector.tsx     # コンテキスト選択
│   │   └── TranscriptLog.tsx       # リアルタイムログ表示
│   ├── contexts/
│   │   ├── ContextForm.tsx         # 登録・編集フォーム
│   │   ├── ContextCard.tsx         # コンテキストカード
│   │   ├── TemplatePicker.tsx      # テンプレート選択UI
│   │   ├── ResearchProgress.tsx    # 調査進捗表示
│   │   └── GlossaryEditor.tsx      # 用語集編集
│   ├── sessions/
│   │   ├── SessionCard.tsx         # セッション一覧カード
│   │   └── TranscriptViewer.tsx    # トランスクリプト閲覧
│   └── layout/
│       ├── Header.tsx              # ヘッダー
│       ├── BottomNav.tsx           # ボトムナビゲーション
│       └── AuthGuard.tsx           # 認証ガード
├── hooks/
│   ├── useAudioCapture.ts          # マイク入力 + Wake Lock フック
│   ├── useDeepgramLive.ts          # Deepgram直接WebSocket接続フック
│   ├── useTranslation.ts           # POST→SSE翻訳ストリーミングフック
│   ├── useUtteranceBuffer.ts       # 発話結合判定フック
│   └── useLiveSession.ts           # セッション管理統合フック
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # ブラウザ用 Supabase クライアント
│   │   └── server.ts               # サーバー用 Supabase クライアント
│   ├── deepgram.ts                 # Deepgram クライアント
│   ├── translation.ts              # 翻訳 LLM クライアント（ティア切替）
│   ├── research-agent.ts           # 事前調査エージェント
│   └── prompts/
│       ├── translation.ts          # 翻訳プロンプトテンプレート
│       └── research.ts             # 調査プロンプトテンプレート
├── stores/
│   ├── liveStore.ts                # ライブ翻訳の状態管理
│   ├── contextStore.ts             # コンテキスト状態管理
│   └── settingsStore.ts            # ユーザー設定
└── types/
    ├── context.ts                  # コンテキスト型定義
    ├── session.ts                  # セッション型定義
    ├── transcript.ts               # トランスクリプト型定義
    └── websocket.ts                # WebSocket メッセージ型定義
```

### 4.2 主要コンポーネント詳細

#### SubtitleDisplay（字幕表示）

ライブ翻訳画面のメインコンポーネント。映画字幕のようなUXを実現。

```typescript
interface SubtitleDisplayProps {
  translations: TranslationMessage[];  // 翻訳結果配列
  interimTranscript?: string;          // 中間文字起こし
  showOriginal: boolean;               // 原文表示切替
  fontSize: 'small' | 'medium' | 'large';
}

// 表示仕様:
// - 画面下部 30% のエリアに表示
// - 最新の翻訳を最前面に、古いものはフェードアウト
// - 最大3行表示、超過分は自動スクロール
// - ストリーミング中は文字が1文字ずつ表示（タイプライター効果）
// - ダークモード時: 半透明黒背景 + 白文字
// - ライトモード時: 半透明白背景 + 黒文字
```

#### AudioCapture（音声入力）

```typescript
// マイク入力 → MediaRecorder で audio/webm;codecs=opus に圧縮 → WebSocket へ送信
// Opus圧縮により帯域を ~32kbps に抑制（PCM 16bit 16kHz = 256kbps の約1/8）

interface AudioCaptureConfig {
  mimeType: 'audio/webm;codecs=opus';  // Deepgramが直接デコード可能
  audioBitsPerSecond: 32000;            // ~32kbps
  timeslice: 250;                       // 250msごとにデータチャンクを送信
}

// MediaRecorder の使用例
// const recorder = new MediaRecorder(stream, {
//   mimeType: 'audio/webm;codecs=opus',
//   audioBitsPerSecond: 32000,
// });
// recorder.ondataavailable = (e) => deepgramWs.send(e.data);
// recorder.start(250);  // 250msごとにチャンク生成
```

---

## 5. 翻訳パイプライン設計

### 5.1 翻訳ティア

| ティア | モデル | 入力単価 | 出力単価 | 用途 |
|--------|--------|---------|---------|------|
| `lite` | Gemini 2.5 Flash-Lite | $0.10/1M | $0.40/1M | 案内板・簡単な説明文 |
| `standard` | **Gemini 3 Flash** | $0.50/1M | $3.00/1M | アトラクション・一般翻訳 |
| `premium` | Claude Sonnet 4.5 | $3.00/1M | $15.00/1M | 演劇・文学的翻訳 |

### 5.2 翻訳プロンプト設計（基本構造）

> **注**: 実際のリアルタイム翻訳では、5.5節のスライディングウィンドウ翻訳プロンプトを使用する。
> 以下はコンテキストなし・履歴なしの場合のフォールバック用基本プロンプト。

```typescript
function buildBasicTranslationPrompt(
  text: string,
  context?: ContextData,
  glossary?: GlossaryEntry[]
): string {
  return `
You are a real-time translator for a live experience.
Translate the following English text into natural Japanese.

${context ? `
## Context
This is from: ${context.title} (${context.type})
Summary: ${context.summary}
` : ''}

${glossary?.length ? `
## Glossary (use these exact translations)
${glossary.map(g => `- "${g.en}" → "${g.ja}"`).join('\n')}
` : ''}

## Rules
- Translate naturally, not literally
- Keep proper nouns in their established Japanese forms
- If the input seems garbled (speech recognition error), infer the intended meaning from context
- Output ONLY the Japanese translation, no explanations
- Keep it concise for subtitle display (max 2 lines)

## Input
${text}
`.trim();
}
```

### 5.3 コンテキストベース補正

Deepgramの文字起こし結果をLLMに渡す前に、コンテキストを注入して精度を上げる。

```
[入力] "Welcome foolish morals to the hunted mention"
                                    ↓
[コンテキスト注入] Haunted Mansion のスクリプトと用語集を付与
                                    ↓
[LLM 出力] "愚かなる人間どもよ、ホーンテッドマンションへようこそ"
```

Deepgramのキーターム機能も併用:

```typescript
// Deepgram 接続時にコンテキストの keywords を渡す
const deepgramParams = {
  model: 'nova-3',
  language: 'en',
  smart_format: true,
  interim_results: true,
  utterance_end_ms: 1000,    // 発話区切り判定（UtteranceBuffer連携）
  vad_events: true,          // Voice Activity Detection イベント
  channels: 1,
  keywords: context.keywords.map(kw => `${kw}:2`),
  // "Haunted Mansion:2", "Ghost Host:2" など
  // :2 は認識優先度のブースト値
  // 注: audio/webm, audio/mp4 はコンテナフォーマットのため encoding/sample_rate は不要
};
```

### 5.4 コンテキストの効率的な受け渡し

リアルタイム翻訳では、毎回のLLMリクエストにコンテキスト全体を渡すとコスト・遅延が増大する。以下の3層構造で効率化する。

#### コンテキスト圧縮戦略

```
[事前調査で収集した生データ]  ← 数万トークン（台本全文、展示解説など）
          ↓ 事前処理（調査時に1回だけ実行）
[構造化コンテキスト]          ← 数千トークン
          ↓ セッション開始時に生成
[翻訳用コンパクトコンテキスト] ← ~500トークン（毎リクエストに付与）
```

| 層                | サイズ目安           | 内容                 | 生成タイミング         |
| ---------------- | --------------- | ------------------ | --------------- |
| Layer 1: 生データ    | 可変（0〜50K tokens） | 取得できた情報すべて（台本断片、展示概要、あらすじ等） | コンテキスト調査時       |
| Layer 2: 構造化データ  | ~5K tokens      | 要約、キャラクター一覧、シーン構成、ユーザー補完情報  | 調査完了時にLLMで要約    |
| Layer 3: 翻訳プロンプト | **~500 tokens** | 状況要約 + アクティブ用語集    | セッション開始時 + 動的更新 |

> **注**: Layer 1 のサイズはコンテンツ種別で大きく異なる。テーマパークでは台本全文（~5K tokens）が
> 取れることが多いが、演劇では概要（~1K tokens）程度。Layer 1 が少なくても、
> **用語集（glossary）が最も翻訳精度に効く**ため、固有名詞の対訳さえあれば大きな改善が見込める。

#### Layer 3 の構造（毎リクエストに付与）

```typescript
interface CompactContext {
  // 固定部分（セッション開始時に生成、~300 tokens）
  situation: string;      // "ディズニーのHaunted Mansionアトラクション内"
  characters: string[];   // ["Ghost Host", "Madame Leota"]
  tone: string;           // "gothic-humorous, theatrical narration"

  // 動的部分（翻訳の進行に応じて更新、~200 tokens）
  activeGlossary: GlossaryEntry[];  // 直近で使われそうな用語のみ
  recentTranslations: string[];     // 直近3件の翻訳結果（一貫性維持用）
}
```

#### Gemini 3 Flash でのコンテキストキャッシュ

Gemini API の Context Caching を活用し、固定部分のコストを削減する。

> **制約**: Gemini 3 Flash の context caching は最小 **1,024トークン** が必要。
> Layer 3 のコンパクトコンテキスト（~500トークン）だけでは不足するため、
> **システムプロンプト全文 + Layer 2 の要約（~2K tokens）** をキャッシュ対象に含める。

```typescript
// セッション開始時にキャッシュを作成（Phase 2で実装）
// システムプロンプト + Layer 2 構造化データ = 約2,000〜3,000トークン
const cache = await genai.caches.create({
  model: 'gemini-3-flash',
  contents: [
    {
      role: 'user',
      parts: [{
        text: [
          SYSTEM_PROMPT,                    // ~300 tokens
          compactContext.situation,          // ~100 tokens
          compactContext.characters,         // ~50 tokens
          structuredData.summary,           // ~500 tokens
          structuredData.sceneDescriptions, // ~500 tokens
          glossarySection,                  // ~500 tokens
          TRANSLATION_RULES,               // ~200 tokens
        ].join('\n')  // 合計 ~2,150 tokens（1,024最小要件を超える）
      }]
    }
  ],
  ttl: '3600s',  // 1時間（セッション中有効）
});

// 翻訳リクエスト時はキャッシュを参照
// 動的部分（履歴 + 今回のutterance）のみ新規入力
const response = await genai.models.generateContent({
  model: 'gemini-3-flash',
  cachedContent: cache.name,
  contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],
});
// → キャッシュ部分は入力コスト1/4（通常の25%）
```

### 5.5 リアルタイム分割翻訳と一貫性の維持

#### 課題

音声認識は発話の区切り（utterance）ごとにテキストを返すため、翻訳も断片的になる。
しかし断片ごとに独立して翻訳すると、以下の問題が発生する:

- 同じ固有名詞の訳が揺れる（"Haunted Mansion" → 「ホーンテッドマンション」と「幽霊屋敷」が混在）
- 代名詞の指示対象がわからない（"He said..." の "He" が誰か不明）
- 文脈が途切れて意味不明な訳になる

#### 解決: スライディングウィンドウ翻訳

直近の翻訳履歴を「ウィンドウ」としてLLMに渡し、一貫性を維持する。

```
時間 →
───────────────────────────────────────────────────►

Utterance 1: "Welcome, foolish mortals"
Utterance 2: "to the Haunted Mansion"
Utterance 3: "I am your Ghost Host"
Utterance 4: "and I will be your guide"
                                        ▲ 現在の翻訳対象

┌─── スライディングウィンドウ（直近3件） ───┐
│ [2] "to the Haunted Mansion"            │
│     → "ホーンテッドマンションへ"           │
│ [3] "I am your Ghost Host"              │
│     → "私はゴーストホスト"                │
│ [4] "and I will be your guide" ← NEW    │
│     → ???                               │
└─────────────────────────────────────────┘
```

#### 翻訳リクエストの構造

```typescript
interface TranslationRequest {
  // コンテキスト（固定、~500 tokens）
  context: CompactContext;

  // スライディングウィンドウ（直近N件、~200 tokens）
  recentHistory: {
    original: string;
    translated: string;
  }[];

  // 今回翻訳する発話
  currentUtterance: string;
}
```

#### プロンプト設計（一貫性維持）

```typescript
function buildTranslationPrompt(req: TranslationRequest): string {
  const historySection = req.recentHistory.length > 0
    ? `## Recent translations (maintain consistency)
${req.recentHistory.map((h, i) =>
  `[${i + 1}] "${h.original}" → "${h.translated}"`
).join('\n')}`
    : '';

  return `
You are a real-time subtitle translator.
Translate the next English utterance into natural Japanese.

## Context
${req.context.situation}
Characters: ${req.context.characters.join(', ')}

## Glossary (use these exact translations)
${req.context.activeGlossary.map(g => `- "${g.en}" → "${g.ja}"`).join('\n')}

${historySection}

## Rules
- Maintain translation consistency with recent history above
- Use the same translation for recurring terms
- Resolve pronouns using context and history
- If speech recognition seems garbled, infer from context
- Output ONLY the Japanese translation
- Keep concise for subtitle display

## Translate this
"${req.currentUtterance}"
`.trim();
}
```

#### 発話の結合判定

短すぎる発話は結合して翻訳品質を上げる。長すぎる発話は分割する。

```typescript
class UtteranceBuffer {
  private buffer: string[] = [];
  private bufferTokens = 0;

  // Deepgram の is_final=true ごとに呼ばれる
  onFinalTranscript(text: string, confidence: number): string | null {
    this.buffer.push(text);
    this.bufferTokens += estimateTokens(text);

    // 翻訳を発火する条件:
    // 1. バッファが十分なサイズ（15トークン以上 ≒ 自然な1文）
    // 2. 文末記号で終わっている（. ! ? など）
    // 3. 2秒間新しい発話がない（タイムアウト）
    // 4. バッファが大きすぎる（50トークン超 → 強制発火）
    if (
      this.bufferTokens >= 15 &&
      (this.endsWithPunctuation(text) || this.bufferTokens >= 50)
    ) {
      return this.flush();
    }

    // タイムアウトは呼び出し元で管理
    return null;
  }

  flush(): string {
    const combined = this.buffer.join(' ');
    this.buffer = [];
    this.bufferTokens = 0;
    return combined;
  }
}
```

#### 処理フローまとめ

```
[Deepgram is_final]
      │
      ▼
[UtteranceBuffer]──── 短すぎる → バッファに蓄積、待機
      │
      │ 発火条件を満たした
      ▼
[スライディングウィンドウ構築]
      │ 直近3件の翻訳履歴を取得
      │ コンパクトコンテキストを付与
      ▼
[LLM 翻訳リクエスト]（ストリーミング）
      │
      ▼
[字幕表示]──→ [翻訳履歴に追加]（DB保存はサーバー側SSE内で完了済み）
```

#### ウィンドウサイズの設定

| パラメータ | 値 | 理由 |
|-----------|-----|------|
| ウィンドウサイズ（履歴件数） | 3件 | 一貫性と遅延のバランス。5件以上はコスト増に見合わない |
| 発話バッファ最小サイズ | 15トークン | 英語の1文平均が15-20トークン |
| 発話バッファ最大サイズ | 50トークン | これ以上は翻訳遅延が大きくなる |
| 発話タイムアウト | 2秒 | 話者の自然なポーズと同等 |
| 用語集の最大エントリ数 | 20件 | プロンプトサイズの制約 |

---

## 6. 認証・セキュリティ設計

### 6.1 認証フロー

```
[ブラウザ]                    [Supabase Auth]
    │                              │
    │── Google OAuth ─────────────►│
    │◄─ JWT Token ─────────────────│
    │                              │
    │── API Request ──────────────►│ (Next.js API)
    │   Authorization: Bearer {jwt}│
    │                              │── Verify JWT ──► Supabase
    │◄─ Response ──────────────────│
```

### 6.2 APIキー管理

| キー | 管理場所 | 露出範囲 |
|------|---------|---------|
| Deepgram API Key | Vercel env | サーバーサイドのみ（一時トークン発行に使用） |
| Deepgram 一時トークン | クライアント（動的） | TTL 600秒、listen権限のみ、250トークン/日制限 |
| Gemini API Key | Vercel env | サーバーサイドのみ |
| Claude API Key | Vercel env | サーバーサイドのみ |
| Tavily API Key | Supabase Edge Function secrets | サーバーサイドのみ（Edge Function内で使用） |
| Firecrawl API Key | Supabase Edge Function secrets | サーバーサイドのみ（Edge Function内で使用） |
| Supabase Anon Key | クライアントコード | ブラウザに露出（RLS で保護） |
| Supabase Service Key | Vercel env | サーバーサイドのみ |

### 6.3 セキュリティ対策

- 全テーブルに **Row Level Security (RLS)** を設定、自分のデータのみアクセス可能
- WebSocket 接続時に JWT を検証、無効なトークンは即切断
- APIキーは全てサーバーサイドで管理、ブラウザに露出しない
- HTTPS 必須（Vercel デフォルト）
- レート制限: 1ユーザーあたり同時セッション1つまで

---

## 7. パフォーマンス設計

### 7.1 レイテンシ目標と内訳

```
[音声入力] → [Deepgram] → [翻訳LLM] → [画面表示]
             <300ms       <500ms TTFT    <50ms
             ─────────────────────────────────
             合計目標: < 1秒（TTFT）, < 2秒（完了）
```

| 処理 | 目標遅延 | 対策 |
|------|---------|------|
| 音声バッファ→送信 | ~256ms | 4096サンプル @16kHz |
| Deepgram 文字起こし | <300ms | WebSocket 常時接続 |
| 翻訳TTFT | <500ms | Gemini 3 Flash ストリーミング |
| 翻訳完了 | <1000ms | 短文プロンプト最適化 |
| DOM 更新 | <16ms | React 仮想 DOM |

### 7.2 最適化戦略

- **バッファリング**: Deepgramの `is_final=true` のみ翻訳に送る（中間結果は表示のみ）
- **UtteranceBuffer**: 短い発話を結合（最小15トークン）、長い発話を分割（最大50トークン）して翻訳品質を最適化
- **並行処理**: 前の翻訳完了を待たず、次の確定テキストを即座に翻訳開始
- **Gemini Context Caching**: セッション中の固定コンテキスト（システムプロンプト+状況説明）をキャッシュし、入力コスト削減（TTL: 1時間）
- **プロンプトキャッシュ**: Claude 使用時、コンテキスト部分をキャッシュして0.1倍コスト
- **3層コンテキスト圧縮**: 生データ（~50K tokens）→ 構造化データ（~5K tokens）→ 翻訳プロンプト（~500 tokens）で毎リクエストのトークン数を最小化
- **コネクションプール**: Deepgram WebSocket はセッション中常時接続を維持

---

## 8. コスト試算

### 8.1 ティア別コスト（1時間利用あたり）

> **前提**: 1時間に約120回の翻訳リクエスト（30秒に1回の発話）。
> 各リクエストにコンテキスト(~500tok) + 履歴(~200tok) + utterance(~30tok) = ~730tok入力。
> Context Caching未使用時の見積もり。

| 項目 | lite | standard | premium |
|------|------|----------|---------|
| 音声認識（Deepgram） | $0.46 | $0.46 | $0.46 |
| 翻訳入力（~88K tokens） | $0.009 | $0.044 | $0.26 |
| 翻訳出力（~24K tokens） | $0.010 | $0.072 | $0.36 |
| ホスティング | $0 | $0 | $0 |
| **合計** | **$0.48/hr** | **$0.58/hr** | **$1.08/hr** |

> Context Caching（Phase 2）導入後: 固定コンテキスト部分が1/4コストになるため、
> standardティアで **~$0.50/hr** まで削減見込み。

### 8.2 月間コスト試算（ユーザーあたり）

| 利用パターン | lite | standard | premium |
|-------------|------|----------|---------|
| ライト（3時間/月） | $1.41 | $1.62 | $2.55 |
| 標準（10時間/月） | $4.70 | $5.40 | $8.50 |
| ヘビー（30時間/月） | $14.10 | $16.20 | $25.50 |

### 8.3 料金プラン案

| プラン | 月額 | 利用時間 | デフォルトティア |
|--------|------|---------|----------------|
| Free | $0 | 1時間/月 | lite |
| Standard | $9.99 | 20時間/月 | standard |
| Premium | $19.99 | 50時間/月 | premium 選択可 |

### 8.4 利用時間追跡

セッションの `started_at` / `ended_at` から月間利用時間を集計し、プランの利用時間上限を管理する。

```sql
-- 月間利用時間集計のRPC関数
CREATE OR REPLACE FUNCTION public.get_monthly_usage(user_uuid UUID, target_month DATE DEFAULT CURRENT_DATE)
RETURNS INTERVAL AS $$
  SELECT COALESCE(
    SUM(
      COALESCE(ended_at, now()) - started_at
    ),
    INTERVAL '0 seconds'
  )
  FROM public.sessions
  WHERE user_id = user_uuid
    AND started_at >= date_trunc('month', target_month)
    AND started_at < date_trunc('month', target_month) + INTERVAL '1 month';
$$ LANGUAGE sql SECURITY DEFINER;
```

**クライアント側の制御:**

- セッション開始時に月間残量を確認（`get_monthly_usage` を呼出し）
- 残量が10分未満の場合、警告を表示
- 残量ゼロの場合、新規セッション作成をブロックし、プランアップグレードを案内
- セッション中は定期的（5分毎）に利用時間を更新（`PATCH /api/sessions/:id` で `ended_at` を更新）

> **MVP段階**: Free プラン（1時間/月）のみ。課金機能はPhase 2で実装。

---

## 9. エラーハンドリング

### 9.1 障害パターンと対策

| 障害 | 検知方法 | 対策 |
|------|---------|------|
| Deepgram 接続断 | WebSocket close/error | 自動再接続（最大3回）、画面に「再接続中」表示 |
| Deepgram API制限 | 429レスポンス | バックオフ後リトライ、ユーザーに待機を通知 |
| 翻訳LLM タイムアウト | 10秒無応答 | 翻訳スキップ、原文のみ表示 |
| 翻訳LLM APIエラー | 4xx/5xx | フォールバックモデルに切替（standard→lite） |
| マイク権限拒否 | getUserMedia error | 権限リクエスト画面を表示 |
| ネットワーク断 | navigator.onLine | 「オフライン」表示、再接続待機 |

### 9.2 フォールバックチェーン

```
翻訳: Gemini 3 Flash → Gemini 2.5 Flash-Lite → 翻訳なし（原文表示）
音声: Deepgram Nova-3 → 自動再接続（最大3回）→ 音声認識停止（手動再開）
```

> **注**: Web Speech API はフォールバックとして採用しない。iOS Safari の continuous モードが
> 不安定（単一文字列が無限に増加する問題）で、リアルタイム連続音声認識に不適切なため。

### 9.3 ネットワーク要件

| 項目 | 値 | 備考 |
|------|-----|------|
| 最低上り帯域 | ~32kbps | audio/webm;codecs=opus 圧縮時 |
| 推奨上り帯域 | 128kbps以上 | 安定した音声ストリーミング |
| 最低下り帯域 | 64kbps | 翻訳テキスト受信 |
| WebSocket遅延 | <500ms RTT | Deepgramへの直接接続 |

**音声コーデック**: MediaRecorder の `audio/webm;codecs=opus` を使用。非圧縮PCM（256kbps）に比べ
帯域を約1/8（~32kbps）に圧縮でき、海外ローミング環境でも動作可能。Deepgramは`audio/webm`を直接デコード可能。

**オフライン時の挙動**:
- `navigator.onLine` で検知
- Deepgram WebSocket切断時: 自動再接続を試行（最大3回、指数バックオフ）
- 再接続失敗時: 「ネットワーク接続を確認してください」をUIに表示
- 翻訳APIタイムアウト時: 原文のみ表示し、次のutteranceで再試行

### 9.4 音声キャプチャの技術的制約と対策

| 制約 | 影響 | 対策 |
|------|------|------|
| iOS バックグラウンド制限 | 画面ロック/アプリ切替で`getUserMedia`停止 | Wake Lock API で画面常時ON維持 |
| 画面自動ロック | 長時間セッション中に画面消灯 | `navigator.wakeLock.request('screen')` |
| バッテリー消費 | WebSocket + マイク + 画面ON = 高消費 | 省電力UI（最小限のDOM更新）、セッション時間警告 |
| 内蔵マイクの指向性 | スピーカーから離れた音声が拾いにくい | 外部マイク推奨のガイダンスを表示 |
| AudioWorklet対応 | iOS Safari 15+ で対応済み | 対象ブラウザ範囲内で問題なし |

```typescript
// Wake Lock の実装（useAudioCapture.ts 内）
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      const lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => {
        // 画面がロックされた場合、ユーザーに通知
        showNotification('画面がロックされました。タップして再開してください。');
      });
      return lock;
    } catch (err) {
      // Wake Lock非対応の場合はフォールバック（何もしない）
      console.warn('Wake Lock not supported:', err);
    }
  }
}
```

### 9.5 プライバシー・データ取り扱い

| データ | 保存先 | 保持期間 | 備考 |
|--------|--------|---------|------|
| 音声データ（生） | **保存しない** | — | Deepgramへの直接ストリームのみ、サーバー/クライアントに保存しない |
| 文字起こしテキスト | Supabase | ユーザーが削除するまで | セッション削除でCASCADE削除 |
| 翻訳テキスト | Supabase | ユーザーが削除するまで | 同上 |
| Deepgramへの音声送信 | Deepgram | Deepgramのポリシーに従う | Deepgramはデフォルトでデータ保持しない設定が可能 |

> Deepgramの設定で `redact` オプションを有効にし、PII（個人情報）の自動除去も可能。
