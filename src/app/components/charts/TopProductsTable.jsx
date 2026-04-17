const cardClass =
  'rounded-[var(--radius)] border border-[rgba(27,58,95,0.12)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';

export function TopProductsTable({ products = [] }) {
  return (
    <div className={cardClass}>
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          Productos más consultados
        </p>
        <h3 className="m-0 text-xl text-[var(--primary)]">Ranking de interacción</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Producto
              </th>
              <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Microtienda
              </th>
              <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Categoría
              </th>
              <th className="border-b border-[var(--border)] px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Vistas
              </th>
              <th className="border-b border-[var(--border)] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Última actividad
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-sm font-semibold text-[var(--foreground)]">
                    {product.nombre}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-sm text-[var(--foreground)]">
                    {product.microtienda}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                    {product.categoria}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-right text-sm font-bold text-[var(--primary)]">
                    {product.views}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                    {product.lastViewedAt
                      ? new Date(product.lastViewedAt).toLocaleString('es-CO')
                      : 'Sin actividad'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]"
                  colSpan={5}
                >
                  Todavía no hay productos consultados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
