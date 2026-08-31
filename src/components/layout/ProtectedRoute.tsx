import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/database";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
