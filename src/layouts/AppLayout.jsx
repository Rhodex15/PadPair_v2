import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import BottomNav from "../components/shared/BottomNav";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();

  // The compatibility questionnaire is mandatory for tenants — nothing else
  // in the app is reachable (including Discover, Messages, Profile) until
  // it's completed. Landlords are exempt since they don't get matched.
  if (user?.role === "tenant" && !user.profileComplete) {
    return <Navigate to="/questionnaire" replace />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-on-surface">
      <Navbar />
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
