import axios from "axios";
import type { Pokemon, Habitat } from "../types";

const api = axios.create({ baseURL: "/api" });

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

// ── Sprite URL ─────────────────────────────────────────────────────────────────
export function getSpriteUrl(spriteKey: string): string {
  const encoded = encodeURIComponent(`${spriteKey}_EP.webm`);
  return `https://www.wikidex.net/wiki/Especial:FilePath/${encoded}`;
}
