import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MatchCard from "../components/MatchCard";
import { useRoommates } from "../context/RoommatesContext";
import { useAuth } from "../context/AuthContext";
import { computeCompatibility, LIFESTYLE_LABELS } from "../utils/compatibility";

const filterGroups = [
  { title: "Cleanliness", key: "cleanliness", type: "radio", options: [
    { label: "Neat Freak", value: "neat" },
    { label: "Average", value: "average" },
    { label: "Relaxed", value: "relaxed" },
  ] },
  { title: "Sleep Schedule", key: "sleepSchedule", type: "checkbox", options: [
    { label: "Early Bird", value: "early" },
    { label: "Night Owl", value: "night_owl" },
  ] },
  { title: "Social Vibe", key: "socialLevel", type: "checkbox", options: [
    { label: "Quiet & Reserved", value: "quiet" },
    { label: "Moderate", value: "moderate" },
    { label: "Very Social", value: "social" },
  ] },
];

export default function RoommateMatching() {
  const navigate = useNavigate();
  const { roommates, savedIds, toggleSaved } = useRoommates();
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState({});

  const toggleFilter = (groupKey, value, isRadio) => {
    setActiveFilters((prev) => {
      const current = prev[groupKey] ?? [];
      if (isRadio) {
        return { ...prev, [groupKey]: current[0] === value ? [] : [value] };
      }
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [groupKey]: next };
    });
  };

  const scored = useMemo(() => {
    return roommates
      .filter((r) => {
        return Object.entries(activeFilters).every(([key, values]) => {
          if (!values || values.length === 0) return true;
          return values.includes(r.lifestyle[key]);
        });
      })
      .map((r) => ({ ...r, match: computeCompatibility(user?.lifestyle, r.lifestyle) }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [roommates, activeFilters, user]);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <aside className="hidden md:block md:col-span-3">
        <div className="sticky top-24 bg-surface-container-low rounded-xl p-6 flex flex-col gap-8">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Filters</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Adjust to find your perfect match.</p>
          </div>
          {filterGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="font-label-lg text-label-lg text-on-surface">{group.title}</h3>
              <div className="flex flex-col gap-2">
                {group.options.map((option) => {
                  const isRadio = group.type === "radio";
                  const checked = (activeFilters[group.key] ?? []).includes(option.value);
                  return (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type={group.type}
                        name={group.title}
                        checked={checked}
                        onChange={() => toggleFilter(group.key, option.value, isRadio)}
                        className="text-primary focus:ring-primary border-outline-variant"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="col-span-1 md:col-span-9">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-display text-display-lg text-on-surface mb-2">Recommended Matches</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {scored.length} {scored.length === 1 ? "match" : "matches"}, ranked by compatibility with your profile.
            </p>
          </div>
        </div>

        {scored.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant py-12 text-center">No roommates match these filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scored.map((match) => (
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
                isSaved={savedIds.includes(match.id)}
                onToggleSave={() => toggleSaved(match.id)}
                onViewProfile={() => navigate(`/roommates/${match.id}`)}
                onStartChat={() => navigate(`/messages/${match.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
