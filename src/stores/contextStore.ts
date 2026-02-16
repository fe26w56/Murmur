import { create } from "zustand";
import type { Context, ContextTemplate } from "@/types/database";

interface ContextState {
  contexts: Context[];
  templates: ContextTemplate[];
  total: number;
  loading: boolean;
  setContexts: (contexts: Context[], total: number) => void;
  addContext: (context: Context) => void;
  updateContext: (context: Context) => void;
  removeContext: (id: string) => void;
  appendContexts: (contexts: Context[]) => void;
  setTemplates: (templates: ContextTemplate[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  contexts: [],
  templates: [],
  total: 0,
  loading: false,
  setContexts: (contexts, total) => set({ contexts, total }),
  addContext: (context) =>
    set((state) => ({
      contexts: [context, ...state.contexts],
      total: state.total + 1,
    })),
  updateContext: (context) =>
    set((state) => ({
      contexts: state.contexts.map((c) => (c.id === context.id ? context : c)),
    })),
  removeContext: (id) =>
    set((state) => ({
      contexts: state.contexts.filter((c) => c.id !== id),
      total: state.total - 1,
    })),
  appendContexts: (contexts) =>
    set((state) => ({
      contexts: [...state.contexts, ...contexts],
    })),
  setTemplates: (templates) => set({ templates }),
  setLoading: (loading) => set({ loading }),
}));
