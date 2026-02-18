import clsx from "clsx";
import { Panel } from "./Panel";

interface AdminMetricProps {
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function AdminMetric({
  label,
  value,
  trend,
  icon,
  className,
}: AdminMetricProps) {
  return (
    <Panel variant="default" padding="md" className={clsx("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-admin-text-muted uppercase tracking-wider">
          {label}
        </span>
        {icon ? (
          <span className="text-admin-text-muted">{icon}</span>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-admin-text tabular-nums">
          {value}
        </span>
        {trend ? (
          <span
            className={clsx(
              "mb-0.5 text-xs font-medium",
              trend.positive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        ) : null}
      </div>
    </Panel>
  );
}
