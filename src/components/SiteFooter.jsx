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
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <img
            src={soledadLogo}
            alt="Soledad Conecta"
            className="site-footer-soledad-logo"
          />
          <p className="site-footer-eyebrow">Vitrina empresarial digital</p>
          <p>
            Plataforma institucional para la vitrina empresarial, la promocion
            de emprendimientos y la interaccion con la comunidad.
          </p>
        </div>

        <div className="site-footer-column">
          <h3>Explorar</h3>
          <ul className="site-footer-links">
            {isHome ? <li><a href="#emprendimientos" className="footer-link">Destacados</a></li> : null}
            {isHome ? <li><a href="#funcionalidades" className="footer-link">Funcionalidades</a></li> : null}
            <li><Link to="/interaccion" className="footer-link">PQR&apos;s</Link></li>
            <li><Link to="/calificaciones" className="footer-link">Comentarios</Link></li>
          </ul>
        </div>

        <div className="site-footer-column">
          <h3>Aliados</h3>
          <div className="site-footer-allies">
            <div className="site-footer-ally">
              <span>Aliado tecnologico</span>
              <button
                type="button"
                className="site-footer-logo-button"
                onClick={() => handleExternalNavigation('https://nova-evolutions.netlify.app/')}
              >
                <img src={novaLogo} alt="Nova Evolutions" className="site-footer-logo" />
              </button>
            </div>

            <div className="site-footer-ally">
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
          </div>
        </div>

        <div className="site-footer-column">
          <h3>Academia</h3>
          <div className="site-footer-ally">
            <span>Proyecto propuesto por</span>
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
            <p className="site-footer-support-text">
              Participacion academica en la formulacion de la iniciativa.
            </p>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>Soledad Conecta. Ecosistema digital para emprendimientos locales.</p>
        <div className="site-footer-bottom-links">
          <span>Terminos de uso</span>
          <span>Politica de privacidad</span>
          <span>Canales institucionales</span>
        </div>
      </div>
    </footer>
  );
}
