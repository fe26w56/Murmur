# Murmur セットアップガイド

本番環境のセットアップ手順。**あなたがやること**（ブラウザ操作 + API キー取得）と **Claude が CLI で実行すること**を分けて記載。

---

## 概要

```
あなた: 5 つの API キー / プロジェクトを作成して Claude に渡す
Claude: CLI で Supabase DB 構築 → Vercel デプロイ → OAuth 設定 を一括実行
```

---

## あなたがやること（5 ステップ）

全ステップ完了後、取得した値を Claude に渡してください。

### Step 1: Supabase プロジェクト作成

1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. **GitHub アカウント**でサインアップ / ログイン
4. ダッシュボードが表示されたら、緑色の **「New Project」** ボタンをクリック
5. フォームに入力:

   | 項目 | 値 |
   |------|-----|
   | Organization | 自分の Organization（初回は自動作成されている） |
   | Project name | `murmur` |
   | Database Password | 「Generate a password」で自動生成 → **必ずコピーしてメモ** |
   | Region | `Northeast Asia (Tokyo)` |
   | Pricing Plan | Free |

6. 「Create new project」をクリック
7. 1〜2 分待つとプロビジョニング完了
8. 完了後、**Project Settings** → **General** を開く
9. 「Reference ID」に表示されている文字列が **Project Ref**

   > 例: URL が `https://abcdefghij.supabase.co` なら、Project Ref は `abcdefghij`

**メモするもの:**
- [ ] Project Ref: `__________`
- [ ] DB Password: `__________`

---

### Step 2: Google OAuth クライアント ID 作成

> gcloud CLI でプロジェクト `murmur-app-2026` は作成済み。People API も有効化済み。
> この手順はブラウザで行う必要がある（gcloud CLI では OAuth クライアント ID を作成できない）。

#### 2-1. OAuth 同意画面の構成

1. https://console.cloud.google.com/apis/credentials/consent?project=murmur-app-2026 を開く
2. 「User Type」で **外部** を選択 → 「作成」
3. 以下を入力:

   | 項目 | 値 |
   |------|-----|
   | アプリ名 | `Murmur` |
   | ユーザーサポートメール | 自分のメールアドレス |
   | デベロッパーの連絡先情報 | 自分のメールアドレス |

4. 「保存して次へ」をクリック
5. **スコープ**画面: 何も変更せず「保存して次へ」
6. **テストユーザー**画面: 「+ ADD USERS」→ 自分のメールアドレスを追加 → 「保存して次へ」
7. 「ダッシュボードに戻る」

#### 2-2. OAuth クライアント ID の作成

1. https://console.cloud.google.com/apis/credentials?project=murmur-app-2026 を開く
2. 上部の **「+ 認証情報を作成」** → **「OAuth クライアント ID」** を選択
3. 以下を入力:

   | 項目 | 値 |
   |------|-----|
   | アプリケーションの種類 | **ウェブ アプリケーション** |
   | 名前 | `Murmur` |

4. **「承認済みのリダイレクト URI」** セクションで「+ URI を追加」をクリック
5. 以下を入力（**Step 1 の Project Ref を使う**）:
   ```
   https://<Project Ref>.supabase.co/auth/v1/callback
   ```
   例: Project Ref が `abcdefghij` なら:
   ```
   https://abcdefghij.supabase.co/auth/v1/callback
   ```
6. 「作成」をクリック
7. ポップアップに **Client ID** と **Client Secret** が表示される → **両方コピー**

**メモするもの:**
- [ ] Client ID: `__________`
- [ ] Client Secret: `__________`

---

### Step 3: Deepgram API キー取得

1. https://console.deepgram.com/ にアクセス
2. アカウント作成（メール or GitHub）→ ログイン
3. 左メニューの **「API Keys」** をクリック
4. **「Create a New API Key」** をクリック
5. 以下を入力:

   | 項目 | 値 |
   |------|-----|
   | Friendly Name | `murmur` |
   | Permissions | **Member** |
   | Expiration | **Never** |

6. 「Create Key」をクリック
7. 表示された API Key を **コピー**（この画面を閉じると二度と表示されない）

> 新規アカウントには **$200 の無料クレジット**が付与される。

**メモするもの:**
- [ ] Deepgram API Key: `__________`

---

### Step 4: Gemini API キー取得

1. https://aistudio.google.com/apikey にアクセス
2. Google アカウントでログイン
3. **「API キーを作成」**（または「Create API Key」）をクリック
4. プロジェクトを聞かれたら、どれでも OK（`murmur-app-2026` を選ぶのが理想）
5. 表示された API Key を **コピー**

> lite ティア（Gemini 2.5 Flash-Lite）と standard ティア（Gemini 3 Flash）で使用。

**メモするもの:**
- [ ] Gemini API Key: `__________`

---

### Step 5: Anthropic API キー取得

1. https://console.anthropic.com/ にアクセス
2. アカウント作成 → ログイン
3. 左メニューの **「API Keys」** をクリック
4. **「Create Key」** をクリック
5. Name: `murmur` → 「Create Key」
6. 表示された API Key を **コピー**

> premium ティア（Claude Sonnet 4.5）で使用。従量課金なので利用量に注意。

**メモするもの:**
- [ ] Anthropic API Key: `__________`

---

## Claude に渡すもの（チェックリスト）

全部揃ったら、以下のフォーマットで Claude に渡してください:

```
1. Supabase Project Ref: xxxxxx
2. Supabase DB Password: xxxxxx
3. Google OAuth Client ID: xxxxxx.apps.googleusercontent.com
4. Google OAuth Client Secret: GOCSPX-xxxxxx
5. Deepgram API Key: xxxxxx
6. Gemini API Key: xxxxxx
7. Anthropic API Key: xxxxxx
```

---

## Claude が実行すること

以下は全て Claude が CLI で自動実行する。手動操作は不要。

### A. Supabase DB セットアップ

```bash
npx supabase login                           # Supabase にログイン
npx supabase link --project-ref <REF>        # プロジェクトをリンク
npx supabase db push                         # テーブル作成（6 マイグレーション）
npx supabase db push --include-seed          # テンプレートデータ投入（26件）
```

### B. Supabase Google OAuth 設定

```bash
# config.toml を更新 → リモートに反映
npx supabase config push
```

### C. Vercel デプロイ

```bash
vercel link                                  # Vercel プロジェクト作成
vercel env add NEXT_PUBLIC_SUPABASE_URL      # 環境変数 6 つを設定
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DEEPGRAM_API_KEY
vercel env add GEMINI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel deploy --prod                         # 本番デプロイ
```

### D. 本番 URL 反映

```bash
# Supabase の site_url を Vercel 本番 URL に更新
npx supabase config push
```

---

## 動作確認

### ローカル

```bash
pnpm dev  # http://localhost:3000
```

1. Google ログインでサインイン
2. ホーム画面が表示される
3. 「コンテキスト」タブでテンプレートからコンテキスト作成
4. 「翻訳」タブでライブ翻訳を開始（マイク許可が必要）
5. 英語の音声 → 日本語字幕が表示される

### 本番

1. Vercel の本番 URL にアクセス
2. 同様のフローで動作確認

---

## トラブルシューティング

### ログインできない

- OAuth 同意画面が「テスト」モードの場合、テストユーザーに登録したメールでのみログイン可
- Supabase の Redirect URL と Google Cloud のリダイレクト URI が一致しているか確認
- ブラウザのサードパーティ Cookie がブロックされていないか確認

### マイクが使えない

- HTTPS 環境でのみマイクアクセス許可される（localhost は例外）
- ブラウザ設定でマイク使用を許可しているか確認
- iOS Safari: 設定 → Safari → マイク → 許可

### Deepgram に接続できない

- `DEEPGRAM_API_KEY` が正しいか確認
- Deepgram ダッシュボードでクレジット残高を確認
- API キーの権限が `Member` 以上か確認

### 翻訳が返ってこない

- `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` が正しいか確認
- ブラウザ DevTools → Network で `/api/translate` のレスポンスを確認
- Vercel ログ: `vercel logs --follow`

### Vercel デプロイが失敗する

- `vercel env ls` で環境変数が全て設定されているか確認
- ローカルでビルド: `pnpm build`
- Node.js バージョン: Vercel Settings → General → `22.x`
