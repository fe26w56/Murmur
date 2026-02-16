'use client';

import { useSettingsStore } from '@/stores/settingsStore';

const tierOptions = [
  { value: 'lite' as const, label: 'Lite', desc: '案内板・簡単な説明向け' },
  { value: 'standard' as const, label: 'Standard', desc: 'アトラクション・一般翻訳' },
  { value: 'premium' as const, label: 'Premium', desc: '演劇・文学的翻訳' },
];

export default function SettingsPage() {
  const { fontSize, showOriginal, defaultTier, setFontSize, setShowOriginal, setDefaultTier } =
    useSettingsStore();

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-lg font-semibold">設定</h1>

      {/* Display settings */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">表示設定</h2>
        <div className="space-y-4 rounded-xl bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">字幕の文字サイズ</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">原文を表示</span>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                showOriginal ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  showOriginal ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Translation settings */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">翻訳設定</h2>
        <div className="space-y-2">
          {tierOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDefaultTier(opt.value)}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                defaultTier === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
              </div>
              {defaultTier === opt.value && (
                <div className="h-5 w-5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
