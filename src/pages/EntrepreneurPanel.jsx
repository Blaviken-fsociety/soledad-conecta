import { Navigate, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { metrics, productRows } from '../data/dashboardData.js';
import { clearSession, getSession, getSessionRole } from '../utils/session.js';

export default function EntrepreneurPanel() {
  const navigate = useNavigate();
  const sessionRole = getSessionRole();
  const session = getSession();

  if (sessionRole !== 'entrepreneur') {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="portal admin-page">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion emprendedor">
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
          <span className="eyebrow">Panel Emprendedor</span>
          <h1>Microtienda y metricas del emprendimiento</h1>
          <p className="hero-text">
            Espacio del emprendedor para administrar la microtienda digital y
            revisar indicadores generales de la plataforma.
          </p>
        </div>

        <aside className="hero-panel">
          <h2>Acceso empresarial</h2>
          <p>
            Desde este panel el emprendedor podra gestionar productos, precios,
            inventario e informacion del negocio.
          </p>
          <p>
            Usuario autenticado: <strong>{session?.user?.nombre}</strong>
          </p>
        </aside>
      </section>

      <section className="microstore-section">
        <div className="section-heading">
          <p className="section-kicker">Modulo 3</p>
          <h2>Microtienda Empresarial</h2>
        </div>

        <div className="microstore-grid">
          <article className="microstore-card">
            <h3>Gestion comercial</h3>
            <ul>
              <li>Registrar productos o servicios.</li>
              <li>Modificar precios.</li>
              <li>Gestionar inventario.</li>
              <li>Subir imagenes de productos.</li>
            </ul>
          </article>

          <article className="microstore-card">
            <h3>Informacion del negocio</h3>
            <ul>
              <li>Editar descripcion del negocio.</li>
              <li>Actualizar informacion de contacto.</li>
              <li>Definir nombre de la empresa.</li>
              <li>Indicar sector economico.</li>
            </ul>
          </article>

          <article className="microstore-card">
            <h3>Datos minimos requeridos</h3>
            <ul>
              <li>Nombre de la empresa.</li>
              <li>Sector economico.</li>
              <li>Numero de contacto por WhatsApp.</li>
              <li>Redes sociales.</li>
            </ul>
          </article>
        </div>

        <div className="microstore-workspace">
          <div className="microstore-business-card">
            <div className="microstore-business-header">
              <div>
                <p className="section-kicker">Ficha del negocio</p>
                <h3>Tienda Demo</h3>
              </div>
              <span className="shop-badge">Comercio</span>
            </div>

            <div className="business-details">
              <div>
                <strong>Empresa</strong>
                <p>Tienda Demo SAS</p>
              </div>
              <div>
                <strong>Sector economico</strong>
                <p>Moda</p>
              </div>
              <div>
                <strong>WhatsApp</strong>
                <p>300 123 4567</p>
              </div>
              <div>
                <strong>Redes sociales</strong>
                <p>@tiendademo</p>
              </div>
            </div>
          </div>

          <div className="users-table-card">
            <div className="table-card-header">
              <h3>Productos y servicios</h3>
              <button type="button" className="primary-button">
                Agregar producto
              </button>
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Inventario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((product) => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                    <td>{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      </section>

      <SiteFooter />
    </main>
  );
}
