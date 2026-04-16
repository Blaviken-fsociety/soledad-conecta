import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router';
import soledadLogo from '../assets/soledad-logo.png';
import alcaldiaLogo from '../assets/alcaldialogo.png';
import cucLogo from '../assets/cuclogo.png';
import novaLogo from '../assets/novalogo.png';
import twitterXLogo from '../assets/twitter-x.png';

const footerLinkClass =
  'text-[rgba(255,255,255,0.85)] no-underline transition-colors duration-200 hover:text-[var(--accent)]';
const contactRowClass = 'flex items-start gap-2';
const partnerCardClass =
  'flex h-[76px] w-[76px] items-center justify-center rounded-[var(--radius)] bg-[rgba(255,255,255,0.1)] p-2 transition-all duration-200 hover:-translate-y-px hover:bg-[rgba(255,255,255,0.16)]';
const socialLinkClass =
  'flex h-7 w-7 items-center justify-center text-[var(--accent)] transition-opacity duration-200 hover:opacity-80';

const partners = [
  {
    name: 'Alcaldía de Soledad',
    logo: alcaldiaLogo,
    href: 'https://www.soledad-atlantico.gov.co/',
  },
  {
    name: 'CUC Universidad de la Costa',
    logo: cucLogo,
    href: 'https://www.cuc.edu.co/',
  },
  {
    name: 'N.O.V.A. Evolutions',
    logo: novaLogo,
    href: 'https://nova-evolutions.netlify.app/',
  },
];

export function Footer() {
  return (
    <footer
      className="mt-auto bg-[var(--primary)] text-[var(--primary-foreground)]"
      style={{ color: 'var(--primary-foreground)' }}
    >
      <div className="w-full px-4 py-20 md:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-[1.7fr_0.9fr_1.05fr_1.05fr] xl:gap-14">
          <div>
            <div className="mb-4">
              <img
                src={soledadLogo}
                alt="Soledad Conecta"
                className="h-20 w-auto object-contain md:h-24"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="max-w-[32rem] leading-[1.6] text-[rgba(255,255,255,0.85)]">
              Conectando emprendedores locales con su comunidad. Un espacio institucional para fortalecer el comercio y la economía de Soledad.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-lg">Enlaces</h4>
            <ul className="list-none space-y-3 p-0">
              <li>
                <Link to="/" className={footerLinkClass}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className={footerLinkClass}>
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/contacto" className={footerLinkClass}>
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/comentarios" className={footerLinkClass}>
                  Comentarios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-lg">Contacto</h4>
            <div className="flex flex-col gap-2">
              <div className={contactRowClass}>
                <Phone size={18} className="mt-[2px] shrink-0" />
                <span className="text-[rgba(255,255,255,0.85)]">+57 300 123 4567</span>
              </div>
              <div className={contactRowClass}>
                <Mail size={18} className="mt-[2px] shrink-0" />
                <span className="text-[rgba(255,255,255,0.85)]">info@soledadconecta.gov.co</span>
              </div>
              <div className={contactRowClass}>
                <MapPin size={18} className="mt-[2px] shrink-0" />
                <span className="text-[rgba(255,255,255,0.85)]">Soledad, Atlántico, Colombia</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-lg">Aliados Institucionales</h4>
            <div className="mb-3 flex flex-wrap gap-3">
              {partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={partnerCardClass}
                  aria-label={`Ir a ${partner.name}`}
                  title={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-[88%] max-w-[88%] object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </a>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.facebook.com/soledadalcaldia"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClass}
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/alcaldiadesoledad/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClass}
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://x.com/soledadalcaldia"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClass}
              >
                <img src={twitterXLogo} alt="X" className="h-9 w-9 object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(90%) sepia(79%) saturate(1267%) hue-rotate(335deg) brightness(104%) contrast(103%)' }} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.15)] pt-7 text-center text-sm text-[rgba(255,255,255,0.7)]">
          © 2026 Soledad Conecta. Todos los derechos reservados. Una iniciativa institucional del Municipio de Soledad.
        </div>
      </div>
    </footer>
  );
}
