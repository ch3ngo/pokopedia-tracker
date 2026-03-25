import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe, Download, Upload } from "lucide-react";
import i18n from "../i18n";
import { useProgressStore, useUIStore } from "../store";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const { exportProgress, importProgress } = useProgressStore();
  const lang = i18n.language as "en" | "es";
  const importRef = useRef<HTMLInputElement>(null);

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-brand-500 dark:text-brand-400"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

  const handleExport = () => {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pokopedia-progress-${new Date().toISOString().slice(0, 10)}.json`;
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
        importProgress(data);
      } catch {
        alert(t("common.importError"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-pixel text-[10px] text-brand-500 dark:text-brand-400 shrink-0">
          Pokopedia
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive("/")}`}
          >
            {t("nav.pokedex")}
          </Link>
          <Link
            to="/habitats"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive("/habitats")}`}
          >
            {t("nav.habitatdex")}
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={t("common.export")}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={t("common.import")}
          >
            <Upload className="w-4 h-4" />
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={lang === "en" ? "Español" : "English"}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
