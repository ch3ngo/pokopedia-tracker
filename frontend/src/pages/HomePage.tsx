import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import i18n from "../i18n";
import { getAllPokemon, getAllHabitats } from "../services/api";
import { useProgressStore, useTodoStore, useDailyStore } from "../store";
import { StatsRing } from "../components/StatsRing";
import { ZONES, ZONE_LABELS } from "../types";
import type { DailyKey } from "../store";

const DAILY_REMINDERS: { key: DailyKey; en: string; es: string; emoji: string }[] = [
  { key: "stamp",      en: "Daily stamp",      es: "Sello diario",         emoji: "📮" },
  { key: "mosslax",    en: "Feed Mosslax",     es: "Alimentar a Mosslax",  emoji: "🌿" },
  { key: "plants",     en: "Water the plants", es: "Regar las plantas",    emoji: "💧" },
  { key: "dreamIsland",en: "Dream Island",     es: "Islas Ensueño",        emoji: "🌙" },
];

const ZONE_EMOJI: Record<string, string> = {
  palette_town: "🌱",
  withered_wastelands: "🌵",
  bleak_beach: "🏖️",
  rocky_ridges: "⛰️",
  sparkling_skylands: "☁️",
};

export function HomePage() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const navigate = useNavigate();

  const { pokemon: progressMap, habitats: habitatProgress } = useProgressStore();
  const { todos, toggleTodo } = useTodoStore();
  const { done, toggle, resetIfNewDay } = useDailyStore();

  useEffect(() => { resetIfNewDay(); }, [resetIfNewDay]);

  const { data: allPokemon = [] } = useQuery({ queryKey: ["pokemon"], queryFn: getAllPokemon });
  const { data: allHabitats = [] } = useQuery({ queryKey: ["habitats"], queryFn: getAllHabitats });

  // Pokédex stats
  const totalPokemon = allPokemon.filter((p) => !p.is_special_npc).length;
  const caughtCount = allPokemon.filter((p) => !p.is_special_npc && progressMap[p.id]?.is_caught).length;
  const specialsCaught = allPokemon.filter((p) => (p.is_legendary || p.is_mythical) && progressMap[p.id]?.is_caught).length;
  const specialsTotal = allPokemon.filter((p) => p.is_legendary || p.is_mythical).length;

  // Habitatdex stats
  const builtCount = allHabitats.filter((h) => habitatProgress[h.id]?.is_built).length;
  const completeCount = allHabitats.filter((h) => {
    const p = habitatProgress[h.id];
    if (!h.pokemon_ids.length) return false;
    return h.pokemon_ids.every(
      (pid) => (p?.pokemon_attracted ?? []).includes(pid) || (progressMap[pid]?.is_caught ?? false)
    );
  }).length;

  // Zone distribution
  const zoneData = ZONES.map((zone) => ({
    zone,
    count: allPokemon.filter((p) => progressMap[p.id]?.is_caught && progressMap[p.id]?.zone === zone).length,
  }));
  const maxZoneCount = Math.max(...zoneData.map((z) => z.count), 1);

  // Todo preview
  const pendingTodos = todos.filter((todo) => !todo.done).slice(0, 5);
  const pendingCount = todos.filter((todo) => !todo.done).length;

  const allDailyDone = DAILY_REMINDERS.every((r) => done[r.key]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">Pokopedia</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {lang === "es" ? "Tu isla en Pokopia" : "Your Pokopia island"}
        </p>
      </div>

      {/* Daily reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {lang === "es" ? "Recordatorios diarios" : "Daily reminders"}
          </p>
          {allDailyDone && (
            <span className="text-xs font-semibold text-accent-teal">
              {lang === "es" ? "¡Todo hecho!" : "All done!"}
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {DAILY_REMINDERS.map((r) => {
            const isDone = done[r.key];
            const label = lang === "es" ? r.es : r.en;
            return (
              <button
                key={r.key}
                onClick={() => toggle(r.key)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <span className="text-xl">{r.emoji}</span>
                <span className={`flex-1 text-sm font-semibold ${isDone ? "line-through text-gray-400 dark:text-gray-600" : "text-gray-800 dark:text-gray-200"}`}>
                  {label}
                </span>
                {isDone
                  ? <CheckCircle2 className="w-5 h-5 text-accent-teal shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Pokédex card */}
        <Link
          to="/pokedex"
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-brand-400 transition-colors group"
        >
          <div className="flex items-center gap-4 mb-3">
            <StatsRing value={caughtCount} max={totalPokemon} size="sm" />
            <div>
              <p className="font-pixel text-[10px] text-gray-400 dark:text-gray-500 mb-1">{t("nav.pokedex")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {caughtCount}<span className="text-sm font-normal text-gray-400 ml-1">/ {totalPokemon}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">{t("pokedex.statSpecials")} ★</p>
              <p className="font-bold text-accent-yellow">{specialsCaught}<span className="text-xs text-gray-400 ml-0.5">/{specialsTotal}</span></p>
            </div>
          </div>
          <p className="text-xs text-brand-500 mt-3 font-semibold group-hover:underline">
            {lang === "es" ? "Ver Pokédex" : "Open Pokédex"} →
          </p>
        </Link>

        {/* Habitatdex card */}
        <Link
          to="/habitats"
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-accent-teal transition-colors group"
        >
          <div className="flex items-center gap-4 mb-3">
            <StatsRing value={builtCount} max={allHabitats.length} size="sm" color="teal" />
            <div>
              <p className="font-pixel text-[10px] text-gray-400 dark:text-gray-500 mb-1">{t("nav.habitatdex")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {builtCount}<span className="text-sm font-normal text-gray-400 ml-1">/ {allHabitats.length}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">{t("habitatdex.complete")}</p>
              <p className="font-bold text-accent-teal">{completeCount}<span className="text-xs text-gray-400 ml-0.5">/{allHabitats.length}</span></p>
            </div>
          </div>
          <p className="text-xs text-accent-teal mt-3 font-semibold group-hover:underline">
            {lang === "es" ? "Ver Habitatdex" : "Open Habitatdex"} →
          </p>
        </Link>
      </div>

      {/* Zone mini-overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{t("nav.zones")}</p>
          <button
            onClick={() => navigate("/zones")}
            className="flex items-center gap-1 text-xs text-brand-500 font-semibold hover:underline"
          >
            {lang === "es" ? "Ver zonas" : "See zones"} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {zoneData.map(({ zone, count }) => {
            const label = ZONE_LABELS[zone][lang];
            const pct = (count / maxZoneCount) * 100;
            return (
              <div key={zone} className="flex items-center gap-3">
                <span className="text-base w-5 text-center">{ZONE_EMOJI[zone]}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-28 shrink-0 truncate">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: count > 0 ? `${pct}%` : "0%" }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Todo preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {t("nav.todo")}
            {pendingCount > 0 && (
              <span className="ml-2 text-xs font-semibold bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </p>
          <Link to="/todo" className="flex items-center gap-1 text-xs text-brand-500 font-semibold hover:underline">
            {lang === "es" ? "Ver todas" : "See all"} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="px-5 py-2">
          {pendingTodos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic py-3">
              {lang === "es" ? "Sin tareas pendientes" : "No pending tasks"}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pendingTodos.map((task) => (
                <li key={task.id}>
                  <button
                    onClick={() => toggleTodo(task.id)}
                    className="w-full flex items-center gap-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 hover:text-accent-teal transition-colors" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{task.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
