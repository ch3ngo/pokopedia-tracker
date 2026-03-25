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
