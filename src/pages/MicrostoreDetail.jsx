import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { getMicrotiendaByIdRequest, getProductsRequest } from '../utils/api.js';

export default function MicrostoreDetail() {
  const { id } = useParams();
  const [microtienda, setMicrotienda] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadMicrostore = async () => {
      try {
        const [fetchedMicrotienda, fetchedProducts] = await Promise.all([
          getMicrotiendaByIdRequest(id),
          getProductsRequest(id),
        ]);

        setMicrotienda(fetchedMicrotienda);
        setProducts(fetchedProducts);
        setLoadError('');
      } catch (error) {
        setLoadError(error.message);
      }
    };

    loadMicrostore();
  }, [id]);

  return (
    <main className="portal admin-page">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Navegacion de detalle">
          <Link to="/" className="header-link">
            Volver al portal
          </Link>
        </nav>
      </header>

      {loadError ? (
        <section className="empty-state detail-page-state">
          <h1>No pudimos abrir esta tienda</h1>
          <p>{loadError}</p>
        </section>
      ) : microtienda ? (
        <>
          <section className="admin-hero microstore-detail-hero">
            <div className="hero-copy">
              <span className="eyebrow">{microtienda.categoria || 'Emprendimiento local'}</span>
              <h1>{microtienda.nombre}</h1>
              <p className="hero-text">
                {microtienda.descripcion || 'Esta tienda ya tiene su espacio propio con informacion y catalogo visibles.'}
              </p>

              <div className="microstore-detail-meta">
                <span>{microtienda.sectorEconomico || 'Sector general'}</span>
                <span>{products.length} productos publicados</span>
                <span>{microtienda.promedioCalificacion.toFixed(1)} de calificacion promedio</span>
              </div>

              <div className="hero-actions">
                {microtienda.whatsapp ? (
                  <a
                    href={`https://wa.me/57${microtienda.whatsapp}`}
                    className="primary-button hero-primary-button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                ) : null}
                <Link to="/calificaciones" className="secondary-button">
                  Ver y dejar calificaciones
                </Link>
              </div>
            </div>

            <aside className="hero-panel microstore-detail-panel">
              {microtienda.logoImagen ? (
                <img
                  src={microtienda.logoImagen}
                  alt={`Logo de ${microtienda.nombre}`}
                  className="microstore-detail-logo"
                />
              ) : (
                <div className="microstore-detail-logo microstore-detail-logo-placeholder">
                  <span>{microtienda.nombre.charAt(0)}</span>
                </div>
              )}
              <h2>{microtienda.propietario}</h2>
              <p>{microtienda.redesSociales || 'Sin redes sociales registradas por ahora.'}</p>
            </aside>
          </section>

          <section className="users-section">
            <div className="section-heading">
              <p className="section-kicker">Catalogo publicado</p>
              <h2>Productos disponibles en esta tienda</h2>
            </div>

            {products.length > 0 ? (
              <div className="detail-products-grid">
                {products.map((product) => (
                  <article key={product.id} className="detail-product-card">
                    {product.imagenUrl ? (
                      <img
                        src={product.imagenUrl}
                        alt={product.nombre}
                        className="detail-product-image"
                      />
                    ) : (
                      <div className="detail-product-image detail-product-placeholder">
                        Imagen pendiente
                      </div>
                    )}
                    <div className="detail-product-body">
                      <div className="shop-card-meta">
                        <div className="shop-badge">{product.categoria || 'Producto'}</div>
                        <span className="shop-sector">Stock: {product.stock}</span>
                      </div>
                      <h3>{product.nombre}</h3>
                      <p>{product.descripcion || 'Sin descripcion adicional.'}</p>
                      <strong>${Number(product.precio || 0).toLocaleString('es-CO')}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state detail-page-state">
                <h3>Esta tienda todavia no tiene productos aprobados</h3>
                <p>Cuando el administrador valide nuevas publicaciones, apareceran aqui.</p>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="empty-state detail-page-state">
          <h1>Cargando tienda...</h1>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
