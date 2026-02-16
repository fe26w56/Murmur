# Murmur - 実装計画書レビュー報告書

> レビュー実施日: 2026-02-16
> 対象: 05-implementation-plan.md
> 参照: 03-system-design.md / 01-requirements.md / 02-api-research.md
> レビューラウンド: 4回実施

---

## 総合評価

| ラウンド | 評価 | Critical | Major | Minor | 備考 |
|---------|------|----------|-------|-------|------|
| Round 1 | B+ | 0 | 5 | 12 | 初版レビュー |
| Round 2 | A- | 0 | 1 | 5 | Major 5件+Minor 12件を修正 |
| Round 3 | A- | 0 | 1 | 5 | Major 1件+Minor 5件を修正 |
| **Round 4** | **A** | **0** | **0** | **3** | Major 1件+Minor 5件を修正。**実装着手推奨** |

---

## レビュー指摘事項の対応履歴

### Round 1 → Round 2 で修正した項目

#### Major（5件）

| # | 指摘 | 修正内容 |
|---|------|---------|
| M1 | Phase 2除外リストが不十分 | AI自動調査の具体ファイル名（research/route.ts, ResearchProgress.tsx, research-agent.ts）を明示 |
| M2 | context_status ENUMの扱い | Sprint 0に「Phase 2に備え定義するがMVPでは `ready` のみ使用」と注記 |
| M3 | src/プレフィックスが欠落 | 1.1節に「パス規約」として記載 |
| M4 | テンプレートIDがTEXTスラッグである旨 | タスク2-3に例（`"wdw-mk-haunted-mansion"`）を追加 |
| M5 | ユニットテストがSprint 5に先送り | Sprint 3にタスク3-16〜3-18としてユニットテストを移動 |

#### Minor（12件）

| # | 指摘 | 修正内容 |
|---|------|---------|
| m1 | audio/mp4フォールバック | タスク3-2に記載 |
| m2 | sort_order | タスク2-1に記載 |
| m3 | description列 | タスク2-2に記載 |
| m4 | セッションtitle自動生成 | タスク4-1に記載 |
| m5 | premiumティアTTFT注記 | リスク表に追加 |
| m6 | 2秒タイムアウト | タスク3-4に記載 |
| m7 | contextStore.ts | タスク2-12として追加 |
| m8 | KeepAliveメッセージ | Deepgram接続フローに追加 |
| m9 | Sprint 3の分割検討 | 情報提供（現行の粒度で実装可能と判断） |
| m10 | channels:'1'とencoding | 4.4節コードパターンに反映 |
| m11 | Sprint 5タスク番号修正 | 5-10〜5-13にリナンバー |
| m12 | テスト戦略表の時期明示 | Sprint 3 / Sprint 5 の実施時期を明記 |

### Round 2 → Round 3 で修正した項目

| # | 指摘 | 重要度 | 修正内容 |
|---|------|--------|---------|
| R2-M1 | KeepAlive間隔がdesign.mdと不一致（10秒 vs 5秒） | Major | 5秒に統一 |
| R2-m1 | MVPコンテキストの `status = 'ready'` INSERT未明記 | Minor | 「INSERT時に明示的に指定する」旨を追記 |
| R2-m2 | MIMEタイプとDeepgram encodingの対応が不明確 | Minor | 対応表を追加 |
| R2-m3 | 3層コンテキスト圧縮のMVP対応が不明確 | Minor | タスク3-7に「Layer 3相当のみ」と補足 |
| R2-m4 | controller.close()後のDB保存 | Minor | DB保存をclose前に移動 |
| R2-m5 | テキスト検索のPhase未定義 | Minor | Phase 2除外リストに追加 |

### Round 3 → Round 4 で修正した項目

| # | 指摘 | 重要度 | 修正内容 |
|---|------|--------|---------|
| R3-M1 | MIMEタイプ対応表のencoding/sample_rate指定が不正確 | Major | コンテナフォーマットは自動検出と修正。design.mdも同時修正 |
| R3-m1 | SSE完了イベントに `original` フィールド欠落 | Minor | コード例に `original: body.utterance` を追加 |
| R3-m2 | 「非同期保存」表現の矛盾 | Minor | 「SSE close前に完了」に修正。design.mdのフロー図も同時修正 |
| R3-m3 | design.mdに audio/mp4 フォールバック未記載 | Minor | design.mdに記述追加 |
| R3-m4 | utterance_end_ms/vad_events がdesign.md未記載 | Minor | design.mdのDeepgramパラメータに追加 |
| R3-m5 | 「プロンプト500トークン以下」の対象が曖昧 | Minor | 「CompactContextを500トークン以下、全体~1000トークン」に修正 |

### Round 4 残存事項（Minor 3件、情報提供レベル）

| # | 指摘 | 重要度 | 対応 |
|---|------|--------|------|
| R4-m1 | design.mdのエクスポートAPIにPhase注記なし | Minor | Phase 3注記を追加済み |
| R4-m2 | design.mdの調査APIにPhase注記なし | Minor | Phase 2注記を追加済み |
| R4-m3 | design.md技術スタック表のnext-pwaはPhase 3 | Minor | 情報（design.mdは全Phase対象のため問題なし） |

---

## 結論

**実装計画書がA評価に到達。Critical/Major指摘ゼロ。MVPの実装着手を推奨する。**

4ラウンドのレビューを通じて、以下の品質が確認された:

1. **MVPスコープの明確性**: Phase 1〜3の境界が明確で、除外リストが具体的
2. **技術的正確性**: Deepgramパラメータ、Vercel Hobby制約回避、SSEパターンが正確
3. **3ドキュメント間の整合性**: requirements.md / design.md / implementation-plan.md の整合が確認済み
4. **テスト戦略**: コアロジックのユニットテストがSprint 3内で実施される設計（テスト左シフト）
5. **リスク対策**: iOS Safari互換性チェックリスト、トークン制限、コスト管理が具体的
