import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/lib/auth";
import { getToken, type UserRole } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading, token } = useAuth();
  const location = useLocation();
  const hasToken = Boolean(token || getToken());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF] text-gray-600">
        Loading…
      </div>
    );
  }

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user?.role && user.role !== role) {
    const home =
      user.role === "admin"
        ? "/admin"
        : user.role === "student"
          ? "/student"
          : "/teacher";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
