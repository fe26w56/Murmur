import { create } from 'zustand';

type TranslationTier = 'lite' | 'standard' | 'premium';

type LiveState = {
  isRecording: boolean;
  currentTier: TranslationTier;
  sessionId: string | null;
  contextId: string | null;
  elapsedSeconds: number;
};

type LiveActions = {
  setRecording: (isRecording: boolean) => void;
  setTier: (tier: TranslationTier) => void;
  setSessionId: (id: string | null) => void;
  setContextId: (id: string | null) => void;
  setElapsedSeconds: (seconds: number) => void;
  reset: () => void;
};

const initialState: LiveState = {
  isRecording: false,
  currentTier: 'standard',
  sessionId: null,
  contextId: null,
  elapsedSeconds: 0,
};

export const useLiveStore = create<LiveState & LiveActions>()((set) => ({
  ...initialState,
  setRecording: (isRecording) => set({ isRecording }),
  setTier: (tier) => set({ currentTier: tier }),
  setSessionId: (id) => set({ sessionId: id }),
  setContextId: (id) => set({ contextId: id }),
  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
  reset: () => set(initialState),
}));
