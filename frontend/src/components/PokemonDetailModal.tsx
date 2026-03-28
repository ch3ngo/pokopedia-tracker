import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { Pokemon, Habitat, PokemonProgress } from "../types";
import { ZONES, ZONE_LABELS } from "../types";
import { PokemonSprite } from "./PokemonSprite";
import { TypeBadge } from "./TypeBadge";

interface Props {
  pokemon: Pokemon;
  progress: PokemonProgress | undefined;
  onUpdate: (update: Partial<PokemonProgress>) => void;
  onClose: () => void;
  lang: "en" | "es";
  habitats?: Habitat[];
}

export function PokemonDetailModal({ pokemon, progress, onUpdate, onClose, lang, habitats }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(progress?.notes ?? "");

  const isCaught = progress?.is_caught ?? false;
  const name = lang === "es" ? pokemon.name_es : pokemon.name_en;
  const isSpecial = pokemon.is_legendary || pokemon.is_mythical || pokemon.is_special_npc;
  const pokemonHabitats = habitats?.filter((h) => h.pokemon_ids.includes(pokemon.id)) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <PokemonSprite spriteKey={pokemon.sprite_key} name={name} size="lg" />
          <h2 className="font-bold text-xl text-gray-900 dark:text-white">{name}</h2>
          <span className="text-xs font-pixel text-gray-400">#{String(pokemon.id).padStart(3, "0")}</span>
          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}
          </div>
          {isSpecial && <span className="text-sm text-accent-yellow">★</span>}
        </div>

        {/* Specialties */}
        {pokemon.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("common.specialties")}</p>
            <div className="flex flex-wrap gap-1">
              {pokemon.specialties.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-semibold">
                  {t(`specialties.${s}`, s)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Habitats */}
        {pokemonHabitats.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("common.habitats")}</p>
            <div className="flex flex-wrap gap-1">
              {pokemonHabitats.map((h) => {
                const hName = lang === "es" ? h.name_es : h.name_en;
                return (
                  <button
                    key={h.id}
                    onClick={() => { onClose(); navigate(`/habitats?search=${encodeURIComponent(hName)}`); }}
                    className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold hover:bg-brand-500/20 transition-colors"
                  >
                    {hName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Caught toggle */}
        <div className="mb-4">
          <button
            onClick={() => onUpdate({ is_caught: !isCaught })}
            className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors ${isCaught ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1" />{t("common.caught")}
          </button>
        </div>

        {/* Zone selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("common.zone")}</p>
          <select
            value={progress?.zone ?? ""}
            onChange={(e) => onUpdate({ zone: e.target.value || null })}
            className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm border-none outline-none"
          >
            <option value="">{t("common.noZone")}</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>{ZONE_LABELS[z][lang]}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("common.notes")}</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate({ notes: notes || null })}
            rows={2}
            className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm border-none outline-none resize-none"
            placeholder="..."
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
