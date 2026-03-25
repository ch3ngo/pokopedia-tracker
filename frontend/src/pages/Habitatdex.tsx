import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import i18n from "../i18n";
import { getAllHabitats, getAllPokemon, getHabitatProgress, updateHabitatProgress } from "../services/api";
import { useAuthStore, useGuestStore } from "../store";
import { HabitatCard } from "../components/HabitatCard";
import { ProgressBar } from "../components/ProgressBar";
import type { HabitatProgress } from "../types";

type Filter = "all" | "built" | "notBuilt" | "complete";

const CATEGORIES = ["grass","flower","water","rocky","ghost","electric","fire","ice","sky","urban","sport","specialized","legendary"] as const;

export function Habitatdex() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const { user } = useAuthStore();
  const guestStore = useGuestStore();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("all");

  const { data: habitats = [] } = useQuery({ queryKey: ["habitats"], queryFn: getAllHabitats });
  const { data: allPokemon = [] } = useQuery({ queryKey: ["pokemon"], queryFn: getAllPokemon });

  const { data: serverProgress = [] } = useQuery({
    queryKey: ["habitat-progress"],
    queryFn: getHabitatProgress,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: ({ id, update }: { id: number; update: Partial<HabitatProgress> }) =>
      updateHabitatProgress(id, update),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habitat-progress"] }),
  });

  const getProgress = (id: number): HabitatProgress | undefined => {
    if (user) return serverProgress.find((p) => p.habitat_id === id);
    return guestStore.habitats[id];
  };

  const handleUpdate = (id: number, update: Partial<HabitatProgress>) => {
    if (user) mutation.mutate({ id, update });
    else guestStore.updateHabitat(id, update);
  };

  const isComplete = (id: number) => {
    const h = habitats.find((hab) => hab.id === id);
    const p = getProgress(id);
    if (!h || !p) return false;
    return h.pokemon_ids.length > 0 && h.pokemon_ids.every((pid) => p.pokemon_attracted.includes(pid));
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
  }, [habitats, search, filter, category, lang, serverProgress, guestStore.habitats]);

  const builtCount = habitats.filter((h) => getProgress(h.id)?.is_built).length;
  const completeCount = habitats.filter((h) => isComplete(h.id)).length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("habitatdex.filterAll") },
    { key: "built", label: t("habitatdex.filterBuilt") },
    { key: "notBuilt", label: t("habitatdex.filterNotBuilt") },
    { key: "complete", label: t("habitatdex.filterComplete") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("habitatdex.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("habitatdex.subtitle")}</p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 space-y-3 border border-gray-200 dark:border-gray-700">
        <ProgressBar value={builtCount} max={habitats.length} label={t("habitatdex.built")} color="bg-brand-500" />
        <ProgressBar value={completeCount} max={habitats.length} label={t("habitatdex.complete")} color="bg-accent-teal" />
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

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setCategory("all")}
            className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
              ${category === "all" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            {t("common.all")}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c === category ? "all" : c)}
              className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors
                ${category === c ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
            >
              {t(`habitatdex.categories.${c}`)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {filtered.length} / {habitats.length}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
        {filtered.map((h) => (
          <HabitatCard
            key={h.id}
            habitat={h}
            progress={getProgress(h.id)}
            allPokemon={allPokemon}
            onUpdate={(update) => handleUpdate(h.id, update)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
