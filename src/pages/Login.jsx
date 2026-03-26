import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { loginRequest } from '../utils/api.js';
import { saveSession } from '../utils/session.js';

export default function Login() {
  const navigate = useNavigate();
  const [activeAccess, setActiveAccess] = useState('admin');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
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
          <h1>Login institucional y acceso empresarial</h1>
          <p className="hero-text">
            Desde esta pantalla se valida el acceso al panel del administrador o
            al panel del emprendedor. Cada rol es redirigido a su espacio
            privado despues del login.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Regla de sesion</h2>
          <p>
            El administrador puede crear usuarios nuevos en la base de datos.
            El emprendedor accede a su panel privado usando autenticacion real
            contra el backend.
          </p>
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
            className={
              activeAccess === 'entrepreneur'
                ? 'access-tab access-tab-active'
                : 'access-tab'
            }
            onClick={() => setActiveAccess('entrepreneur')}
          >
            Emprendedor
          </button>
        </div>

        <div className="login-panel">
          <div className="login-copy">
            <p className="section-kicker">
              {activeAccess === 'admin' ? 'Acceso institucional' : 'Acceso empresarial'}
            </p>
            <h3>
              {activeAccess === 'admin'
                ? 'Ingreso del administrador'
                : 'Ingreso del emprendedor'}
            </h3>
            <p>
              {activeAccess === 'admin'
                ? 'Valida el acceso al panel de gestion institucional del sistema.'
                : 'Valida el acceso al panel privado de microtienda y metricas.'}
            </p>
          </div>

          <form className="login-form">
            <label className="sr-only" htmlFor="access-email">
              Correo institucional
            </label>
            <input
              id="access-email"
              type="email"
              placeholder={
                activeAccess === 'admin'
                  ? 'Correo del administrador'
                  : 'Correo del emprendedor'
              }
              value={credentials.email}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <label className="sr-only" htmlFor="access-password">
              Contrasena
            </label>
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
            <button type="button" onClick={handleLogin}>
              {isSubmitting ? 'Validando...' : 'Entrar'}
            </button>
            {loginError ? <p className="login-error">{loginError}</p> : null}
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
