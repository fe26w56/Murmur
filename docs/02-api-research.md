# Murmur - バックエンドAPI調査レポート（2026年2月時点）

## 1. 音声認識（Speech-to-Text）API比較

### 比較一覧

| プロバイダ | リアルタイム対応 | ブラウザ接続 | 遅延 | 英語WER | ストリーミング単価/hr | 無料枠 | 騒音耐性 |
|------------|-----------------|-------------|------|---------|----------------------|--------|----------|
| **Deepgram Nova-3** | ネイティブ | WebSocket直接 | <300ms | 6.84% | $0.46 | $200クレジット | 最優秀（専用設計） |
| **OpenAI Realtime API** | あり | WebSocket+WebRTC | 可変 | 最高（バッチ） | トークン課金（高額） | $5クレジット | 良好 |
| **OpenAI Whisper/Transcribe** | なし（バッチのみ） | N/A | N/A | 最高 | $0.18-0.36 | $5クレジット | N/A |
| **AssemblyAI Universal-3 Pro** | ネイティブ | WebSocket直接 | ~307ms | Deepgram比28%改善 | $0.21（セッション課金） | 5,000時間無料 | **最優秀**（Deepgram超え） |
| **ElevenLabs Scribe v2** | ネイティブ | WebSocket+REST | ~150ms | ~6.5% (FLEURS) | $0.28 | プラン依存 | 良好 |
| **Soniox v3→v4** | ネイティブ | WebSocket | 高速 | ~6.5%（自社BM） | $0.12 | トライアル | 良好 |
| **Google Chirp 3** | StreamingRecognize | gRPC（要プロキシ） | 中程度 | 良好 | $1.44-2.16 | 60分/月 | デノイザー内蔵 |
| **Azure Speech** | ネイティブ | SDK（内部WS） | 中程度 | 良好 | $1.00 | 5時間/月 | カスタムモデル |

### 詳細分析

#### Deepgram Nova-3（推奨）

Murmurの用途に最適。騒音環境（テーマパーク、劇場）での利用を想定して設計されたモデル。

- **ストリーミング**: WebSocket `wss://api.deepgram.com/v1/listen` に直接接続
- **精度**: ストリーミングWER 6.84%（競合比54.3%改善）、バッチWER 5.26%
- **騒音対応**: 重なる会話、マイク距離、環境騒音に特化して最適化
- **特殊機能**: キーターム・プロンプティング（カスタム語彙ブースト）で事前登録した専門用語の認識率を向上可能
- **料金**: Pay-As-You-Go $0.0077/分（$0.46/時）

```javascript
// ブラウザからの接続例
const socket = new WebSocket(
  'wss://api.deepgram.com/v1/listen?model=nova-3&language=en',
  ['token', DEEPGRAM_API_KEY]
);
```

> **注意**: ブラウザ直接接続にはDeepgramの一時トークンAPI（`POST /v1/auth/grant`、TTL最大3,600秒）を使用。
> APIキーはサーバーサイドでのみ使用し、クライアントには一時トークンのみを渡す。
> 制約: 一時トークンは250個/日まで（1セッション10分毎×1時間 = 6個消費）。

#### OpenAI GPT-4o Transcribe

バッチ処理では最高精度だが、リアルタイムストリーミングにはRealtime APIが必要で高額。

- **GPT-4o Transcribe**: $0.006/分（バッチのみ）、最高精度
- **GPT-4o Mini Transcribe**: $0.003/分（バッチのみ）、OpenAI推奨
- **Realtime API**: WebSocket/WebRTC対応だが、音声トークン $32/1M入力・$64/1M出力と高額

#### AssemblyAI Universal-3 Pro

2026年2月リリースの最新モデル。ノイズ耐性とプロンプト機能でDeepgramの有力な対抗馬。

- **料金**: $0.21/時（セッション課金＝壁時計時間）
- **遅延**: ~307ms（P50）— Deepgramの516msより41%高速
- **ノイズ耐性**: Deepgram Nova-3比 **28%改善**
- **プロンプト**: 最大1,500語のコンテキスト + 1,000語のカスタム語彙
- **注意**: 2026年2月中は5,000時間まで無料。詳細はSection 5参照

#### ElevenLabs Scribe v2 Realtime

超低遅延（~150ms）が特徴。会話AIエージェント向けだが、字幕表示にも有効。

#### Soniox v3

最安値（$0.12/時）で多言語精度トップクラス。コスト重視の場合に検討。

---

## 2. 翻訳 / LLM API比較

### 比較一覧

| API | 入力単価(/1M tok) | 出力単価(/1M tok) | ストリーミング | TTFT | EN→JP品質 | 用語集対応 | 音声入力 |
|-----|-------------------|-------------------|---------------|------|-----------|-----------|----------|
| **GPT-4.1 mini** | $0.40 | $1.60 | SSE | ~350ms | 非常に良い | プロンプト | なし |
| **GPT-4.1** | $2.00 | $8.00 | SSE | ~390ms | 優秀（文脈理解） | プロンプト | なし |
| **GPT-4o** | $2.50 | $10.00 | SSE | ~610ms | 非常に良い | プロンプト | なし |
| **Claude Haiku 4.5** | $1.00 | $5.00 | SSE | ~200ms | 良い〜非常に良い | プロンプト+キャッシュ | なし |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | SSE | ~500ms | 優秀 | プロンプト+キャッシュ | なし |
| **Gemini 3 Flash** | $0.50 | $3.00 | SSE | ~400ms | **非常に良い**（SimpleQA 68.7%） | プロンプト+Context Cache | なし |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | SSE | ~500ms | 良い | プロンプト | なし |
| **Gemini 2.0 Flash Live** | ~$0.10 | ~$0.40 | WebSocket | 低遅延 | 良い | プロンプト | **あり** |
| **DeepL Text** | ~$25/1M文字 | （含む） | なし | ~300ms | **最高**（1.7倍改善） | **ネイティブAPI** | なし |
| **DeepL Voice** | 要問合せ | 要問合せ | あり | TBD | **最高** | **ネイティブAPI** | **あり** |
| **Qwen-MT Turbo** | ~$0.25 | ~$0.50 | あり | 高速 | 優秀（CJK特化） | **ネイティブAPI** | なし |

### 詳細分析

#### GPT-4.1 mini（候補：代替翻訳エンジン）

コストと品質のバランスが優れているが、固有名詞の正確性（SimpleQA）でGemini 3 Flashに劣る。

- **料金**: $0.40/$1.60/1M tokens — GPT-4oの約83%安
- **コンテキスト窓**: 1Mトークン — 大量の事前調査データ・用語集を注入可能
- **TTFT**: ~350ms — リアルタイム字幕表示に十分な速度
- **CJK最適化**: 日本語出力のトークン効率が30-40%改善済み
- **SimpleQA**: 38.4% — Gemini 3 Flash（68.7%）に大きく劣る
- **用途**: フォールバック候補

> **最終選定**: メイン翻訳エンジンには **Gemini 3 Flash** を選定。SimpleQA 68.7%で固有名詞（ディズニーキャラ名、施設名等）の翻訳精度が高く、Murmurの用途に最適。3段階ティア構成（Gemini 2.5 Flash-Lite / Gemini 3 Flash / Claude Sonnet 4.5）で運用。

#### Claude Sonnet 4.5（推奨：高品質翻訳オプション）

EN→JP翻訳品質でトップクラス。WMT24翻訳コンペでは**Claude 3.5 Sonnet**が11言語ペア中9つで1位を獲得。後継のSonnet 4.5はさらに改善が期待される。

- **料金**: $3.00/$15.00/1M tokens
- **プロンプトキャッシュ**: コンテキストデータのキャッシュ読み取りが0.1倍コスト（$0.30/1M）
  - 同じコンテキストを使う連続翻訳リクエストで大幅コスト削減
- **用途**: 演劇の台詞など、ニュアンスが重要なコンテンツ向け

#### Gemini 2.5 Flash-Lite / Gemini 2.0 Flash Live API（注目：音声→テキスト一体型）

音声入力から翻訳テキスト出力までを1つのAPIで完結。Deepgram + LLM のパイプラインを置き換える可能性。

- **料金**: 音声25トークン/秒 → 約$0.0006/分（OpenAI Realtimeの1/100以下）
- **方式**: リアルタイム双方向ストリーミング（ターンベースではなく連続）
- **用途**: Phase 2以降で検証。コスト最適化の切り札

#### DeepL Voice API（2026年2月2日リリース）

DeepLの翻訳品質（EN→JPで1.7倍改善）に音声入力を統合。

- **状況**: リリース直後、料金未公開（API Proサブスクライバー向け）
- **用途**: 品質重視のユースケース。安定したら最有力候補

#### Qwen-MT Turbo（コスト最適化候補）

CJK翻訳に特化。ネイティブ用語集APIを持つ唯一の汎用翻訳モデル。

- **料金**: ~$0.50/1M出力トークン（GPT-4.1 miniの1/3）
- **特殊機能**: 用語介入、ドメインプロンプト、翻訳メモリをAPI側で管理
- **注意**: Alibaba Cloudのエコシステムへの依存

---

## 3. 事前調査（AI Agent / Web検索）API比較

### Web検索API

| API | 特徴 | 料金 | 用途 |
|-----|------|------|------|
| **Tavily Search API** | AI Agent向け最適化、構造化結果 | クレジットベース | コンテキスト収集のメイン検索 |
| **Tavily /research** | 完全自動マルチステップ調査 | クレジットベース | 深い調査（台本・あらすじ収集） |
| **Perplexity Sonar** | 検索+回答生成、引用付き | $1/$1/1M tokens | 簡易検索・要約 |
| **Perplexity Sonar Deep Research** | 自律的多段階調査 | $2/$8/1M tokens | 包括的な調査 |
| **Google Grounding** | Geminiモデルに検索統合 | $14-35/1K検索 | Gemini利用時 |
| **OpenAI Web Search** | Responses APIに統合 | クエリ課金 | OpenAI利用時 |

### Webスクレイピング

| API | 特徴 | 料金 |
|-----|------|------|
| **Firecrawl** | URL→LLM向けmarkdown変換、自然言語での構造化抽出 | 500クレジット無料、$16-333/月 |

### エージェントフレームワーク

| フレームワーク | 特徴 | 推奨度 |
|--------------|------|--------|
| **OpenAI Agents SDK** | 軽量、Python/TypeScript、ツール統合が容易 | 推奨（シンプルさ重視） |
| **LangGraph** | 状態管理付きグラフベース、複雑なワークフロー | 推奨（複雑な調査フロー） |
| **CrewAI** | ロールベースのマルチエージェント | 代替案 |

---

## 4. リアルタイム通信

### 推奨アーキテクチャ（クライアント直接接続方式）

> **設計変更**: Vercel Hobby（無料）はWebSocket非対応のため、クライアントからDeepgramへ直接接続する方式を採用。
> 翻訳はutterance毎の個別HTTPリクエスト（POST→SSE）で処理し、Vercelの10秒タイムアウト制限内で完結させる。

```
[スマートフォン (ブラウザ)]
    │
    ├── POST /api/deepgram-token ──→ Vercel API（一時トークン発行）
    │
    ├── 音声ストリーム（上り）──→ WebSocket(直接) ──→ Deepgram Nova-3
    │                                                    │
    │◄─── 文字起こしテキスト（クライアントで直接受信）◄──────┘
    │
    │   [UtteranceBuffer: 発話結合] → [SlidingWindow: 履歴付与]
    │
    ├── POST /api/translate ──→ Vercel API ──→ Gemini 3 Flash / Claude
    │                                                    │
    └── 翻訳テキスト（下り）◀── SSE ◀───────────────────┘
```

### 通信方式の選定

| 方式 | 方向 | 用途 | 選定理由 |
|------|------|------|----------|
| **WebSocket** | クライアント→Deepgram直接 | 音声データ送信 | 一時トークンでAPIキー保護、サーバー不要 |
| **POST→SSE** | クライアント→Vercel→LLM | 翻訳テキスト配信 | utterance毎の独立リクエスト、10秒以内で完結 |

### Deepgramブラウザ直接接続の認証フロー

```
1. クライアント → POST /api/deepgram-token → Vercel API
2. Vercel → POST https://api.deepgram.com/v1/auth/grant (TTL:600秒)
3. Vercel → クライアントに一時トークンを返却
4. クライアント → wss://api.deepgram.com/v1/listen (Sec-WebSocket-Protocol: ['token', tempToken])
5. 10分後にトークン失効 → 新しいトークンを取得して再接続
```

**制約**: Deepgram一時トークンは1日250個まで。1セッションで約6個消費（10分毎×1時間）。

---

## 5. 追加調査: 音声認識API再評価

レビューの指摘を受け、追加調査した結果を記載する。

### AssemblyAI Universal-3 Pro（2026年2月リリース）

Deepgram Nova-3の有力な対抗馬。特にプロンプト機能とノイズ耐性が優秀。

- **プロンプト機能**: 最大1,500語のコンテキスト + 1,000語のカスタム語彙をプロンプトで指定可能（モデル再学習不要）
- **ノイズ耐性**: Deepgram Nova-3比 **28%改善**
- **レイテンシ**: 307ms P50（AssemblyAIベンチマークにおけるword emission latency。同条件でのDeepgramは516ms。Deepgram公称の"<300ms"はprocessing latencyで測定手法が異なる）
- **料金**: $0.21/時（Deepgramの$0.46/時の半額以下）
- **注意**: 2026年2月中は5,000時間まで無料
- **Immutable Finals**: 確定結果が後から変わらないため、UX設計が容易

> **評価**: Murmurの用途に非常に適合。特にプロンプトベースのカスタマイズはコンテキスト登録機能との相性が良い。
> **Phase 2でABテスト実施を推奨**。無料期間中にDeepgramと並行テストすべき。

### Soniox v4（2026年2月28日移行）

コスト最適化候補。8,000トークンのコンテキスト対応が強力。

- **WER**: 6.5%（自社ベンチマーク、独立評価は未確認）
- **料金**: **$0.12/時**（Deepgramの1/4）
- **コンテキスト**: v4で最大8,000トークン対応
- **キーワードブースト**: あり（-50〜+50のブースト値）
- **注意**: 精度の独立評価が不足

### Web Speech API（フォールバック候補 → **不採用**）

- **iOS Safari**: continuous モードが実質使用不可（文字列が無限増加）
- **Android Chrome**: 初回のみ認識、自動停止する問題あり
- **結論**: リアルタイム連続音声認識には**不適切**。フォールバックとして採用しない。

### Speechmatics（参考調査）

- **特徴**: 音声認識+翻訳の一体型API（EN→JP含む69言語ペア）
- **遅延**: 1秒未満
- **料金**: $0.25〜$0.35/時（Deepgramより高い）
- **結論**: コスト面で不利。Phase 2以降の多言語対応時に再検討。

---

## 6. ホスティング比較

### 比較一覧

| サービス | WebSocket | 関数タイムアウト | Next.js対応 | 月額 |
|----------|----------|---------------|------------|------|
| **Vercel Hobby** | ❌ | 10秒 | ✅ 公式 | **$0** |
| Vercel Pro | ❌ | 300秒 | ✅ 公式 | $20 |
| **Cloudflare Pages** | ✅ Workers | 300秒CPU | ✅ OpenNext | **$0** |
| Railway Hobby | ✅ | 制限なし | ✅ | $5 |
| Fly.io | ✅ | 制限なし | ✅ standalone | $5〜 |
| Render | ✅ | 制限なし | ✅ | $7〜 |

### 選定: Vercel Hobby（$0/月）

**理由**: クライアント直接Deepgram接続方式を採用することで、WebSocket非対応の制約を回避可能。
Next.js公式サポートで最もデプロイが簡単。帯域100GB/月は音声データがVercelを経由しないため十分。

**代替案**: Cloudflare Pages（無料、WebSocket対応）。Vercel Hobbyの10秒制限が問題になった場合に移行。

---

## 7. 推奨構成とコスト試算

### Phase 1 (MVP) 推奨構成

| レイヤー | 選定 | 単価 | 月額固定 |
|----------|------|------|---------|
| ホスティング | **Vercel Hobby** | — | **$0** |
| 長時間処理 | **Supabase Edge Functions** | — | **$0** |
| データベース | **Supabase Free** | — | **$0** |
| 音声認識 | Deepgram Nova-3 | $0.46/時 | 従量課金 |
| 翻訳（標準） | Gemini 3 Flash | $0.50/$3.00/1M tokens | 従量課金 |
| 翻訳（低コスト） | Gemini 2.5 Flash-Lite | $0.10/$0.40/1M tokens | 従量課金 |
| 翻訳（高品質） | Claude Sonnet 4.5 | $3.00/$15.00/1M tokens | 従量課金 |
| 事前調査 | Tavily + Firecrawl | クレジットベース | 従量課金 |

**月額固定コスト: $0**（API従量課金のみ）

### 1時間利用あたりのコスト試算（standardティア）

> 前提: 120回/時の翻訳リクエスト（30秒に1回）。
> 各リクエスト入力: コンテキスト~500tok + 履歴~200tok + utterance~30tok = ~730tok

| 項目 | 想定 | コスト |
|------|------|--------|
| 音声認識 | 1時間連続 | $0.46 |
| 翻訳（入力） | ~88K tokens | $0.044 |
| 翻訳（出力） | ~24K tokens | $0.072 |
| **合計** | | **~$0.58/時** |

> Context Caching導入後は **~$0.50/時** まで削減見込み。

### Phase 2以降の検討事項

| 検討項目 | 候補 | 期待効果 |
|----------|------|----------|
| 音声認識精度向上 | AssemblyAI Universal-3 Pro | ノイズ耐性28%改善、コスト$0.21/時 |
| 音声→翻訳一体型 | Gemini 2.0 Flash Live API | コスト1/10以下、遅延削減 |
| 翻訳品質向上 | DeepL Voice API | EN→JP最高品質 |
| コスト削減 | Soniox v4 | 音声$0.12/hr、8Kトークンコンテキスト |
| ホスティング移行 | Cloudflare Pages | WebSocketサーバーサイドプロキシが必要になった場合 |

---

## 8. 調査ソース

- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI Realtime API Guide](https://platform.openai.com/docs/guides/realtime)
- [OpenAI GPT-4.1 Model Overview](https://platform.openai.com/docs/models/gpt-4.1)
- [Anthropic Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Deepgram Nova-3](https://deepgram.com/learn/introducing-nova-3-speech-to-text-api)
- [Deepgram Pricing](https://deepgram.com/pricing)
- [Deepgram Token-Based Authentication](https://developers.deepgram.com/guides/fundamentals/token-based-authentication)
- [Deepgram API Rate Limits](https://developers.deepgram.com/reference/api-rate-limits)
- [AssemblyAI Universal-3 Pro](https://www.assemblyai.com/blog/introducing-universal-3-pro)
- [AssemblyAI Streaming STT](https://www.assemblyai.com/products/streaming-speech-to-text)
- [Speechmatics Real-Time Translation](https://www.speechmatics.com/company/articles-and-news/speechmatics-to-launch-pioneering-real-time-speech-translation-capabilities)
- [Soniox Benchmarks](https://soniox.com/benchmarks)
- [Soniox Context Documentation](https://soniox.com/docs/stt/concepts/context)
- [ElevenLabs Scribe v2](https://elevenlabs.io/realtime-speech-to-text)
- [Google Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [DeepL Voice API Launch](https://gilbane.com/2026/02/deepl-launches-voice-api-for-real-time-speech-transcription-and-translation-for-instant-multilingual-communication/)
- [DeepL API Products](https://www.deepl.com/en/products/api)
- [Qwen-MT Translation Model](https://qwenlm.github.io/blog/qwen-mt/)
- [Tavily](https://www.tavily.com/)
- [Firecrawl](https://www.firecrawl.dev/)
- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Railway Pricing](https://railway.com/pricing)
