/**
 * Heuristic scam-risk flagging, used only until the real backend
 * `scamDetection.service.js` (Claude API call) exists. Looks for the most
 * common red flags in Nigerian rental scams: pressure to pay off-platform,
 * "no inspection needed" language, and unverified listings priced far
 * below comparable ones.
 */
const SUSPICIOUS_PHRASES = [
  "western union",
  "wire transfer",
  "no inspection needed",
  "pay before viewing",
  "moneygram",
  "send money to hold",
];

export function assessScamRisk(listing, comparableListings = []) {
  const reasons = [];
  const text = `${listing.title} ${listing.description ?? ""}`.toLowerCase();

  SUSPICIOUS_PHRASES.forEach((phrase) => {
    if (text.includes(phrase)) reasons.push(`Mentions "${phrase}" — never pay before an inspection.`);
  });

  if (!listing.verified) reasons.push("This listing has not completed PadPair verification.");

  const comparablePrices = comparableListings.filter((l) => l.id !== listing.id).map((l) => l.price);
  if (comparablePrices.length >= 2) {
    const avg = comparablePrices.reduce((s, p) => s + p, 0) / comparablePrices.length;
    if (listing.price < avg * 0.4) {
      reasons.push("Price is significantly below similar listings in this area.");
    }
  }

  const risk = reasons.length >= 2 ? "high" : reasons.length === 1 ? "medium" : "low";
  return { risk, reasons };
}
