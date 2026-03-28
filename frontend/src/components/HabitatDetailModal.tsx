import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Hammer, CheckCircle2 } from "lucide-react";
import type { Habitat, HabitatProgress, Pokemon } from "../types";
import { useProgressStore } from "../store";
import { PokemonSprite } from "./PokemonSprite";

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

function ModalHabitatImage({ habitatId, emoji }: { habitatId: number; emoji: string }) {
  const [errored, setErrored] = useState(false);
  const src = `/imgs/habitatdex/${String(habitatId).padStart(3, "0")}.png`;

  if (errored) {
    return (
      <div className="w-[200px] h-[200px] mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-5xl mb-4">
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-[200px] h-[200px] mx-auto object-contain rounded-2xl mb-4"
      onError={() => setErrored(true)}
    />
  );
}

interface Props {
  habitat: Habitat;
  progress: HabitatProgress | undefined;
  allPokemon: Pokemon[];
  onUpdate: (update: Partial<HabitatProgress>) => void;
  onClose: () => void;
  lang: "en" | "es";
}

export function HabitatDetailModal({ habitat, progress, allPokemon, onUpdate, onClose, lang }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pokemon: pokemonProgress } = useProgressStore();

  const isBuilt = progress?.is_built ?? false;
  const attracted = progress?.pokemon_attracted ?? [];
  const spawnPokemon = allPokemon.filter((p) => habitat.pokemon_ids.includes(p.id));

  const effectiveAttracted = spawnPokemon.filter(
    (p) => attracted.includes(p.id) || (pokemonProgress[p.id]?.is_caught ?? false)
  );
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

  const handlePokemonNavigate = (pokemon: Pokemon) => {
    const pName = lang === "es" ? pokemon.name_es : pokemon.name_en;
    onClose();
    navigate(`/pokedex?search=${encodeURIComponent(pName)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <ModalHabitatImage habitatId={habitat.id} emoji={emoji} />

        {/* Header */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-pixel">
            #{String(habitat.id).padStart(3, "0")} · {t(`habitatdex.categories.${habitat.category}`)}
          </p>
          <h2 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{name}</h2>
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("habitatdex.requirements")}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{requirements}</p>
        </div>

        {/* Built toggle */}
        <div className="mb-4">
          <button
            onClick={() => onUpdate({ is_built: !isBuilt })}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors
              ${isBuilt ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            <Hammer className="w-4 h-4" />
            {isBuilt ? t("habitatdex.markNotBuilt") : t("habitatdex.markBuilt")}
          </button>
        </div>

        {/* Progress bar */}
        {isBuilt && spawnPokemon.length > 0 && (
          <div className="mb-4">
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

        {/* Pokemon grid */}
        {spawnPokemon.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("habitatdex.spawns")}</p>
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
                      {isAttracted && <CheckCircle2 className="w-3 h-3 text-accent-teal" />}
                    </button>
                    <button
                      onClick={() => handlePokemonNavigate(p)}
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

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
