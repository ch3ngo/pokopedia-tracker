import type { Pokemon, Habitat } from "../types";
import pokemonData from "../data/pokemon.json";
import habitatsData from "../data/habitats.json";

// ── Pokémon ───────────────────────────────────────────────────────────────────
export async function getAllPokemon(): Promise<Pokemon[]> {
  return pokemonData as Pokemon[];
}

// ── Habitats ──────────────────────────────────────────────────────────────────
export async function getAllHabitats(): Promise<Habitat[]> {
  return habitatsData as Habitat[];
}

// ── Sprite URL ─────────────────────────────────────────────────────────────────
export function getSpriteUrl(spriteKey: string): string {
  const encoded = encodeURIComponent(`${spriteKey}_EP.webm`);
  return `https://www.wikidex.net/wiki/Especial:FilePath/${encoded}`;
}
