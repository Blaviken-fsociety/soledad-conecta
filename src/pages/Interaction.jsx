import { Link } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

const pqrsTypes = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia'];

export default function Interaction() {
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
          <span className="eyebrow">Modulo 6</span>
          <h1>Contacto Comercial y PQR's</h1>
          <p className="hero-text">
            Este modulo concentra los mecanismos de contacto comercial y el
            registro de PQR's para los emprendimientos del portal.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Objetivo del modulo</h2>
          <p>
            Facilitar la comunicacion entre visitantes y emprendimientos,
            recoger solicitudes institucionales y mejorar la atencion del
            portal.
          </p>
        </aside>
      </section>

      <section className="interaction-section">
        <div className="section-heading">
          <p className="section-kicker">Contacto comercial</p>
          <h2>Canal directo por WhatsApp</h2>
        </div>

        <div className="contact-grid">
          <article className="contact-card">
            <h3>Tienda Demo</h3>
            <p>Atencion comercial directa con el emprendimiento.</p>
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Contactar por WhatsApp
            </a>
          </article>

          <article className="contact-card">
            <h3>Sabores de Barrio</h3>
            <p>Consulta disponibilidad, pedidos y tiempos de entrega.</p>
            <a
              href="https://wa.me/573009876543"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Contactar por WhatsApp
            </a>
          </article>

          <article className="contact-card">
            <h3>Casa Vital</h3>
            <p>Solicita informacion de servicios y agenda comercial.</p>
            <a
              href="https://wa.me/573005554433"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Contactar por WhatsApp
            </a>
          </article>
        </div>
      </section>

      <section className="interaction-section">
        <div className="section-heading">
          <p className="section-kicker">Sistema PQRS</p>
          <h2>Registro de peticiones, quejas, reclamos y sugerencias</h2>
        </div>

        <div className="pqrs-layout">
          <form className="pqrs-form">
            <input type="text" placeholder="Nombre" />
            <input type="email" placeholder="Correo electronico" />
            <select defaultValue="">
              <option value="" disabled>
                Selecciona el tipo de solicitud
              </option>
              {pqrsTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <textarea
              rows="5"
              placeholder="Escribe tu mensaje o solicitud"
            ></textarea>
            <button type="button" className="primary-button">
              Enviar PQRS
            </button>
          </form>

          <article className="microstore-card">
            <h3>Campos minimos</h3>
            <ul>
              <li>Nombre.</li>
              <li>Correo electronico.</li>
              <li>Mensaje.</li>
            </ul>
            <p className="pqrs-note">
              El formulario centraliza peticiones, quejas, reclamos y
              sugerencias para seguimiento institucional.
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
