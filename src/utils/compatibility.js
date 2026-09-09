/**
 * Heuristic roommate compatibility scoring — a simple weighted-agreement
 * calculation across five lifestyle dimensions, each contributing to 100%.
 */
const WEIGHTS = {
  cleanliness: 25,
  sleepSchedule: 25,
  socialLevel: 20,
  smoking: 15,
  pets: 15,
};

export function computeCompatibility(a, b) {
  if (!a || !b) return { score: 0, breakdown: [] };

  const breakdown = Object.keys(WEIGHTS).map((key) => {
    const match = a[key] === b[key];
    return { key, match, weight: WEIGHTS[key] };
  });

  const score = Math.round(breakdown.reduce((sum, item) => sum + (item.match ? item.weight : item.weight * 0.3), 0));

  return { score: Math.min(score, 100), breakdown };
}

export const LIFESTYLE_LABELS = {
  cleanliness: { neat: "Very Neat", average: "Average", relaxed: "Relaxed" },
  sleepSchedule: { early: "Early Bird", night_owl: "Night Owl" },
  socialLevel: { quiet: "Quiet & Reserved", moderate: "Moderate", social: "Very Social" },
  smoking: { true: "Smoker", false: "Non-Smoker" },
  pets: { friendly: "Pet Friendly", neutral: "Neutral on Pets", no: "No Pets" },
};
