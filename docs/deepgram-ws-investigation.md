# Deepgram WebSocket 接続失敗 調査レポート

## 現象

本番環境で Deepgram への WebSocket 接続が失敗する。

```
WebSocket connection to 'wss://api.deepgram.com/v1/listen?model=nova-3&language=en&punctuate=true&interim_results=true&utterance_end_ms=2000' failed:
```

## 接続フロー

```
ブラウザ
  → POST /api/deepgram-token (Next.js API Route)
  → サーバーが Deepgram API から一時トークンを取得して返す
  → ブラウザが new WebSocket(url, ['token', token]) で Deepgram に直接接続
```

## 仮説

| # | 仮説 | 検証方法 |
|---|------|----------|
| H1 | `/v1/auth/grant` の JWT が `['token', jwt]` サブプロトコルで認証できない | Node.js `ws` ライブラリで実 WebSocket 接続テスト |
| H2 | TTL パラメータ名が誤りで TTL が反映されていない | `time_to_live_in_seconds` と `ttl_seconds` の両方でレスポンス比較 |
| H3 | `/v1/projects/{id}/keys` の一時 API キーなら WS 認証が通る | 一時キーで実 WebSocket 接続テスト |
| H4 | API キー自体の権限・有効性に問題がある | メインキーで Deepgram REST API を呼べるか確認 |

## 検証環境

- 検証ツール: Node.js `ws` ライブラリ (v8.19.0) による実 WebSocket 接続
- curl による検証は補助的な参考情報として記載（WebSocket ハンドシェイクを完了できないため確定的でない）
- 検証日時: 2026-02-16

---

## 検証結果

### H4: API キーの有効性

```bash
curl -s "https://api.deepgram.com/v1/projects" \
  -H "Authorization: Token <DEEPGRAM_API_KEY>"
```

```
HTTP 200 → API キーは有効
```

**結果: ❌ 否定** — API キー自体に問題なし。

---

### H2: TTL パラメータ名の誤り

#### 誤ったパラメータ名 `time_to_live_in_seconds`（修正前コードで使用）

```bash
curl -s -X POST "https://api.deepgram.com/v1/auth/grant" \
  -H "Authorization: Token <DEEPGRAM_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"time_to_live_in_seconds": 600}'
```

```json
{ "access_token": "eyJ0eXA...", "expires_in": 30 }
```

TTL が 600s にならず、デフォルト値 30s で返る。

#### 正しいパラメータ名 `ttl_seconds`（[公式リファレンス](https://developers.deepgram.com/reference/auth/tokens/grant) 準拠）

```bash
curl -s -X POST "https://api.deepgram.com/v1/auth/grant" \
  -H "Authorization: Token <DEEPGRAM_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"ttl_seconds": 600}'
```

```json
{ "access_token": "eyJ0eXA...", "expires_in": 600 }
```

TTL が正しく 600s で返る。

**結果: ✅ 確定** — パラメータ名の誤りにより TTL が常にデフォルト 30 秒だった。これは **根本原因の一つ**。

---

### H1: JWT の WebSocket サブプロトコル認証

正しい `ttl_seconds` で取得した JWT（`expires_in: 600`）を使い、Node.js `ws` ライブラリで実 WebSocket 接続をテスト。

```javascript
const WebSocket = require('ws');

// Test A: JWT + subprotocol ['token', jwt]（ブラウザ互換）
const wsA = new WebSocket(url, ['token', jwt]);

// Test B: JWT + Authorization: Bearer ヘッダー（サーバーサイドのみ）
const wsB = new WebSocket(url, { headers: { Authorization: `Bearer ${jwt}` } });

// Test C: JWT + subprotocol ['bearer', jwt]（ブラウザ互換）
const wsC = new WebSocket(url, ['bearer', jwt]);
```

| テスト | 認証方式 | ブラウザ互換 | 結果 |
|--------|----------|:---:|------|
| A | `['token', jwt]` | ✅ | **401 INVALID_AUTH** |
| B | `Authorization: Bearer jwt` ヘッダー | ❌ | **CONNECTED** |
| C | `['bearer', jwt]` | ✅ | **CONNECTED** |

**結果: ✅ 部分確定** — JWT は `['token', ...]` サブプロトコルでは認証できないが、`['bearer', ...]` サブプロトコルなら認証できる。`Authorization: Bearer` ヘッダーも使えるが、ブラウザ WebSocket API ではカスタムヘッダーを設定できないため使用不可。

> **注**: Deepgram の [Sec-WebSocket-Protocol ドキュメント](https://developers.deepgram.com/docs/using-the-sec-websocket-protocol) には `['token', API_KEY]` のみが記載されており、`['bearer', JWT]` は未記載。

---

### H3: 一時 API キーでの WS 接続

```javascript
// Test D: 一時APIキー + subprotocol ['token', tempKey]（ブラウザ互換）
const wsD = new WebSocket(url, ['token', tempKey]);

// Test E: メインAPIキー + subprotocol ['token', apiKey]（参考）
const wsE = new WebSocket(url, ['token', apiKey]);
```

| テスト | 認証方式 | 結果 |
|--------|----------|------|
| D | 一時キー + `['token', tempKey]` | **CONNECTED** |
| E | メインキー + `['token', apiKey]` | **CONNECTED** |

**結果: ✅ 確定** — 一時 API キーは `['token', ...]` サブプロトコルで認証できる。

**ただし、一時 API キーには [1日250件の作成制限](https://developers.deepgram.com/docs/create-additional-api-keys) がある。**

---

## 全体まとめ

### 仮説の最終結果

| # | 仮説 | 結果 |
|---|------|------|
| H1 | JWT は `['token', jwt]` サブプロトコルで認証できない | **✅ 確定**（ただし `['bearer', jwt]` なら認証可能） |
| H2 | TTL パラメータ名が誤り | **✅ 確定**（`time_to_live_in_seconds` → `ttl_seconds` が正しい） |
| H3 | 一時 API キーなら WS 認証が通る | **✅ 確定**（ただし 250件/日制限あり） |
| H4 | API キー自体の問題 | **❌ 否定** |

### WebSocket 認証の全パターン比較（Node.js `ws` による実接続結果）

| # | 認証方式 | ブラウザ互換 | 結果 |
|---|----------|:---:|------|
| 1 | API キー + `['token', key]` | ✅ | **CONNECTED** |
| 2 | 一時 API キー + `['token', tempKey]` | ✅ | **CONNECTED** |
| 3 | JWT + `['token', jwt]` | ✅ | **401 REJECTED** |
| 4 | JWT + `['bearer', jwt]` | ✅ | **CONNECTED** |
| 5 | JWT + `Authorization: Bearer` ヘッダー | ❌ | **CONNECTED** |
| 6 | JWT + `['authorization', jwt]` | ✅ | **401 REJECTED** |

## 根本原因

2 つの問題が重なっていた:

1. **TTL パラメータ名の誤り**: `time_to_live_in_seconds`（誤）→ `ttl_seconds`（正）。未知のパラメータは無視され、デフォルト 30 秒が適用されていた。
2. **サブプロトコル名の不一致**: JWT トークンには `['bearer', jwt]` を使う必要があるが、コードは `['token', jwt]` を使用していた。`['token', ...]` は API キー専用。

## 修正方針の比較

| 方針 | 変更箇所 | メリット | デメリット |
|------|----------|---------|-----------|
| **A: JWT + `['bearer', jwt]`** | route.ts: `ttl_seconds` に修正<br>useDeepgramLive.ts: subprotocol を `['bearer', token]` に変更 | レート制限なし、公式推奨の一時認証方式 | `['bearer', ...]` が公式ドキュメントに未記載 |
| B: 一時 API キー + `['token', key]` | route.ts: `/v1/projects/{id}/keys` に変更（現在デプロイ中） | ドキュメント記載の方式 | **250件/日制限**、プロジェクトID取得が必要 |

**推奨: 方針 A**（JWT + `['bearer', jwt]`）

- `/v1/auth/grant` は Deepgram が公式に推奨する [Token-Based Authentication](https://developers.deepgram.com/guides/fundamentals/token-based-authentication) の仕組み
- レート制限の心配がない
- 一時 API キーの 250件/日制限を回避できる
- `['bearer', ...]` サブプロトコルは未記載だが、実際に動作することを Node.js `ws` で確認済み

### 追加発見: Nova-3 の `keywords` パラメータ非対応

方針 A で認証を修正後もブラウザで接続が失敗した。Node.js `ws` で同一 URL（キーワード付き）をテストしたところ、真の原因が判明:

```json
{
  "err_code": "INVALID_QUERY_PARAMETER",
  "err_msg": "Keywords are not supported for Nova-3. Please use `keyterm` instead."
}
```

Deepgram Nova-3 では `keywords` パラメータが廃止され、`keyterm` に変更されている。ブラウザの WebSocket エラーは HTTP ステータスコードやレスポンスボディを表示しないため、認証エラーと区別がつかなかった。

### 修正ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/app/api/deepgram-token/route.ts` | `/v1/auth/grant` + `ttl_seconds` に修正 |
| `src/hooks/useDeepgramLive.ts` | subprotocol を `['token', token]` → `['bearer', token]` に変更 |
| `src/hooks/useDeepgramLive.ts` | `keywords=` → `keyterm=` に変更（Nova-3 対応） |
