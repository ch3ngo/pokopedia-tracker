import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PokemonProgress, HabitatProgress } from "../types";

// ─── Progress store (localStorage) ───────────────────────────────────────────
interface ProgressStore {
  pokemon: Record<number, PokemonProgress>;
  habitats: Record<number, HabitatProgress>;
  updatePokemon: (id: number, update: Partial<PokemonProgress>) => void;
  updateHabitat: (id: number, update: Partial<HabitatProgress>) => void;
  importProgress: (data: { pokemon: PokemonProgress[]; habitats: HabitatProgress[] }) => void;
  exportProgress: () => { pokemon: PokemonProgress[]; habitats: HabitatProgress[] };
  clear: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      pokemon: {},
      habitats: {},

      updatePokemon: (id, update) =>
        set((state) => {
          const base: PokemonProgress = state.pokemon[id] ?? {
            pokemon_id: id,
            is_caught: false,
            zone: null,
            notes: null,
          };
          return { pokemon: { ...state.pokemon, [id]: { ...base, ...update } } };
        }),

      updateHabitat: (id, update) =>
        set((state) => {
          const base: HabitatProgress = state.habitats[id] ?? {
            habitat_id: id,
            is_built: false,
            pokemon_attracted: [],
          };
          return { habitats: { ...state.habitats, [id]: { ...base, ...update } } };
        }),

      importProgress: (data) => {
        const pokemon: Record<number, PokemonProgress> = {};
        const habitats: Record<number, HabitatProgress> = {};
        data.pokemon.forEach((p) => (pokemon[p.pokemon_id] = p));
        data.habitats.forEach((h) => (habitats[h.habitat_id] = h));
        set({ pokemon, habitats });
      },

      exportProgress: () => ({
        pokemon: Object.values(get().pokemon),
        habitats: Object.values(get().habitats),
      }),

      clear: () => set({ pokemon: {}, habitats: {} }),
    }),
    { name: "pokopedia-progress" }
  )
);

// ─── Todo store ───────────────────────────────────────────────────────────────
export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text) => {
        const trimmed = text.trim().slice(0, 200);
        if (!trimmed) return;
        set((state) => ({
          todos: [...state.todos, { id: Date.now().toString(), text: trimmed, done: false }],
        }));
      },
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
      clearCompleted: () =>
        set((state) => ({ todos: state.todos.filter((t) => !t.done) })),
    }),
    { name: "pokopedia-todos" }
  )
);

// ─── Zone comfort store ───────────────────────────────────────────────────────
interface ZoneStore {
  comfort: Record<string, number>;
  setComfort: (zone: string, value: number) => void;
}

export const useZoneStore = create<ZoneStore>()(
  persist(
    (set) => ({
      comfort: {},
      setComfort: (zone, value) =>
        set((state) => ({ comfort: { ...state.comfort, [zone]: value } })),
    }),
    { name: "pokopedia-zones" }
  )
);

// ─── Daily reminders store ────────────────────────────────────────────────────
const DAILY_KEYS = ["stamp", "mosslax", "plants", "dreamIsland"] as const;
export type DailyKey = typeof DAILY_KEYS[number];

interface DailyStore {
  done: Record<DailyKey, boolean>;
  lastDate: string;
  toggle: (key: DailyKey) => void;
  resetIfNewDay: () => void;
}

const todayStr = () => {
  const now = new Date();
  // Before 5am still counts as the previous day
  if (now.getHours() < 5) now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const emptyDone = (): Record<DailyKey, boolean> => ({ stamp: false, mosslax: false, plants: false, dreamIsland: false });

export const useDailyStore = create<DailyStore>()(
  persist(
    (set, get) => ({
      done: emptyDone(),
      lastDate: todayStr(),
      toggle: (key) =>
        set((state) => ({ done: { ...state.done, [key]: !state.done[key] } })),
      resetIfNewDay: () => {
        const today = todayStr();
        if (get().lastDate !== today) {
          set({ done: emptyDone(), lastDate: today });
        }
      },
    }),
    { name: "pokopedia-daily" }
  )
);

// ─── Theme / UI store ─────────────────────────────────────────────────────────
interface UIStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        document.documentElement.classList.toggle("dark", next === "dark");
        set({ theme: next });
      },
    }),
    { name: "pokopedia-ui" }
  )
);
