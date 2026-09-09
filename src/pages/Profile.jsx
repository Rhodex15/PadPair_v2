import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useListings } from "../context/ListingsContext";
import { useToast } from "../context/ToastContext";
import { LIFESTYLE_LABELS } from "../utils/compatibility";
import { PROPERTY_TYPES } from "../utils/seedData";

const lifestyleFields = [
  { key: "cleanliness", icon: "cleaning_services", label: "Cleanliness Routine", options: ["neat", "average", "relaxed"] },
  { key: "sleepSchedule", icon: "bedtime", label: "Sleep Schedule", options: ["early", "night_owl"] },
  { key: "socialLevel", icon: "groups", label: "Social Habits", options: ["quiet", "moderate", "social"] },
  { key: "pets", icon: "pets", label: "Pet Policy", options: ["friendly", "neutral", "no"] },
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { savedListings, getListingsByOwner } = useListings();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user ?? {});

  if (!user) return null;

  const isLandlord = user.role === "landlord";

  const openEdit = () => {
    setForm(user);
    setEditing(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    updateProfile(form);
    setEditing(false);
    showToast("Profile updated");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const togglePropertyType = (type) => {
    setForm((f) => {
      const current = f.propertyTypesManaged ?? [];
      return { ...f, propertyTypesManaged: current.includes(type) ? current.filter((t) => t !== type) : [...current, type] };
    });
  };

  const quickLinks = isLandlord
    ? [
        { icon: "home_work", label: "My Listings", badge: getListingsByOwner(user.id).length || null, to: "/my-listings" },
        { icon: "add_circle", label: "List a New Property", to: "/create-listing" },
        { icon: "forum", label: "Messages", to: "/messages" },
      ]
    : [
        { icon: "favorite", label: "My Interests", badge: savedListings.length || null, to: "/saved" },
        { icon: "forum", label: "Messages", to: "/messages" },
        { icon: "group", label: "Find a Roommate", to: "/roommates" },
      ];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Member Dashboard</span>
          <h1 className="font-display text-display-lg text-primary">Your Personal Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-error/10 text-error font-label-sm text-label-sm hover:bg-error/20 transition-colors self-start"
        >
          <Icon name="logout" size={18} />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 border border-outline-variant flex flex-col items-center text-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover mb-5" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline-lg text-headline-lg font-bold mb-5">
                {user.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <h2 className="font-headline-md text-headline-md text-primary font-bold">{user.name}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{user.email}</p>
            {isLandlord ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                {[user.landlordType === "agency" ? user.businessName || "Agency" : "Individual Landlord", user.phone].filter(Boolean).join(" · ")}
              </p>
            ) : (
              (user.age || user.occupation) && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  {[user.age && `${user.age} yrs`, user.gender, user.occupation].filter(Boolean).join(" · ")}
                </p>
              )
            )}

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={openEdit}
                className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-sunset-orange transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="edit" size={20} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-outline uppercase px-3 py-2">Quick Navigation</span>
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name={link.icon} size={18} />
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface group-hover:text-primary transition-colors">{link.label}</span>
                </div>
                {link.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                    {link.badge}
                  </span>
                ) : (
                  <Icon name="chevron_right" size={18} className="text-outline" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          {user.description && (
            <Section title="About Me" icon="person_outline">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{user.description}</p>
            </Section>
          )}

          {isLandlord ? (
            <Section title="Landlord Details" icon="badge">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatBox label="Account Type" value={user.landlordType === "agency" ? "Agency / Company" : "Individual Landlord"} sub={user.businessName || "—"} />
                <StatBox label="Experience" value={`${user.yearsExperience ?? 0} years`} sub="Letting properties" />
                <StatBox label="Phone" value={user.phone || "Not set"} sub="Contact number" />
                <StatBox label="Preferred Contact" value={user.contactPreference || "In-app Chat"} sub="How tenants should reach you" highlight />
              </div>
              {user.propertyTypesManaged?.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                  <span className="font-label-lg text-label-lg text-primary font-semibold">Property Types Listed</span>
                  <div className="flex flex-wrap gap-2">
                    {user.propertyTypesManaged.map((type) => (
                      <span key={type} className="px-3 py-1 rounded-full bg-primary/5 text-primary font-label-sm text-label-sm font-semibold">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          ) : (
            <>
              <Section title="Lifestyle & Living Preferences" icon="tune">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lifestyleFields.map((field) => (
                    <div key={field.key} className="p-5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary font-semibold font-label-lg text-label-lg">
                        <Icon name={field.icon} size={20} className="text-secondary" />
                        {field.label}
                      </div>
                      <p className="font-headline-sm text-headline-sm text-on-surface">
                        {LIFESTYLE_LABELS[field.key][user.lifestyle?.[field.key]] ?? "Not set"}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Budget & Housing Search" icon="search_insights">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatBox
                    label="Target Budget"
                    value={`₦${(user.budget?.min ?? 0).toLocaleString()} – ₦${(user.budget?.max ?? 0).toLocaleString()}`}
                    sub="Per year"
                    highlight
                  />
                  <StatBox label="Role" value="Tenant" sub="Account type" />
                </div>
              </Section>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={saveEdit} className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">Edit Profile</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-on-surface-variant hover:text-primary">
                <Icon name="close" size={20} />
              </button>
            </div>

            <EditField label="Full Name">
              <input
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </EditField>

            <EditField label="Email">
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </EditField>

            {isLandlord ? (
              <>
                <EditField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </EditField>
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Account Type">
                    <select
                      value={form.landlordType ?? "individual"}
                      onChange={(e) => setForm((f) => ({ ...f, landlordType: e.target.value }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="individual">Individual Landlord</option>
                      <option value="agency">Agency / Company</option>
                    </select>
                  </EditField>
                  <EditField label="Years of Experience">
                    <input
                      type="number"
                      min={0}
                      value={form.yearsExperience ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, yearsExperience: Number(e.target.value) }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </EditField>
                </div>
                {form.landlordType === "agency" && (
                  <EditField label="Business / Agency Name">
                    <input
                      value={form.businessName ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </EditField>
                )}
                <EditField label="Preferred Contact Method">
                  <select
                    value={form.contactPreference ?? "In-app Chat"}
                    onChange={(e) => setForm((f) => ({ ...f, contactPreference: e.target.value }))}
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {["In-app Chat", "Phone Call", "Email"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </EditField>
                <EditField label="Property Types You List">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map((type) => {
                      const checked = (form.propertyTypesManaged ?? []).includes(type);
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={() => togglePropertyType(type)} className="rounded text-primary focus:ring-primary border-outline-variant" />
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </EditField>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Age">
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={form.age ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </EditField>
                  <EditField label="Occupation">
                    <input
                      value={form.occupation ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </EditField>
                </div>
                <EditField label="Gender">
                  <select
                    value={form.gender ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                    className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {["Female", "Male", "Non-binary", "Prefer not to say"].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </EditField>
                {lifestyleFields.map((field) => (
                  <EditField key={field.key} label={field.label}>
                    <select
                      value={form.lifestyle?.[field.key] ?? field.options[0]}
                      onChange={(e) => setForm((f) => ({ ...f, lifestyle: { ...f.lifestyle, [field.key]: e.target.value } }))}
                      className="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {LIFESTYLE_LABELS[field.key][opt]}
                        </option>
                      ))}
                    </select>
                  </EditField>
                ))}
              </>
            )}

            <EditField label="About / Description">
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </EditField>

            <button type="submit" className="mt-2 h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg hover:bg-sunset-orange transition-colors">
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 border border-outline-variant flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
          <Icon name={icon} size={22} />
        </div>
        <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, highlight }) {
  return (
    <div className={`p-4 rounded-xl flex flex-col gap-1 ${highlight ? "bg-secondary/5" : "bg-surface-container-low"}`}>
      <span className={`font-label-sm text-label-sm uppercase font-semibold ${highlight ? "text-secondary" : "text-outline"}`}>{label}</span>
      <span className="font-headline-sm text-headline-sm text-primary font-bold">{value}</span>
      <span className="font-label-sm text-label-sm text-on-surface-variant">{sub}</span>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}
