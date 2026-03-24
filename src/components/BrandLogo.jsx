import { Link } from 'react-router-dom';

import soledadLogo from '../assets/soledad-logo.png';

export default function BrandLogo() {
  return (
    <Link to="/" className="brand-logo-link" aria-label="Soledad Conecta">
      <img
        src={soledadLogo}
        alt="Soledad Conecta"
        className="brand-logo-image"
      />
    </Link>
  );
}
