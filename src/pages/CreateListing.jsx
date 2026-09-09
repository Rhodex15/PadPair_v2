import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { cn } from "../utils/cn";
import { useListings } from "../context/ListingsContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PROPERTY_TYPES, CITIES, AMENITIES } from "../utils/seedData";

const steps = ["Basics", "Details", "Photos", "Review"];
const LEASE_TERMS = ["6 months", "12 months", "24 months"];
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024; // 1.5MB — keeps localStorage usage sane

const PROPERTY_TYPE_ICONS = {
  Apartment: "apartment",
  Studio: "meeting_room",
  Duplex: "villa",
  Room: "bed",
  "Self-Contained": "door_front",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
];

const emptyForm = {
  propertyType: "",
  title: "",
  city: "",
  cityOther: "",
  location: "",
  description: "",
  rent: "",
  bedrooms: "1",
  bathrooms: "1",
  furnished: false,
  sizeSqm: "",
  leaseTerm: "12 months",
  availableFrom: "",
  amenities: [],
  images: [],
};

function generateDescription(form) {
  const bits = [];
  bits.push(`${form.bedrooms === "0" ? "A studio" : `A ${form.bedrooms}-bedroom ${form.propertyType?.toLowerCase() || "property"}`}`);
  if (form.location || form.city) bits.push(`in ${[form.location, form.city === "Other" ? form.cityOther : form.city].filter(Boolean).join(", ")}`);
  let text = bits.join(" ") + ".";
  if (form.furnished) text += " Fully furnished and ready to move in.";
  if (form.amenities.length > 0) text += ` Comes with ${form.amenities.slice(0, 4).join(", ").toLowerCase()}.`;
  text += " Reach out to schedule a viewing.";
  return text;
}

export default function CreateListing() {
  const { id } = useParams();
  const isEditMode = !!id;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const { addListing, updateListing, getListing } = useListings();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      const existing = getListing(id);
      if (existing) {
        const knownCity = CITIES.includes(existing.city);
        setForm({
          propertyType: existing.propertyType ?? "",
          title: existing.title ?? "",
          city: knownCity ? existing.city : "Other",
          cityOther: knownCity ? "" : existing.city ?? "",
          location: existing.location?.split(",")[0]?.trim() ?? existing.location ?? "",
          description: existing.description ?? "",
          rent: String(existing.price ?? ""),
          bedrooms: String(existing.bedrooms ?? "1"),
          bathrooms: String(existing.bathrooms ?? "1"),
          furnished: !!existing.furnished,
          sizeSqm: existing.sizeSqm ? String(existing.sizeSqm) : "",
          leaseTerm: existing.leaseTerm ?? "12 months",
          availableFrom: existing.availableFrom ?? "",
          amenities: existing.amenities ?? [],
          images: existing.images ?? (existing.image ? [existing.image] : []),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggleAmenity = (item) => {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(item) ? f.amenities.filter((a) => a !== item) : [...f.amenities, item] }));
  };

  const handlePhotoFiles = (files) => {
    const list = Array.from(files);
    if (form.images.length + list.length > MAX_PHOTOS) {
      showToast(`You can upload up to ${MAX_PHOTOS} photos`, "error");
    }
    list.slice(0, MAX_PHOTOS - form.images.length).forEach((file) => {
      if (file.size > MAX_PHOTO_BYTES) {
        showToast(`"${file.name}" is too large (max 1.5MB)`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, images: [...f.images, reader.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const isLastStep = step === steps.length - 1;

  const validateStep = () => {
    if (step === 0) {
      if (!form.propertyType) return "Choose a property type";
      if (!form.title.trim()) return "Add a listing title";
      if (!form.city) return "Select a city";
      if (form.city === "Other" && !form.cityOther.trim()) return "Enter the city name";
      if (!form.location.trim()) return "Add the neighborhood or area";
    }
    if (step === 1) {
      if (!form.rent || Number(form.rent) <= 0) return "Add a valid rent amount";
    }
    return null;
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handlePrimaryAction = () => {
    const error = validateStep();
    if (error) {
      showToast(error, "error");
      return;
    }
    if (!isLastStep) {
      setStep((s) => Math.min(steps.length - 1, s + 1));
      return;
    }
    publish();
  };

  const publish = () => {
    const cityFinal = form.city === "Other" ? form.cityOther.trim() : form.city;
    const payload = {
      title: form.title.trim(),
      propertyType: form.propertyType,
      city: cityFinal,
      location: `${form.location.trim()}, ${cityFinal}`,
      description: form.description.trim() || generateDescription(form),
      price: Number(form.rent) || 0,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      furnished: form.furnished,
      sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
      leaseTerm: form.leaseTerm,
      availableFrom: form.availableFrom || undefined,
      amenities: form.amenities,
      tags: form.amenities.slice(0, 3),
      images: form.images,
      image: form.images[0] || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)],
    };

    if (isEditMode) {
      updateListing(id, payload);
      showToast("Listing updated");
      navigate(`/listings/${id}`);
      return;
    }

    const listing = addListing({
      ...payload,
      posterName: user?.name ?? "You",
      posterAvatar: user?.avatar ?? null,
      ownerId: user?.id,
    });
    showToast("Listing published!");
    navigate(`/listings/${listing.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      {/* Progress indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant rounded-full" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-label-lg text-label-lg",
                  i < step && "bg-primary text-on-primary",
                  i === step && "bg-primary text-on-primary ring-4 ring-primary/20",
                  i > step && "bg-surface text-on-surface-variant border border-outline-variant"
                )}
              >
                {i < step ? <Icon name="check" size={16} /> : i + 1}
              </div>
              <span className={cn("mt-2 font-label-sm text-label-sm", i === step ? "text-primary font-bold" : "text-on-surface-variant")}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface mb-2">{isEditMode ? "Edit your listing" : stepHeadline(step)}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">{stepSubtext(step)}</p>
      </div>

      {/* Step 0: Basics */}
      {step === 0 && (
        <div className="flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant">
          <Field label="What kind of space are you listing?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, propertyType: type }))}
                  className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    form.propertyType === type ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                  )}
                >
                  <Icon name={PROPERTY_TYPE_ICONS[type] ?? "home"} size={28} />
                  <span className="font-label-lg text-label-lg">{type}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Listing Title">
            <input
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Sunny 2-Bedroom Apartment in Lekki"
              className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City">
              <select
                value={form.city}
                onChange={update("city")}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">Select a city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </Field>
            {form.city === "Other" ? (
              <Field label="City Name">
                <input
                  value={form.cityOther}
                  onChange={update("cityOther")}
                  placeholder="e.g. Kano"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </Field>
            ) : (
              <Field label="Neighborhood / Area">
                <input
                  value={form.location}
                  onChange={update("location")}
                  placeholder="e.g. Lekki Phase 1"
                  className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </Field>
            )}
          </div>
          {form.city === "Other" && (
            <Field label="Neighborhood / Area">
              <input
                value={form.location}
                onChange={update("location")}
                placeholder="e.g. Nasarawa GRA"
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </Field>
          )}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant">
          <Field label="Description">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Describe the space, amenities, and vibe</span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, description: generateDescription(f) }))}
                className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm hover:text-primary-container transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <Icon name="auto_awesome" size={16} />
                Generate from details
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={5}
              placeholder="Describe the room, amenities, and vibe..."
              className="w-full p-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Annual Rent (₦)">
              <input
                type="number"
                value={form.rent}
                onChange={update("rent")}
                placeholder="0"
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </Field>
            <Field label="Available From">
              <input
                type="date"
                value={form.availableFrom}
                onChange={update("availableFrom")}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms">
              <select
                value={form.bedrooms}
                onChange={update("bedrooms")}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {["0", "1", "2", "3", "4", "5"].map((n) => (
                  <option key={n} value={n}>
                    {n === "0" ? "Studio" : n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bathrooms">
              <select
                value={form.bathrooms}
                onChange={update("bathrooms")}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {["1", "2", "3", "4"].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Size (m²)">
              <input
                type="number"
                value={form.sizeSqm}
                onChange={update("sizeSqm")}
                placeholder="Optional"
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <Field label="Lease Term">
              <select
                value={form.leaseTerm}
                onChange={update("leaseTerm")}
                className="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {LEASE_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-3 h-12 px-4 rounded-lg border border-outline-variant cursor-pointer">
              <input type="checkbox" checked={form.furnished} onChange={(e) => setForm((f) => ({ ...f, furnished: e.target.checked }))} className="rounded text-primary focus:ring-primary" />
              <span className="font-body-md text-body-md text-on-surface">Furnished</span>
            </label>
          </div>

          <Field label="Amenities">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map((item) => {
                const checked = form.amenities.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={() => toggleAmenity(item)} className="rounded text-primary focus:ring-primary border-outline-variant" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{item}</span>
                  </label>
                );
              })}
            </div>
          </Field>
        </div>
      )}

      {/* Step 2: Photos */}
      {step === 2 && (
        <div className="flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Photos</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Upload up to {MAX_PHOTOS} photos (max 1.5MB each). Optional — we'll use a placeholder if you skip this.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {form.images.length < MAX_PHOTOS && (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePhotoFiles(e.dataTransfer.files);
                }}
                className="col-span-2 md:col-span-3 aspect-video rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high hover:border-primary transition-all duration-200 group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="add_photo_alternate" size={32} />
                </div>
                <p className="font-label-lg text-label-lg text-on-surface">Drag & drop photos here</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">or click to browse</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoFiles(e.target.files)} />
              </label>
            )}
            {form.images.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl bg-surface-container border border-outline-variant/50 relative overflow-hidden group">
                <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 w-8 h-8 bg-surface/80 rounded-full flex items-center justify-center text-on-surface hover:bg-error hover:text-on-error transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                >
                  <Icon name="delete" size={18} />
                </button>
                {i === 0 && <div className="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md font-label-sm text-label-sm text-on-surface">Cover</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant">
          <div className="w-full h-56 rounded-xl overflow-hidden bg-surface-container">
            <img
              src={form.images[0] || FALLBACK_IMAGES[0]}
              alt={form.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">{form.title || "Untitled listing"}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <Icon name="location_on" size={16} />
              {form.location}
              {form.location && ", "}
              {form.city === "Other" ? form.cityOther : form.city}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ReviewStat icon={PROPERTY_TYPE_ICONS[form.propertyType] ?? "home"} label={form.propertyType || "—"} />
            <ReviewStat icon="bed" label={form.bedrooms === "0" ? "Studio" : `${form.bedrooms} bed`} />
            <ReviewStat icon="bathtub" label={`${form.bathrooms} bath`} />
            <ReviewStat icon="payments" label={form.rent ? `₦${Number(form.rent).toLocaleString()}/yr` : "—"} />
          </div>
          {form.description && <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{form.description}</p>}
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.amenities.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between items-center pt-6 border-t border-outline-variant">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="h-12 px-6 rounded-lg font-label-lg text-label-lg text-primary border border-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={handlePrimaryAction}
          className="h-12 px-8 rounded-lg font-label-lg text-label-lg bg-sunset-orange text-on-primary hover:opacity-90 transition-opacity shadow-md"
        >
          {isLastStep ? (isEditMode ? "Save Changes" : "Publish Listing") : "Continue"}
        </button>
      </div>
    </div>
  );
}

function stepHeadline(step) {
  return ["Describe your place", "Add the details", "Show it off", "Review & publish"][step];
}
function stepSubtext(step) {
  return [
    "Start with the basics — what it is, and where.",
    "Rent, size, and what's included.",
    "Photos help tenants trust a listing (optional, but it helps).",
    "Double-check everything before it goes live.",
  ][step];
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-label-lg text-label-lg text-on-surface">{label}</label>
      {children}
    </div>
  );
}

function ReviewStat({ icon, label }) {
  return (
    <div className="p-3 rounded-lg bg-surface-container-low flex flex-col items-center gap-1 text-center">
      <Icon name={icon} size={20} className="text-primary" />
      <span className="font-label-sm text-label-sm text-on-surface">{label}</span>
    </div>
  );
}
