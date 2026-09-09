/**
 * @param {{ percent: number, size?: number, strokeWidth?: number, label?: string, trackClassName?: string, barClassName?: string }} props
 */
export default function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 6,
  label,
  trackClassName = "text-surface-container-high",
  barClassName = "text-secondary",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={barClassName}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-headline-sm text-headline-sm text-primary font-bold">
          {percent}
          <span className="text-label-sm font-normal">%</span>
        </span>
      </div>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
