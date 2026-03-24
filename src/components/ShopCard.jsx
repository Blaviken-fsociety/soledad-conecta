export default function ShopCard({ shop }) {
  return (
    <article className="shop-card" role="listitem">
      <div className="shop-badge">{shop.category}</div>
      <h3>{shop.name}</h3>
      <p className="shop-sector">{shop.sector}</p>
      <p className="shop-description">{shop.description}</p>
      <div className="shop-footer">
        <span>{shop.contact}</span>
        <a href={`#microtienda-${shop.id}`}>Ver espacio</a>
      </div>
    </article>
  );
}
