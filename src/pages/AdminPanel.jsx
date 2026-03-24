import { Navigate, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { categories } from '../data/marketplaceData.js';
import { metrics, userRows } from '../data/dashboardData.js';
import { clearSession, getSessionRole } from '../utils/session.js';

export default function AdminPanel() {
  const navigate = useNavigate();
  const sessionRole = getSessionRole();

  if (sessionRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const totalEntrepreneurs = userRows.filter(
    (user) => user.role === 'Emprendedor / Empresario',
  ).length;

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
            Espacio reservado para administrar usuarios, categorias del sistema
            y revisar metricas institucionales de la plataforma.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Acceso seguro</h2>
          <p>
            Solo el administrador autenticado puede acceder a este panel y
            gestionar la configuracion estructural de la plataforma.
          </p>
        </aside>
      </section>

      <section className="users-section">
        <div className="section-heading">
          <p className="section-kicker">Modulo 2</p>
          <h2>Gestion de usuarios</h2>
        </div>

        <div className="users-toolbar">
          <button type="button" className="primary-button">
            Crear emprendedor
          </button>
          <button type="button" className="secondary-button">
            Configuracion general
          </button>
        </div>

        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {userRows.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
