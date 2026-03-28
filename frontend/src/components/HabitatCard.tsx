import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Hammer, CheckCircle2, ChevronDown } from "lucide-react";
import type { Habitat, HabitatProgress, Pokemon } from "../types";
import { useProgressStore } from "../store";
import { PokemonSprite } from "./PokemonSprite";

interface Props {
  habitat: Habitat;
  progress: HabitatProgress | undefined;
  allPokemon: Pokemon[];
  onUpdate: (update: Partial<HabitatProgress>) => void;
  lang: "en" | "es";
}

const CATEGORY_EMOJI: Record<string, string> = {
  grass: "🌿",
  flower: "🌸",
  water: "💧",
  rocky: "🪨",
  ghost: "👻",
  electric: "⚡",
  fire: "🔥",
  ice: "❄️",
  sky: "☁️",
  urban: "🏙️",
  sport: "⚽",
  specialized: "⭐",
  legendary: "✨",
};

function HabitatImage({ habitatId, emoji }: { habitatId: number; emoji: string }) {
  const [errored, setErrored] = useState(false);
  const src = `/imgs/habitatdex/${String(habitatId).padStart(3, "0")}.png`;

  if (errored) {
    return (
      <div className="w-full h-20 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-3xl mb-3">
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-20 object-cover rounded-xl mb-3"
      onError={() => setErrored(true)}
    />
  );
}

export function HabitatCard({ habitat, progress, allPokemon, onUpdate, lang }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { pokemon: pokemonProgress } = useProgressStore();

  const isBuilt = progress?.is_built ?? false;
  const attracted = progress?.pokemon_attracted ?? [];
  const spawnPokemon = allPokemon.filter((p) => habitat.pokemon_ids.includes(p.id));

  // A Pokémon counts as attracted if explicitly marked OR if it has been caught
  const effectiveAttracted = spawnPokemon.filter(
    (p) => attracted.includes(p.id) || (pokemonProgress[p.id]?.is_caught ?? false)
  );
  const isComplete = spawnPokemon.length > 0 && effectiveAttracted.length === spawnPokemon.length;
  const completionPct =
    spawnPokemon.length > 0 ? Math.round((effectiveAttracted.length / spawnPokemon.length) * 100) : 0;

  const name = lang === "es" ? habitat.name_es : habitat.name_en;
  const requirements = lang === "es" ? habitat.requirements_es : habitat.requirements_en;
  const emoji = CATEGORY_EMOJI[habitat.category] ?? "🏡";

  const toggleAttracted = (pokemonId: number) => {
    const current = progress?.pokemon_attracted ?? [];
    const next = current.includes(pokemonId)
      ? current.filter((id) => id !== pokemonId)
      : [...current, pokemonId];
    onUpdate({ pokemon_attracted: next });
  };

  const handlePokemonNavigate = (pokemon: Pokemon, e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const pName = lang === "es" ? pokemon.name_es : pokemon.name_en;
    navigate(`/pokedex?search=${encodeURIComponent(pName)}`);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200
        ${isComplete
          ? "border-accent-teal bg-white dark:bg-gray-800 shadow-md shadow-accent-teal/20"
          : isBuilt
            ? "border-brand-400 bg-white dark:bg-gray-800"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        }`}
    >
      <div className="p-4">
        {/* Habitat image (shows placeholder until images are placed locally) */}
        <HabitatImage habitatId={habitat.id} emoji={emoji} />

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
              #{String(habitat.id).padStart(3, "0")} · {t(`habitatdex.categories.${habitat.category}`)}
            </p>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{name}</h3>
          </div>
          {isComplete && <CheckCircle2 className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" />}
        </div>

        {/* Requirements */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{requirements}</p>

        {/* Progress bar */}
        {isBuilt && spawnPokemon.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t("habitatdex.spawns")}</span>
              <span>{effectiveAttracted.length}/{spawnPokemon.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-teal transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ is_built: !isBuilt })}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors
              ${isBuilt ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
          >
            <Hammer className="w-3 h-3" />
            {isBuilt ? t("habitatdex.markNotBuilt") : t("habitatdex.markBuilt")}
          </button>
          {spawnPokemon.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold"
            >
              <span>{spawnPokemon.length}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Pokémon grid */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{t("habitatdex.spawns")}</p>
            <div className="grid grid-cols-4 gap-2">
              {spawnPokemon.map((p) => {
                const isAttracted =
                  attracted.includes(p.id) || (pokemonProgress[p.id]?.is_caught ?? false);
                const isCaughtAuto =
                  !attracted.includes(p.id) && (pokemonProgress[p.id]?.is_caught ?? false);
                const pName = lang === "es" ? p.name_es : p.name_en;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => !isCaughtAuto && toggleAttracted(p.id)}
                      title={pName}
                      className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all border w-full
                        ${isAttracted
                          ? isCaughtAuto
                            ? "border-accent-teal/50 bg-accent-teal/5 cursor-default opacity-80"
                            : "border-accent-teal bg-accent-teal/10"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                    >
                      <PokemonSprite
                        spriteKey={p.sprite_key}
                        name={pName}
                        size="sm"
                        grayscale={!isAttracted}
                      />
                      <span className="text-[8px] text-gray-500 dark:text-gray-400 text-center leading-tight line-clamp-1">
                        {pName}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handlePokemonNavigate(p, e)}
                      className="text-[8px] text-brand-500 hover:underline"
                      title={`${t("common.viewInPokedex")}: ${pName}`}
                    >
                      ↗
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
