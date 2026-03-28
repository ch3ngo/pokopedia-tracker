import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sun, Moon, Globe, Download, Upload, Trash2,
  ChevronLeft, ChevronRight,
  Home, BookOpen, Tent, Map, ListTodo,
} from "lucide-react";
import i18n from "../i18n";
import { useProgressStore, useUIStore } from "../store";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function Navbar({ collapsed, onToggle }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const { exportProgress, importProgress, clear } = useProgressStore();
  const lang = i18n.language as "en" | "es";
  const importRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
  };

  const navLinks = [
    { path: "/",         label: t("nav.home"),       icon: Home     },
    { path: "/pokedex",  label: t("nav.pokedex"),     icon: BookOpen },
    { path: "/habitats", label: t("nav.habitatdex"),  icon: Tent     },
    { path: "/zones",    label: t("nav.zones"),       icon: Map      },
    { path: "/todo",     label: t("nav.todo"),        icon: ListTodo },
  ];

  return (
    <>
      <aside
        className={`
          sticky top-0 h-screen flex flex-col shrink-0
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-200 overflow-hidden z-30
          ${collapsed ? "w-14" : "w-52"}
        `}
      >
        {/* Header */}
        <div className="flex items-center h-14 border-b border-gray-200 dark:border-gray-800 shrink-0 px-2">
          {!collapsed && (
            <Link
              to="/"
              className="font-pixel text-[10px] text-brand-500 dark:text-brand-400 flex-1 truncate pl-2"
            >
              Pokopedia
            </Link>
          )}
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0 ${collapsed ? "mx-auto" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(path)}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Lang + Theme */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-0.5 shrink-0">
          <button
            onClick={toggleLang}
            title={collapsed ? (lang === "en" ? "Español" : "English") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{lang === "en" ? "Español" : "English"}</span>}
          </button>
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
          </button>
        </div>

        {/* Export / Import / Reset */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-0.5 shrink-0">
          <button
            onClick={handleExport}
            title={collapsed ? t("common.export") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("common.export")}</span>}
          </button>
          <button
            onClick={() => importRef.current?.click()}
            title={collapsed ? t("common.import") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("common.import")}</span>}
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            title={collapsed ? t("common.resetProgress") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("common.resetProgress")}</span>}
          </button>
        </div>
      </aside>

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
              {t("common.resetConfirmTitle")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
              {t("common.resetConfirmBody")}
            </p>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 text-center mb-6">
              {t("common.resetConfirmBackup")}
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
                {t("common.resetConfirmAction")}
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </>
  );
}
