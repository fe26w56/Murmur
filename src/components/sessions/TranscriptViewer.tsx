'use client';

import { useSettingsStore } from '@/stores/settingsStore';

interface Transcript {
  id: string;
  original_text: string;
  translated_text: string;
  timestamp_ms: number;
}

interface TranscriptViewerProps {
  transcripts: Transcript[];
  startedAt: string;
}

const fontSizeMap = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

export function TranscriptViewer({ transcripts, startedAt }: TranscriptViewerProps) {
  const { fontSize, showOriginal } = useSettingsStore();
  const sizeClass = fontSizeMap[fontSize];
  const startTime = new Date(startedAt).getTime();

  if (transcripts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <p className="text-sm text-muted-foreground">トランスクリプトがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcripts.map((t) => {
        const elapsed = Math.max(0, Math.round((t.timestamp_ms - startTime) / 1000));
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;
        const timeLabel = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        return (
          <div key={t.id} className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">{timeLabel}</span>
            <div className="min-w-0 flex-1">
              {showOriginal && t.original_text && (
                <p className="text-sm text-muted-foreground">{t.original_text}</p>
              )}
              <p className={`leading-relaxed ${sizeClass}`}>{t.translated_text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
