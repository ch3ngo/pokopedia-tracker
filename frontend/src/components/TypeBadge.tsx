import { TYPE_COLORS } from "../types";

interface Props {
  type: string;
}

export function TypeBadge({ type }: Props) {
  const color = TYPE_COLORS[type] ?? "bg-gray-400 text-white";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {type}
    </span>
  );
}
