import { useState } from 'react';
import { Link } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import ShopCard from '../components/ShopCard.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { categories, featuredShops } from '../data/marketplaceData.js';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const visibleCategories = ['Todas', ...categories];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredShops = featuredShops.filter((shop) => {
    const matchesCategory =
      selectedCategory === 'Todas' || shop.category === selectedCategory;

    const searchSource = [
      shop.name,
      shop.sector,
      shop.category,
      shop.description,
      ...(shop.keywords || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 || searchSource.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const scrollToShops = () => {
    const targetSection = document.getElementById('emprendimientos');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryNavigation = (category) => {
    setSelectedCategory(category);
    scrollToShops();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    scrollToShops();
  };

  return (
    <main className="portal">
      <header className="portal-header">
        <BrandLogo />
        <nav className="header-actions" aria-label="Acciones principales">
          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="navbar-search">
              Buscar emprendimientos
            </label>
            <input
              id="navbar-search"
              name="search"
              type="search"
              placeholder="Buscar emprendimientos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" className="search-icon-button" aria-label="Buscar">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="search-icon-svg"
              >
                <path
                  d="M10.5 4a6.5 6.5 0 1 0 4.09 11.55l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>

          <label className="category-dropdown">
            <span className="sr-only">Categorias</span>
            <select
              value={selectedCategory}
              onChange={(event) => handleCategoryNavigation(event.target.value)}
            >
              {visibleCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <Link to="/login" className="login-button">
            Login
          </Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <h1>Portal Publico de Vitrina Empresarial</h1>
          <p className="hero-text">
            Explora los emprendimientos registrados, consulta sus catalogos,
            filtra por categorias y encuentra negocios locales mediante
            palabras clave.
          </p>
          <div className="hero-actions">
            <a href="#emprendimientos" className="primary-button">
              Ver emprendimientos
            </a>
            <Link to="/interaccion" className="secondary-button">
              Contacto y PQR's
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <h2>Que debe permitir el portal</h2>
          <ul>
            <li>Visualizar los emprendimientos disponibles.</li>
            <li>Consultar catalogos de productos o servicios.</li>
            <li>Navegar por categorias empresariales.</li>
            <li>Buscar emprendimientos mediante palabras clave.</li>
          </ul>
          <p>
            Cada emprendimiento debe contar con un espacio propio con
            informacion basica, catalogo y medios de contacto.
          </p>
        </aside>
      </section>

      <section className="overview-section">
        <div className="section-heading">
          <p className="section-kicker">Estructura del modulo</p>
          <h2>Espacios clave del portal</h2>
        </div>

        <div className="carousel-track overview-carousel" role="list">
          <article className="overview-card" role="listitem">
            <h3>Vitrina publica</h3>
            <p>
              Lista visible de emprendimientos activos con informacion clara y
              acceso rapido a su ficha individual.
            </p>
          </article>
          <article className="overview-card" role="listitem">
            <h3>Catalogos</h3>
            <p>
              Presentacion ordenada de productos o servicios disponibles por
              emprendimiento.
            </p>
          </article>
          <article className="overview-card" role="listitem">
            <h3>Contacto</h3>
            <p>
              Canales de comunicacion como WhatsApp, redes sociales, correo o
              telefono.
            </p>
          </article>
        </div>
      </section>

      <section className="shops-section" id="emprendimientos">
        <div className="section-heading">
          <p className="section-kicker">Emprendimientos destacados</p>
          <h2>Espacios propios dentro del portal</h2>
          <p>
            Resultados dinamicos para categoria <strong>{selectedCategory}</strong>
            {normalizedSearch ? ` y busqueda "${searchTerm}"` : ''}.
          </p>
        </div>

        {filteredShops.length > 0 ? (
          <div className="carousel-track shops-carousel" role="list">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No hay resultados para esta busqueda</h3>
            <p>
              Ajusta la palabra clave o cambia la categoria para explorar otros
              emprendimientos.
            </p>
          </div>
        )}
      </section>

      <section className="overview-section">
        <div className="section-heading">
          <h2>Interaccion con Usuarios y Retroalimentacion</h2>
          <p>
            Accede por separado al modulo de contacto y PQR's y al modulo de
            calificaciones y comentarios.
          </p>
        </div>

        <div className="module-grid">
          <div className="module-link-card">
            <div>
              <h3>Contacto y PQR's</h3>
              <p>
                Incluye botones de WhatsApp y formulario para peticiones,
                quejas, reclamos y sugerencias.
              </p>
            </div>
            <Link to="/interaccion" className="primary-button">
              Abrir PQR's
            </Link>
          </div>

          <div className="module-link-card">
            <div>
              <h3>Calificaciones y comentarios</h3>
              <p>
                Modulo independiente para estrellas, comentarios y promedio de
                calificacion por emprendimiento.
              </p>
            </div>
            <Link to="/calificaciones" className="primary-button">
              Abrir comentarios
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
