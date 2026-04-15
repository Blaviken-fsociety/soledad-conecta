import { useState } from 'react';
import { Search, LogIn, Menu, X } from 'lucide-react';
import { Link } from 'react-router';
import soledadLogo from '../assets/soledad-logo.png';

const navLinkClass =
  'px-4 py-2 font-medium transition-colors duration-200 hover:text-[var(--accent)]';
const outlineButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-[var(--primary)] px-6 py-2.5 font-semibold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-[0_4px_12px_rgba(27,58,95,0.2)]';
const accentButtonClass =
  'inline-flex items-center justify-center rounded-r-[var(--radius)] bg-[var(--accent)] px-4 text-[var(--accent-foreground)] transition-all duration-200 hover:-translate-y-px hover:bg-[#E5A600] hover:shadow-[0_4px_12px_rgba(255,184,0,0.3)]';
const searchInputClass =
  'h-11 w-full rounded-l-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-4 text-base outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,184,0,0.15)]';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      aria-label="Principal"
    >
      <div className="w-full px-4 md:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-6">
          <Link
            to="/"
            className="flex items-center text-[var(--primary)] transition-colors duration-200 hover:text-[var(--accent)]"
          >
            <img
              src={soledadLogo}
              alt="Soledad Conecta"
              className="h-14 w-auto object-contain lg:h-16"
            />
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] text-[var(--primary)] lg:hidden"
            aria-controls="navbarContent"
            aria-expanded={isOpen}
            aria-label="Abrir navegación"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden min-w-0 flex-1 lg:flex lg:items-center lg:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex max-w-[600px]">
                <input
                  type="search"
                  className={searchInputClass}
                  placeholder="Buscar emprendimientos, productos..."
                  aria-label="Buscar"
                />
                <button className={accentButtonClass} type="button" aria-label="Buscar">
                  <Search size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/marketplace" className={navLinkClass}>
                Marketplace
              </Link>
              <Link to="/contacto" className={navLinkClass}>
                Contacto
              </Link>
              <Link to="/login" className={outlineButtonClass}>
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {isOpen ? (
          <div id="navbarContent" className="mt-4 border-t border-[var(--border)] pt-4 lg:hidden">
            <div className="flex flex-col gap-4">
              <div className="flex w-full">
                <input
                  type="search"
                  className={searchInputClass}
                  placeholder="Buscar emprendimientos, productos..."
                  aria-label="Buscar"
                />
                <button className={accentButtonClass} type="button" aria-label="Buscar">
                  <Search size={20} />
                </button>
              </div>

              <div className="flex flex-col items-start gap-2">
                <Link to="/marketplace" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Marketplace
                </Link>
                <Link to="/contacto" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Contacto
                </Link>
                <Link to="/login" className={outlineButtonClass} onClick={() => setIsOpen(false)}>
                  <LogIn size={18} />
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
