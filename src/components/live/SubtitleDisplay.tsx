'use client';

import type { TranslationEntry } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';

interface SubtitleDisplayProps {
  translations: TranslationEntry[];
  interimText: string;
}

const fontSizeMap = {
  small: 'text-base',
  medium: 'text-xl',
  large: 'text-2xl',
};

export function SubtitleDisplay({ translations, interimText }: SubtitleDisplayProps) {
  const { fontSize, showOriginal } = useSettingsStore();
  const sizeClass = fontSizeMap[fontSize];

  // Show last 3 translations
  const visible = translations.slice(-3);

  return (
    <div className="flex flex-1 flex-col justify-end p-4">
      {/* Interim transcription (top area) */}
      {interimText && (
        <p className="mb-4 text-sm text-muted-foreground italic">{interimText}</p>
      )}

      {/* Subtitle entries */}
      <div className="space-y-3">
        {visible.map((entry, i) => {
          const isLatest = i === visible.length - 1;
          const opacity = isLatest ? 'opacity-100' : i === visible.length - 2 ? 'opacity-50' : 'opacity-30';

          return (
            <div key={entry.sequenceNumber} className={`transition-opacity duration-500 ${opacity}`}>
              {showOriginal && entry.original && (
                <p className="text-sm text-muted-foreground">{entry.original}</p>
              )}
              <p className={`font-medium leading-relaxed ${sizeClass}`}>
                {entry.translated}
                {entry.isStreaming && (
                  <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-foreground" />
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
