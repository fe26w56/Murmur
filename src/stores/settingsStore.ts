import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TranslationTier } from "@/types/database";

type FontSize = "small" | "medium" | "large";

interface SettingsState {
  fontSize: FontSize;
  showOriginal: boolean;
  defaultTier: TranslationTier;
  setFontSize: (size: FontSize) => void;
  setShowOriginal: (show: boolean) => void;
  setDefaultTier: (tier: TranslationTier) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: "medium",
      showOriginal: false,
      defaultTier: "standard",
      setFontSize: (fontSize) => set({ fontSize }),
      setShowOriginal: (showOriginal) => set({ showOriginal }),
      setDefaultTier: (defaultTier) => set({ defaultTier }),
    }),
    {
      name: "murmur-settings",
    },
  ),
);
