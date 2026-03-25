import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Download, Upload } from "lucide-react";
import { getAllPokemon, getAllHabitats, exportProgress } from "../services/api";
import { useAuthStore, useGuestStore } from "../store";
import { ProgressBar } from "../components/ProgressBar";

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const guestStore = useGuestStore();

  const { data: allPokemon = [] } = useQuery({ queryKey: ["pokemon"], queryFn: getAllPokemon });
  const { data: habitats = [] } = useQuery({ queryKey: ["habitats"], queryFn: getAllHabitats });

  const handleExport = async () => {
    let data;
    if (user) {
      data = await exportProgress();
    } else {
      data = guestStore.exportProgress();
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pokopedia-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        guestStore.importProgress(data);
        alert(t("profile.importSuccess"));
      } catch {
        alert(t("profile.importError"));
      }
    };
    reader.readAsText(file);
  };

  const pokemonProgress = user
    ? []
    : Object.values(guestStore.pokemon);

  const habitatProgress = user
    ? []
    : Object.values(guestStore.habitats);

  const caughtCount = allPokemon.filter(
    (p) => !p.is_special_npc && pokemonProgress.find((pp) => pp.pokemon_id === p.id)?.is_caught
  ).length;

  const seenCount = allPokemon.filter(
    (p) => !p.is_special_npc && pokemonProgress.find((pp) => pp.pokemon_id === p.id)?.is_seen
  ).length;

  const builtCount = habitatProgress.filter((h) => h.is_built).length;

  const completeCount = habitats.filter((h) => {
    const p = habitatProgress.find((pp) => pp.habitat_id === h.id);
    return p && h.pokemon_ids.length > 0 && h.pokemon_ids.every((pid) => p.pokemon_attracted.includes(pid));
  }).length;

  const totalPokemon = allPokemon.filter((p) => !p.is_special_npc).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-pixel text-lg text-gray-900 dark:text-white mb-6">{t("profile.title")}</h1>

      {/* User info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        {user ? (
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Registered account</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{t("common.guestMode")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Progress saved locally</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-white">{t("profile.progress")}</h2>
        <ProgressBar value={caughtCount} max={totalPokemon} label={t("profile.stats.caught")} color="bg-brand-500" />
        <ProgressBar value={seenCount} max={totalPokemon} label={t("profile.stats.seen")} color="bg-yellow-400" />
        <ProgressBar value={builtCount} max={habitats.length} label={t("profile.stats.habitats")} color="bg-accent-teal" />
        <ProgressBar value={completeCount} max={habitats.length} label={t("profile.stats.complete")} color="bg-accent-purple" />
      </div>

      {/* Import / Export */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-white">{t("common.export")}</h2>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          {t("profile.exportJson")}
        </button>

        {!user && (
          <>
            <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              {t("profile.importJson")}
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
