import { useEffect, useMemo, useState } from 'react';
import { Activity, Download, Package, Store, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityLineChart } from '../../../components/charts/ActivityLineChart';
import { CategoryDonutChart } from '../../../components/charts/CategoryDonutChart';
import { KpiMetricCard } from '../../../components/charts/KpiMetricCard';
import { TopProductsTable } from '../../../components/charts/TopProductsTable';
import { downloadAnalyticsReport, getAdminAnalytics } from '../../../services/metricasService';

const panelClass =
  'rounded-[var(--radius)] border border-[rgba(27,58,95,0.12)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds || 0);

  if (!safeSeconds) {
    return '0 seg';
  }

  if (safeSeconds < 60) {
    return `${formatNumber(safeSeconds, 1)} seg`;
  }

  return `${formatNumber(safeSeconds / 60, 1)} min`;
};

const GrowthCard = ({ label, growth }) => (
  <div className="rounded-[22px] border border-[var(--border)] bg-[var(--secondary)] p-4">
    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
      {label}
    </p>
    <p className="mb-1 text-2xl font-bold text-[var(--primary)]">{formatNumber(growth?.current || 0)}</p>
    <p
      className="m-0 text-sm font-semibold"
      style={{
        color:
          growth?.direction === 'up'
            ? '#0F8A5F'
            : growth?.direction === 'down'
              ? '#C2410C'
              : 'var(--muted-foreground)',
      }}
    >
      {growth?.percentage > 0 ? '+' : ''}
      {formatNumber(growth?.percentage || 0, 1)}% frente al periodo anterior
    </p>
  </div>
);

export function AdminMetricsPanel() {
  const [range, setRange] = useState('weekly');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAdminAnalytics(range);

        if (isMounted) {
          setAnalytics(response || null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'No fue posible cargar la analítica administrativa.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const kpiCards = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        icon: Store,
        label: 'Microtiendas activas',
        value: formatNumber(analytics.kpis.totalMicrotiendasActivas),
        helper: 'Emprendimientos actualmente visibles y aprobados.',
        growth: analytics.growth.microtiendas,
        tone: 'var(--primary)',
      },
      {
        icon: Package,
        label: 'Productos registrados',
        value: formatNumber(analytics.kpis.totalProductosRegistrados),
        helper: 'Inventario consolidado dentro del ecosistema.',
        growth: analytics.growth.productos,
        tone: '#FFB800',
      },
      {
        icon: Users,
        label: 'Usuarios activos',
        value: formatNumber(analytics.kpis.usuariosActivos),
        helper: 'Usuarios identificados con actividad durante el periodo.',
        growth: analytics.growth.usuarios,
        tone: '#0F8A5F',
      },
      {
        icon: Activity,
        label: 'Permanencia promedio',
        value: formatDuration(analytics.kpis.tiempoPromedioPermanenciaSegundos),
        helper: 'Tiempo medio observado entre microtiendas y productos.',
        growth: analytics.growth.general,
        tone: '#B45309',
      },
      {
        icon: TrendingUp,
        label: 'Vistas del periodo',
        value: formatNumber(analytics.kpis.totalVistasPeriodo),
        helper: range === 'monthly' ? 'Acumulado de los últimos 30 días.' : 'Acumulado de los últimos 7 días.',
        growth: analytics.growth.general,
        tone: '#2563EB',
      },
    ];
  }, [analytics, range]);

  const handleDownload = async (format) => {
    setDownloading(format);

    try {
      await downloadAnalyticsReport({ format, range });
    } catch (downloadError) {
      setError(downloadError.message || 'No fue posible generar el reporte.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-6 overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#17324F_0%,#1F4C77_58%,#2F6B8F_100%)] px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.78)]">
              Admin · Métricas
            </p>
            <h2 className="mb-2 text-[2rem] leading-tight text-white">Panel institucional de analítica administrativa</h2>
            <p className="m-0 text-sm leading-7 text-[rgba(255,255,255,0.84)]">
              Consolida interacción con microtiendas y productos, detecta crecimiento y exporta reportes operativos para seguimiento administrativo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.12)] p-1">
              {[
                ['weekly', 'Semanal'],
                ['monthly', 'Mensual'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: range === value ? 'white' : 'transparent',
                    color: range === value ? 'var(--primary)' : 'white',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleDownload('csv')}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.28)] px-4 py-2 text-sm font-semibold text-white"
              disabled={downloading === 'csv'}
            >
              <Download size={16} />
              {downloading === 'csv' ? 'Generando CSV...' : 'Reporte CSV'}
            </button>
            <button
              type="button"
              onClick={() => handleDownload('excel')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]"
              disabled={downloading === 'excel'}
            >
              <Download size={16} />
              {downloading === 'excel' ? 'Generando Excel...' : 'Generar reporte'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-[var(--radius)] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className={panelClass}>
          <p className="m-0 text-sm text-[var(--muted-foreground)]">Construyendo el panel analítico...</p>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {kpiCards.map((item) => (
              <KpiMetricCard key={item.label} {...item} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
            <ActivityLineChart
              data={analytics.charts.activity}
              rangeLabel={range === 'monthly' ? 'mensual' : 'semanal'}
            />
            <CategoryDonutChart data={analytics.charts.categoryDistribution} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GrowthCard label="Crecimiento general" growth={analytics.growth.general} />
            <GrowthCard label="Crecimiento de microtiendas" growth={analytics.growth.microtiendas} />
            <GrowthCard label="Crecimiento de productos" growth={analytics.growth.productos} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <TopProductsTable products={analytics.rankings.topProducts} />

            <div className={panelClass}>
              <div className="mb-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  Microtiendas más visitadas
                </p>
                <h3 className="m-0 text-xl text-[var(--primary)]">Ranking de interés institucional</h3>
              </div>

              <div className="space-y-3">
                {analytics.rankings.topMicrotiendas.length ? (
                  analytics.rankings.topMicrotiendas.map((item, index) => (
                    <div key={item.id} className="rounded-[20px] border border-[var(--border)] px-4 py-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--secondary)] text-sm font-bold text-[var(--primary)]">
                            {index + 1}
                          </span>
                          <div>
                            <p className="m-0 text-sm font-semibold text-[var(--foreground)]">{item.nombre}</p>
                            <p className="m-0 text-xs text-[var(--muted-foreground)]">{item.categoria}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-[var(--primary)]">{item.views}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                        <span>Ingresos directos: {item.directViews}</span>
                        <span>Vistas de productos: {item.productViews}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    Las microtiendas aparecerán aquí cuando empiece el tráfico analítico.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
