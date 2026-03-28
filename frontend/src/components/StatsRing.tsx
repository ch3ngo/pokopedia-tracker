interface Props {
  value: number;
  max: number;
  size?: "sm" | "md";
  color?: "brand" | "teal";
}

const CONFIG = {
  md: { r: 38, size: 96, strokeWidth: 8, textSize: "text-[11px]" },
  sm: { r: 28, size: 68, strokeWidth: 6, textSize: "text-[9px]" },
};

const STROKE_CLASS = {
  brand: "stroke-brand-500",
  teal: "stroke-accent-teal",
};

const TEXT_CLASS = {
  brand: "text-brand-500",
  teal: "text-accent-teal",
};

export function StatsRing({ value, max, size = "md", color = "brand" }: Props) {
  const cfg = CONFIG[size];
  const circumference = 2 * Math.PI * cfg.r;
  const pct = max > 0 ? value / max : 0;
  const offset = circumference * (1 - pct);
  const displayPct = max > 0 ? Math.round(pct * 100) : 0;

  return (
    <div className="relative shrink-0" style={{ width: cfg.size, height: cfg.size }}>
      <svg width={cfg.size} height={cfg.size} className="-rotate-90">
        <circle
          cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
          fill="none" strokeWidth={cfg.strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
          fill="none" strokeWidth={cfg.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${STROKE_CLASS[color]} transition-all duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-pixel ${cfg.textSize} ${TEXT_CLASS[color]} leading-none`}>{displayPct}%</span>
      </div>
    </div>
  );
}
