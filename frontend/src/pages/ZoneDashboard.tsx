import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getAllPokemon, getAllHabitats } from "../services/api";
import { useProgressStore, useZoneStore } from "../store";
import { ZONES, ZONE_LABELS } from "../types";
import type { Pokemon, PokemonProgress, Zone } from "../types";
import { PokemonSprite } from "../components/PokemonSprite";
import { PokemonDetailModal } from "../components/PokemonDetailModal";
import { Plus } from "lucide-react";

const ALL_SPECIALTIES = [
  "Appraise", "Build", "Bulldoze", "Burn", "Chop", "Collect", "Crush",
  "DJ", "Dream Island", "Eat", "Engineer", "Explode", "Fly", "Gather", "Gather Honey",
  "Generate", "Grow", "Hype", "Illuminate", "Litter", "Paint", "Party", "Rarify", "Recycle",
  "Search", "Storage", "Teleport", "Trade", "Transform", "Water", "Yawn",
];

const ZONE_EMOJI: Record<string, string> = {
  palette_town: "🌱",
  withered_wastelands: "🌵",
  bleak_beach: "🏖️",
  rocky_ridges: "⛰️",
  sparkling_skylands: "☁️",
};

const COMFORT_COLORS = [
  "", // 0 unused
  "bg-red-500",    // 1
  "bg-red-400",    // 2
  "bg-orange-500", // 3
  "bg-orange-400", // 4
  "bg-yellow-400", // 5
  "bg-yellow-300", // 6
  "bg-lime-400",   // 7
  "bg-green-400",  // 8
  "bg-green-500",  // 9
  "bg-emerald-500",// 10
];

function BulkZoneModal({
  zone,
  allPokemon,
  progressMap,
  lang,
  onDone,
  onClose,
}: {
  zone: Zone;
  allPokemon: Pokemon[];
  progressMap: Record<number, PokemonProgress>;
  lang: "en" | "es";
  onDone: (selected: Set<number>) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<number>>(() => {
    const s = new Set<number>();
    allPokemon.forEach((p) => {
      if (progressMap[p.id]?.zone === zone) s.add(p.id);
    });
    return s;
  });
  const [search, setSearch] = useState("");

  const filtered = allPokemon
    .filter((p) => !p.is_special_npc)
    .filter((p) => {
      const name = lang === "es" ? p.name_es : p.name_en;
      return name.toLowerCase().includes(search.toLowerCase());
    });

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-4 w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">{t("zoneDashboard.addPokemon")}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selected.size} {t("zoneDashboard.selected")}
          </span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("common.search")}
          className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 outline-none"
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-0.5">
          {filtered.map((p) => {
            const name = lang === "es" ? p.name_es : p.name_en;
            const isChecked = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors
                  ${isChecked
                    ? "bg-brand-500/10 text-brand-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isChecked ? "bg-brand-500 border-brand-500" : "border-gray-400 dark:border-gray-500"}`}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <PokemonSprite spriteKey={p.sprite_key} name={name} size="sm" />
                <span className="text-sm font-medium truncate flex-1">{name}</span>
                <span className="text-xs text-gray-400 shrink-0">#{String(p.id).padStart(3, "0")}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={() => onDone(selected)}
            className="flex-1 py-2 rounded-xl bg-brand-500 text-white font-semibold text-sm"
          >
            {t("zoneDashboard.done")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZoneDashboard() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const { pokemon: progressMap, updatePokemon } = useProgressStore();
  const { comfort, setComfort } = useZoneStore();
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [bulkZone, setBulkZone] = useState<Zone | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<Partial<Record<Zone, string>>>({});

  const toggleSpecialtyFilter = (zone: Zone, specialty: string) => {
    setSpecialtyFilter((prev) => ({
      ...prev,
      [zone]: prev[zone] === specialty ? undefined : specialty,
    }));
  };

  const { data: allPokemon = [] } = useQuery({
    queryKey: ["pokemon"],
    queryFn: getAllPokemon,
  });

  const { data: allHabitats = [] } = useQuery({
    queryKey: ["habitats"],
    queryFn: getAllHabitats,
  });

  const handleBulkDone = (zone: Zone, selected: Set<number>) => {
    allPokemon.forEach((p) => {
      const currentZone = progressMap[p.id]?.zone;
      if (selected.has(p.id)) {
        if (currentZone !== zone) updatePokemon(p.id, { zone });
      } else if (currentZone === zone) {
        updatePokemon(p.id, { zone: null });
      }
    });
    setBulkZone(null);
  };

  const totalCaught = allPokemon.filter((p) => !p.is_special_npc && progressMap[p.id]?.is_caught).length;
  const assignedCount = allPokemon.filter((p) => !p.is_special_npc && progressMap[p.id]?.is_caught && progressMap[p.id]?.zone).length;

  const zoneData = ZONES.map((zone) => {
    const zonePokemon = allPokemon.filter((p) => {
      const prog = progressMap[p.id];
      return prog?.is_caught && prog?.zone === zone;
    });
    const specialtyCounts = new Map<string, number>();
    zonePokemon.forEach((p) => p.specialties.forEach((s) => specialtyCounts.set(s, (specialtyCounts.get(s) ?? 0) + 1)));
    const missingSpecialties = ALL_SPECIALTIES.filter((s) => !specialtyCounts.has(s));
    return { zone, zonePokemon, specialtyCounts, missingSpecialties };
  });

  const maxZonePokemon = Math.max(...zoneData.map((z) => z.zonePokemon.length), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("zoneDashboard.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("zoneDashboard.subtitle")}</p>
      </div>

      {/* Summary stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-6 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("zoneDashboard.totalCaught")}</p>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{totalCaught}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("zoneDashboard.assigned")}</p>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{assignedCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("zoneDashboard.unassigned")}</p>
            <p className="font-bold text-xl text-brand-500">{totalCaught - assignedCount}</p>
          </div>
        </div>

        {/* Zone distribution bars */}
        <div className="space-y-2">
          {zoneData.map(({ zone, zonePokemon }) => {
            const label = ZONE_LABELS[zone][lang];
            const pct = maxZonePokemon > 0 ? (zonePokemon.length / maxZonePokemon) * 100 : 0;
            return (
              <div key={zone} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{ZONE_EMOJI[zone]}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-32 shrink-0 truncate">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-6 text-right">{zonePokemon.length}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-zone cards */}
      <div className="space-y-4">
        {zoneData.map(({ zone, zonePokemon, specialtyCounts, missingSpecialties }) => {
          const zoneLabel = ZONE_LABELS[zone][lang];
          const emoji = ZONE_EMOJI[zone] ?? "📍";
          const specialtyPct = Math.round((specialtyCounts.size / ALL_SPECIALTIES.length) * 100);
          const comfortVal = comfort[zone] ?? 0;
          const activeFilter = specialtyFilter[zone];
          const visiblePokemon = activeFilter
            ? zonePokemon.filter((p) => p.specialties.includes(activeFilter))
            : zonePokemon;

          return (
            <div
              key={zone}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Zone header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <h2 className="font-bold text-gray-900 dark:text-white">{zoneLabel}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {zonePokemon.length} {t("zoneDashboard.pokemon")}
                  </span>
                  <button
                    onClick={() => setBulkZone(zone)}
                    className="flex items-center gap-1 text-xs font-semibold bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 px-2 py-1 rounded-full transition-colors"
                    title={t("zoneDashboard.addPokemon")}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Comfort level */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("zoneDashboard.comfort", "Comfort level")}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${comfortVal > 0 ? COMFORT_COLORS[comfortVal] : "bg-gray-300 dark:bg-gray-600"}`}>
                      {comfortVal > 0 ? `${comfortVal}/10` : "—"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setComfort(zone, comfortVal === n ? 0 : n)}
                        className={`flex-1 h-5 rounded transition-all duration-150
                          ${n <= comfortVal
                            ? COMFORT_COLORS[comfortVal] + " opacity-90"
                            : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        title={`${n}/10`}
                      />
                    ))}
                  </div>
                </div>

                {/* Specialty coverage bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("zoneDashboard.present", "Specialties present")} ({specialtyCounts.size}/{ALL_SPECIALTIES.length})
                    </p>
                    <span className="text-xs font-bold text-accent-teal">{specialtyPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-accent-teal transition-all duration-500"
                      style={{ width: `${specialtyPct}%` }}
                    />
                  </div>
                  {zonePokemon.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(specialtyCounts.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([s, count]) => (
                        <button
                          key={s}
                          onClick={() => toggleSpecialtyFilter(zone, s)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                            activeFilter === s
                              ? "bg-accent-teal text-white"
                              : "bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/40"
                          }`}
                        >
                          {t(`specialties.${s}`, s)} (x{count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing specialties */}
                {missingSpecialties.length > 0 && zonePokemon.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {t("zoneDashboard.missing", "Missing")} ({missingSpecialties.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {missingSpecialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs">
                          {t(`specialties.${s}`, s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pokémon sprites — clickable */}
                {zonePokemon.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t("zoneDashboard.empty")}</p>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t("zoneDashboard.caughtHere")}
                      </p>
                      {activeFilter && (
                        <span className="text-xs text-accent-teal font-semibold">
                          {visiblePokemon.length}/{zonePokemon.length}
                        </span>
                      )}
                    </div>
                    {visiblePokemon.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {t("zoneDashboard.noMatch", "No Pokémon with this specialty in this zone.")}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visiblePokemon.map((p) => {
                          const pName = lang === "es" ? p.name_es : p.name_en;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPokemon(p)}
                              className="flex flex-col items-center gap-0.5 hover:opacity-75 transition-opacity"
                              title={pName}
                            >
                              <PokemonSprite spriteKey={p.sprite_key} name={pName} size="sm" />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center w-14 leading-tight truncate">
                                {pName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          progress={progressMap[selectedPokemon.id]}
          onUpdate={(update) => updatePokemon(selectedPokemon.id, update)}
          onClose={() => setSelectedPokemon(null)}
          lang={lang}
          habitats={allHabitats}
        />
      )}

      {bulkZone && (
        <BulkZoneModal
          zone={bulkZone}
          allPokemon={allPokemon}
          progressMap={progressMap}
          lang={lang}
          onDone={(selected) => handleBulkDone(bulkZone, selected)}
          onClose={() => setBulkZone(null)}
        />
      )}
    </div>
  );
}
