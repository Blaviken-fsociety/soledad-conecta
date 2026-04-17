import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Loader,
  Monitor,
  Palette,
  Pizza,
  Search,
  Settings,
  Shirt,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getCategoriesRequest, getMarketplaceMicrotiendasRequest } from '../utils/api';

const fallbackBusinessImage =
  'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&q=80';

const categoryIconMap = {
  alimentos: Pizza,
  moda: Shirt,
  tecnologia: Monitor,
  artesanias: Palette,
  servicios: Settings,
  belleza: Sparkles,
};

const cardClass =
  'h-full overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]';
const badgeClass =
  'inline-flex items-center rounded-[calc(var(--radius)-2px)] bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-foreground)]';
const inputClass =
  'h-12 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] pl-12 pr-4 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const filterButtonBase =
  'inline-flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
const activeFilterClass = `${filterButtonBase} bg-[var(--accent)] text-[var(--accent-foreground)] hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)]`;
const inactiveFilterClass = `${filterButtonBase} border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]`;
const primaryButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)]';

const buildFallbackDescription = (category) =>
  category
    ? `Emprendimiento del sector ${category.toLowerCase()} registrado en la plataforma oficial del municipio.`
    : 'Emprendimiento registrado en la plataforma oficial del municipio.';

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadMarketplaceData = async () => {
      setIsLoading(true);

      try {
        const [backendCategories, backendBusinesses] = await Promise.all([
          getCategoriesRequest(true),
          getMarketplaceMicrotiendasRequest({
            page,
            limit: 9,
            search: searchTerm.trim(),
            categoria: selectedCategory,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const formattedCategories = (backendCategories || []).map((category) => ({
          id: category.id,
          name: category.nombre,
          count: Number(category.totalMicrotiendas || 0),
          Icon: categoryIconMap[normalizeText(category.nombre)] || Settings,
        }));

        const rawBusinesses = Array.isArray(backendBusinesses)
          ? backendBusinesses
          : backendBusinesses?.items || [];

        const formattedBusinesses = rawBusinesses.map((business, index) => ({
          id: business.id,
          name: business.nombre || `Emprendimiento ${index + 1}`,
          category: business.categoria || 'General',
          owner: business.propietario || 'Emprendedor registrado',
          rating: Number(business.promedioCalificacion || 0),
          reviews: Number(business.totalCalificaciones || 0),
          description:
            business.descripcion?.trim() || buildFallbackDescription(business.categoria || ''),
          image: business.logoImagen || fallbackBusinessImage,
          sector: business.sectorEconomico || '',
        }));

        setCategories(formattedCategories);
        setBusinesses(formattedBusinesses);
        setPagination(
          backendBusinesses?.pagination || {
            page: 1,
            limit: 9,
            total: formattedBusinesses.length,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        );
      } catch (error) {
        console.error('No se pudieron cargar las categorias y microtiendas del marketplace', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarketplaceData();

    return () => {
      isMounted = false;
    };
  }, [page, searchTerm, selectedCategory]);

  const categoryOptions = useMemo(
    () => ['Todos', ...categories.map((category) => category.name)],
    [categories],
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: pagination.totalPages || 1 }, (_, index) => index + 1),
    [pagination.totalPages],
  );

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="w-full bg-[var(--primary)] px-6 py-12 text-[var(--primary-foreground)] lg:px-8">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 text-[var(--white)]">Marketplace</h1>
            <p className="text-lg text-[rgba(255,255,255,0.9)]">
              Descubre y conecta con emprendimientos locales registrados en la plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="w-full bg-[var(--white)] px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] lg:px-8">
        <div className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-[48%]">
            <div className="relative">
              <Search
                size={20}
                color="var(--muted-foreground)"
                className="absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                type="search"
                className={inputClass}
                placeholder="Buscar emprendimientos registrados..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={20} color="var(--primary)" />
              <span className="mr-2 font-semibold">Categoria:</span>
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                  className={selectedCategory === category ? activeFilterClass : inactiveFilterClass}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-16 lg:px-8">
        <div className="mb-6 flex w-full items-center justify-between">
          <h3 className="m-0">
            {pagination.total}{' '}
            {pagination.total === 1 ? 'Emprendimiento' : 'Emprendimientos'}
            {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
          </h3>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <Loader size={48} className="mx-auto animate-spin" color="var(--accent)" />
            <p className="mt-4 text-[var(--muted-foreground)]">Cargando emprendimientos...</p>
          </div>
        ) : businesses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-8 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)]">
              <Search size={56} strokeWidth={1.5} />
            </div>
            <h3 className="mb-4">No se encontraron resultados</h3>
            <p className="mb-8 text-lg text-[var(--muted-foreground)]">
              Intenta con otros terminos de busqueda o explora diferentes categorias.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setPage(1);
              }}
              className={primaryButtonClass}
            >
              Limpiar filtros
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/negocio/${business.id}`} className="block text-inherit no-underline">
                    <div className={cardClass}>
                      <div className="relative overflow-hidden pt-[66.67%]">
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
                        <div className="mb-2 flex items-center gap-2">
                          <UserRound size={14} color="var(--muted-foreground)" />
                          <span className="text-sm text-[var(--muted-foreground)]">{business.owner}</span>
                        </div>
                        {business.sector ? (
                          <div className="mb-2 min-h-[20px] text-sm text-[var(--muted-foreground)]">
                            Sector: {business.sector}
                          </div>
                        ) : (
                          <div className="mb-2 min-h-[20px]" />
                        )}
                        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-2">
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
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={!pagination.hasPreviousPage}
                className={inactiveFilterClass}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={page === pageNumber ? activeFilterClass : inactiveFilterClass}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages || 1))}
                disabled={!pagination.hasNextPage}
                className={inactiveFilterClass}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
