import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Loader,
  MessageCircle,
  Phone,
  Settings,
  Share2,
  ShoppingBag,
  Star,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  getMicrotiendaByIdRequest,
  getProductsRequest,
  getRatingsRequest,
} from '../utils/api';

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)]';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const smallOutlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]';
const badgeClass =
  'inline-flex items-center rounded-[calc(var(--radius)-2px)] bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-foreground)]';
const fallbackBusinessImage =
  'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&q=80';

const buildFallbackDescription = (category) =>
  category
    ? `Negocio local del sector ${category.toLowerCase()} registrado en la plataforma oficial del municipio.`
    : 'Negocio local registrado en la plataforma oficial del municipio.';

export function BusinessDetailPageReal() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBusinessDetail = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [businessResponse, productsResponse, ratingsResponse] = await Promise.all([
          getMicrotiendaByIdRequest(id),
          getProductsRequest(Number(id)),
          getRatingsRequest({ microtiendaId: Number(id) }),
        ]);

        if (!isMounted) {
          return;
        }

        setBusiness({
          ...businessResponse,
          descripcion:
            businessResponse.descripcion?.trim() ||
            buildFallbackDescription(businessResponse.categoria || ''),
        });
        setProducts(productsResponse || []);
        setRecentReviews((ratingsResponse || []).slice(0, 3));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('No se pudo cargar el detalle del negocio', error);
        setErrorMessage(error.message || 'No se pudo cargar el negocio seleccionado.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBusinessDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const whatsappHref = useMemo(() => {
    if (!business?.whatsapp) {
      return null;
    }

    const normalized = String(business.whatsapp).replace(/\D/g, '');
    return normalized ? `https://wa.me/${normalized}` : null;
  }, [business]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--ivory)] px-6">
        <div className="text-center">
          <Loader size={48} className="mx-auto animate-spin" color="var(--accent)" />
          <p className="mt-4 text-[var(--muted-foreground)]">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--ivory)] px-6">
        <div className={`${cardClass} max-w-[640px] text-center`}>
          <h2 className="mb-4">No pudimos mostrar este negocio</h2>
          <p className="mb-6 text-[var(--muted-foreground)]">
            {errorMessage || 'La microtienda no existe o ya no se encuentra disponible.'}
          </p>
          <Link to="/marketplace" className={outlineButtonClass}>
            Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="relative h-[400px] overflow-hidden">
        <ImageWithFallback
          src={business.logoImagen || fallbackBusinessImage}
          alt={business.nombre}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.18))',
          }}
        />

        <div className="absolute right-0 bottom-8 left-0 w-full px-6 lg:px-8">
          <div className="w-full">
            <span className={`${badgeClass} mb-3`}>{business.categoria || 'General'}</span>
            <h1 className="mb-2 text-[var(--white)]">{business.nombre}</h1>
            <div className="flex flex-wrap items-center gap-4 text-[rgba(255,255,255,0.92)]">
              <div className="flex items-center gap-1">
                <Star size={20} fill="var(--accent)" color="var(--accent)" />
                <span className="text-lg font-semibold text-[var(--white)]">
                  {Number(business.promedioCalificacion || 0).toFixed(1)}
                </span>
                <span>({Number(business.totalCalificaciones || 0)} reseñas)</span>
              </div>
              <div className="flex items-center gap-2">
                <Store size={18} />
                <span>{business.sectorEconomico || 'Emprendimiento local de Soledad'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div>
            <div className={`${cardClass} mb-6`}>
              <h2 className="mb-4">Acerca del negocio</h2>
              <p className="m-0 text-[1.0625rem] leading-[1.7] text-[var(--muted-foreground)]">
                {business.descripcion}
              </p>
            </div>

            <div className={cardClass}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="m-0">Productos publicados</h2>
                <span className={badgeClass}>{products.length}</span>
              </div>

              {products.length === 0 ? (
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] px-6 py-10 text-center">
                  <h4 className="mb-3">Esta tienda todavía no tiene productos aprobados</h4>
                  <p className="m-0 text-[var(--muted-foreground)]">
                    Cuando el administrador valide nuevas publicaciones, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      <div className="h-full overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                        <button
                          type="button"
                          className="block w-full cursor-pointer border-none bg-transparent p-0 text-left"
                          onClick={() => setSelectedImage(product.imagenUrl || fallbackBusinessImage)}
                        >
                          <div className="grid h-full grid-cols-[120px_minmax(0,1fr)]">
                            <div>
                              <ImageWithFallback
                                src={product.imagenUrl || fallbackBusinessImage}
                                alt={product.nombre}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  minHeight: '120px',
                                }}
                              />
                            </div>
                            <div className="p-4">
                              <div className="mb-2 flex items-start justify-between gap-3">
                                <h4 className="mb-0 text-base">{product.nombre}</h4>
                                <span className={badgeClass}>{product.stock}</span>
                              </div>
                              <p className="mb-2 text-sm text-[var(--muted-foreground)]">
                                {product.descripcion || 'Producto registrado en la tienda.'}
                              </p>
                              <div className="text-lg font-bold text-[var(--accent-foreground)]">
                                {formatPrice(product.precio)}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${cardClass} mt-6`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="m-0">Reseñas recientes</h2>
                <Link
                  to={`/comentarios?microtiendaId=${business.id}`}
                  className={smallOutlineButtonClass}
                >
                  Ver todas
                </Link>
              </div>

              {recentReviews.length === 0 ? (
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4 text-[var(--muted-foreground)]">
                  Este negocio todavía no tiene reseñas aprobadas.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="mb-1 text-base">{review.nombreVisitante}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Number(review.puntuacion || 0) ? 'var(--accent)' : 'none'}
                                color={
                                  i < Number(review.puntuacion || 0)
                                    ? 'var(--accent)'
                                    : 'var(--muted-foreground)'
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {new Date(review.fecha).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      <p className="m-0 text-[var(--foreground)]">{review.comentario}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className={`${cardClass} lg:sticky lg:top-[100px]`}>
              <div className="mb-4 text-center">
                <div className="mx-auto h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-[var(--accent)]">
                  <ImageWithFallback
                    src={business.logoImagen || fallbackBusinessImage}
                    alt={business.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>

              <h3 className="mb-2 text-center">{business.propietario || 'Emprendedor registrado'}</h3>
              <p className="mb-6 text-center text-[var(--muted-foreground)]">Propietario</p>

              <div className="mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Store size={18} color="var(--primary)" />
                  <span>{business.categoria || 'Categoría general'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings size={18} color="var(--primary)" />
                  <span>{business.sectorEconomico || 'Sector no especificado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} color="var(--primary)" />
                  <span>{Number(business.totalProductos || 0)} productos publicados</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound size={18} color="var(--primary)" />
                  <span>{Number(business.totalCalificaciones || 0)} reseñas aprobadas</span>
                </div>
                {business.redesSociales ? (
                  <div className="flex items-center gap-2">
                    <Share2 size={18} color="var(--primary)" />
                    <span className="break-words text-sm">{business.redesSociales}</span>
                  </div>
                ) : null}
              </div>

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${accentButtonClass} mb-3 w-full`}
                >
                  <MessageCircle size={20} />
                  Contactar por WhatsApp
                </a>
              ) : (
                <div className="mb-3 flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  <Phone size={18} />
                  Este negocio no tiene WhatsApp registrado.
                </div>
              )}

              <Link to={`/comentarios?microtiendaId=${business.id}`} className={`${outlineButtonClass} w-full`}>
                <Star size={20} />
                Ver y dejar calificaciones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.9)] p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--white)]"
          >
            <X size={24} color="var(--primary)" />
          </button>
          <ImageWithFallback
            src={selectedImage}
            alt="Producto"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
