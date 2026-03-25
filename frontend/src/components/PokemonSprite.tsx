import { useState } from "react";
import { getSpriteUrl } from "../services/api";

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

export function PokemonSprite({ spriteKey, name, size = "md", grayscale = false }: Props) {
  const [errored, setErrored] = useState(false);
  const url = getSpriteUrl(spriteKey);

  if (errored) {
    return (
      <div
        className={`${sizes[size]} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 text-xs font-pixel`}
      >
        ?
      </div>
    );
  }

  return (
    <video
      className={`${sizes[size]} object-contain ${grayscale ? "grayscale opacity-40" : ""} transition-all duration-300`}
      autoPlay
      loop
      muted
      playsInline
      title={name}
      onError={() => setErrored(true)}
    >
      <source src={url} type="video/webm" />
    </video>
  );
}
