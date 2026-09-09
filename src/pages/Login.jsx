import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form);
    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(`Welcome back, ${result.user.name.split(" ")[0]}!`);
    const fallback = result.user.role === "landlord" ? "/my-listings" : "/discover";
    navigate(location.state?.from?.pathname ?? fallback);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="font-display text-display-lg text-primary">PadPair</span>
        </div>
        <header className="mb-8 text-center">
          <h1 className="font-display text-display-lg text-on-surface mb-2">Welcome back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Log in to continue your search.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Email Address</label>
            <div className="relative">
              <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="chidi@example.com"
                className="w-full pl-10 h-12 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Password</label>
            <div className="relative">
              <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-10 h-12 rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-label-lg text-label-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Log In
            <Icon name="arrow_forward" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/30 pt-6">
          <p className="font-body-md text-body-md text-on-surface-variant">
            New to PadPair?{" "}
            <Link to="/onboarding" className="font-label-lg text-label-lg text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
