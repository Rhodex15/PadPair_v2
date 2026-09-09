import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import { cn } from "../utils/cn";
import ListingCard from "../components/ListingCard";
import MatchCard from "../components/MatchCard";
import { useListings } from "../context/ListingsContext";
import { useRoommates } from "../context/RoommatesContext";
import { useAuth } from "../context/AuthContext";
import { computeCompatibility, LIFESTYLE_LABELS } from "../utils/compatibility";

export default function Interests() {
  const navigate = useNavigate();
  const { savedListings, savedIds: savedListingIds, toggleSaved: toggleSavedListing } = useListings();
  const { roommates, savedIds: savedRoommateIds, toggleSaved: toggleSavedRoommate } = useRoommates();
  const { user } = useAuth();
  const [tab, setTab] = useState("listings");

  const savedRoommates = useMemo(
    () =>
      roommates
        .filter((r) => savedRoommateIds.includes(r.id))
        .map((r) => ({ ...r, match: computeCompatibility(user?.lifestyle, r.lifestyle) })),
    [roommates, savedRoommateIds, user]
  );

  const tabs = [
    { key: "listings", label: "Saved Listings", count: savedListings.length },
    { key: "roommates", label: "Saved Roommates", count: savedRoommates.length },
  ];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <h1 className="font-display text-display-lg text-on-surface mb-2">My Interests</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6">Everything you've bookmarked, in one place.</p>

      <div className="flex gap-2 border-b border-outline-variant mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-3 font-label-lg text-label-lg border-b-2 -mb-px transition-colors flex items-center gap-2",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
            )}
          >
            {t.label}
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-label-sm text-label-sm",
                tab === t.key ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "listings" &&
        (savedListings.length === 0 ? (
          <EmptyState icon="favorite_border" message="You haven't saved any listings yet." linkTo="/discover" linkLabel="Browse listings" />
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                {...listing}
                price={`₦${listing.price.toLocaleString()}`}
                isSaved={savedListingIds.includes(listing.id)}
                onToggleSave={() => toggleSavedListing(listing.id)}
              />
            ))}
          </div>
        ))}

      {tab === "roommates" &&
        (savedRoommates.length === 0 ? (
          <EmptyState icon="bookmark_border" message="You haven't bookmarked any roommates yet." linkTo="/roommates" linkLabel="Browse roommates" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRoommates.map((match) => (
              <MatchCard
                key={match.id}
                image={match.image}
                name={match.name}
                age={match.age}
                matchScore={match.match.score}
                verified={match.verified}
                bio={match.bio}
                traits={[
                  LIFESTYLE_LABELS.sleepSchedule[match.lifestyle.sleepSchedule],
                  LIFESTYLE_LABELS.cleanliness[match.lifestyle.cleanliness],
                  LIFESTYLE_LABELS.socialLevel[match.lifestyle.socialLevel],
                ]}
                onViewProfile={() => navigate(`/roommates/${match.id}`)}
                onStartChat={() => navigate(`/messages/${match.id}`)}
                isSaved
                onToggleSave={() => toggleSavedRoommate(match.id)}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

function EmptyState({ icon, message, linkTo, linkLabel }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Icon name={icon} size={48} className="text-on-surface-variant" />
      <p className="font-body-lg text-body-lg text-on-surface-variant">{message}</p>
      <Link to={linkTo} className="text-primary font-label-lg text-label-lg hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
