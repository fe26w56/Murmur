'use client';

type TranslationTier = 'lite' | 'standard' | 'premium';

interface LiveControlsProps {
  isRecording: boolean;
  tier: TranslationTier;
  elapsedSeconds: number;
  volume: number;
  onStart: () => void;
  onStop: () => void;
  onTierChange: (tier: TranslationTier) => void;
}

const tierOptions: { value: TranslationTier; label: string; sub: string }[] = [
  { value: 'lite', label: 'lite', sub: '案内板' },
  { value: 'standard', label: 'standard', sub: 'アトラクション' },
  { value: 'premium', label: 'premium', sub: '演劇' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function LiveControls({
  isRecording,
  tier,
  elapsedSeconds,
  volume,
  onStart,
  onStop,
  onTierChange,
}: LiveControlsProps) {
  if (isRecording) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        {/* Volume indicator */}
        <div className="flex items-center gap-2">
          <div className="flex h-4 items-end gap-0.5">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${
                  volume >= threshold ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ height: `${(i + 1) * 3 + 4}px` }}
              />
            ))}
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-medium text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          録音停止
        </button>

        {/* Recording indicator */}
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          <span className="text-destructive font-medium">REC</span>
          <span className="text-muted-foreground">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Tier selector */}
      <div>
        <label className="mb-2 block text-sm font-medium">翻訳ティア</label>
        <div className="flex rounded-[22px] bg-muted p-1">
          {tierOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTierChange(opt.value)}
              className={`flex-1 rounded-[18px] py-2 text-center transition-colors ${
                tier === opt.value ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xs font-medium">{opt.label}</span>
              <br />
              <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
        録音開始
      </button>
    </div>
  );
}
