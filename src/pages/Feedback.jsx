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

export default function Feedback() {
  const [summary, setSummary] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [microtiendas, setMicrotiendas] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    nombreVisitante: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
    telefono: '',
    idMicrotienda: '',
    idProducto: '',
    puntuacion: '',
    comentario: '',
  });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    try {
      const [fetchedSummary, fetchedRatings, fetchedMicrotiendas] = await Promise.all([
        getRatingsSummaryRequest(),
        getRatingsRequest(),
        getMicrotiendasRequest(),
      ]);

      setSummary(fetchedSummary);
      setRatings(fetchedRatings);
      setMicrotiendas(fetchedMicrotiendas);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      await loadData();
    })();
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

    loadProducts();
  }, [form.idMicrotienda]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRatingRequest(form);
      setForm({
        nombreVisitante: '',
        tipoDocumento: '',
        numeroDocumento: '',
        direccion: '',
        telefono: '',
        idMicrotienda: '',
        idProducto: '',
        puntuacion: '',
        comentario: '',
      });
      setMessage('Calificacion enviada para revision del administrador.');
      setErrorMessage('');
      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
      setMessage('');
    }
  };

  return (
    <main className="portal">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion publica">
          <Link to="/" className="header-link">
            Volver al portal
          </Link>
        </nav>
      </header>

      <section className="admin-hero">
        <div className="hero-copy">
          <span className="eyebrow">Modulo Calificaciones</span>
          <h1>Calificacion y Comentarios</h1>
          <p className="hero-text">
            Las valoraciones quedan registradas con datos personales para control
            administrativo, pero esa informacion solo la ve el administrador.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Retroalimentacion visible</h2>
          <p>
            Los visitantes pueden evaluar la experiencia con estrellas y dejar
            comentarios utiles para otros usuarios del portal.
          </p>
        </aside>
      </section>

      <section className="interaction-section">
        <div className="section-heading">
          <p className="section-kicker">Opiniones publicadas</p>
          <h2>Promedio de calificacion por emprendimiento</h2>
        </div>

        <div className="metrics-grid">
          {summary.map((item) => (
            <article key={item.microtiendaId} className="metric-card">
              <p className="metric-label">{item.microtienda}</p>
              <h3>{item.promedio} / 5</h3>
              <p className="stars">*****</p>
              <p>{item.comentarioDestacado}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="users-section">
        <div className="section-heading">
          <p className="section-kicker">Comentarios aprobados</p>
          <h2>Historial visible en el portal</h2>
        </div>

        <div className="users-table-card">
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
                    <td>{item.puntuacion}</td>
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
      </section>

      <section className="interaction-section">
        <div className="section-heading">
          <p className="section-kicker">Registrar comentario</p>
          <h2>Deja tu valoracion</h2>
        </div>

        <form className="pqrs-form" onSubmit={handleSubmit}>
          <div className="service-form-grid">
            <input type="text" placeholder="Nombre completo" value={form.nombreVisitante} onChange={(event) => setForm((current) => ({ ...current, nombreVisitante: event.target.value }))} />
            <select value={form.tipoDocumento} onChange={(event) => setForm((current) => ({ ...current, tipoDocumento: event.target.value }))}>
              <option value="">Tipo de documento</option>
              <option value="CC">Cedula</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="CE">Cedula de extranjeria</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>
          <div className="service-form-grid">
            <input type="text" placeholder="Numero de documento" value={form.numeroDocumento} onChange={(event) => setForm((current) => ({ ...current, numeroDocumento: event.target.value }))} />
            <input type="text" placeholder="Telefono" value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
          </div>
          <input type="text" placeholder="Direccion" value={form.direccion} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          <select
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
          <select value={form.idProducto} onChange={(event) => setForm((current) => ({ ...current, idProducto: event.target.value }))}>
            <option value="">Calificacion general o selecciona producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre}
              </option>
            ))}
          </select>
          <select value={form.puntuacion} onChange={(event) => setForm((current) => ({ ...current, puntuacion: event.target.value }))}>
            <option value="">Selecciona una calificacion</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
          <textarea rows="5" placeholder="Escribe tu comentario" value={form.comentario} onChange={(event) => setForm((current) => ({ ...current, comentario: event.target.value }))}></textarea>
          <button type="submit" className="primary-button">
            Enviar comentario
          </button>
          {message ? <p className="form-success">{message}</p> : null}
          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}
