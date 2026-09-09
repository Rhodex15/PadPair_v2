import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * @param {{ allow: string[], children: React.ReactNode }} props
 */
export default function RoleRoute({ allow, children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const permitted = !user || allow.includes(user.role);

  useEffect(() => {
    if (!permitted && user) {
      showToast(
        user.role === "landlord" ? "That page is for tenants — here's your listings dashboard." : "That page is for landlords only.",
        "info"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permitted]);

  if (permitted) return children;

  const home = user.role === "landlord" ? "/my-listings" : "/discover";
  return <Navigate to={home} replace />;
}
