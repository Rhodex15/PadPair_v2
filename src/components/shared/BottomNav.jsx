import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";

const tenantTabs = [
  { to: "/discover", icon: "home", label: "Home" },
  { to: "/roommates", icon: "group", label: "Roommates" },
  { to: "/saved", icon: "favorite", label: "Interests" },
  { to: "/messages", icon: "chat", label: "Messages" },
  { to: "/profile", icon: "person", label: "Profile" },
];

const landlordTabs = [
  { to: "/my-listings", icon: "home_work", label: "Listings" },
  { to: "/create-listing", icon: "add_circle", label: "List New" },
  { to: "/messages", icon: "chat", label: "Messages" },
  { to: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const { user } = useAuth();
  const tabs = user?.role === "landlord" ? landlordTabs : tenantTabs;

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface-charcoal/90 backdrop-blur-lg border-t border-outline-variant/20 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface")
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} filled={isActive} />
                <span className="font-label-sm text-[10px]">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
