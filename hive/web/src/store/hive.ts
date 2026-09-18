import { create } from 'zustand';
import { api } from '@/lib/api';
import type { HiveEvent, HiveState } from '@/lib/types';

interface HiveStore {
  data: HiveState | null;
  events: HiveEvent[];
  live: boolean;
  error: string | null;
  lastDeploy: HiveEvent | null;
  refresh: () => Promise<void>;
  connect: () => () => void;
  dismissDeploy: () => void;
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

export const useHive = create<HiveStore>((set, get) => ({
  data: null,
  events: [],
  live: false,
  error: null,
  lastDeploy: null,

  refresh: async () => {
    try {
      const data = await api.get<HiveState>('/api/state');
      set({ data, events: data.events, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // One SSE stream feeds the whole app. File-change noise updates the feed only;
  // anything else triggers a debounced state refresh.
  connect: () => {
    const es = new EventSource('/api/stream');
    es.onopen = () => set({ live: true });
    es.onerror = () => set({ live: false });
    es.onmessage = m => {
      const ev: HiveEvent = JSON.parse(m.data);
      set(s => ({ events: [ev, ...s.events].slice(0, 500), ...(ev.type === 'deploy.alert' ? { lastDeploy: ev } : {}) }));
      if (ev.type !== 'files.changed') {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => get().refresh(), 350);
      }
    };
    const poll = setInterval(() => get().refresh(), 30000);
    return () => { es.close(); clearInterval(poll); };
  },

  dismissDeploy: () => set({ lastDeploy: null }),
}));

// Stable empty arrays: a selector that returns a fresh [] loops React forever.
export const EMPTY: never[] = [];

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useTasks = () => useHive(s => s.data?.tasks ?? EMPTY);
export const useRuns = () => useHive(s => s.data?.runs ?? EMPTY);
