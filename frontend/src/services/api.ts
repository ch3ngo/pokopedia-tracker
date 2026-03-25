import axios from "axios";
import type {
  Pokemon,
  Habitat,
  PokemonProgress,
  HabitatProgress,
  FullProgress,
  User,
} from "../types";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<string> {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);
  const { data } = await api.post<{ access_token: string }>("/auth/login", form);
  return data.access_token;
}

export async function register(username: string, password: string): Promise<string> {
  const { data } = await api.post<{ access_token: string }>("/auth/register", {
    username,
    password,
  });
  return data.access_token;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

// ── Pokémon ───────────────────────────────────────────────────────────────────
export async function getAllPokemon(): Promise<Pokemon[]> {
  const { data } = await api.get<Pokemon[]>("/pokemon");
  return data;
}

// ── Habitats ──────────────────────────────────────────────────────────────────
export async function getAllHabitats(): Promise<Habitat[]> {
  const { data } = await api.get<Habitat[]>("/habitats");
  return data;
}

// ── Progress (authenticated) ──────────────────────────────────────────────────
export async function getPokemonProgress(): Promise<PokemonProgress[]> {
  const { data } = await api.get<PokemonProgress[]>("/progress/pokemon");
  return data;
}

export async function updatePokemonProgress(
  pokemonId: number,
  update: Partial<PokemonProgress>
): Promise<PokemonProgress> {
  const { data } = await api.put<PokemonProgress>(`/progress/pokemon/${pokemonId}`, update);
  return data;
}

export async function getHabitatProgress(): Promise<HabitatProgress[]> {
  const { data } = await api.get<HabitatProgress[]>("/progress/habitats");
  return data;
}

export async function updateHabitatProgress(
  habitatId: number,
  update: Partial<HabitatProgress>
): Promise<HabitatProgress> {
  const { data } = await api.put<HabitatProgress>(`/progress/habitats/${habitatId}`, update);
  return data;
}

export async function exportProgress(): Promise<FullProgress> {
  const { data } = await api.get<FullProgress>("/progress/export");
  return data;
}

// ── Sprite URL ─────────────────────────────────────────────────────────────────
export function getSpriteUrl(spriteKey: string): string {
  const encoded = encodeURIComponent(`${spriteKey}_EP.webm`);
  return `https://www.wikidex.net/wiki/Especial:FilePath/${encoded}`;
}
