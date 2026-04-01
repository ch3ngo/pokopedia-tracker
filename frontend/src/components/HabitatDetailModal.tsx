import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Hammer, CheckCircle2, ListTodo } from "lucide-react";
import type { Habitat, HabitatProgress, Pokemon } from "../types";
import { ZONES, ZONE_LABELS } from "../types";
import { useProgressStore, useTodoStore } from "../store";
import { PokemonSprite } from "./PokemonSprite";
import { PokemonDetailModal } from "./PokemonDetailModal";

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
  onBack?: () => void;
  allHabitats?: Habitat[];
}

export function HabitatDetailModal({ habitat, progress, allPokemon, onUpdate, onClose, lang, onBack, allHabitats }: Props) {
  const { t } = useTranslation();
  const { pokemon: pokemonProgress, updatePokemon } = useProgressStore();
  const { addTodo } = useTodoStore();
  const [addedToTodo, setAddedToTodo] = useState(false);
  const [zonePendingId, setZonePendingId] = useState<number | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

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
    if (current.includes(pokemonId)) {
      onUpdate({ pokemon_attracted: current.filter((id) => id !== pokemonId) });
      if (zonePendingId === pokemonId) setZonePendingId(null);
    } else {
      onUpdate({ pokemon_attracted: [...current, pokemonId] });
      // Sync to Pokédex: mark as caught
      updatePokemon(pokemonId, { is_caught: true });
      // Show zone picker if no zone assigned yet
      if (!pokemonProgress[pokemonId]?.zone) {
        setZonePendingId(pokemonId);
      }
    }
  };

  const handleAddToTodo = () => {
    const todoText = lang === "es"
      ? `Construir hábitat ${name}`
      : `Build habitat ${name}`;
    addTodo(todoText);
    setAddedToTodo(true);
    setTimeout(() => setAddedToTodo(false), 1500);
  };

  if (selectedPokemon) {
    return (
      <PokemonDetailModal
        pokemon={selectedPokemon}
        progress={pokemonProgress[selectedPokemon.id]}
        onUpdate={(update) => updatePokemon(selectedPokemon.id, update)}
        onClose={onClose}
        lang={lang}
        habitats={allHabitats}
        allPokemon={allPokemon}
        onBack={() => setSelectedPokemon(null)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back button (when opened from Pokédex) */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-500 mb-3 transition-colors"
          >
            ← {t("common.back")}
          </button>
        )}

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

        {/* Built toggle + Todo button */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => onUpdate({ is_built: !isBuilt })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors
              ${isBuilt ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            <Hammer className="w-4 h-4" />
            {isBuilt ? t("habitatdex.markNotBuilt") : t("habitatdex.markBuilt")}
          </button>
          <button
            onClick={handleAddToTodo}
            title={addedToTodo ? t("common.addedToTodo") : t("common.addToTodo")}
            className={`flex items-center justify-center px-3 py-2 rounded-xl text-sm font-semibold transition-colors
              ${addedToTodo
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            <ListTodo className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar — always shown */}
        {spawnPokemon.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-end text-xs text-gray-400 mb-1">
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
                      onClick={() => setSelectedPokemon(p)}
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

        {/* Zone picker — shown after marking a new Pokemon as attracted */}
        {zonePendingId !== null && (
          <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{t("common.selectZone")}</p>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {ZONES.map((z) => (
                <button
                  key={z}
                  onClick={() => { updatePokemon(zonePendingId, { zone: z }); setZonePendingId(null); }}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-brand-500 hover:text-brand-500 transition-colors text-left truncate"
                >
                  {ZONE_LABELS[z][lang]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setZonePendingId(null)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {t("common.skipZone")}
            </button>
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
