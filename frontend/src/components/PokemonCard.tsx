import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Check, CheckCircle2 } from "lucide-react";
import type { Pokemon, Habitat, PokemonProgress } from "../types";
import { PokemonSprite } from "./PokemonSprite";
import { TypeBadge } from "./TypeBadge";
import { PokemonDetailModal } from "./PokemonDetailModal";

interface Props {
  pokemon: Pokemon;
  progress: PokemonProgress | undefined;
  onUpdate: (update: Partial<PokemonProgress>) => void;
  lang: "en" | "es";
  habitats?: Habitat[];
}

export function PokemonCard({ pokemon, progress, onUpdate, lang, habitats }: Props) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);

  const isCaught = progress?.is_caught ?? false;
  const name = lang === "es" ? pokemon.name_es : pokemon.name_en;
  const isSpecial = pokemon.is_legendary || pokemon.is_mythical || pokemon.is_special_npc;

  return (
    <>
      <div
        className={`relative rounded-2xl border transition-all duration-200 cursor-pointer group
          ${isCaught
            ? "border-brand-500 bg-white dark:bg-gray-800 shadow-md shadow-brand-500/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          }
        `}
        onClick={() => setShowDetail(true)}
      >
        {/* Status indicator */}
        {isCaught && (
          <div className="absolute top-2 right-2 z-10">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
              <Check className="w-3 h-3 text-brand-500" />
            </span>
          </div>
        )}

        {/* Special badge */}
        {isSpecial && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[9px] font-pixel text-accent-yellow">★</span>
          </div>
        )}

        <div className="p-3 flex flex-col items-center gap-2">
          <PokemonSprite spriteKey={pokemon.sprite_key} name={name} size="md" />

          <span className="text-[9px] font-pixel text-gray-400 dark:text-gray-500">
            #{String(pokemon.id).padStart(3, "0")}
          </span>

          <p className="font-bold text-sm text-center text-gray-900 dark:text-gray-100 leading-tight">
            {name}
          </p>

          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>

          {pokemon.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {pokemon.specialties.map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded-full bg-accent-teal/15 text-accent-teal text-[9px] font-semibold">
                  {t(`specialties.${s}`, s)}
                </span>
              ))}
            </div>
          )}

          {progress?.zone && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{t(`zones.${progress.zone}`)}</span>
            </div>
          )}
        </div>

        {/* Quick action on hover */}
        <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ is_caught: !isCaught }); }}
            className={`p-2 rounded-full ${isCaught ? "bg-brand-500 text-white" : "bg-white/20 text-white"} hover:scale-110 transition-transform`}
            title={t("pokedex.markCaught")}
          >
            {isCaught ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showDetail && (
        <PokemonDetailModal
          pokemon={pokemon}
          progress={progress}
          onUpdate={onUpdate}
          onClose={() => setShowDetail(false)}
          lang={lang}
          habitats={habitats}
        />
      )}
    </>
  );
}
