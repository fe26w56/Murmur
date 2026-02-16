import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontSize = 'small' | 'medium' | 'large';
type TranslationTier = 'lite' | 'standard' | 'premium';

type SettingsState = {
  fontSize: FontSize;
  showOriginal: boolean;
  defaultTier: TranslationTier;
};

type SettingsActions = {
  setFontSize: (size: FontSize) => void;
  setShowOriginal: (show: boolean) => void;
  setDefaultTier: (tier: TranslationTier) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      showOriginal: true,
      defaultTier: 'standard',
      setFontSize: (fontSize) => set({ fontSize }),
      setShowOriginal: (showOriginal) => set({ showOriginal }),
      setDefaultTier: (defaultTier) => set({ defaultTier }),
    }),
    {
      name: 'murmur-settings',
    },
  ),
);
