import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Hammer, CheckCircle2, ListTodo } from "lucide-react";
import type { Habitat, HabitatProgress, Pokemon } from "../types";
import { useProgressStore, useTodoStore } from "../store";
import { HabitatDetailModal } from "./HabitatDetailModal";

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
      <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-2xl">
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-20 h-20 shrink-0 object-cover rounded-xl"
      onError={() => setErrored(true)}
    />
  );
}

export function HabitatCard({ habitat, progress, allPokemon, onUpdate, lang }: Props) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [addedToTodo, setAddedToTodo] = useState(false);
  const { pokemon: pokemonProgress } = useProgressStore();
  const { addTodo } = useTodoStore();

  const isBuilt = progress?.is_built ?? false;
  const attracted = progress?.pokemon_attracted ?? [];
  const spawnPokemon = allPokemon.filter((p) => habitat.pokemon_ids.includes(p.id));

  const effectiveAttracted = spawnPokemon.filter(
    (p) => attracted.includes(p.id) || (pokemonProgress[p.id]?.is_caught ?? false)
  );
  const isComplete = spawnPokemon.length > 0 && effectiveAttracted.length === spawnPokemon.length;
  const completionPct =
    spawnPokemon.length > 0 ? Math.round((effectiveAttracted.length / spawnPokemon.length) * 100) : 0;

  const name = lang === "es" ? habitat.name_es : habitat.name_en;
  const requirements = lang === "es" ? habitat.requirements_es : habitat.requirements_en;
  const emoji = CATEGORY_EMOJI[habitat.category] ?? "🏡";

  const handleAddToTodo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const todoText = lang === "es"
      ? `Construir hábitat ${name}`
      : `Build habitat ${name}`;
    addTodo(todoText);
    setAddedToTodo(true);
    setTimeout(() => setAddedToTodo(false), 1500);
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className={`rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md h-full flex flex-col
          ${isComplete
            ? "border-accent-teal bg-white dark:bg-gray-800 shadow-md shadow-accent-teal/20"
            : isBuilt
              ? "border-brand-400 bg-white dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          }`}
      >
        <div className="p-4 flex gap-4 items-start flex-1">
          {/* Habitat image */}
          <HabitatImage habitatId={habitat.id} emoji={emoji} />

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
                #{String(habitat.id).padStart(3, "0")} · {t(`habitatdex.categories.${habitat.category}`)}
              </p>
              <div className="flex items-start gap-2">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight flex-1 line-clamp-2">{name}</h3>
                {isComplete && <CheckCircle2 className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" />}
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{requirements}</p>

            {/* Progress bar — always shown */}
            {spawnPokemon.length > 0 && (
              <div>
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
            <div className="flex gap-1.5 mt-auto">
              <button
                onClick={(e) => { e.stopPropagation(); onUpdate({ is_built: !isBuilt }); }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-colors
                  ${isBuilt ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                <Hammer className="w-3 h-3" />
                {isBuilt ? t("habitatdex.markNotBuilt") : t("habitatdex.markBuilt")}
              </button>

              <button
                onClick={handleAddToTodo}
                title={addedToTodo ? t("common.addedToTodo") : t("common.addToTodo")}
                className={`flex items-center justify-center w-8 h-7 rounded-xl text-xs font-semibold transition-colors shrink-0
                  ${addedToTodo
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <HabitatDetailModal
          habitat={habitat}
          progress={progress}
          allPokemon={allPokemon}
          onUpdate={onUpdate}
          onClose={() => setModalOpen(false)}
          lang={lang}
        />
      )}
    </>
  );
}
