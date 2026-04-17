import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
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
  createRatingRequest,
  getMicrotiendaByIdRequest,
  getProductsRequest,
  getRatingsRequest,
} from '../utils/api';
import {
  registerMicrotiendaStay,
  registerProductStay,
  trackMicrotiendaVisit,
  trackProductVisit,
} from '../services/metricasService';

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

const getProductImages = (product) => {
  if (Array.isArray(product?.imagenes) && product.imagenes.length) {
    return product.imagenes.filter(Boolean);
  }

  return product?.imagenUrl ? [product.imagenUrl] : [fallbackBusinessImage];
};

const initialReviewForm = {
  nombreVisitante: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  telefono: '',
  puntuacion: 0,
  comentario: '',
};

export function BusinessDetailPageReal() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewProductImageIndex, setPreviewProductImageIndex] = useState(0);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const microtiendaViewRef = useRef({ viewId: null, startedAt: 0 });
  const productViewSessionsRef = useRef({});

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
        setAllRatings(ratingsResponse || []);
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

  useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();
    microtiendaViewRef.current = { viewId: null, startedAt };

    const registerVisit = async () => {
      try {
        const response = await trackMicrotiendaVisit(Number(id));

        if (isMounted) {
          microtiendaViewRef.current = {
            viewId: response?.id || null,
            startedAt,
          };
        }
      } catch (error) {
        console.error('No se pudo registrar la visita de la microtienda', error);
      }
    };

    registerVisit();

    return () => {
      isMounted = false;
      const session = microtiendaViewRef.current;

      if (session?.viewId) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
        registerMicrotiendaStay(session.viewId, durationSeconds).catch((error) => {
          console.error('No se pudo registrar la permanencia en la microtienda', error);
        });
      }
    };
  }, [id]);

  useEffect(() => {
    return () => {
      Object.keys(productViewSessionsRef.current).forEach((productId) => {
        const session = productViewSessionsRef.current[productId];

        if (!session?.viewId || !session?.startedAt) {
          return;
        }

        const durationSeconds = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));

        registerProductStay(session.viewId, durationSeconds).catch((error) => {
          console.error('No se pudo registrar la permanencia del producto', error);
        });
      });
    };
  }, []);

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

  const productRatingsMap = useMemo(
    () =>
      allRatings.reduce((accumulator, review) => {
        const productId = Number(review.idProducto ?? review.productoId ?? review.id_producto ?? 0);

        if (!productId) {
          return accumulator;
        }

        if (!accumulator[productId]) {
          accumulator[productId] = { total: 0, count: 0 };
        }

        accumulator[productId].total += Number(review.puntuacion || 0);
        accumulator[productId].count += 1;
        return accumulator;
      }, {}),
    [allRatings],
  );

  const getProductRatingSummary = (productId) => {
    const summary = productRatingsMap[Number(productId)];

    if (!summary?.count) {
      return { average: 0, count: 0 };
    }

    return {
      average: Number((summary.total / summary.count).toFixed(1)),
      count: summary.count,
    };
  };

  const handleReviewFieldChange = (field) => (event) => {
    setReviewForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setReviewError('');
    setReviewSuccess('');
  };

  const openReviewModal = (product) => {
    setReviewProduct(product);
    setReviewForm(initialReviewForm);
    setHoverRating(0);
    setReviewError('');
    setReviewSuccess('');
  };

  const closeReviewModal = () => {
    setReviewProduct(null);
    setReviewForm(initialReviewForm);
    setHoverRating(0);
    setReviewError('');
    setReviewSuccess('');
  };

  const finalizeProductSession = (productId) => {
    const session = productViewSessionsRef.current[productId];

    if (!session?.viewId || !session?.startedAt) {
      return;
    }

    const durationSeconds = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));

    registerProductStay(session.viewId, durationSeconds).catch((error) => {
      console.error('No se pudo registrar la permanencia del producto', error);
    });

    delete productViewSessionsRef.current[productId];
  };

  const openProductPreview = async (product) => {
    setPreviewProduct(product);
    setPreviewProductImageIndex(0);
    
    try {
      const response = await trackProductVisit({
        productId: Number(product.id),
        microtiendaId: Number(business?.id || id),
      });

      productViewSessionsRef.current = {
        ...productViewSessionsRef.current,
        [product.id]: {
          viewId: response?.id || null,
          startedAt: Date.now(),
        },
      };
    } catch (error) {
      console.error('No se pudo registrar la visita del producto', error);
    }
  };

  const closeProductPreview = () => {
    if (previewProduct?.id) {
      finalizeProductSession(previewProduct.id);
    }

    setPreviewProduct(null);
    setPreviewProductImageIndex(0);
  };

  const handleSubmitProductReview = async (event) => {
    event.preventDefault();

    if (!reviewProduct || !business) {
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await createRatingRequest({
        nombreVisitante: reviewForm.nombreVisitante.trim(),
        tipoDocumento: reviewForm.tipoDocumento.trim(),
        numeroDocumento: reviewForm.numeroDocumento.trim(),
        telefono: reviewForm.telefono.trim(),
        puntuacion: reviewForm.puntuacion,
        comentario: reviewForm.comentario.trim(),
        idMicrotienda: Number(business.id),
        idProducto: Number(reviewProduct.id),
      });

      setReviewSuccess('Tu reseña fue enviada correctamente. Será visible cuando el administrador la apruebe.');
      setReviewForm(initialReviewForm);
      setHoverRating(0);
    } catch (error) {
      setReviewError(error.message || 'No fue posible enviar la reseña del producto.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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
                          onClick={() => openProductPreview(product)}
                        >
                          <div className="grid h-full grid-cols-[120px_minmax(0,1fr)]">
                            <div>
                              <ImageWithFallback
                                src={getProductImages(product)[0]}
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
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-lg font-bold text-[var(--accent-foreground)]">
                                  {formatPrice(product.precio)}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                                  <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                  <span>
                                    {getProductRatingSummary(product.id).count > 0
                                      ? `${getProductRatingSummary(product.id).average} (${getProductRatingSummary(product.id).count})`
                                      : 'Sin reseñas'}
                                  </span>
                                </div>
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
                <h2 className="m-0">Reseñas de este negocio</h2>
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
                          {review.producto ? (
                            <div className="mb-2">
                              <span className={badgeClass}>{review.producto}</span>
                            </div>
                          ) : null}
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

      {previewProduct ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(15,23,42,0.56)] px-4 py-8">
          <div className="w-full max-w-[760px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="mb-2">Vista previa del producto</h3>
                <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                  Consulta los detalles de <strong>{previewProduct.nombre}</strong> dentro de{' '}
                  <strong>{business.nombre}</strong> antes de dejar tu reseña.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductPreview}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--white)]"
              >
                <X size={20} color="var(--primary)" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
              <button
                type="button"
                className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] p-0"
                onClick={() => setSelectedImage(getProductImages(previewProduct)[previewProductImageIndex])}
              >
                <ImageWithFallback
                  src={getProductImages(previewProduct)[previewProductImageIndex]}
                  alt={`${previewProduct.nombre} ${previewProductImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '280px',
                    objectFit: 'cover',
                  }}
                />

                {getProductImages(previewProduct).length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(15,23,42,0.58)] text-[var(--white)] shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition-all duration-200 hover:bg-[rgba(15,23,42,0.82)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewProductImageIndex((current) =>
                          current === 0 ? getProductImages(previewProduct).length - 1 : current - 1,
                        );
                      }}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.72)] bg-[rgba(15,23,42,0.58)] text-[var(--white)] shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition-all duration-200 hover:bg-[rgba(15,23,42,0.82)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewProductImageIndex((current) =>
                          current === getProductImages(previewProduct).length - 1 ? 0 : current + 1,
                        );
                      }}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                ) : null}

                <div className="absolute right-3 bottom-3 rounded-full bg-[rgba(15,23,42,0.72)] px-3 py-1 text-xs font-semibold text-[var(--white)]">
                  {previewProductImageIndex + 1} / {getProductImages(previewProduct).length}
                </div>
              </button>

              <div className="flex flex-col">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={badgeClass}>{business.categoria || 'General'}</span>
                  <div className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--secondary)] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                    <span>
                      {getProductRatingSummary(previewProduct.id).count > 0
                        ? `${getProductRatingSummary(previewProduct.id).average} / 5`
                        : 'Sin reseñas'}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      ({getProductRatingSummary(previewProduct.id).count || 0})
                    </span>
                  </div>
                </div>

                <h3 className="mb-2">{previewProduct.nombre}</h3>
                <p className="mb-5 text-[var(--muted-foreground)]">
                  {previewProduct.descripcion ||
                    'Producto publicado por este negocio en la vitrina institucional.'}
                </p>

                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                      Precio
                    </span>
                    <span className="text-lg font-bold text-[var(--accent-foreground)]">
                      {formatPrice(previewProduct.precio)}
                    </span>
                  </div>
                  <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                      Stock disponible
                    </span>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {previewProduct.stock}
                    </span>
                  </div>
                </div>

                <div className="mb-5 rounded-[var(--radius)] border border-[var(--border)] bg-[rgba(27,58,95,0.04)] p-4">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                    Microtienda
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{business.nombre}</span>
                </div>

                <div className="mt-auto flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    className={outlineButtonClass}
                    onClick={closeProductPreview}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className={accentButtonClass}
                    onClick={() => {
                      closeProductPreview();
                      openReviewModal(previewProduct);
                    }}
                  >
                    Dejar reseña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {reviewProduct ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(15,23,42,0.56)] px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="mb-2">Dejar reseña del producto</h3>
                <p className="m-0 text-sm leading-6 text-[var(--muted-foreground)]">
                  Tu reseña quedará asociada a <strong>{reviewProduct.nombre}</strong> en <strong>{business.nombre}</strong> y será visible cuando sea aprobada.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--white)]"
              >
                <X size={20} color="var(--primary)" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitProductReview}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Negocio</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{business.nombre}</span>
                </div>
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Producto</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{reviewProduct.nombre}</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Nombre del visitante *</label>
                  <input
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                    value={reviewForm.nombreVisitante}
                    onChange={handleReviewFieldChange('nombreVisitante')}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Tipo de documento *</label>
                  <select
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                    value={reviewForm.tipoDocumento}
                    onChange={handleReviewFieldChange('tipoDocumento')}
                    required
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="TI">TI</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Número de documento *</label>
                  <input
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                    value={reviewForm.numeroDocumento}
                    onChange={handleReviewFieldChange('numeroDocumento')}
                    placeholder="Ingresa tu número de documento"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Teléfono *</label>
                  <input
                    className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                    value={reviewForm.telefono}
                    onChange={handleReviewFieldChange('telefono')}
                    placeholder="Número de contacto"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Calificación *</label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      size={36}
                      style={{ cursor: 'pointer' }}
                      fill={rating <= (hoverRating || reviewForm.puntuacion) ? 'var(--accent)' : 'none'}
                      color={rating <= (hoverRating || reviewForm.puntuacion) ? 'var(--accent)' : 'var(--muted-foreground)'}
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() =>
                        setReviewForm((current) => ({
                          ...current,
                          puntuacion: rating,
                        }))
                      }
                    />
                  ))}
                  {reviewForm.puntuacion > 0 ? (
                    <span className="ml-3 text-lg font-semibold">{reviewForm.puntuacion}/5</span>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Comentario *</label>
                <textarea
                  className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]"
                  rows={5}
                  value={reviewForm.comentario}
                  onChange={handleReviewFieldChange('comentario')}
                  placeholder="Comparte tu experiencia con este producto..."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {reviewError ? (
                <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              ) : null}

              {reviewSuccess ? (
                <div className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {reviewSuccess}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className={outlineButtonClass} onClick={closeReviewModal} disabled={reviewSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className={accentButtonClass} disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Enviando reseña...' : 'Enviar reseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
