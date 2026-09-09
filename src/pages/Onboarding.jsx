import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const roles = [
  { value: "tenant", label: "Find a Room", sublabel: "As a Tenant", icon: "home" },
  { value: "landlord", label: "List a Room", sublabel: "As a Landlord", icon: "key" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [role, setRole] = useState("tenant");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = signup({ fullName: form.fullName, email: form.email, password: form.password, role });
    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(`Welcome to PadPair, ${form.fullName.split(" ")[0] || "there"}!`);
    navigate(role === "landlord" ? "/landlord-questionnaire" : "/questionnaire");
  };

  return (
    <main className="min-h-dvh flex flex-col md:flex-row bg-surface">
      <section className="hidden md:flex md:w-1/2 relative bg-surface-dim">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80"
          alt="Cozy apartment lifestyle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 mt-auto p-margin-desktop mb-12 max-w-lg">
          <div className="bg-surface/90 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-verified-green/10 text-verified-green rounded-full font-label-sm text-label-sm mb-4">
              <Icon name="verified" filled size={16} />
              Verified Homes
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Find your space. Find your people.</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              PadPair connects you with verified roommates and secure spaces, making the journey to your next home
              seamless and safe.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-6 md:p-8">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <span className="font-display text-display-lg text-primary">PadPair</span>
          </div>

          <header className="mb-8 text-center md:text-left">
            <h1 className="font-display text-display-lg text-on-surface mb-2">Join PadPair</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Create an account to start your journey.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset>
              <legend className="font-label-lg text-label-lg text-on-surface mb-3">I am looking to...</legend>
              <div className="grid grid-cols-2 gap-4">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3",
                      role === r.value ? "border-primary bg-primary/5 text-primary" : "border-outline-variant hover:border-primary/50"
                    )}
                  >
                    <Icon name={r.icon} filled size={24} />
                    <div>
                      <span className="block font-label-lg text-label-lg text-on-surface">{r.label}</span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">{r.sublabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            </fieldset>

            <TextField label="Full Name" icon="person" value={form.fullName} onChange={update("fullName")} placeholder="Chidi Okeke" />
            <TextField label="Email Address" icon="mail" type="email" value={form.email} onChange={update("email")} placeholder="chidi@example.com" />

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Password</label>
              <div className="relative">
                <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 h-12 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <Icon name={showPassword ? "visibility" : "visibility_off"} />
                </button>
              </div>
              <p className="mt-1 font-label-sm text-[10px] text-on-surface-variant/70">Must be at least 8 characters.</p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary mt-0.5" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                I agree to the <span className="text-primary hover:underline">Terms of Service</span> and{" "}
                <span className="text-primary hover:underline">Privacy Policy</span>.
              </span>
            </label>

            <button
              type="submit"
              className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-label-lg text-label-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Get Started
              <Icon name="arrow_forward" />
            </button>
          </form>

          <div className="mt-8 text-center border-t border-outline-variant/30 pt-6">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{" "}
              <Link to="/login" className="font-label-lg text-label-lg text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function TextField({ label, icon, ...inputProps }) {
  return (
    <div>
      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">{label}</label>
      <div className="relative">
        <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          {...inputProps}
          required
          className="w-full pl-10 h-12 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
