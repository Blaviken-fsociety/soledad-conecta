import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Send, Calendar, Store, User, CreditCard, Phone, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'react-router';

import {
  createRatingRequest,
  getMicrotiendasRequest,
  getProductsRequest,
  getRatingsRequest,
  getRatingsSummaryRequest,
} from '../utils/api';

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(27,58,95,0.12)]';
const badgeClass =
  'inline-flex items-center rounded-[calc(var(--radius)-2px)] bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-foreground)]';
const accentButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)] disabled:cursor-not-allowed disabled:opacity-70';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const primaryButtonClass =
  'inline-flex w-full items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#152E4D] hover:shadow-[0_4px_12px_rgba(27,58,95,0.25)]';
const fieldClass =
  'w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';
const labelClass = 'mb-2 block font-semibold text-[var(--foreground)]';
const alertBaseClass = 'rounded-[var(--radius)] border px-4 py-3 text-sm';

const initialFormData = {
  idMicrotienda: '',
  idProducto: '',
  nombreVisitante: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  telefono: '',
  puntuacion: 0,
  comentario: '',
};

function TextField({ id, label, value, onChange, placeholder, type = 'text', required = true }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={fieldClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export function CommentsPage() {
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState('');
  const [microstores, setMicrostores] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [microstoresResponse, productsResponse, reviewsResponse, summaryResponse] = await Promise.all([
        getMicrotiendasRequest(),
        getProductsRequest(),
        getRatingsRequest(),
        getRatingsSummaryRequest(),
      ]);

      setMicrostores(Array.isArray(microstoresResponse) ? microstoresResponse : []);
      setProducts(Array.isArray(productsResponse) ? productsResponse : []);
      setReviews(Array.isArray(reviewsResponse) ? reviewsResponse : []);
      setSummary(Array.isArray(summaryResponse) ? summaryResponse : []);
    } catch (requestError) {
      setError(requestError.message || 'No fue posible cargar la información de comentarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const microtiendaId = searchParams.get('microtiendaId') || '';
    const productoId = searchParams.get('productoId') || '';

    if (microtiendaId || productoId) {
      setShowForm(true);
      setFormData((current) => ({
        ...current,
        idMicrotienda: microtiendaId,
        idProducto: productoId,
      }));
    }
  }, [searchParams]);

  const reviewsWithBusinessData = useMemo(() => {
    return reviews.map((review) => {
      const store = microstores.find((item) => Number(item.id) === Number(review.microtiendaId));
      const product = products.find((item) => Number(item.id) === Number(review.productoId));
      const storeSummary = summary.find((item) => Number(item.microtiendaId) === Number(review.microtiendaId));

      return {
        ...review,
        businessName: review.microtienda || store?.nombre || 'Emprendimiento local',
        businessCategory: store?.categoria || 'Sin categoría',
        productName: review.producto || product?.nombre || '',
        average: storeSummary?.promedio || 0,
        totalReviews: storeSummary?.totalCalificaciones || 0,
      };
    });
  }, [microstores, products, reviews, summary]);

  const filteredProducts = useMemo(
    () => products.filter((product) => Number(product.microtiendaId) === Number(formData.idMicrotienda)),
    [formData.idMicrotienda, products],
  );

  const filteredReviews = useMemo(() => {
    if (!selectedBusinessFilter) {
      return reviewsWithBusinessData;
    }

    return reviewsWithBusinessData.filter(
      (review) => Number(review.microtiendaId) === Number(selectedBusinessFilter),
    );
  }, [reviewsWithBusinessData, selectedBusinessFilter]);

  const overallAverage = useMemo(() => {
    if (!reviewsWithBusinessData.length) return '0.0';
    const total = reviewsWithBusinessData.reduce((acc, review) => acc + Number(review.puntuacion || 0), 0);
    return (total / reviewsWithBusinessData.length).toFixed(1);
  }, [reviewsWithBusinessData]);

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviewsWithBusinessData.filter((review) => Number(review.puntuacion) === rating).length,
    }));
  }, [reviewsWithBusinessData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      await createRatingRequest({
        nombreVisitante: formData.nombreVisitante.trim(),
        tipoDocumento: formData.tipoDocumento.trim(),
        numeroDocumento: formData.numeroDocumento.trim(),
        telefono: formData.telefono.trim(),
        puntuacion: formData.puntuacion,
        comentario: formData.comentario.trim(),
        idMicrotienda: Number(formData.idMicrotienda),
        idProducto: formData.idProducto ? Number(formData.idProducto) : null,
      });

      setSubmitSuccess(
        'Tu comentario fue enviado correctamente. Será visible cuando el administrador lo apruebe.',
      );
      setFormData(initialFormData);
      setHoverRating(0);
      setShowForm(false);
      await loadData();
    } catch (requestError) {
      setSubmitError(requestError.message || 'No fue posible enviar tu comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--ivory)]">
      <section className="w-full bg-[var(--primary)] px-6 py-12 text-[var(--primary-foreground)] lg:px-8">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="mb-4 text-[var(--white)]">Comentarios y calificaciones</h1>
            <p className="text-lg text-[rgba(255,255,255,0.9)]">
              Comparte tu experiencia real y ayuda a otros usuarios a conocer los emprendimientos de Soledad.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="grid w-full grid-cols-1 gap-6 px-6 py-16 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${cardClass} mb-6`}>
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="text-center md:mb-0">
                  <div
                    className="text-[4rem] leading-none font-bold text-[var(--primary)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {overallAverage}
                  </div>
                  <div className="mb-2 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        fill={i < Math.round(Number(overallAverage)) ? 'var(--accent)' : 'none'}
                        color={i < Math.round(Number(overallAverage)) ? 'var(--accent)' : 'var(--muted-foreground)'}
                      />
                    ))}
                  </div>
                  <p className="mb-0 text-[var(--muted-foreground)]">
                    Basado en {reviewsWithBusinessData.length} reseñas aprobadas
                  </p>
                </div>
                <div>
                  <h3 className="mb-4 text-xl">Distribución de calificaciones</h3>
                  {ratingCounts.map(({ rating, count }) => {
                    const percentage = reviewsWithBusinessData.length
                      ? (count / reviewsWithBusinessData.length) * 100
                      : 0;

                    return (
                      <div key={rating} className="mb-2 flex items-center gap-2">
                        <span className="w-[60px] font-semibold">{rating} estrellas</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-[4px] bg-[var(--secondary)]">
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: 'var(--accent)',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-[var(--muted-foreground)]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2>Reseñas recientes</h2>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} className={accentButtonClass}>
                  <Star size={18} />
                  Escribir reseña
                </button>
              ) : null}
            </div>

            <div className="max-w-[420px]">
              <label className={labelClass}>Filtrar por emprendimiento</label>
              <select
                className={fieldClass}
                value={selectedBusinessFilter}
                onChange={(event) => setSelectedBusinessFilter(event.target.value)}
              >
                <option value="">Todos los emprendimientos</option>
                {microstores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {submitSuccess ? (
            <div className={`${alertBaseClass} mb-6 border-emerald-200 bg-emerald-50 text-emerald-700`}>
              {submitSuccess}
            </div>
          ) : null}

          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`${cardClass} mb-6`}>
                <h3 className="mb-6">Nueva reseña</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Selecciona el emprendimiento *</label>
                    <select
                      className={fieldClass}
                      value={formData.idMicrotienda}
                      onChange={(e) => setFormData({ ...formData, idMicrotienda: e.target.value, idProducto: '' })}
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      {microstores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.nombre} · {store.categoria || 'Sin categoría'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Selecciona el producto</label>
                    <select
                      className={fieldClass}
                      value={formData.idProducto}
                      onChange={(e) => setFormData({ ...formData, idProducto: e.target.value })}
                      disabled={!formData.idMicrotienda}
                    >
                      <option value="">
                        {formData.idMicrotienda ? 'Selecciona un producto' : 'Selecciona primero un emprendimiento'}
                      </option>
                      {filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      id="review-name"
                      label="Nombre del visitante *"
                      value={formData.nombreVisitante}
                      onChange={(e) => setFormData({ ...formData, nombreVisitante: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                    <div>
                      <label className={labelClass}>Tipo de documento *</label>
                      <select
                        className={fieldClass}
                        value={formData.tipoDocumento}
                        onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
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
                    <TextField
                      id="review-document"
                      label="Número de documento *"
                      value={formData.numeroDocumento}
                      onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      placeholder="Ingresa tu número de documento"
                    />
                    <TextField
                      id="review-phone"
                      label="Teléfono *"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="Número de contacto"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Calificación *</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          size={40}
                          style={{ cursor: 'pointer' }}
                          fill={rating <= (hoverRating || formData.puntuacion) ? 'var(--accent)' : 'none'}
                          color={rating <= (hoverRating || formData.puntuacion) ? 'var(--accent)' : 'var(--muted-foreground)'}
                          onMouseEnter={() => setHoverRating(rating)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormData({ ...formData, puntuacion: rating })}
                        />
                      ))}
                      {formData.puntuacion > 0 ? (
                        <span className="ml-4 text-xl font-semibold">{formData.puntuacion}/5</span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Tu comentario *</label>
                    <textarea
                      className={`${fieldClass} min-h-[140px]`}
                      rows={5}
                      value={formData.comentario}
                      onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                      required
                      placeholder="Comparte tu experiencia con este emprendimiento..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {submitError ? (
                    <div className={`${alertBaseClass} border-red-200 bg-red-50 text-red-700`}>{submitError}</div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" className={accentButtonClass} disabled={submitting}>
                      <Send size={18} />
                      {submitting ? 'Enviando reseña...' : 'Publicar reseña'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className={outlineButtonClass}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : null}

          {error ? (
            <div className={`${alertBaseClass} mb-6 border-red-200 bg-red-50 text-red-700`}>{error}</div>
          ) : null}

          {loading ? (
            <div className={cardClass}>
              <p className="mb-0 text-[var(--muted-foreground)]">Cargando comentarios y calificaciones...</p>
            </div>
          ) : filteredReviews.length ? (
            <div className="flex flex-col gap-3">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className={cardClass}>
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="m-0 text-lg">{review.nombreVisitante || 'Visitante'}</h4>
                          <span className={badgeClass}>{review.businessCategory}</span>
                          {review.productName ? <span className={badgeClass}>{review.productName}</span> : null}
                        </div>
                        <p className="mb-2 text-sm text-[var(--muted-foreground)]">{review.businessName}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < Number(review.puntuacion) ? 'var(--accent)' : 'none'}
                              color={i < Number(review.puntuacion) ? 'var(--accent)' : 'var(--muted-foreground)'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Calendar size={14} />
                        {new Date(review.fecha).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    <p className="mb-4 leading-[1.6]">{review.comentario || 'Sin comentario.'}</p>

                    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                      <span className="inline-flex items-center gap-2">
                        <Store size={14} />
                        {review.businessName}
                      </span>
                      {review.productName ? (
                        <span className="inline-flex items-center gap-2">
                          <ShoppingBag size={14} />
                          {review.productName}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-2">
                        <Star size={14} color="var(--accent)" fill="var(--accent)" />
                        Promedio actual: {Number(review.average || 0).toFixed(1)}
                      </span>
                      <span>Total de reseñas: {review.totalReviews}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={cardClass}>
              <p className="mb-0 text-[var(--muted-foreground)]">
                {selectedBusinessFilter
                  ? 'Este emprendimiento aún no tiene reseñas aprobadas para mostrar.'
                  : 'Aún no hay reseñas aprobadas para mostrar. Puedes ser la primera persona en compartir una experiencia.'}
              </p>
            </div>
          )}
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${cardClass} mb-6`}>
              <h3 className="mb-6">Guías para comentar</h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                  <h4 className="mb-2 text-base">Sé específico</h4>
                  <p className="mb-0 text-sm text-[var(--muted-foreground)]">
                    Describe detalles sobre productos, atención recibida y lo que más valoraste del servicio.
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                  <h4 className="mb-2 text-base">Sé respetuoso</h4>
                  <p className="mb-0 text-sm text-[var(--muted-foreground)]">
                    Mantén un tono constructivo y profesional. Tus comentarios ayudan a mejorar el portal.
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-[var(--secondary)] p-4">
                  <h4 className="mb-2 text-base">Sé honesto</h4>
                  <p className="mb-0 text-sm text-[var(--muted-foreground)]">
                    Comparte una experiencia real. El sistema solo publica reseñas revisadas por administración.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-[var(--radius)] border border-[var(--border)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              <h3 className="mb-4">¿Necesitas ayuda?</h3>
              <p className="mb-4 leading-[1.6]">
                Si necesitas reportar contenido o tienes dudas sobre una reseña, usa el módulo de contacto institucional.
              </p>
              <button className={primaryButtonClass}>Contactar soporte</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
