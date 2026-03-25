export interface Pokemon {
  id: number;
  name_en: string;
  name_es: string;
  types: string[];
  specialties: string[];
  generation: number;
  is_legendary: boolean;
  is_mythical: boolean;
  is_special_npc: boolean;
  sprite_key: string;
}

export interface Habitat {
  id: number;
  name_en: string;
  name_es: string;
  category: string;
  requirements_en: string;
  requirements_es: string;
  pokemon_ids: number[];
}

export interface PokemonProgress {
  pokemon_id: number;
  is_caught: boolean;
  zone: string | null;
  notes: string | null;
}

export interface HabitatProgress {
  habitat_id: number;
  is_built: boolean;
  pokemon_attracted: number[];
}

export interface FullProgress {
  pokemon: PokemonProgress[];
  habitats: HabitatProgress[];
}

export type Zone =
  | "palette_town"
  | "withered_wastelands"
  | "bleak_beach"
  | "rocky_ridges"
  | "sparkling_skylands"
  | "cloud_island";

export const ZONES: Zone[] = [
  "palette_town",
  "withered_wastelands",
  "bleak_beach",
  "rocky_ridges",
  "sparkling_skylands",
  "cloud_island",
];

export const ZONE_LABELS: Record<Zone, { en: string; es: string }> = {
  palette_town: { en: "Palette Town", es: "Pueblo Paleta" },
  withered_wastelands: { en: "Withered Wastelands", es: "Páramos Marchitos" },
  bleak_beach: { en: "Bleak Beach", es: "Playa Sombría" },
  rocky_ridges: { en: "Rocky Ridges", es: "Riscos Rocosos" },
  sparkling_skylands: { en: "Sparkling Skylands", es: "Tierras Celestes" },
  cloud_island: { en: "Cloud Island", es: "Isla Nube" },
};

export const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400 text-stone-900",
  Fire: "bg-orange-500 text-white",
  Water: "bg-blue-500 text-white",
  Electric: "bg-yellow-400 text-yellow-900",
  Grass: "bg-green-500 text-white",
  Ice: "bg-cyan-400 text-cyan-900",
  Fighting: "bg-red-700 text-white",
  Poison: "bg-purple-600 text-white",
  Ground: "bg-amber-600 text-white",
  Flying: "bg-indigo-400 text-white",
  Psychic: "bg-pink-500 text-white",
  Bug: "bg-lime-600 text-white",
  Rock: "bg-stone-600 text-white",
  Ghost: "bg-violet-700 text-white",
  Dragon: "bg-indigo-700 text-white",
  Dark: "bg-neutral-800 text-white",
  Steel: "bg-slate-500 text-white",
  Fairy: "bg-pink-300 text-pink-900",
};
