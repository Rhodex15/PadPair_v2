import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useListings } from "../context/ListingsContext";
import { useToast } from "../context/ToastContext";

export default function MyListings() {
  const { user } = useAuth();
  const { getListingsByOwner, deleteListing } = useListings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const myListings = getListingsByOwner(user.id);

  const handleDelete = (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This can't be undone.`)) return;
    deleteListing(listing.id);
    showToast("Listing deleted");
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Landlord Dashboard</span>
          <h1 className="font-display text-display-lg text-primary">My Listings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {myListings.length} {myListings.length === 1 ? "property" : "properties"} listed
          </p>
        </div>
        <Link
          to="/create-listing"
          className="flex items-center gap-2 h-12 px-6 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-sunset-orange transition-colors self-start"
        >
          <Icon name="add" size={20} />
          List a New Property
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-surface-container-lowest rounded-xl border border-outline-variant">
          <Icon name="home_work" size={48} className="text-on-surface-variant" />
          <p className="font-body-lg text-body-lg text-on-surface-variant">You haven't listed any properties yet.</p>
          <Link to="/create-listing" className="text-primary font-label-lg text-label-lg hover:underline">
            List your first property
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <img src={listing.image} alt={listing.title} className="w-full sm:w-32 h-32 sm:h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{listing.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <Icon name="location_on" size={16} />
                  {listing.location}
                </p>
                {listing.propertyType && (
                  <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-3 mt-1">
                    <span>{listing.propertyType}</span>
                    <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}</span>
                    <span>{listing.bathrooms} bath</span>
                  </p>
                )}
                <p className="font-label-lg text-label-lg text-primary mt-1">₦{listing.price.toLocaleString()} / yr</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/listings/${listing.id}`)}
                  className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="View listing"
                >
                  <Icon name="visibility" size={20} />
                </button>
                <button
                  onClick={() => navigate(`/listings/${listing.id}/edit`)}
                  className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Edit listing"
                >
                  <Icon name="edit" size={20} />
                </button>
                <button
                  onClick={() => handleDelete(listing)}
                  className="p-2.5 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors"
                  aria-label="Delete listing"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
