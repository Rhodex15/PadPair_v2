import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import ListingCard from "../components/ListingCard";
import { useListings } from "../context/ListingsContext";
import { PROPERTY_TYPES } from "../utils/seedData";

const bedroomOptions = [
  { label: "Any", value: "" },
  { label: "Studio (0)", value: "0" },
  { label: "1 Bedroom", value: "1" },
  { label: "2 Bedrooms", value: "2" },
  { label: "3+ Bedrooms", value: "3plus" },
];

export default function Discover() {
  const { listings, savedIds, toggleSaved } = useListings();
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([]);
  const [bedrooms, setBedrooms] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);

  const cityOptions = useMemo(() => [...new Set(listings.map((l) => l.city).filter(Boolean))].sort(), [listings]);

  const toggleFromList = (setter) => (value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };
  const toggleCity = toggleFromList(setCities);
  const toggleType = toggleFromList(setTypes);

  const clearFilters = () => {
    setCities([]);
    setTypes([]);
    setBedrooms("");
    setPriceMin("");
    setPriceMax("");
    setVerifiedOnly(false);
    setFurnishedOnly(false);
  };

  const activeFilterCount = cities.length + types.length + (bedrooms ? 1 : 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (verifiedOnly ? 1 : 0) + (furnishedOnly ? 1 : 0);

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const matchesQuery =
        !query || listing.title.toLowerCase().includes(query.toLowerCase()) || listing.location.toLowerCase().includes(query.toLowerCase());
      const matchesCity = cities.length === 0 || cities.includes(listing.city);
      const matchesType = types.length === 0 || types.includes(listing.propertyType);
      const matchesBedrooms =
        !bedrooms ||
        (bedrooms === "3plus" ? (listing.bedrooms ?? 0) >= 3 : (listing.bedrooms ?? 0) === Number(bedrooms));
      const matchesMin = !priceMin || listing.price >= Number(priceMin);
      const matchesMax = !priceMax || listing.price <= Number(priceMax);
      const matchesVerified = !verifiedOnly || listing.verified;
      const matchesFurnished = !furnishedOnly || listing.furnished;

      return matchesQuery && matchesCity && matchesType && matchesBedrooms && matchesMin && matchesMax && matchesVerified && matchesFurnished;
    });
  }, [listings, query, cities, types, bedrooms, priceMin, priceMax, verifiedOnly, furnishedOnly]);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6">
      <div className="relative mb-6">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or location..."
          className="w-full bg-surface-container-high border-none rounded-full py-3 pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
        {/* Sidebar filters */}
        <aside className="hidden md:block md:col-span-3">
          <div className="sticky top-24 bg-surface-container-low rounded-xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-primary">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="font-label-sm text-label-sm text-secondary hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup title="City">
              {cityOptions.map((city) => (
                <Checkbox key={city} label={city} checked={cities.includes(city)} onChange={() => toggleCity(city)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Price Range (₦/yr)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <span className="text-on-surface-variant">–</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </FilterGroup>

            <FilterGroup title="Property Type">
              {PROPERTY_TYPES.map((type) => (
                <Checkbox key={type} label={type} checked={types.includes(type)} onChange={() => toggleType(type)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Bedrooms">
              <div className="flex flex-col gap-2">
                {bedroomOptions.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="bedrooms"
                      checked={bedrooms === opt.value}
                      onChange={() => setBedrooms(opt.value)}
                      className="text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Other">
              <Checkbox label="Verified listings only" checked={verifiedOnly} onChange={() => setVerifiedOnly((v) => !v)} />
              <Checkbox label="Furnished only" checked={furnishedOnly} onChange={() => setFurnishedOnly((v) => !v)} />
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <div className="md:col-span-9">
          <div className="mb-6">
            <h1 className="font-display text-display-lg text-on-surface">Discover Rooms</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Icon name="search_off" size={48} className="text-on-surface-variant" />
              <p className="font-body-lg text-body-lg text-on-surface-variant">No listings match your filters.</p>
              <button onClick={clearFilters} className="text-primary font-label-lg text-label-lg hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  {...listing}
                  price={`₦${listing.price.toLocaleString()}`}
                  isSaved={savedIds.includes(listing.id)}
                  onToggleSave={() => toggleSaved(listing.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-label-lg text-label-lg text-on-surface">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded text-primary focus:ring-primary border-outline-variant" />
      <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">{label}</span>
    </label>
  );
}
