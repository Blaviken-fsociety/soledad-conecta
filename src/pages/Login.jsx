import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { createEntrepreneurRequest, loginRequest } from '../utils/api.js';
import { saveSession } from '../utils/session.js';

const emptyRequestForm = {
  nombre: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
};

export default function Login() {
  const navigate = useNavigate();
  const [activeAccess, setActiveAccess] = useState('admin');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [requestForm, setRequestForm] = useState(emptyRequestForm);
  const [loginError, setLoginError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogin = async (event) => {
    event?.preventDefault();
    setIsSubmitting(true);

    try {
      const session = await loginRequest({
        correo: credentials.email,
        password: credentials.password,
        rol: activeAccess,
      });

      setLoginError('');
      saveSession(session);
      navigate(session.user.rol === 'admin' ? '/panel-admin' : '/panel-emprendedor');
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntrepreneurRequest = async (event) => {
    event.preventDefault();

    try {
      await createEntrepreneurRequest(requestForm);
      setRequestForm(emptyRequestForm);
      setRequestMessage(
        'Solicitud enviada. El administrador revisara tus datos y te asignara contrasena si aprueba el registro.',
      );
      setRequestError('');
    } catch (error) {
      setRequestError(error.message);
      setRequestMessage('');
    }
  };

  return (
    <main className="portal portal-service-page login-page">
      <header className="portal-header portal-home-header portal-home-toolbar">
        <div className="container-xxl">
          <div className="navbar-shell home-toolbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo />
            </div>

            <div className="navbar-actions-slot">
              <nav className="header-actions service-header-actions home-toolbar-actions" aria-label="Navegacion de acceso">
                <Link to="/" className="btn portal-btn portal-btn-secondary service-header-button login-header-button">
                  Volver al portal
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className="service-hero-section login-hero-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-7">
              <div className="hero-copy service-hero-copy login-hero-copy">
                <h1>Acceso institucional y postulacion de emprendedores en un flujo mas claro.</h1>
                <p className="hero-text">
                  El emprendedor diligencia primero su solicitud. Luego el administrador
                  revisa los datos, asigna una contrasena y habilita el acceso
                  para continuar la gestion del portal.
                </p>
                <div className="hero-actions">
                  <a href="#acceso" className="btn portal-btn portal-btn-primary hero-primary-button">
                    Ingresar ahora
                  </a>
                  <a href="#solicitud" className="btn portal-btn portal-btn-secondary">
                    Solicitar registro
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <aside className="service-info-panel login-info-panel">
                <p className="section-kicker">Flujo de acceso</p>
                <h2>Dos perfiles, una entrada ordenada y facil de entender.</h2>
                <p>
                  La vista separa el ingreso institucional y la postulacion del
                  emprendedor para evitar friccion y hacer mas clara cada accion.
                </p>
                <div className="service-info-metrics">
                  <div>
                    <strong>2</strong>
                    <span>formas de acceso disponibles</span>
                  </div>
                  <div>
                    <strong>1</strong>
                    <span>ruta clara de aprobacion y seguimiento</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="access-section service-section" id="acceso" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="access-switch" role="tablist" aria-label="Tipos de acceso">
            <button
              type="button"
              className={activeAccess === 'admin' ? 'btn access-tab access-tab-active' : 'btn access-tab'}
              onClick={() => setActiveAccess('admin')}
            >
              Administrador
            </button>
            <button
              type="button"
              className={activeAccess === 'entrepreneur' ? 'btn access-tab access-tab-active' : 'btn access-tab'}
              onClick={() => setActiveAccess('entrepreneur')}
            >
              Emprendedor
            </button>
          </div>

          <div className="admin-user-layout login-page-layout">
            <form className="admin-user-form" onSubmit={handleLogin}>
              <div className="section-heading">
                <p className="section-kicker">
                  {activeAccess === 'admin' ? 'Acceso institucional' : 'Acceso habilitado'}
                </p>
                <h3>{activeAccess === 'admin' ? 'Ingreso del administrador' : 'Ingreso del emprendedor'}</h3>
                <p>Puedes presionar Enter para iniciar sesion sin usar el mouse.</p>
              </div>

              <input
                id="access-email"
                type="email"
                className="form-control"
                placeholder={activeAccess === 'admin' ? 'Correo del administrador' : 'Correo del emprendedor'}
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <input
                id="access-password"
                type="password"
                className="form-control"
                placeholder="Contrasena"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <button type="submit" className="btn portal-btn portal-btn-primary">
                {isSubmitting ? 'Validando...' : 'Entrar'}
              </button>
              {loginError ? <p className="login-error">{loginError}</p> : null}
            </form>

            <form className="admin-user-form" id="solicitud" onSubmit={handleEntrepreneurRequest}>
              <div className="section-heading">
                <p className="section-kicker">Postulacion</p>
                <h3>Solicitar registro como emprendedor</h3>
                <p>Completa tus datos para que el administrador revise tu acceso.</p>
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Nombre completo"
                value={requestForm.nombre}
                onChange={(event) => setRequestForm((current) => ({ ...current, nombre: event.target.value }))}
              />
              <div className="service-form-grid">
                <select
                  className="form-select"
                  value={requestForm.tipoDocumento}
                  onChange={(event) =>
                    setRequestForm((current) => ({ ...current, tipoDocumento: event.target.value }))
                  }
                >
                  <option value="">Tipo de documento</option>
                  <option value="CC">Cedula</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CE">Cedula de extranjeria</option>
                  <option value="PAS">Pasaporte</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Numero de documento"
                  value={requestForm.numeroDocumento}
                  onChange={(event) =>
                    setRequestForm((current) => ({ ...current, numeroDocumento: event.target.value }))
                  }
                />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Direccion"
                value={requestForm.direccion}
                onChange={(event) => setRequestForm((current) => ({ ...current, direccion: event.target.value }))}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Telefono"
                value={requestForm.telefono}
                onChange={(event) => setRequestForm((current) => ({ ...current, telefono: event.target.value }))}
              />
              <input
                type="email"
                className="form-control"
                placeholder="Correo electronico"
                value={requestForm.correo}
                onChange={(event) => setRequestForm((current) => ({ ...current, correo: event.target.value }))}
              />
              <button type="submit" className="btn portal-btn portal-btn-secondary">
                Enviar solicitud
              </button>
              {requestMessage ? <p className="form-success">{requestMessage}</p> : null}
              {requestError ? <p className="login-error">{requestError}</p> : null}
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
