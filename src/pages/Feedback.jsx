import { Link } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

const feedbackItems = [
  {
    business: 'Tienda Demo',
    average: '4.8',
    comment:
      'Excelente atencion por WhatsApp y respuesta rapida sobre disponibilidad.',
  },
  {
    business: 'Sabores de Barrio',
    average: '4.6',
    comment:
      'El catalogo es claro y los comentarios ayudan a decidir la compra.',
  },
  {
    business: 'Casa Vital',
    average: '4.9',
    comment:
      'Muy buena experiencia. El emprendimiento mantiene actualizada su informacion.',
  },
];

export default function Feedback() {
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
            Modulo independiente para valorar productos o servicios, dejar
            comentarios y visualizar el promedio de calificacion de cada
            emprendimiento.
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
          <p className="section-kicker">Opiniones de usuarios</p>
          <h2>Promedio de calificacion por emprendimiento</h2>
        </div>

        <div className="metrics-grid">
          {feedbackItems.map((item) => (
            <article key={item.business} className="metric-card">
              <p className="metric-label">{item.business}</p>
              <h3>{item.average} / 5</h3>
              <p className="stars">★★★★★</p>
              <p>{item.comment}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="interaction-section">
        <div className="section-heading">
          <p className="section-kicker">Registrar comentario</p>
          <h2>Deja tu valoracion</h2>
        </div>

        <form className="pqrs-form">
          <input type="text" placeholder="Nombre" />
          <input type="text" placeholder="Emprendimiento o producto" />
          <select defaultValue="">
            <option value="" disabled>
              Selecciona una calificacion
            </option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
          <textarea rows="5" placeholder="Escribe tu comentario"></textarea>
          <button type="button" className="primary-button">
            Publicar comentario
          </button>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}
