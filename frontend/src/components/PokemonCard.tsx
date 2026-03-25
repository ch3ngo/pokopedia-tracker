import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MapPin, Pencil, Check } from "lucide-react";
import type { Pokemon, PokemonProgress } from "../types";
import { ZONES, ZONE_LABELS } from "../types";
import { PokemonSprite } from "./PokemonSprite";
import { TypeBadge } from "./TypeBadge";

interface Props {
  pokemon: Pokemon;
  progress: PokemonProgress | undefined;
  onUpdate: (update: Partial<PokemonProgress>) => void;
  lang: "en" | "es";
}

export function PokemonCard({ pokemon, progress, onUpdate, lang }: Props) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);
  const [notes, setNotes] = useState(progress?.notes ?? "");

  const isCaught = progress?.is_caught ?? false;
  const name = lang === "es" ? pokemon.name_es : pokemon.name_en;

  const badgeLabel = pokemon.is_mythical
    ? t("common.mythical")
    : pokemon.is_legendary
      ? t("common.legendary")
      : pokemon.is_special_npc
        ? t("common.specialNpc")
        : null;

  return (
    <>
      <div
        className={`relative rounded-2xl border transition-all duration-200 cursor-pointer group
          ${isCaught
            ? "border-brand-500 bg-white dark:bg-gray-800 shadow-md shadow-brand-500/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70 hover:opacity-100"
          }
        `}
        onClick={() => setShowDetail(true)}
      >
        {/* Status indicator */}
        {isCaught && (
          <div className="absolute top-2 right-2">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
              <Check className="w-3 h-3 text-brand-500" />
            </span>
          </div>
        )}

        {/* Special badge */}
        {badgeLabel && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-pixel text-accent-yellow">★</span>
          </div>
        )}

        <div className="p-3 flex flex-col items-center gap-2">
          <PokemonSprite
            spriteKey={pokemon.sprite_key}
            name={name}
            size="md"
            grayscale={!isCaught}
          />

          <span className="text-[9px] font-pixel text-gray-400 dark:text-gray-500">
            #{String(pokemon.id).padStart(3, "0")}
          </span>

          <p className="font-bold text-sm text-center text-gray-900 dark:text-gray-100 leading-tight">
            {name}
          </p>

          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          {progress?.zone && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{t(`zones.${progress.zone}`)}</span>
            </div>
          )}
        </div>

        {/* Quick actions on hover */}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ is_caught: !isCaught }); }}
            className={`p-2 rounded-full ${isCaught ? "bg-brand-500 text-white" : "bg-white/20 text-white"} hover:scale-110 transition-transform`}
            title={t("pokedex.markCaught")}
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
            className="p-2 rounded-full bg-white/20 text-white hover:scale-110 transition-transform"
            title={t("pokedex.assignZone")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 mb-6">
              <PokemonSprite spriteKey={pokemon.sprite_key} name={name} size="lg" />
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">{name}</h2>
              <span className="text-xs font-pixel text-gray-400">#{String(pokemon.id).padStart(3, "0")}</span>
              <div className="flex flex-wrap justify-center gap-1">
                {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
              {badgeLabel && (
                <span className="text-xs font-semibold text-accent-yellow">{badgeLabel}</span>
              )}
            </div>

            {/* Specialties */}
            {pokemon.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("common.specialties")}</p>
                <div className="flex flex-wrap gap-1">
                  {pokemon.specialties.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Caught toggle */}
            <div className="mb-4">
              <button
                onClick={() => onUpdate({ is_caught: !isCaught })}
                className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors ${isCaught ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
              >
                <Star className="w-4 h-4 inline mr-1" />{t("common.caught")}
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
              onClick={() => setShowDetail(false)}
              className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
