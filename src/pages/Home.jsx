import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import soledadLogo from '../assets/soledad-logo.png';
import BrandLogo from '../components/BrandLogo.jsx';
import ShopCard from '../components/ShopCard.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import {
  getCategoriesRequest,
  getMicrotiendasRequest,
  getRatingsSummaryRequest,
} from '../utils/api.js';

const portalFeatures = [
  {
    title: 'Descubre negocios reales',
    description: 'Explora emprendimientos con identidad visual, categoria y contacto directo.',
  },
  {
    title: 'Consulta catalogos activos',
    description: 'Revisa productos, servicios y vitrinas publicadas por cada emprendimiento.',
  },
  {
    title: 'Filtra sin perder tiempo',
    description: 'Combina busqueda por texto y categorias para llegar rapido al resultado.',
  },
  {
    title: 'Conecta y opina',
    description: 'Activa contacto por WhatsApp, envia PQRs y deja calificaciones desde el portal.',
  },
];

const keySpaces = [
  {
    title: 'Vitrina publica con enfoque local',
    description:
      'La portada prioriza descubrimiento, busqueda y contexto visual para cada emprendimiento, con una lectura mas editorial que listado generico.',
    accent: 'Descubrir',
  },
  {
    title: 'Microespacios para cada negocio',
    description:
      'Cada emprendimiento necesita una presencia propia: identidad, descripcion, catalogo, contacto y secciones que faciliten decisiones rapidas.',
    accent: 'Gestionar',
  },
];

const portalGrid = [
  'Busqueda inteligente por palabras clave.',
  'Categorias visibles y faciles de recorrer.',
  'Contacto directo con enfoque institucional.',
  'Comentarios y confianza social para el visitante.',
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showIntro, setShowIntro] = useState(true);
  const [introSettled, setIntroSettled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [microtiendas, setMicrotiendas] = useState([]);
  const [topRatedHighlights, setTopRatedHighlights] = useState([]);
  const [loadError, setLoadError] = useState('');
  const carouselRef = useRef(null);

  const visibleCategories = ['Todas', ...categories.map((category) => category.nombre)];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredShops = microtiendas.filter((shop) => {
    const matchesCategory =
      selectedCategory === 'Todas' || shop.categoria === selectedCategory;

    const searchSource = [
      shop.nombre,
      shop.sectorEconomico,
      shop.categoria,
      shop.descripcion,
      shop.propietario,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 || searchSource.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const collapseTimer = window.setTimeout(() => {
      setIntroSettled(true);
    }, 2700);

    const removeTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 3400);

    return () => {
      window.clearTimeout(collapseTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedMicrotiendas, ratingSummary] = await Promise.all([
          getCategoriesRequest(true),
          getMicrotiendasRequest(),
          getRatingsSummaryRequest(),
        ]);

        setCategories(fetchedCategories);
        setMicrotiendas(fetchedMicrotiendas);
        setTopRatedHighlights(ratingSummary.slice(0, 2));
        setLoadError('');
      } catch (error) {
        setLoadError(error.message);
      }
    };

    loadData();
  }, []);

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
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

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

  const scrollMarketplace = (direction) => {
    if (!carouselRef.current) {
      return;
    }

    carouselRef.current.scrollBy({
      left: direction * 360,
      behavior: 'smooth',
    });
  };

  return (
    <main className="portal portal-home">
      {showIntro ? (
        <div className={`portal-intro ${introSettled ? 'portal-intro-finished' : ''}`}>
          <img
            src={soledadLogo}
            alt="Soledad Conecta"
            className="portal-intro-logo"
          />
        </div>
      ) : null}

      <header className="portal-header portal-home-header sticky-top">
        <div className="container-xxl">
          <div className="navbar-shell">
            <div className="navbar-brand-slot">
              <BrandLogo
                className={introSettled ? 'brand-logo-docked' : 'brand-logo-pending'}
              />
            </div>

            <div className="navbar-actions-slot">
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
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon-svg">
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
            </div>
          </div>
        </div>
      </header>

      <section className="hero-home-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="hero-feature-band">
            <div className="hero-copy hero-home-copy hero-home-copy-wide">
              <div className="hero-home-copy-grid">
                <div className="hero-home-copy-main">
                  <span className="eyebrow">Marketplace institucional</span>
                  <h1>Soledad Conecta impulsa la visibilidad de los negocios locales.</h1>
                </div>

                <div className="hero-home-copy-support">
                  <p className="hero-text">
                    Explora emprendimientos, descubre categorias activas y conecta
                    con una vitrina digital pensada para mostrar el talento
                    comercial del municipio con una experiencia clara y moderna.
                  </p>
                  <div className="hero-actions">
                    <a href="#emprendimientos" className="primary-button hero-primary-button">
                      Ver emprendimientos
                    </a>
                    <Link to="/interaccion" className="secondary-button">
                      Contacto y PQR&apos;s
                    </Link>
                  </div>
                </div>

                <div className="hero-status-strip">
                  <div>
                    <strong>{microtiendas.length}+</strong>
                    <span>emprendimientos visibles</span>
                  </div>
                  <div>
                    <strong>{categories.length}</strong>
                    <span>categorias activas</span>
                  </div>
                  <div>
                    <strong>{topRatedHighlights.length}</strong>
                    <span>negocios destacados por calificacion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-insights-band">
            <aside className="hero-visual-shell" aria-label="Vista previa del portal">
              <div className="hero-visual-layout">
                <div className="hero-visual-panel hero-visual-main">
                  <span className="section-kicker">Vista destacada</span>
                  <h2>Una portada con mas ritmo, contexto y profundidad visual.</h2>
                  <p>
                    El portal combina busqueda, categorias y una vitrina con
                    mejor jerarquia para dar protagonismo a los emprendimientos.
                  </p>
                </div>
                <div className="hero-visual-stack">
                  {topRatedHighlights.map((item, index) => (
                    <div
                      key={item.microtiendaId}
                      className={`hero-visual-panel hero-visual-side ${
                        index % 2 === 0 ? 'hero-visual-yellow' : 'hero-visual-blue'
                      }`}
                    >
                      <div className="hero-visual-rating">
                        <span>Calificacion</span>
                        <strong>{item.promedio.toFixed(1)}</strong>
                      </div>
                      <h3>{item.microtienda}</h3>
                      <p>{item.comentarioDestacado}</p>
                      <div className="hero-visual-side-footer">
                        <span>{item.totalCalificaciones} opiniones registradas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-ambient-orb hero-orb-one"></div>
              <div className="hero-ambient-orb hero-orb-two"></div>
            </aside>
          </div>
        </div>
      </section>

      <section className="feature-strip-section" id="funcionalidades" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Experiencia principal</p>
            <h2>Todo lo importante del portal en una sola franja clara y util.</h2>
          </div>

          <div className="portal-feature-strip">
            {portalFeatures.map((feature) => (
              <article key={feature.title} className="portal-feature-item">
                <div className="feature-icon" aria-hidden="true">
                  <span></span>
                </div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overview-section portal-spaces-section" data-reveal="fade-left">
        <div className="container-xxl">
          <div className="section-heading mb-4">
            <p className="section-kicker">Espacios clave del portal</p>
            <h2>Una estructura mas variada para contar mejor el ecosistema.</h2>
          </div>

          <div className="portal-space-block portal-space-block-light">
            <div className="row g-4 align-items-center">
              <div className="col-12 col-lg-6">
                <div className="portal-space-copy">
                  <span className="portal-space-tag">{keySpaces[0].accent}</span>
                  <h3>{keySpaces[0].title}</h3>
                  <p>{keySpaces[0].description}</p>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="portal-space-visual portal-space-visual-browser">
                  <div className="portal-space-window-bar"></div>
                  <div className="portal-space-window-grid">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="portal-space-block portal-space-block-dark" data-reveal="fade-right">
            <div className="row g-4 align-items-center flex-lg-row-reverse">
              <div className="col-12 col-lg-6">
                <div className="portal-space-copy portal-space-copy-dark">
                  <span className="portal-space-tag">{keySpaces[1].accent}</span>
                  <h3>{keySpaces[1].title}</h3>
                  <p>{keySpaces[1].description}</p>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="portal-space-visual portal-space-visual-stack">
                  <div className="portal-mini-panel"></div>
                  <div className="portal-mini-panel"></div>
                  <div className="portal-mini-panel"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="portal-grid-summary" data-reveal="fade-up">
            {portalGrid.map((item) => (
              <div key={item} className="portal-grid-summary-item">
                <span className="portal-grid-bullet"></span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shops-section marketplace-section" id="emprendimientos" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="marketplace-heading">
            <div className="section-heading">
              <p className="section-kicker">Emprendimientos destacados</p>
              <h2>Un carrusel mas amplio y expresivo para la vitrina empresarial.</h2>
              <p>
                Resultados dinamicos para categoria <strong>{selectedCategory}</strong>
                {normalizedSearch ? ` y busqueda "${searchTerm}"` : ''}.
              </p>
            </div>

            <div className="marketplace-controls" aria-label="Controles del carrusel">
              <button type="button" className="marketplace-control" onClick={() => scrollMarketplace(-1)}>
                Anterior
              </button>
              <button type="button" className="marketplace-control" onClick={() => scrollMarketplace(1)}>
                Siguiente
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="empty-state">
              <h3>No fue posible cargar el marketplace</h3>
              <p>{loadError}</p>
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="marketplace-carousel" ref={carouselRef} role="list">
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
        </div>
      </section>

      <section className="cta-banner-section" data-reveal="fade-up">
        <div className="container-xxl">
          <div className="cta-banner">
            <div className="cta-banner-copy">
              <p className="section-kicker cta-kicker">Interaccion con usuarios</p>
              <h2>Activa el dialogo con visitantes, solicitudes y opiniones del portal.</h2>
              <p>
                Integra los canales institucionales en una sola franja de alto
                contraste para que la accion principal sea inmediata y visible.
              </p>
            </div>

            <div className="cta-banner-actions">
              <Link to="/interaccion" className="cta-action-card cta-action-primary">
                <span className="cta-action-title">Abrir PQR&apos;s</span>
                <span className="cta-action-text">
                  Registra peticiones, quejas, reclamos o sugerencias para recibir
                  atencion institucional.
                </span>
              </Link>
              <Link to="/calificaciones" className="cta-action-card cta-action-secondary">
                <span className="cta-action-title">Abrir comentarios</span>
                <span className="cta-action-text">
                  Consulta opiniones de otros usuarios y comparte tu experiencia
                  con los emprendimientos del portal.
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
