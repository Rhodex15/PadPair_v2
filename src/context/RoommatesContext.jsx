import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";
import { seedRoommates } from "../utils/seedData";

const RoommatesContext = createContext(null);

export function RoommatesProvider({ children }) {
  const [roommates] = useState(seedRoommates);
  const [savedIds, setSavedIds] = useState(() => loadState("savedRoommateIds", []));

  useEffect(() => saveState("savedRoommateIds", savedIds), [savedIds]);

  const getRoommate = (id) => roommates.find((r) => r.id === id);

  const toggleSaved = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return <RoommatesContext.Provider value={{ roommates, getRoommate, savedIds, toggleSaved }}>{children}</RoommatesContext.Provider>;
}

export function useRoommates() {
  const ctx = useContext(RoommatesContext);
  if (!ctx) throw new Error("useRoommates must be used within RoommatesProvider");
  return ctx;
}
