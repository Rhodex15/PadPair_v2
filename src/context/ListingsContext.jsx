import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";
import { seedListings, SEED_VERSION } from "../utils/seedData";

const ListingsContext = createContext(null);

function loadListings() {
  const storedVersion = loadState("listingsSeedVersion", null);
  const stored = loadState("listings", null);

  if (!stored || storedVersion !== SEED_VERSION) {
    // Seed data changed since this browser last loaded — reset to the fresh
    // seed set, but keep anything the user actually created themselves
    // (identifiable by having an ownerId) instead of silently deleting it.
    const userCreated = (stored ?? []).filter((l) => l.ownerId);
    return [...seedListings, ...userCreated];
  }
  return stored;
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState(loadListings);
  const [savedIds, setSavedIds] = useState(() => loadState("savedListingIds", []));

  useEffect(() => {
    saveState("listings", listings);
    saveState("listingsSeedVersion", SEED_VERSION);
  }, [listings]);
  useEffect(() => saveState("savedListingIds", savedIds), [savedIds]);

  const addListing = (listing) => {
    const id =
      listing.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);
    const newListing = { id, verified: false, rating: null, tags: [], ...listing };
    setListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = (id, updates) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteListing = (id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSavedIds((prev) => prev.filter((x) => x !== id));
  };

  const getListing = (id) => listings.find((l) => l.id === id);
  const getListingsByOwner = (ownerId) => listings.filter((l) => l.ownerId === ownerId);

  const toggleSaved = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const savedListings = listings.filter((l) => savedIds.includes(l.id));

  return (
    <ListingsContext.Provider
      value={{
        listings,
        addListing,
        updateListing,
        deleteListing,
        getListing,
        getListingsByOwner,
        savedIds,
        toggleSaved,
        savedListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
}
