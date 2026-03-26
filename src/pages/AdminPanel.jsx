import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { categories } from '../data/marketplaceData.js';
import { metrics } from '../data/dashboardData.js';
import { createUserRequest, getUsersRequest } from '../utils/api.js';
import {
  clearSession,
  getSession,
  getSessionRole,
  getSessionToken,
} from '../utils/session.js';

export default function AdminPanel() {
  const navigate = useNavigate();
  const sessionRole = getSessionRole();
  const session = getSession();
  const token = getSessionToken();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [formState, setFormState] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'entrepreneur',
  });
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoadingUsers(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const fetchedUsers = await getUsersRequest(token);
        setUsers(fetchedUsers);
      } catch (error) {
        setFormError(error.message);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [token]);

  if (sessionRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const totalEntrepreneurs = users.filter((user) => user.rol === 'entrepreneur').length;

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsCreatingUser(true);

    try {
      const createdUser = await createUserRequest(token, formState);

      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setFormMessage('Usuario creado y guardado en MySQL correctamente.');
      setFormError('');
      setFormState({
        nombre: '',
        correo: '',
        password: '',
        rol: 'entrepreneur',
      });
    } catch (error) {
      setFormError(error.message);
      setFormMessage('');
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <main className="portal admin-page">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion administrativa">
          <button
            type="button"
            className="logout-button"
            onClick={() => {
              clearSession();
              navigate('/');
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <section className="admin-hero">
        <div className="hero-copy">
          <span className="eyebrow">Panel Administrador</span>
          <h1>Gestion institucional del sistema</h1>
          <p className="hero-text">
            Espacio reservado para administrar usuarios reales, categorias del
            sistema y revisar metricas institucionales de la plataforma.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Acceso seguro</h2>
          <p>
            Solo el administrador autenticado puede acceder a este panel y
            registrar nuevos usuarios directamente en la base de datos.
          </p>
          <p>
            Sesion activa: <strong>{session?.user?.nombre}</strong>
          </p>
        </aside>
      </section>

      <section className="users-section">
        <div className="section-heading">
          <p className="section-kicker">Modulo 2</p>
          <h2>Gestion de usuarios</h2>
        </div>

        <div className="admin-user-layout">
          <form className="admin-user-form" onSubmit={handleCreateUser}>
            <div className="section-heading">
              <p className="section-kicker">Registro</p>
              <h3>Crear nuevo usuario</h3>
              <p>
                Este formulario inserta usuarios reales en la tabla
                <strong> usuario </strong>
                de MySQL.
              </p>
            </div>

            <input
              type="text"
              placeholder="Nombre completo"
              value={formState.nombre}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
            />
            <input
              type="email"
              placeholder="Correo del usuario"
              value={formState.correo}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  correo: event.target.value,
                }))
              }
            />
            <input
              type="password"
              placeholder="Contrasena temporal"
              value={formState.password}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
            <select
              value={formState.rol}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  rol: event.target.value,
                }))
              }
            >
              <option value="entrepreneur">Emprendedor</option>
              <option value="admin">Administrador</option>
            </select>

            <button type="submit" className="primary-button">
              {isCreatingUser ? 'Guardando...' : 'Crear usuario'}
            </button>

            {formMessage ? <p className="form-success">{formMessage}</p> : null}
            {formError ? <p className="login-error">{formError}</p> : null}
          </form>

          <div className="users-table-card">
            <div className="table-card-header">
              <h3>Usuarios registrados</h3>
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan="5">Cargando usuarios...</td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.nombre}</td>
                      <td>{user.correo}</td>
                      <td>{user.rol === 'admin' ? 'Administrador' : 'Emprendedor'}</td>
                      <td>{user.estado ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No hay usuarios registrados todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="users-section">
        <div className="section-heading">
          <p className="section-kicker">Modulo 4</p>
          <h2>Categorias del sistema</h2>
          <p>
            Estas categorias se crean desde administracion y se publican en la
            pantalla Home para busqueda y filtrado.
          </p>
        </div>

        <div className="users-toolbar">
          <button type="button" className="primary-button">
            Crear categoria
          </button>
          <button type="button" className="secondary-button">
            Editar categorias
          </button>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article key={category} className="category-card">
              <h3>{category}</h3>
              <p>Categoria institucional disponible para el portal.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="metrics-section">
        <div className="section-heading">
          <p className="section-kicker">Modulo 5</p>
          <h2>Panel de Metricas Institucionales</h2>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <p className="metric-label">{metric.label}</p>
              <h3>{metric.value}</h3>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="users-table-card">
          <div className="table-card-header">
            <h3>Resumen institucional</h3>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Emprendedores totales</td>
                <td>{totalEntrepreneurs}</td>
              </tr>
              {categories.map((category, index) => (
                <tr key={category}>
                  <td>Emprendedores en {category}</td>
                  <td>{index + 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
