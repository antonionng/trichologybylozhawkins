type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-graphite">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-black/45">{hint}</p> : null}
    </div>
  );
}







