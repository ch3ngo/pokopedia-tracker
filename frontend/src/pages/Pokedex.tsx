import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import i18n from "../i18n";
import { getAllPokemon } from "../services/api";
import { useProgressStore } from "../store";
import { PokemonCard } from "../components/PokemonCard";
import { ProgressBar } from "../components/ProgressBar";
import type { PokemonProgress } from "../types";

type Filter = "all" | "caught" | "uncaught" | "legendary" | "mythical" | "npc";

export function Pokedex() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const { pokemon: progressMap, updatePokemon } = useProgressStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: allPokemon = [] } = useQuery({
    queryKey: ["pokemon"],
    queryFn: getAllPokemon,
  });

  const getProgress = (id: number): PokemonProgress | undefined => progressMap[id];

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    allPokemon.forEach((p) => p.types.forEach((t) => types.add(t)));
    return Array.from(types).sort();
  }, [allPokemon]);

  const filtered = useMemo(() => {
    return allPokemon.filter((p) => {
      const progress = getProgress(p.id);
      const name = lang === "es" ? p.name_es : p.name_en;

      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && !p.types.includes(typeFilter)) return false;

      switch (filter) {
        case "caught": return progress?.is_caught ?? false;
        case "uncaught": return !(progress?.is_caught ?? false);
        case "legendary": return p.is_legendary;
        case "mythical": return p.is_mythical;
        case "npc": return p.is_special_npc;
        default: return true;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPokemon, search, filter, typeFilter, lang, progressMap]);

  const totalPokemon = allPokemon.filter((p) => !p.is_special_npc).length;
  const caughtCount = allPokemon.filter((p) => !p.is_special_npc && getProgress(p.id)?.is_caught).length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("pokedex.filterAll") },
    { key: "caught", label: t("pokedex.filterCaught") },
    { key: "uncaught", label: t("pokedex.filterUncaught") },
    { key: "legendary", label: t("pokedex.filterLegendary") },
    { key: "mythical", label: t("pokedex.filterMythical") },
    { key: "npc", label: t("pokedex.filterNpc") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("pokedex.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("pokedex.subtitle")}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <ProgressBar value={caughtCount} max={totalPokemon} label={t("pokedex.caught")} color="bg-brand-500" />
      </div>

      {/* Search + filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${filter === f.key ? "bg-brand-500 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
              ${typeFilter === "all" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            {t("common.all")}
          </button>
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? "all" : type)}
              className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
                ${typeFilter === type ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {filtered.length} / {allPokemon.length}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-fade-in">
        {filtered.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            progress={getProgress(p.id)}
            onUpdate={(update) => updatePokemon(p.id, update)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
