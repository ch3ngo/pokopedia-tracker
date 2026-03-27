import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getAllPokemon } from "../services/api";
import { useProgressStore } from "../store";
import { ZONES, ZONE_LABELS } from "../types";
import { PokemonSprite } from "../components/PokemonSprite";

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
  cloud_island: "🌤️",
};

export function ZoneDashboard() {
  const { t } = useTranslation();
  const lang = i18n.language as "en" | "es";
  const { pokemon: progressMap } = useProgressStore();

  const { data: allPokemon = [] } = useQuery({
    queryKey: ["pokemon"],
    queryFn: getAllPokemon,
  });

  const totalCaught = allPokemon.filter((p) => !p.is_special_npc && progressMap[p.id]?.is_caught).length;
  const assignedCount = allPokemon.filter((p) => progressMap[p.id]?.is_caught && progressMap[p.id]?.zone).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-1">{t("zoneDashboard.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("zoneDashboard.subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700 flex gap-6">
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

      <div className="space-y-4">
        {ZONES.map((zone) => {
          const zoneLabel = ZONE_LABELS[zone][lang];
          const emoji = ZONE_EMOJI[zone] ?? "📍";

          const zonePokemon = allPokemon.filter((p) => {
            const prog = progressMap[p.id];
            return prog?.is_caught && prog?.zone === zone;
          });

          const presentSpecialties = new Set(
            zonePokemon.flatMap((p) => p.specialties)
          );

          const missingSpecialties = ALL_SPECIALTIES.filter(
            (s) => !presentSpecialties.has(s)
          );

          return (
            <div
              key={zone}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Zone header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <h2 className="font-bold text-gray-900 dark:text-white">{zoneLabel}</h2>
                </div>
                <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {zonePokemon.length} {t("zoneDashboard.pokemon")}
                </span>
              </div>

              <div className="p-4">
                {zonePokemon.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t("zoneDashboard.empty")}</p>
                ) : (
                  <>
                    {/* Specialties present */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                        {t("zoneDashboard.present")} ({presentSpecialties.size}/{ALL_SPECIALTIES.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(presentSpecialties).sort().map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-semibold">
                            {t(`specialties.${s}`, s)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialties missing */}
                    {missingSpecialties.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                          {t("zoneDashboard.missing")} ({missingSpecialties.length})
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

                    {/* Pokémon sprites */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                        {t("zoneDashboard.caughtHere")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {zonePokemon.map((p) => {
                          const pName = lang === "es" ? p.name_es : p.name_en;
                          return (
                            <div key={p.id} className="flex flex-col items-center gap-0.5" title={pName}>
                              <PokemonSprite spriteKey={p.sprite_key} name={pName} size="sm" />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center w-14 leading-tight truncate">
                                {pName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
