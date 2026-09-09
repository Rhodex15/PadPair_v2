import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Icon from "../components/Icon";
import InfoPill from "../components/InfoPill";
import { useListings } from "../context/ListingsContext";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessagesContext";
import { useToast } from "../context/ToastContext";
import { assessScamRisk } from "../utils/scamDetection";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, getListing, savedIds, toggleSaved } = useListings();
  const { user } = useAuth();
  const { getOrCreateConversation } = useMessages();
  const { showToast } = useToast();
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [activePhoto, setActivePhoto] = useState(null);

  const listing = getListing(id);
  if (!listing) return <Navigate to="/discover" replace />;

  const heroPhoto = activePhoto ?? listing.image;

  const isSaved = savedIds.includes(listing.id);
  const isOwner = listing.ownerId && listing.ownerId === user?.id;
  const scamRisk = assessScamRisk(listing, listings);

  const handleContact = () => {
    // If this listing was created by a real landlord account, message them
    // directly (they'll see it in their own inbox). Otherwise — for the
    // platform's seed listings, which have no real owner — fall back to a
    // one-way placeholder thread keyed off the listing itself.
    const convo = getOrCreateConversation({
      id: listing.ownerId || listing.id + "-landlord",
      name: listing.posterName ?? "Landlord",
      avatar: listing.posterAvatar,
    });
    navigate(`/messages/${convo.id}`);
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    setShowReport(false);
    setReportReason("");
    showToast("Report submitted. Trust & Safety will review within 2 hours.", "shield");
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 pb-16">
      <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-4">
        <button onClick={() => navigate("/discover")} className="hover:text-primary transition-colors">
          Home
        </button>
        <span className="opacity-40">/</span>
        <span className="text-on-surface font-semibold truncate">{listing.title}</span>
      </nav>

      {scamRisk.risk !== "low" && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${scamRisk.risk === "high" ? "bg-error/10 border-error/30" : "bg-secondary/10 border-secondary/30"}`}>
          <Icon name="warning" size={22} className={scamRisk.risk === "high" ? "text-error" : "text-secondary"} />
          <div>
            <p className={`font-label-lg text-label-lg font-semibold ${scamRisk.risk === "high" ? "text-error" : "text-secondary"}`}>
              {scamRisk.risk === "high" ? "High scam risk detected" : "Exercise caution with this listing"}
            </p>
            <ul className="font-body-sm text-body-sm text-on-surface-variant list-disc list-inside mt-1">
              {scamRisk.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {listing.verified && <InfoPill icon="verified_user" label="Verified Listing" tone="verified" />}
            {listing.tags?.includes("24/7 Power") && <InfoPill icon="electric_bolt" label="24/7 Guaranteed Power" tone="secondary" />}
          </div>
          <h1 className="font-display text-display-lg text-primary">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
            {listing.rating && (
              <div className="flex items-center gap-1 text-on-surface font-semibold">
                <Icon name="star" filled size={18} className="text-sunset-orange" />
                {listing.rating}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Icon name="location_on" size={18} className="text-outline" />
              {listing.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-end">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast("Listing link copied!", "link");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm"
          >
            <Icon name="share" size={18} />
            Share
          </button>
          <button
            onClick={() => toggleSaved(listing.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm"
          >
            <Icon name="favorite" filled={isSaved} size={18} className="text-secondary" />
            {isSaved ? "Interested ✓" : "I'm Interested"}
          </button>
        </div>
      </div>

      <div className="w-full h-[320px] md:h-[420px] rounded-xl overflow-hidden mb-3 bg-surface-container">
        <img src={heroPhoto} alt={listing.title} className="w-full h-full object-cover" />
      </div>
      {listing.images?.length > 1 && (
        <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar">
          {listing.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(src)}
              className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${heroPhoto === src ? "border-primary" : "border-transparent"}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Key property stats */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant flex flex-wrap gap-x-8 gap-y-4">
            {listing.propertyType && (
              <Stat icon="apartment" label="Type" value={listing.propertyType} />
            )}
            <Stat icon="bed" label="Bedrooms" value={listing.bedrooms === 0 ? "Studio" : listing.bedrooms ?? "—"} />
            <Stat icon="bathtub" label="Bathrooms" value={listing.bathrooms ?? "—"} />
            {listing.sizeSqm && <Stat icon="straighten" label="Size" value={`${listing.sizeSqm} m²`} />}
            <Stat icon="chair" label="Furnished" value={listing.furnished ? "Yes" : "No"} />
            {listing.leaseTerm && <Stat icon="event_repeat" label="Lease Term" value={listing.leaseTerm} />}
            {listing.availableFrom && (
              <Stat icon="calendar_today" label="Available From" value={new Date(listing.availableFrom).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">About this Space</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {listing.description || "No description provided yet."}
            </p>
          </div>

          {(listing.amenities?.length > 0 || listing.tags?.length > 0) && (
            <div className="flex flex-col gap-4">
              <h2 className="font-headline-md text-headline-md text-primary font-bold">Amenities & Features</h2>
              <div className="flex flex-wrap gap-2">
                {(listing.amenities?.length > 0 ? listing.amenities : listing.tags).map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="check_circle" size={14} className="text-verified-green" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 w-full">
          <div className="sticky top-24 flex flex-col gap-5 rounded-xl bg-surface-container-lowest p-6 sm:p-7 border border-outline-variant">
            <div>
              <span className="font-display text-display-xl text-primary font-bold">₦{listing.price.toLocaleString()}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant"> / year</span>
            </div>

            {isOwner ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm">
                  <Icon name="home_work" size={18} />
                  This is your listing
                </div>
                <button
                  onClick={() => navigate(`/listings/${listing.id}/edit`)}
                  className="w-full h-12 rounded-lg bg-secondary hover:bg-sunset-orange text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2"
                >
                  <Icon name="edit" size={20} />
                  Edit Listing
                </button>
                <button
                  onClick={() => navigate("/my-listings")}
                  className="w-full h-12 rounded-lg border border-primary text-primary font-label-lg text-label-lg hover:bg-primary/5 flex items-center justify-center gap-2"
                >
                  <Icon name="dashboard" size={20} />
                  Back to My Listings
                </button>
              </div>
            ) : (
              <button
                onClick={handleContact}
                className="w-full h-12 rounded-lg bg-secondary hover:bg-sunset-orange text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2"
              >
                <Icon name="chat" size={20} />
                Contact Landlord / Agent
              </button>
            )}

            {listing.posterName && (
              <div className="pt-4 flex items-center gap-3.5">
                {listing.posterAvatar ? (
                  <img src={listing.posterAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {listing.posterName.split(" ").map((w) => w[0]).join("")}
                  </div>
                )}
                <div>
                  <span className="font-label-lg text-label-lg text-on-surface font-bold block">{listing.posterName}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Listing owner</span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
              <Icon name="verified_user" size={20} className="text-verified-green shrink-0 mt-0.5" />
              <div>
                <span className="font-label-sm text-label-sm font-bold text-on-surface block">PadPair Scam Protection</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant text-[11px] leading-tight">
                  PadPair connects you with landlords but never handles payments. Never send rent, deposits, or fees to anyone before a verified in-person inspection.
                </p>
              </div>
            </div>

            <button onClick={() => setShowReport(true)} className="text-on-surface-variant hover:text-error text-label-sm font-label-sm flex items-center justify-center gap-1">
              <Icon name="flag" size={16} />
              Report this listing if inaccurate
            </button>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">Report this listing</h3>
              <button onClick={() => setShowReport(false)} className="text-on-surface-variant hover:text-primary">
                <Icon name="close" size={20} />
              </button>
            </div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              placeholder="Describe the issue (e.g. asked for payment before inspection, inaccurate photos)..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button onClick={handleReport} className="self-end px-6 py-2.5 rounded-lg bg-error text-on-error font-label-lg text-label-lg">
              Submit Report
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
        <Icon name={icon} size={20} />
      </div>
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
        <span className="font-label-lg text-label-lg text-on-surface font-semibold">{value}</span>
      </div>
    </div>
  );
}
