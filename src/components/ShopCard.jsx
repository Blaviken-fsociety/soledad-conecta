const categoryThemes = {
  Moda: 'shop-card-visual-moda',
  'Salud y Belleza': 'shop-card-visual-salud',
  Alimentos: 'shop-card-visual-alimentos',
  Servicios: 'shop-card-visual-servicios',
  Hogar: 'shop-card-visual-hogar',
  Restaurantes: 'shop-card-visual-restaurantes',
};

export default function ShopCard({ shop }) {
  const visualTheme = categoryThemes[shop.category] || 'shop-card-visual-default';

  return (
    <article className="shop-card marketplace-card" role="listitem">
      <div className={`shop-card-visual ${visualTheme}`} aria-hidden="true">
        <div className="shop-card-orb"></div>
        <div className="shop-card-grid"></div>
      </div>
      <div className="shop-card-body">
        <div className="shop-card-meta">
          <div className="shop-badge">{shop.category}</div>
          <span className="shop-sector">{shop.sector}</span>
        </div>
        <h3>{shop.name}</h3>
        <p className="shop-description">{shop.description}</p>
      </div>
      <div className="shop-footer">
        <span>{shop.contact}</span>
        <a href={`#microtienda-${shop.id}`}>Ver espacio</a>
      </div>
    </article>
  );
}
