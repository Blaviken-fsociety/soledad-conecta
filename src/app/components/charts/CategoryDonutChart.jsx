import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#1B3A5F', '#FFB800', '#0F8A5F', '#B45309', '#2563EB', '#7C3AED', '#D946EF'];

const cardClass =
  'rounded-[var(--radius)] border border-[rgba(27,58,95,0.12)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';

export function CategoryDonutChart({ data = [] }) {
  const total = data.reduce((accumulator, item) => accumulator + Number(item.value || 0), 0);

  return (
    <div className={cardClass}>
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          Distribución por categoría
        </p>
        <h3 className="m-0 text-xl text-[var(--primary)]">Interés analítico por categoría</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,1fr)]">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Consultas']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="rounded-[20px] bg-[var(--secondary)] px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              Total agregado
            </p>
            <p className="m-0 text-2xl font-bold text-[var(--primary)]">{total}</p>
          </div>

          {data.length ? (
            data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-[18px] border border-[var(--border)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--primary)]">{item.value}</span>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              Aún no hay suficiente actividad por categoría.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
