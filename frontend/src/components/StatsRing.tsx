const RING_R = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

interface Props {
  value: number;
  max: number;
}

export function StatsRing({ value, max }: Props) {
  const pct = max > 0 ? value / max : 0;
  const offset = RING_CIRCUMFERENCE * (1 - pct);
  const displayPct = max > 0 ? Math.round(pct * 100) : 0;
  return (
    <div className="relative shrink-0 w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48" cy="48" r={RING_R}
          fill="none" strokeWidth="8"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx="48" cy="48" r={RING_R}
          fill="none" strokeWidth="8"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-brand-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-pixel text-[11px] text-brand-500 leading-none">{displayPct}%</span>
      </div>
    </div>
  );
}
