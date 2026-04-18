import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  ExternalLink,
  Monitor,
  Palette,
  Pizza,
  Settings,
  Shirt,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ChatBot from '../components/ChatBot';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  getCategoriesRequest,
  getMicrotiendasRequest,
  getPublicMetricsRequest,
} from '../utils/api';

const categoryDefinitions = [
  { name: 'Alimentos', targetCategory: 'Alimentos', icon: Pizza },
  { name: 'Moda', targetCategory: 'Moda', icon: Shirt },
  { name: 'Tecnologia', targetCategory: 'Tecnologia', icon: Monitor },
  { name: 'Artesanías', targetCategory: 'Artesanías', icon: Palette },
  { name: 'Servicios', targetCategory: 'Servicios', icon: Settings },
  { name: 'Belleza', targetCategory: 'Salud y Belleza', icon: Sparkles },
];

const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)]';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)]';
const featuredCtaButtonClass =
  'inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] bg-[var(--primary)] px-8 py-4 text-[1.05rem] font-semibold text-[var(--primary-foreground)] no-underline transition-all duration-200 hover:bg-[#152E4D] hover:shadow-[0_8px_24px_rgba(27,58,95,0.22)]';
const outlineButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const cardClass =
  'h-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]';
const badgeClass =
  'inline-flex items-center rounded-[calc(var(--radius)-2px)] bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-foreground)]';

const fallbackBusinessImage =
  'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&q=80';

const buildFallbackDescription = (category) =>
  category
    ? `Emprendimiento local del sector ${category.toLowerCase()} registrado en la plataforma oficial del municipio.`
    : 'Emprendimiento local registrado en la plataforma oficial del municipio.';

export function HomePage() {
  const [publicMetrics, setPublicMetrics] = useState({
    microtiendasActivas: 0,
    totalEmprendedores: 0,
    tasaSatisfaccion: 0,
  });
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [categories, setCategories] = useState(
    categoryDefinitions.map((category) => ({ ...category, count: 0 })),
  );

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        const [metrics, microtiendas, backendCategories] = await Promise.all([
          getPublicMetricsRequest(),
          getMicrotiendasRequest(),
          getCategoriesRequest(true),
        ]);

        if (!isMounted) {
          return;
        }

        setPublicMetrics({
          microtiendasActivas: Number(metrics?.microtiendasActivas || 0),
          totalEmprendedores: Number(metrics?.totalEmprendedores || 0),
          tasaSatisfaccion: Number(metrics?.tasaSatisfaccion || 0),
        });

        const categoryCountMap = new Map(
          (backendCategories || []).map((category) => [
            String(category.nombre || '').toLowerCase(),
            Number(category.totalMicrotiendas || 0),
          ]),
        );

        setCategories(
          categoryDefinitions.map((category) => ({
            ...category,
            count: categoryCountMap.get(category.name.toLowerCase()) || 0,
          })),
        );

        const businesses = [...(microtiendas || [])]
          .sort((a, b) => {
            const ratingDiff =
              Number(b.promedioCalificacion || 0) - Number(a.promedioCalificacion || 0);

            if (ratingDiff !== 0) {
              return ratingDiff;
            }

            const reviewsDiff = Number(b.totalCalificaciones || 0) - Number(a.totalCalificaciones || 0);

            if (reviewsDiff !== 0) {
              return reviewsDiff;
            }

            return (
              new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime()
            );
          })
          .slice(0, 4)
          .map((business, index) => ({
            id: business.id,
            name: business.nombre || `Emprendimiento ${index + 1}`,
            category: business.categoria || 'General',
            owner: business.propietario || 'Emprendedor registrado',
            rating: Number(business.promedioCalificacion || 0),
            reviews: Number(business.totalCalificaciones || 0),
            description:
              business.descripcion?.trim() || buildFallbackDescription(business.categoria || ''),
            image: business.logoImagen || fallbackBusinessImage,
          }));

        setFeaturedBusinesses(businesses);
      } catch (error) {
        console.error('No se pudieron cargar los datos públicos de la página de inicio', error);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const dynamicStats = useMemo(
    () => [
      {
        icon: Store,
        value: `${publicMetrics.microtiendasActivas}+`,
        label: 'Emprendimientos Activos',
      },
      {
        icon: Users,
        value: `${publicMetrics.totalEmprendedores}+`,
        label: 'Emprendedores Registrados',
      },
      {
        icon: TrendingUp,
        value: `${publicMetrics.tasaSatisfaccion}%`,
        label: 'Tasa de satisfacción',
      },
    ],
    [publicMetrics],
  );

  return (
    <div className="w-full">
      <ChatBot />
      <section className="relative w-full overflow-hidden bg-[var(--ivory)] px-6 lg:px-8">
        <div className="flex min-h-[600px] w-full flex-col items-center justify-between gap-12 py-12 lg:flex-row lg:gap-16 lg:py-0">
          <div className="w-full max-w-[720px] flex-1 py-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="mb-6 inline-block rounded-[calc(var(--radius)*2)] px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                Plataforma Oficial del Municipio
              </div>
              <h1 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-[var(--primary)]">
                Conecta con los Emprendedores de Soledad
              </h1>
              <p className="mb-8 max-w-[40rem] text-xl leading-[1.6] text-[var(--muted-foreground)]">
                Descubre negocios locales, apoya el talento de tu comunidad y fortalece la economia de
                nuestro municipio.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/marketplace" className={accentButtonClass}>
                  Explorar Marketplace
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className={outlineButtonClass}>
                  Registra tu Emprendimiento
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-6">
                {dynamicStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)]"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)',
                      }}
                    >
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <div className="text-2xl leading-none font-bold text-[var(--primary)]">
                        {stat.value}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="hidden w-full flex-1 lg:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] w-full"
            >
              <ImageWithFallback
                src={fallbackBusinessImage}
                alt="Emprendedores de Soledad"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 20px 60px rgba(27, 58, 95, 0.2)',
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--white)] px-6 py-16 lg:px-8">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4">Explora por Categoria</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Encuentra emprendimientos en diferentes sectores
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={`/marketplace?category=${encodeURIComponent(category.targetCategory || category.name)}`}
                    className="no-underline"
                  >
                    <div className={`${cardClass} cursor-pointer p-6 text-center`}>
                      <div className="mb-3 flex justify-center text-[var(--primary)]">
                        <Icon size={44} strokeWidth={1.7} />
                      </div>
                      <h4 className="mb-1 text-base">{category.name}</h4>
                      <span className={badgeClass}>{category.count}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--secondary)] px-6 py-16 lg:px-8">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4">Emprendimientos Destacados</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Conoce los negocios más populares de nuestra comunidad
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredBusinesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/negocio/${business.id}`} className="block text-inherit no-underline">
                  <div className={`${cardClass} overflow-hidden`}>
                    <div className="relative overflow-hidden pt-[75%]">
                      <ImageWithFallback
                        src={business.image}
                        alt={business.name}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />

                      <div className="absolute top-4 right-4">
                        <span className={badgeClass}>{business.category}</span>
                      </div>
                    </div>
                    <div className="flex min-h-[205px] flex-col p-6">
                      <h3 className="mb-2 min-h-[56px] text-xl">{business.name}</h3>
                      <p className="mb-3 min-h-[40px] line-clamp-2 text-sm text-[var(--muted-foreground)]">
                        {business.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star size={16} fill="var(--accent)" color="var(--accent)" />
                            <span className="font-semibold">{business.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            ({business.reviews})
                          </span>
                        </div>
                        <ExternalLink size={18} color="var(--primary)" />
                      </div>
                      <div className="mt-auto border-t border-[var(--border)] pt-3">
                        <div className="flex items-center gap-2">
                          <Users size={14} color="var(--muted-foreground)" />
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {business.owner}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/marketplace" className={featuredCtaButtonClass}>
              Ver Todos los Emprendimientos
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--primary)] px-6 py-16 text-[var(--primary-foreground)] lg:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-6 lg:flex-row lg:gap-10">
          <div className="w-full lg:max-w-[70%]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-[var(--white)]">Eres Emprendedor?</h2>
              <p className="text-lg text-[rgba(255,255,255,0.9)]">
                Unete a nuestra plataforma institucional y lleva tu negocio al siguiente nivel.
                Accede a herramientas, visibilidad y apoyo del municipio.
              </p>
            </motion.div>
          </div>
          <div className="flex w-full justify-start lg:w-auto lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/login" className={accentButtonClass}>
                Registrar Emprendimiento
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
