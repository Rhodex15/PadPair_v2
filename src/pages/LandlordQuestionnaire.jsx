import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PROPERTY_TYPES } from "../utils/seedData";

const contactMethods = ["In-app Chat", "Phone Call", "Email"];

export default function LandlordQuestionnaire() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [landlordType, setLandlordType] = useState(user?.landlordType ?? "individual");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [yearsExperience, setYearsExperience] = useState(user?.yearsExperience ?? "");
  const [propertyTypesManaged, setPropertyTypesManaged] = useState(user?.propertyTypesManaged ?? []);
  const [contactPreference, setContactPreference] = useState(user?.contactPreference ?? "In-app Chat");
  const [description, setDescription] = useState(user?.description ?? "");

  // One-time setup step — no retaking it once complete.
  if (user?.profileComplete) {
    return <Navigate to="/my-listings" replace />;
  }

  const toggleType = (type) => {
    setPropertyTypesManaged((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      showToast("Add a phone number tenants can reach you on", "error");
      return;
    }
    if (landlordType === "agency" && !businessName.trim()) {
      showToast("Add your business or agency name", "error");
      return;
    }
    if (yearsExperience === "" || Number(yearsExperience) < 0) {
      showToast("Enter your years of experience (0 is fine if you're just starting)", "error");
      return;
    }
    if (propertyTypesManaged.length === 0) {
      showToast("Select at least one property type you list", "error");
      return;
    }

    updateProfile({
      phone: phone.trim(),
      landlordType,
      businessName: landlordType === "agency" ? businessName.trim() : "",
      yearsExperience: Number(yearsExperience),
      propertyTypesManaged,
      contactPreference,
      description: description.trim(),
      profileComplete: true,
    });
    showToast("Profile complete — you can start listing properties!");
    navigate("/my-listings");
  };

  return (
    <main className="min-h-dvh bg-surface py-10 md:py-16 px-margin-mobile">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="font-display text-display-lg text-primary">PadPair</span>
        </div>

        <div className="mb-10 text-center">
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Required — one time setup</span>
          <h1 className="font-display text-display-lg text-primary mt-1 mb-2">Set up your landlord profile</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            This is what tenants see when they consider a listing of yours — and how they'll know how to reach you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-5">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Icon name="badge" size={22} className="text-primary" />
              Contact Details
            </h2>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 080 1234 5678"
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Preferred contact method</label>
              <div className="grid grid-cols-3 gap-3">
                {contactMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setContactPreference(method)}
                    className={cn(
                      "px-3 py-3 rounded-xl border-2 font-label-sm text-label-sm transition-all text-center",
                      contactPreference === method
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-5">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Are you an individual landlord or an agency?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "individual", label: "Individual Landlord" },
                { value: "agency", label: "Agency / Company" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLandlordType(opt.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 font-label-lg text-label-lg transition-all text-center",
                    landlordType === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {landlordType === "agency" && (
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Business / Agency Name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Adeola Properties"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Years of experience letting properties</label>
              <input
                type="number"
                min={0}
                max={60}
                required
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g. 5"
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">What kind of properties do you list?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyTypesManaged.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={cn(
                      "px-4 py-3 rounded-xl border-2 font-label-lg text-label-lg transition-all text-center",
                      isSelected ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Tell tenants about yourself</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="e.g. I manage a small portfolio of serviced apartments across Lekki and VI, all with verified 24/7 power backup..."
              className="w-full p-4 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            />
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
