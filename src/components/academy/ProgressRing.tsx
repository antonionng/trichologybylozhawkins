"use client";

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function ProgressRing({
  percent,
  size = 100,
  strokeWidth = 8,
  label,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/5"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fab826" />
            <stop offset="100%" stopColor="#e5a820" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-black leading-none">
          {percent}%
        </span>
        {label && (
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-black/40">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
