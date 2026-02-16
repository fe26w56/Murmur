import { create } from 'zustand';

type ContextState = {
  selectedContextId: string | null;
};

type ContextActions = {
  setSelectedContextId: (id: string | null) => void;
};

export const useContextStore = create<ContextState & ContextActions>()((set) => ({
  selectedContextId: null,
  setSelectedContextId: (id) => set({ selectedContextId: id }),
}));
