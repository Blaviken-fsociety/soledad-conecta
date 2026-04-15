import { Link } from 'react-router-dom';

import soledadLogo from '../assets/soledad-logo.png';

export default function BrandLogo({ className = '', imageClassName = '' }) {
  return (
    <Link
      to="/"
      className={`brand-logo-link ${className}`.trim()}
      aria-label="Soledad Conecta"
    >
      <img
        src={soledadLogo}
        alt="Soledad Conecta"
        className={`brand-logo-image ${imageClassName}`.trim()}
      />
    </Link>
  );
}
