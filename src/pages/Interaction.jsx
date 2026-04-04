import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { createPqrsRequest, getMicrotiendasRequest } from '../utils/api.js';

const pqrsTypes = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];

export default function Interaction() {
  const [contactChannels, setContactChannels] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    tipo: '',
    mensaje: '',
  });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadContactChannels = async () => {
      try {
        const microtiendas = await getMicrotiendasRequest();
        setContactChannels(microtiendas.filter((item) => item.whatsapp));
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadContactChannels();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createPqrsRequest(form);
      setForm({
        nombre: '',
        correo: '',
        tipo: '',
        mensaje: '',
      });
      setMessage('PQRS enviada correctamente.');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setMessage('');
    }
  };

  return (
    <main className="portal portal-service-page">
      <header className="portal-header portal-home-header sticky-top">
        <div className="container-xxl">
          <div className="navbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo />
            </div>

            <div className="navbar-actions-slot">
              <nav className="header-actions service-header-actions" aria-label="Navegacion publica">
                <Link to="/" className="secondary-button service-header-button">
                  Volver al portal
                </Link>
                <Link to="/calificaciones" className="header-link service-header-button">
                  Comentarios
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className="service-hero-section">
        <div className="container-xxl">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-7">
              <div className="hero-copy service-hero-copy">
                <span className="eyebrow">Modulo 6</span>
                <h1>Contacto comercial y gestion de PQR&apos;s con una experiencia mas clara.</h1>
                <p className="hero-text">
                  Este modulo concentra el contacto institucional con los
                  emprendimientos y el registro formal de peticiones, quejas,
                  reclamos y sugerencias del portal.
                </p>
                <div className="hero-actions">
                  <a href="#formulario-pqrs" className="primary-button hero-primary-button">
                    Enviar solicitud
                  </a>
                  <a href="#contacto-comercial" className="secondary-button">
                    Ver canales
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <aside className="service-info-panel">
                <p className="section-kicker">Atencion institucional</p>
                <h2>Un solo espacio para orientar, escuchar y hacer seguimiento.</h2>
                <p>
                  Facilita la comunicacion con visitantes y emprendimientos,
                  registra solicitudes formales y mejora la experiencia del
                  portal con trazabilidad y respuesta organizada.
                </p>
                <div className="service-info-metrics">
                  <div>
                    <strong>{contactChannels.length}</strong>
                    <span>canales de contacto directo</span>
                  </div>
                  <div>
                    <strong>{pqrsTypes.length}</strong>
                    <span>tipos de solicitud disponibles</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="interaction-section service-section" id="contacto-comercial">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Contacto comercial</p>
            <h2>Canales directos para resolver dudas y activar conversaciones.</h2>
            <p>Cada acceso prioriza rapidez, claridad y continuidad en la atencion.</p>
          </div>

          <div className="contact-grid service-contact-grid">
            {contactChannels.map((channel) => (
              <article key={channel.id} className="contact-card service-contact-card">
                <div className="service-contact-top">
                  <span className="shop-badge">WhatsApp</span>
                  <h3>{channel.nombre}</h3>
                </div>
                <p>{channel.descripcion}</p>
                <p className="service-contact-detail">{channel.redesSociales || 'Contacto comercial directo.'}</p>
                <a
                  href={`https://wa.me/57${channel.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button"
                >
                  Contactar por WhatsApp
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="interaction-section service-section" id="formulario-pqrs">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Sistema PQRS</p>
            <h2>Registro de peticiones, quejas, reclamos y sugerencias.</h2>
            <p>Un formulario claro para reportes formales, seguimiento y mejora continua.</p>
          </div>

          <div className="pqrs-layout service-pqrs-layout">
            <form className="pqrs-form service-pqrs-form" onSubmit={handleSubmit}>
              <div className="service-form-grid">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nombre: event.target.value }))
                  }
                />
                <input
                  type="email"
                  placeholder="Correo electronico"
                  value={form.correo}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, correo: event.target.value }))
                  }
                />
              </div>
              <select
                value={form.tipo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tipo: event.target.value }))
                }
              >
                <option value="">Selecciona el tipo de solicitud</option>
                {pqrsTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <textarea
                rows="6"
                placeholder="Describe tu solicitud con el mayor detalle posible"
                value={form.mensaje}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mensaje: event.target.value }))
                }
              ></textarea>
              <button type="submit" className="primary-button hero-primary-button">
                Enviar PQRS
              </button>
              {message ? <p className="form-success">{message}</p> : null}
              {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
            </form>

            <article className="microstore-card service-pqrs-aside">
              <h3>Antes de enviar tu solicitud</h3>
              <ul>
                <li>Incluye tu nombre completo para facilitar la atencion.</li>
                <li>Usa un correo valido para el seguimiento institucional.</li>
                <li>Describe con claridad el caso, la fecha y el contexto.</li>
              </ul>
              <p className="pqrs-note">
                El formulario centraliza peticiones, quejas, reclamos y
                sugerencias para seguimiento institucional y respuesta organizada.
              </p>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
