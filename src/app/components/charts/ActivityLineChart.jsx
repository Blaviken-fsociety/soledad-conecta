import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const cardClass =
  'rounded-[var(--radius)] border border-[rgba(27,58,95,0.12)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';

export function ActivityLineChart({ data = [], rangeLabel = 'semanal' }) {
  return (
    <div className={cardClass}>
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          Actividad en el tiempo
        </p>
        <h3 className="m-0 text-xl text-[var(--primary)]">Evolución {rangeLabel} de consultas</h3>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="microtiendaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#1B3A5F" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#1B3A5F" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="productoGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#FFB800" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FFB800" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(27,58,95,0.08)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="microtiendaViews"
              stroke="#1B3A5F"
              fill="url(#microtiendaGradient)"
              strokeWidth={3}
              name="Microtiendas"
            />
            <Area
              type="monotone"
              dataKey="productViews"
              stroke="#FFB800"
              fill="url(#productoGradient)"
              strokeWidth={3}
              name="Productos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
