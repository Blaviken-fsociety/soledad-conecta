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
  const [previewImage, setPreviewImage] = useState(null);

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

  const shopName = microtienda?.nombre || 'Emprendimiento local';
  const shopCategory = microtienda?.categoria || 'Emprendimiento local';
  const shopDescription =
    microtienda?.descripcion || 'Esta tienda ya tiene su espacio propio con informacion y catalogo visibles.';
  const shopSector = microtienda?.sectorEconomico || 'Sector general';
  const shopOwner = microtienda?.propietario || 'Propietario pendiente';
  const shopRating = Number(microtienda?.promedioCalificacion || 0).toFixed(1);
  const shopInitial = shopName.charAt(0).toUpperCase();
  const shopSocial = microtienda?.redesSociales || 'Sin redes sociales registradas por ahora.';
  const shopWhatsapp = microtienda?.whatsapp;

  return (
    <main className="portal portal-service-page microstore-detail-page">
      <header className="portal-header portal-home-header portal-home-toolbar">
        <div className="container-xxl">
          <div className="navbar-shell home-toolbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo />
            </div>

            <div className="navbar-actions-slot">
              <nav className="header-actions service-header-actions home-toolbar-actions" aria-label="Navegacion de detalle">
                <Link to="/" className="btn portal-btn portal-btn-secondary service-header-button">
                  Volver al portal
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {loadError ? (
        <section className="service-section">
          <div className="container-xxl">
            <section className="empty-state detail-page-state">
              <h1>No pudimos abrir esta tienda</h1>
              <p>{loadError}</p>
            </section>
          </div>
        </section>
      ) : microtienda ? (
        <>
          <section className="service-hero-section microstore-showcase-section">
            <div className="container-xxl">
              <div className="admin-hero microstore-detail-hero">
                <div className="hero-copy microstore-detail-copy">
                  <span className="eyebrow">{shopCategory}</span>
                  <h1>{shopName}</h1>
                  <p className="hero-text">{shopDescription}</p>

                  <div className="microstore-detail-meta">
                    <span>{shopSector}</span>
                    <span>{products.length} productos publicados</span>
                    <span>{shopRating} de calificacion promedio</span>
                  </div>

                  <div className="hero-actions">
                    {shopWhatsapp ? (
                      <a
                        href={`https://wa.me/57${shopWhatsapp}`}
                        className="btn portal-btn portal-btn-primary hero-primary-button"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Contactar por WhatsApp
                      </a>
                    ) : null}
                    <Link to="/calificaciones" className="btn portal-btn portal-btn-secondary">
                      Ver y dejar calificaciones
                    </Link>
                  </div>
                </div>

                <aside className="hero-panel microstore-detail-panel">
                  {microtienda?.logoImagen ? (
                    <img
                      src={microtienda.logoImagen}
                      alt={`Logo de ${shopName}`}
                      className="microstore-detail-logo"
                    />
                  ) : (
                    <div className="microstore-detail-logo microstore-detail-logo-placeholder">
                      <span>{shopInitial}</span>
                    </div>
                  )}
                  <h2>{shopOwner}</h2>
                  <p>{shopSocial}</p>
                </aside>
              </div>
            </div>
          </section>

          <section className="users-section service-section microstore-catalog-section">
            <div className="container-xxl">
              <div className="section-heading">
                <p className="section-kicker">Catalogo publicado</p>
                <h2>Productos disponibles en esta tienda</h2>
              </div>

              {products.length > 0 ? (
                <div className="detail-products-grid">
                  {products.map((product) => (
                    <article key={product.id} className="detail-product-card">
                      {product.imagenUrl ? (
                        <button
                          type="button"
                          className="detail-product-visual detail-product-image-button"
                          onClick={() =>
                            setPreviewImage({
                              src: product.imagenUrl,
                              alt: product.nombre,
                            })
                          }
                        >
                          <img
                            src={product.imagenUrl}
                            alt={product.nombre}
                            className="detail-product-image"
                          />
                        </button>
                      ) : (
                        <div className="detail-product-visual detail-product-image detail-product-placeholder">
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
                        <div className="detail-product-footer">
                          <strong>${Number(product.precio || 0).toLocaleString('es-CO')}</strong>
                          {product.imagenUrl ? (
                            <button
                              type="button"
                              className="btn btn-outline-primary portal-btn portal-btn-secondary detail-image-cta"
                              onClick={() =>
                                setPreviewImage({
                                  src: product.imagenUrl,
                                  alt: product.nombre,
                                })
                              }
                            >
                              Ver producto
                            </button>
                          ) : null}
                        </div>
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
            </div>
          </section>
        </>
      ) : (
        <section className="service-section">
          <div className="container-xxl">
            <section className="empty-state detail-page-state">
              <h1>Cargando tienda...</h1>
            </section>
          </div>
        </section>
      )}

      {previewImage ? (
        <div className="detail-image-modal" role="dialog" aria-modal="true" aria-label="Vista ampliada de imagen">
          <div className="detail-image-modal-backdrop" onClick={() => setPreviewImage(null)}></div>
          <div className="detail-image-modal-content">
            <button
              type="button"
              className="btn btn-light portal-btn portal-btn-secondary detail-image-close"
              onClick={() => setPreviewImage(null)}
            >
              Volver
            </button>
            <img src={previewImage.src} alt={previewImage.alt} className="detail-image-modal-preview" />
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </main>
  );
}
