import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { LIFESTYLE_LABELS } from "../utils/compatibility";

const genders = ["Female", "Male", "Non-binary", "Prefer not to say"];

const lifestyleQuestions = [
  { key: "cleanliness", title: "How would you describe your cleanliness habits?", options: ["neat", "average", "relaxed"] },
  { key: "sleepSchedule", title: "What's your typical sleep schedule?", options: ["early", "night_owl"] },
  { key: "socialLevel", title: "How social are you at home?", options: ["quiet", "moderate", "social"] },
  { key: "pets", title: "How do you feel about pets in the home?", options: ["friendly", "neutral", "no"] },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [personal, setPersonal] = useState({
    age: user?.age ?? "",
    gender: user?.gender ?? "",
    occupation: user?.occupation ?? "",
    description: user?.description ?? "",
  });
  const [lifestyle, setLifestyle] = useState({
    cleanliness: user?.lifestyle?.cleanliness ?? "neat",
    sleepSchedule: user?.lifestyle?.sleepSchedule ?? "early",
    socialLevel: user?.lifestyle?.socialLevel ?? "quiet",
    smoking: user?.lifestyle?.smoking ?? false,
    pets: user?.lifestyle?.pets ?? "friendly",
  });
  const [budget, setBudget] = useState({ min: user?.budget?.min ?? "", max: user?.budget?.max ?? "" });
  const [moveInDate, setMoveInDate] = useState(user?.moveInDate ?? "");
  const [preferredLocations, setPreferredLocations] = useState(user?.preferredLocations ?? "");

  // This is a one-time setup step — once completed, there's no retaking it
  // here (lifestyle answers can still be edited individually from Profile).
  if (user?.profileComplete) {
    return <Navigate to="/discover" replace />;
  }

  const selectLifestyle = (key, value) => setLifestyle((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const age = Number(personal.age);
    if (!age || age < 18 || age > 100) {
      showToast("Enter a valid age (18 or older)", "error");
      return;
    }
    if (!personal.gender) {
      showToast("Select your gender", "error");
      return;
    }
    if (!personal.occupation.trim()) {
      showToast("Tell us your occupation", "error");
      return;
    }
    if (!budget.min || !budget.max) {
      showToast("Add a budget range", "error");
      return;
    }

    updateProfile({
      age,
      gender: personal.gender,
      occupation: personal.occupation.trim(),
      description: personal.description.trim(),
      lifestyle,
      budget: { min: Number(budget.min) || 0, max: Number(budget.max) || 0 },
      moveInDate,
      preferredLocations,
      profileComplete: true,
    });
    showToast("Profile complete — your matches are now personalized!");
    navigate("/discover");
  };

  return (
    <main className="min-h-dvh bg-surface py-10 md:py-16 px-margin-mobile">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="font-display text-display-lg text-primary">PadPair</span>
        </div>

        <div className="mb-10 text-center">
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Required — one time setup</span>
          <h1 className="font-display text-display-lg text-primary mt-1 mb-2">Complete your profile to continue</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We need a few details before you can browse rooms or roommates — this is what makes your compatibility scores accurate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-5">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Icon name="badge" size={22} className="text-primary" />
              About You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Age</label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  required
                  value={personal.age}
                  onChange={(e) => setPersonal((p) => ({ ...p, age: e.target.value }))}
                  placeholder="24"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Occupation</label>
                <input
                  required
                  value={personal.occupation}
                  onChange={(e) => setPersonal((p) => ({ ...p, occupation: e.target.value }))}
                  placeholder="e.g. Software Engineer"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Gender</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {genders.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPersonal((p) => ({ ...p, gender: g }))}
                    className={cn(
                      "px-3 py-3 rounded-xl border-2 font-label-sm text-label-sm transition-all text-center",
                      personal.gender === g ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Tell potential roommates about yourself</label>
              <textarea
                value={personal.description}
                onChange={(e) => setPersonal((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="e.g. I'm a remote software engineer, early riser, and I love cooking on weekends. Looking for a tidy, respectful roommate..."
                className="w-full p-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {lifestyleQuestions.map((q) => (
            <div key={q.key} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{q.title}</h2>
              <div className={cn("grid gap-3", q.options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
                {q.options.map((option) => {
                  const isSelected = lifestyle[q.key] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectLifestyle(q.key, option)}
                      className={cn(
                        "px-4 py-3 rounded-xl border-2 font-label-lg text-label-lg transition-all text-center",
                        isSelected ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                      )}
                    >
                      {LIFESTYLE_LABELS[q.key][option]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Do you smoke?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[false, true].map((option) => {
                const isSelected = lifestyle.smoking === option;
                return (
                  <button
                    key={String(option)}
                    type="button"
                    onClick={() => selectLifestyle("smoking", option)}
                    className={cn(
                      "px-4 py-3 rounded-xl border-2 font-label-lg text-label-lg transition-all text-center",
                      isSelected ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                    )}
                  >
                    {LIFESTYLE_LABELS.smoking[String(option)]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">What's your budget range?</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Min (₦/year)</label>
                <input
                  type="number"
                  required
                  value={budget.min}
                  onChange={(e) => setBudget((b) => ({ ...b, min: e.target.value }))}
                  placeholder="200000"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Max (₦/year)</label>
                <input
                  type="number"
                  required
                  value={budget.max}
                  onChange={(e) => setBudget((b) => ({ ...b, max: e.target.value }))}
                  placeholder="700000"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Move-in timeline & preferred areas</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Target move-in date</label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Preferred neighborhoods</label>
                <input
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="e.g. Yaba, Lekki, Surulere"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-sunset-orange transition-colors flex items-center justify-center gap-2"
          >
            Complete Profile & Continue
            <Icon name="arrow_forward" size={20} />
          </button>
        </form>
      </div>
    </main>
  );
}
