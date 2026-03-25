import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe, LogOut, User } from "lucide-react";
import i18n from "../i18n";
import { useAuthStore, useUIStore } from "../store";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const lang = i18n.language as "en" | "es";

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-brand-500 dark:text-brand-400"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

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

          {user ? (
            <div className="flex items-center gap-1 ml-1">
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive("/profile")}`}
              >
                <User className="w-3.5 h-3.5" />
                {user.username}
              </Link>
              <button
                onClick={clearAuth}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                title={t("nav.logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
