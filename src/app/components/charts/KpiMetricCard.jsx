import { TrendingDown, TrendingUp } from 'lucide-react';

const cardClass =
  'rounded-[var(--radius)] border border-[rgba(27,58,95,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,252,0.98))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';

const getTrendCopy = (percentage) => {
  if (percentage > 0) {
    return {
      Icon: TrendingUp,
      color: '#0F8A5F',
      label: `+${percentage}%`,
    };
  }

  if (percentage < 0) {
    return {
      Icon: TrendingDown,
      color: '#C2410C',
      label: `${percentage}%`,
    };
  }

  return null;
};

export function KpiMetricCard({ icon: Icon, label, value, helper, tone = 'var(--primary)', growth }) {
  const trend = getTrendCopy(Number(growth?.percentage || 0));

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-[18px] shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
          style={{ backgroundColor: tone }}
        >
          <Icon size={22} color="white" />
        </div>
        {trend ? (
          <div
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${trend.color}18`, color: trend.color }}
          >
            <trend.Icon size={14} />
            {trend.label}
          </div>
        ) : null}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p
        className="m-0 text-[2rem] leading-none font-bold text-[var(--primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </p>
      <p className="mt-3 mb-0 text-sm leading-6 text-[var(--muted-foreground)]">{helper}</p>
    </div>
  );
}
