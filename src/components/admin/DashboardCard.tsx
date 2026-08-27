export function DashboardCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-cioco-green">{value}</p>
      {hint && <p className="mt-1 text-xs text-cioco-green/50">{hint}</p>}
    </div>
  );
}
