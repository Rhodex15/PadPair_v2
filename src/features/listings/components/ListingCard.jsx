import { useNavigate } from "react-router-dom";
import Icon from "../../../components/ui/Icon";

/**
 * @param {{ id?: string|number, image: string, title: string, location: string, price: string,
 *   period?: string, rating?: number, verified?: boolean, tags?: string[],
 *   posterName?: string, posterAvatar?: string }} props
 */
export default function ListingCard({
  id,
  image,
  title,
  location,
  price,
  period = "yr",
  rating,
  verified,
  tags = [],
  posterName,
  posterAvatar,
  propertyType,
  bedrooms,
  bathrooms,
  isSaved,
  onToggleSave,
}) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => id && navigate(`/listings/${id}`)}
      className="bg-surface-charcoal rounded-xl overflow-hidden border border-outline-variant hover:border-primary transition-all duration-300 hover:scale-[1.01] group cursor-pointer"
    >
      <div className="relative h-56 w-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {rating && (
          <div className="absolute top-3 left-3 bg-surface-container/80 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 border border-outline-variant">
            <Icon name="star" filled size={16} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-on-surface">{rating}</span>
          </div>
        )}
        <button
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.();
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-error border border-outline-variant transition-colors"
        >
          <Icon name="favorite" filled={isSaved} className={isSaved ? "text-error" : ""} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <Icon name="location_on" size={16} /> {location}
            </p>
            {(propertyType || bedrooms !== undefined) && (
              <div className="flex items-center gap-3 mt-1.5 text-on-surface-variant">
                {propertyType && (
                  <span className="font-label-sm text-label-sm flex items-center gap-1">
                    <Icon name="apartment" size={14} />
                    {propertyType}
                  </span>
                )}
                {bedrooms !== undefined && (
                  <span className="font-label-sm text-label-sm flex items-center gap-1">
                    <Icon name="bed" size={14} />
                    {bedrooms === 0 ? "Studio" : `${bedrooms} bed`}
                  </span>
                )}
                {bathrooms !== undefined && (
                  <span className="font-label-sm text-label-sm flex items-center gap-1">
                    <Icon name="bathtub" size={14} />
                    {bathrooms} bath
                  </span>
                )}
              </div>
            )}
          </div>
          {verified && (
            <div className="flex items-center gap-1 bg-verified-green/10 px-2 py-1 rounded text-verified-green shrink-0">
              <Icon name="verified" size={14} />
              <span className="font-label-sm text-label-sm">Verified</span>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="bg-surface-container-high rounded px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-end mt-2 pt-3 border-t border-outline-variant/30">
          <div>
            <span className="font-headline-md text-headline-md text-primary">{price}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">/{period}</span>
          </div>
          {posterName && (
            <div className="flex items-center gap-2">
              {posterAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                  <img src={posterAvatar} alt={posterName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant">
                  <Icon name="business" size={16} />
                </div>
              )}
              <span className="font-label-sm text-label-sm text-on-surface-variant">{posterName}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
