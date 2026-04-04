import { Link } from 'react-router-dom';

const categoryThemes = {
  Moda: 'shop-card-visual-moda',
  'Salud y Belleza': 'shop-card-visual-salud',
  Alimentos: 'shop-card-visual-alimentos',
  Servicios: 'shop-card-visual-servicios',
  Hogar: 'shop-card-visual-hogar',
  Restaurantes: 'shop-card-visual-restaurantes',
};

export default function ShopCard({ shop }) {
  const categoryName = shop.categoria || shop.category || 'Sin categoria';
  const visualTheme = categoryThemes[categoryName] || 'shop-card-visual-default';

  return (
    <article className="shop-card marketplace-card" role="listitem">
      <div className={`shop-card-visual ${visualTheme}`}>
        {shop.logoImagen ? (
          <img
            src={shop.logoImagen}
            alt={`Logo de ${shop.nombre || shop.name}`}
            className="shop-card-logo-image"
          />
        ) : (
          <>
            <div className="shop-card-orb"></div>
            <div className="shop-card-grid"></div>
          </>
        )}
      </div>
      <div className="shop-card-body">
        <div className="shop-card-meta">
          <div className="shop-badge">{categoryName}</div>
          <span className="shop-sector">{shop.sectorEconomico || shop.sector || 'General'}</span>
        </div>
        <h3>{shop.nombre || shop.name}</h3>
        <p className="shop-description">{shop.descripcion || shop.description}</p>
      </div>
      <div className="shop-footer">
        <span>{shop.whatsapp ? `WhatsApp: ${shop.whatsapp}` : shop.contact || 'Contacto disponible'}</span>
        <div className="shop-footer-actions">
          <Link to={`/microtiendas/${shop.id}`}>Ver espacio</Link>
          {shop.whatsapp ? (
            <a href={`https://wa.me/57${shop.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
