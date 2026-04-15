import { Link, useLocation } from 'react-router-dom';

import alcaldiaLogo from '../assets/alcaldia-logo.png';
import cucLogo from '../assets/cuc-logo.png';
import novaLogo from '../assets/nova-logo.png';
import soledadLogo from '../assets/soledad-logo.png';

export default function SiteFooter() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const handleExternalNavigation = (url) => {
    const shouldOpen = window.confirm(
      'Sera redireccionado a una pagina externa. Desea continuar?',
    );

    if (shouldOpen) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-main site-footer-figma">
        <div className="site-footer-brand">
          <img
            src={soledadLogo}
            alt="Soledad Conecta"
            className="site-footer-soledad-logo"
          />
          <h3 className="site-footer-brand-title">Soledad Conecta</h3>
          <p className="site-footer-brand-copy">
            Plataforma institucional para impulsar emprendimientos locales,
            fortalecer la visibilidad comercial y conectar la comunidad con la
            vitrina empresarial del municipio.
          </p>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Enlaces</h4>
          <ul className="site-footer-links">
            <li><Link to="/" className="footer-link">Inicio</Link></li>
            {isHome ? <li><a href="#emprendimientos" className="footer-link">Marketplace</a></li> : null}
            {isHome ? <li><a href="#funcionalidades" className="footer-link">Funcionalidades</a></li> : null}
            <li><Link to="/interaccion" className="footer-link">PQR&apos;s</Link></li>
            <li><Link to="/calificaciones" className="footer-link">Comentarios</Link></li>
          </ul>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Contacto</h4>
          <div className="site-footer-contact-list">
            <p><strong>Telefono:</strong> +57 300 123 4567</p>
            <p><strong>Correo:</strong> info@soledadconecta.gov.co</p>
            <p><strong>Ubicacion:</strong> Soledad, Atlantico, Colombia</p>
          </div>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Aliados institucionales</h4>
          <div className="site-footer-logo-cluster">
            <div className="site-footer-ally-card">
              <span>Aliado tecnologico</span>
              <button
                type="button"
                className="site-footer-logo-button"
                onClick={() => handleExternalNavigation('https://nova-evolutions.netlify.app/')}
              >
                <img src={novaLogo} alt="Nova Evolutions" className="site-footer-logo" />
              </button>
            </div>

            <div className="site-footer-ally-card">
              <span>Apoyo institucional</span>
              <button
                type="button"
                className="site-footer-logo-button"
                onClick={() => handleExternalNavigation('https://www.soledad-atlantico.gov.co/')}
              >
                <img
                  src={alcaldiaLogo}
                  alt="Alcaldia de Soledad"
                  className="site-footer-logo"
                />
              </button>
            </div>

            <div className="site-footer-ally-card">
              <span>Academia</span>
              <button
                type="button"
                className="site-footer-logo-button"
                onClick={() => handleExternalNavigation('https://www.cuc.edu.co/')}
              >
                <img
                  src={cucLogo}
                  alt="CUC"
                  className="site-footer-logo"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom site-footer-bottom-figma">
        <p>© 2026 Soledad Conecta. Todos los derechos reservados. Iniciativa institucional del Municipio de Soledad.</p>
        <div className="site-footer-bottom-links">
          <span>Terminos de uso</span>
          <span>Politica de privacidad</span>
          <span>Canales institucionales</span>
        </div>
      </div>
    </footer>
  );
}
