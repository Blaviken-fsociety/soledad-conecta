import { useState } from 'react';
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
    <main className="portal admin-page">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion de acceso">
          <Link to="/" className="header-link">
            Volver al portal
          </Link>
        </nav>
      </header>

      <section className="admin-hero">
        <div className="hero-copy">
          <span className="eyebrow">Acceso y gestion</span>
          <h1>Login institucional y postulacion de emprendedores</h1>
          <p className="hero-text">
            El emprendedor primero diligencia su solicitud. Luego el administrador
            revisa los datos, asigna una contrasena y habilita el acceso.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Flujo de acceso</h2>
          <p>1. El emprendedor se registra.</p>
          <p>2. El administrador valida y aprueba.</p>
          <p>3. El emprendedor ya puede iniciar sesion y solicitar publicaciones.</p>
        </aside>
      </section>

      <section className="access-section">
        <div className="access-switch" role="tablist" aria-label="Tipos de acceso">
          <button
            type="button"
            className={activeAccess === 'admin' ? 'access-tab access-tab-active' : 'access-tab'}
            onClick={() => setActiveAccess('admin')}
          >
            Administrador
          </button>
          <button
            type="button"
            className={activeAccess === 'entrepreneur' ? 'access-tab access-tab-active' : 'access-tab'}
            onClick={() => setActiveAccess('entrepreneur')}
          >
            Emprendedor
          </button>
        </div>

        <div className="admin-user-layout">
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
              placeholder="Contrasena"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
            <button type="submit" className="primary-button">
              {isSubmitting ? 'Validando...' : 'Entrar'}
            </button>
            {loginError ? <p className="login-error">{loginError}</p> : null}
          </form>

          <form className="admin-user-form" onSubmit={handleEntrepreneurRequest}>
            <div className="section-heading">
              <p className="section-kicker">Postulacion</p>
              <h3>Solicitar registro como emprendedor</h3>
            </div>

            <input type="text" placeholder="Nombre completo" value={requestForm.nombre} onChange={(event) => setRequestForm((current) => ({ ...current, nombre: event.target.value }))} />
            <div className="service-form-grid">
              <select value={requestForm.tipoDocumento} onChange={(event) => setRequestForm((current) => ({ ...current, tipoDocumento: event.target.value }))}>
                <option value="">Tipo de documento</option>
                <option value="CC">Cedula</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cedula de extranjeria</option>
                <option value="PAS">Pasaporte</option>
              </select>
              <input type="text" placeholder="Numero de documento" value={requestForm.numeroDocumento} onChange={(event) => setRequestForm((current) => ({ ...current, numeroDocumento: event.target.value }))} />
            </div>
            <input type="text" placeholder="Direccion" value={requestForm.direccion} onChange={(event) => setRequestForm((current) => ({ ...current, direccion: event.target.value }))} />
            <input type="text" placeholder="Telefono" value={requestForm.telefono} onChange={(event) => setRequestForm((current) => ({ ...current, telefono: event.target.value }))} />
            <input type="email" placeholder="Correo electronico" value={requestForm.correo} onChange={(event) => setRequestForm((current) => ({ ...current, correo: event.target.value }))} />
            <button type="submit" className="primary-button">
              Enviar solicitud
            </button>
            {requestMessage ? <p className="form-success">{requestMessage}</p> : null}
            {requestError ? <p className="login-error">{requestError}</p> : null}
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
