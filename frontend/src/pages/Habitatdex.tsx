import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import i18n from "../i18n";
import { getAllHabitats, getAllPokemon } from "../services/api";
import { useProgressStore } from "../store";
import { HabitatCard } from "../components/HabitatCard";
import { StatsRing } from "../components/StatsRing";
import type { HabitatProgress } from "../types";

type Filter = "all" | "built" | "notBuilt" | "complete";

const CATEGORIES = ["grass","flower","water","rocky","ghost","electric","fire","ice","sky","urban","sport","specialized","legendary"] as const;

export function Habitatdex() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const { habitats: progressMap, pokemon: pokemonProgress, updateHabitat } = useProgressStore();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("all");

  const { data: habitats = [] } = useQuery({ queryKey: ["habitats"], queryFn: getAllHabitats });
  const { data: allPokemon = [] } = useQuery({ queryKey: ["pokemon"], queryFn: getAllPokemon });

  const getProgress = (id: number): HabitatProgress | undefined => progressMap[id];

  const isComplete = (id: number) => {
    const h = habitats.find((hab) => hab.id === id);
    const p = getProgress(id);
    if (!h || h.pokemon_ids.length === 0) return false;
    return h.pokemon_ids.every(
      (pid) =>
        (p?.pokemon_attracted ?? []).includes(pid) ||
        (pokemonProgress[pid]?.is_caught ?? false)
    );
  };

  const filtered = useMemo(() => {
    return habitats.filter((h) => {
      const name = lang === "es" ? h.name_es : h.name_en;
      const progress = getProgress(h.id);
      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && h.category !== category) return false;
      switch (filter) {
        case "built": return progress?.is_built ?? false;
        case "notBuilt": return !(progress?.is_built ?? false);
        case "complete": return isComplete(h.id);
        default: return true;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitats, search, filter, category, lang, progressMap, pokemonProgress]);

  const builtCount = habitats.filter((h) => getProgress(h.id)?.is_built).length;
  const completeCount = habitats.filter((h) => isComplete(h.id)).length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("habitatdex.filterAll") },
    { key: "built", label: t("habitatdex.filterBuilt") },
    { key: "notBuilt", label: t("habitatdex.filterNotBuilt") },
    { key: "complete", label: t("habitatdex.filterComplete") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="lg:flex lg:gap-6 lg:items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col gap-4 w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
          <div>
            <h1 className="font-pixel text-[12px] text-gray-900 dark:text-white mb-1">{t("habitatdex.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{t("habitatdex.subtitle")}</p>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-3">
              <StatsRing value={builtCount} max={habitats.length} />
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("habitatdex.built")}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                  {builtCount}<span className="text-xs font-normal text-gray-400 ml-1">/ {habitats.length}</span>
                </p>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("habitatdex.complete")}</p>
                <p className="text-lg font-bold text-accent-teal leading-none">
                  {completeCount}<span className="text-xs font-normal text-gray-400 ml-1">/ {habitats.length}</span>
                </p>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("habitatdex.total")}</p>
                <p className="text-lg font-bold text-gray-500 dark:text-gray-400 leading-none">
                  {habitats.length}
                </p>
              </div>
            </div>
          </div>

          {/* Status filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-[9px] font-pixel text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {t("common.status", "Status")}
            </p>
            <div className="space-y-0.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors
                    ${filter === f.key
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-[9px] font-pixel text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {t("common.category", "Category")}
            </p>
            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              <button
                onClick={() => setCategory("all")}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors
                  ${category === "all"
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {t("common.all")}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c === category ? "all" : c)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors
                    ${category === c
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {t(`habitatdex.categories.${c}`)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Mobile header */}
          <div className="lg:hidden mb-4">
            <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("habitatdex.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t("habitatdex.subtitle")}</p>
          </div>

          {/* Mobile stats */}
          <div className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <StatsRing value={builtCount} max={habitats.length} />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t("habitatdex.built")}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {builtCount}<span className="text-sm font-normal text-gray-400 ml-1">/ {habitats.length}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t("habitatdex.complete")}</p>
                  <p className="text-2xl font-bold text-accent-teal leading-none">
                    {completeCount}<span className="text-sm font-normal text-gray-400 ml-1">/ {habitats.length}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filters */}
          <div className="lg:hidden mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                    ${filter === f.key
                      ? "bg-brand-500 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCategory("all")}
                className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
                  ${category === "all"
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
              >
                {t("common.all")}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c === category ? "all" : c)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
                    ${category === c
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {t(`habitatdex.categories.${c}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Count */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {filtered.length} / {habitats.length}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm font-semibold">{t("common.noResults")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-in">
              {filtered.map((h) => (
                <HabitatCard
                  key={h.id}
                  habitat={h}
                  progress={getProgress(h.id)}
                  allPokemon={allPokemon}
                  onUpdate={(update) => updateHabitat(h.id, update)}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
