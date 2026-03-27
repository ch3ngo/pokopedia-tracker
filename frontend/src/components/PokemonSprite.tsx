import { useState } from "react";

interface Props {
  spriteKey: string;
  name: string;
  size?: "sm" | "md" | "lg";
  grayscale?: boolean;
}

const sizes = {
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-32 h-32",
};

function normalizeSpriteName(key: string): string {
  return key
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/:/g, "")
    .replace(/--+/g, "-");
}

export function PokemonSprite({ spriteKey, name, size = "md", grayscale = false }: Props) {
  const [stage, setStage] = useState<"local" | "remote" | "error">("local");
  const normalized = normalizeSpriteName(spriteKey);
  const localUrl = `/imgs/pokedex/${normalized}.png`;
  const remoteUrl = `https://img.pokemondb.net/sprites/home/normal/${normalized}.png`;

  if (stage === "error") {
    return (
      <div
        className={`${sizes[size]} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 text-xs font-pixel`}
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={stage === "local" ? localUrl : remoteUrl}
      alt={name}
      className={`${sizes[size]} object-contain ${grayscale ? "grayscale opacity-40" : ""} transition-all duration-300`}
      onError={() => setStage(stage === "local" ? "remote" : "error")}
    />
  );
}
