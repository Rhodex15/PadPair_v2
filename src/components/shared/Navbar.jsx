import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const tenantLinks = [
  { to: "/discover", label: "Find a Room" },
  { to: "/roommates", label: "Find a Roommate" },
  { to: "/saved", label: "My Interests" },
];

const landlordLinks = [
  { to: "/my-listings", label: "My Listings" },
  { to: "/create-listing", label: "List a Property" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLandlord = user?.role === "landlord";
  const navLinks = isLandlord ? landlordLinks : tenantLinks;
  const homeLink = isLandlord ? "/my-listings" : "/discover";

  return (
    <header className="bg-surface/70 border-b border-outline-variant/30 backdrop-blur-lg shadow-sm fixed top-0 w-full z-50">
      <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <NavLink to={homeLink} className="text-headline-md font-display font-bold text-primary shrink-0">
          PadPair
        </NavLink>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => cnLink(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Toggle theme" onClick={toggleTheme} className="text-on-surface hover:text-primary transition-colors">
            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} />
          </button>
          <NavLink to="/profile" aria-label="Profile" className="text-on-surface hover:text-primary transition-colors flex items-center gap-2">
            {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" /> : <Icon name="account_circle" />}
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function cnLink(isActive) {
  return [
    "font-label-lg text-label-lg pb-1 transition-colors duration-200 whitespace-nowrap",
    isActive ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary-container",
  ].join(" ");
}
