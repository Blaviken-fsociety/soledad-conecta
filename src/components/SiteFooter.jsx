import alcaldiaLogo from '../assets/alcaldia-logo.png';
import cucLogo from '../assets/cuc-logo.png';
import novaLogo from '../assets/nova-logo.png';
import soledadLogo from '../assets/soledad-logo.png';

export default function SiteFooter() {
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
            <li>Emprendimientos destacados</li>
            <li>Busqueda por categorias</li>
            <li>Contacto y PQR's</li>
            <li>Calificaciones y comentarios</li>
          </ul>
        </div>

        <div className="site-footer-column">
          <h3>Aliados</h3>
          <div className="site-footer-allies">
            <div className="site-footer-ally">
              <span>Aliado tecnologico</span>
              <img src={novaLogo} alt="Nova Evolutions" className="site-footer-logo" />
            </div>

            <div className="site-footer-ally">
              <span>Apoyo institucional</span>
              <img
                src={alcaldiaLogo}
                alt="Alcaldia de Soledad"
                className="site-footer-logo"
              />
            </div>
          </div>
        </div>

        <div className="site-footer-column">
          <h3>Academia</h3>
          <div className="site-footer-ally">
            <span>Proyecto propuesto por</span>
            <img
              src={cucLogo}
              alt="CUC"
              className="site-footer-logo"
            />
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
