import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();

  // Both roles have a mandatory one-time profile questionnaire — nothing
  // else in the app is reachable until it's completed.
  if (user?.role === "tenant" && !user.profileComplete) {
    return <Navigate to="/questionnaire" replace />;
  }
  if (user?.role === "landlord" && !user.profileComplete) {
    return <Navigate to="/landlord-questionnaire" replace />;
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
