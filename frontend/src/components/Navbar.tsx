import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe, Download, Upload, Menu, X, Trash2 } from "lucide-react";
import i18n from "../i18n";
import { useProgressStore, useUIStore } from "../store";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const { exportProgress, importProgress, clear } = useProgressStore();
  const lang = i18n.language as "en" | "es";
  const importRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "bg-brand-500/10 text-brand-500 dark:text-brand-400"
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";

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

  const handleReset = () => {
    clear();
    setShowResetConfirm(false);
    setSidebarOpen(false);
  };

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/pokedex", label: t("nav.pokedex") },
    { path: "/habitats", label: t("nav.habitatdex") },
    { path: "/zones", label: t("nav.zones") },
    { path: "/todo", label: t("nav.todo") },
  ];

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="font-pixel text-[10px] text-brand-500 dark:text-brand-400 flex-1 text-center">
            Pokopedia
          </Link>

          {/* spacer to keep title centered */}
          <div className="w-9" />
        </div>
      </nav>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <span className="font-pixel text-[10px] text-brand-500 dark:text-brand-400">Pokopedia</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Lang + Theme */}
            <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800 flex gap-1 shrink-0">
              <button
                onClick={toggleLang}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{lang === "en" ? "Español" : "English"}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>

            {/* Export / Import / Reset */}
            <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1 shrink-0">
              <button
                onClick={() => { handleExport(); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t("common.export")}</span>
              </button>
              <button
                onClick={() => importRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{t("common.import")}</span>
              </button>

              <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("common.resetProgress", "Reset progress")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-2">
              {t("common.resetConfirmTitle", "Reset all progress?")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
              {t("common.resetConfirmBody", "This will erase all caught Pokémon, built habitats, and zone assignments. This action cannot be undone.")}
            </p>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 text-center mb-6">
              {t("common.resetConfirmBackup", "Export a backup before resetting.")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                {t("common.resetConfirmAction", "Yes, reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </>
  );
}
