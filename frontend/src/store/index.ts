import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PokemonProgress, HabitatProgress, User } from "../types";

// ─── Auth store ───────────────────────────────────────────────────────────────
interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
    }),
    { name: "pokopedia-auth" }
  )
);

// ─── Guest progress store (localStorage) ─────────────────────────────────────
interface GuestProgressStore {
  pokemon: Record<number, PokemonProgress>;
  habitats: Record<number, HabitatProgress>;
  updatePokemon: (id: number, update: Partial<PokemonProgress>) => void;
  updateHabitat: (id: number, update: Partial<HabitatProgress>) => void;
  importProgress: (data: { pokemon: PokemonProgress[]; habitats: HabitatProgress[] }) => void;
  exportProgress: () => { pokemon: PokemonProgress[]; habitats: HabitatProgress[] };
  clear: () => void;
}

export const useGuestStore = create<GuestProgressStore>()(
  persist(
    (set, get) => ({
      pokemon: {},
      habitats: {},

      updatePokemon: (id, update) =>
        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [id]: {
              pokemon_id: id,
              is_seen: false,
              is_caught: false,
              zone: null,
              notes: null,
              ...state.pokemon[id],
              ...update,
            },
          },
        })),

      updateHabitat: (id, update) =>
        set((state) => ({
          habitats: {
            ...state.habitats,
            [id]: {
              habitat_id: id,
              is_built: false,
              pokemon_attracted: [],
              ...state.habitats[id],
              ...update,
            },
          },
        })),

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
    { name: "pokopedia-guest-progress" }
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
