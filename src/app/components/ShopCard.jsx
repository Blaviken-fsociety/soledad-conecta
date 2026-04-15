import { ExternalLink, Star, User } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function ShopCard({ shop }) {
  return (
    <article className="sc-featured-card">
      <Link to={`/negocio/${shop.id}`} className="sc-featured-card-image-link">
        <div className="sc-featured-card-image-wrap">
          <ImageWithFallback src={shop.image} alt={shop.name} className="sc-featured-card-image" />
          <span className="sc-featured-card-badge">{shop.category}</span>
        </div>
      </Link>

      <div className="sc-featured-card-body">
        <h3>{shop.name}</h3>
        <p>{shop.description}</p>

        <div className="sc-featured-card-rating">
          <div className="sc-featured-card-rating-value">
            <Star size={16} fill="currentColor" />
            <span>{shop.rating.toFixed(1)}</span>
            <small>({shop.reviews})</small>
          </div>
          <Link to={`/negocio/${shop.id}`} className="sc-featured-card-link" aria-label={`Ver ${shop.name}`}>
            <ExternalLink size={18} />
          </Link>
        </div>

        <div className="sc-featured-card-owner">
          <User size={15} />
          <span>{shop.owner}</span>
        </div>
      </div>
    </article>
  );
}
