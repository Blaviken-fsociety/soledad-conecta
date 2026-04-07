import { Component } from 'react';

import BrandLogo from './BrandLogo.jsx';
import SiteFooter from './SiteFooter.jsx';

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error de render en la ruta:', error, info);
  }

  render() {
    const { error } = this.state;
    const { children, title = 'No pudimos abrir esta vista' } = this.props;

    if (!error) {
      return children;
    }

    return (
      <main className="portal portal-service-page">
        <header className="portal-header portal-home-header sticky-top">
          <div className="container-xxl">
            <div className="navbar-shell">
              <div className="navbar-brand-slot">
                <BrandLogo />
              </div>
            </div>
          </div>
        </header>

        <section className="service-section">
          <div className="container-xxl">
            <section className="empty-state detail-page-state">
              <h1>{title}</h1>
              <p>{error.message || 'Ocurrio un error inesperado al renderizar esta seccion.'}</p>
            </section>
          </div>
        </section>

        <SiteFooter />
      </main>
    );
  }
}

export default RouteErrorBoundary;
