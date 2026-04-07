import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import {
  createRatingRequest,
  getMicrotiendasRequest,
  getProductsRequest,
  getRatingsRequest,
  getRatingsSummaryRequest,
} from '../utils/api.js';

const emptyForm = {
  nombreVisitante: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  idMicrotienda: '',
  idProducto: '',
  puntuacion: '',
  comentario: '',
};

const renderStars = (rating) => {
  const filledStars = Math.max(1, Math.min(5, Math.round(Number(rating))));
  return `${'\u2605'.repeat(filledStars)}${'\u2606'.repeat(5 - filledStars)}`;
};

export default function Feedback() {
  const [summary, setSummary] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [microtiendas, setMicrotiendas] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchFeedbackData = async () => {
    const [fetchedSummary, fetchedRatings, fetchedMicrotiendas] = await Promise.all([
      getRatingsSummaryRequest(),
      getRatingsRequest(),
      getMicrotiendasRequest(),
    ]);

    return {
      fetchedSummary,
      fetchedRatings,
      fetchedMicrotiendas,
    };
  };

  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
      try {
        const { fetchedSummary, fetchedRatings, fetchedMicrotiendas } = await fetchFeedbackData();

        if (ignore) {
          return;
        }

        setSummary(fetchedSummary);
        setRatings(fetchedRatings);
        setMicrotiendas(fetchedMicrotiendas);
        setErrorMessage('');
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
        }
      }
    };

    void initialize();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));

    if (elements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -50px 0px' },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (!form.idMicrotienda) {
        setProducts([]);
        return;
      }

      try {
        const fetchedProducts = await getProductsRequest(form.idMicrotienda);
        setProducts(fetchedProducts);
      } catch {
        setProducts([]);
      }
    };

    void loadProducts();
  }, [form.idMicrotienda]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRatingRequest(form);
      const { fetchedSummary, fetchedRatings, fetchedMicrotiendas } = await fetchFeedbackData();

      setSummary(fetchedSummary);
      setRatings(fetchedRatings);
      setMicrotiendas(fetchedMicrotiendas);
      setForm(emptyForm);
      setMessage('Calificacion enviada para revision del administrador.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setMessage('');
    }
  };

  return (
    <main className="portal portal-service-page feedback-page">
      <header className="portal-header portal-home-header portal-home-toolbar">
        <div className="container-xxl">
          <div className="navbar-shell home-toolbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo />
            </div>

            <div className="navbar-actions-slot">
              <nav className="header-actions service-header-actions home-toolbar-actions" aria-label="Navegacion publica">
                <Link to="/" className="btn portal-btn portal-btn-secondary service-header-button feedback-home-button">
                  Volver al portal
                </Link>
                <Link
                  to="/interaccion"
                  className="btn portal-btn portal-btn-outline service-header-button feedback-pqrs-button"
                >
                  PQR&apos;s
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className="service-hero-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-7">
              <div className="hero-copy service-hero-copy">
                <h1>Comentarios y valoraciones para fortalecer la confianza del portal.</h1>
                <p className="hero-text">
                  Consulta experiencias publicadas, revisa el promedio de cada
                  emprendimiento y comparte una nueva opinion con una interfaz
                  mas clara, cercana y consistente con la portada principal.
                </p>
                <div className="hero-actions">
                  <a href="#opiniones" className="btn portal-btn portal-btn-primary hero-primary-button">
                    Ver opiniones
                  </a>
                  <a href="#formulario-comentarios" className="btn portal-btn portal-btn-secondary">
                    Dejar valoracion
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <aside className="service-info-panel">
                <p className="section-kicker">Retroalimentacion visible</p>
                <h2>Una vista mas clara para decidir, comparar y confiar.</h2>
                <p>
                  Las valoraciones ayudan a otros usuarios a reconocer negocios
                  mejor calificados y a identificar experiencias utiles dentro
                  de la vitrina empresarial.
                </p>
                <div className="service-info-metrics">
                  <div>
                    <strong>{summary.length}</strong>
                    <span>emprendimientos con promedio visible</span>
                  </div>
                  <div>
                    <strong>{ratings.length}</strong>
                    <span>comentarios aprobados publicados</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="interaction-section service-section" id="opiniones" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Promedios visibles</p>
            <h2>Calificaciones destacadas por emprendimiento.</h2>
            <p>Una lectura rapida del nivel de satisfaccion y de los comentarios mas relevantes.</p>
          </div>

          <div className="metrics-grid feedback-summary-grid">
            {summary.length > 0 ? (
              summary.map((item, index) => (
                <article
                  key={item.microtiendaId}
                  className={`metric-card feedback-summary-card ${index % 2 === 0 ? '' : 'feedback-summary-card-blue'}`}
                >
                  <div className="feedback-summary-top">
                    <p className="metric-label">{item.microtienda}</p>
                    <span className="feedback-score-badge">{Number(item.promedio).toFixed(1)} / 5</span>
                  </div>
                  <p className="stars">{renderStars(item.promedio)}</p>
                  <p>{item.comentarioDestacado}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>Aun no hay promedios disponibles</h3>
                <p>Cuando existan comentarios aprobados, aqui se mostrara el resumen de valoraciones.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="users-section service-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Comentarios aprobados</p>
            <h2>Historial visible para los visitantes del portal.</h2>
          </div>

          <div className="users-table-card feedback-table-card">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Microtienda</th>
                  <th>Producto</th>
                  <th>Puntuacion</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {ratings.length > 0 ? (
                  ratings.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombreVisitante}</td>
                      <td>{item.microtienda}</td>
                      <td>{item.producto || 'General'}</td>
                      <td>{renderStars(item.puntuacion)}</td>
                      <td>{item.comentario}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No hay calificaciones aprobadas todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="interaction-section service-section" id="formulario-comentarios" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Registrar comentario</p>
            <h2>Comparte tu valoracion con una estructura clara y ordenada.</h2>
          </div>

          <div className="pqrs-layout service-pqrs-layout">
            <form className="pqrs-form service-pqrs-form" onSubmit={handleSubmit}>
              <div className="service-form-grid">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre completo"
                  value={form.nombreVisitante}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nombreVisitante: event.target.value }))
                  }
                />
                <select
                  className="form-select"
                  value={form.tipoDocumento}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tipoDocumento: event.target.value }))
                  }
                >
                  <option value="">Tipo de documento</option>
                  <option value="CC">Cedula</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CE">Cedula de extranjeria</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div className="service-form-grid">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Numero de documento"
                  value={form.numeroDocumento}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, numeroDocumento: event.target.value }))
                  }
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Telefono"
                  value={form.telefono}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, telefono: event.target.value }))
                  }
                />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Direccion"
                value={form.direccion}
                onChange={(event) =>
                  setForm((current) => ({ ...current, direccion: event.target.value }))
                }
              />
              <select
                className="form-select"
                value={form.idMicrotienda}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    idMicrotienda: event.target.value,
                    idProducto: '',
                  }))
                }
              >
                <option value="">Selecciona una microtienda</option>
                {microtiendas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={form.idProducto}
                onChange={(event) =>
                  setForm((current) => ({ ...current, idProducto: event.target.value }))
                }
              >
                <option value="">Calificacion general o selecciona producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={form.puntuacion}
                onChange={(event) =>
                  setForm((current) => ({ ...current, puntuacion: event.target.value }))
                }
              >
                <option value="">Selecciona una calificacion</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
              <textarea
                rows="5"
                className="form-control"
                placeholder="Escribe tu comentario"
                value={form.comentario}
                onChange={(event) =>
                  setForm((current) => ({ ...current, comentario: event.target.value }))
                }
              ></textarea>
              <button type="submit" className="btn portal-btn portal-btn-primary">
                Enviar comentario
              </button>
              {message ? <p className="form-success">{message}</p> : null}
              {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
            </form>

            <article className="microstore-card service-pqrs-aside feedback-aside-card">
              <h3>Antes de publicar tu opinion</h3>
              <ul>
                <li>Selecciona la microtienda correcta para asociar bien tu experiencia.</li>
                <li>Usa la puntuacion de 1 a 5 estrellas segun tu experiencia real.</li>
                <li>Escribe un comentario claro, respetuoso y util para otros visitantes.</li>
              </ul>
              <p className="pqrs-note">
                La valoracion pasa por revision administrativa antes de hacerse visible
                en la vitrina publica del portal.
              </p>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
