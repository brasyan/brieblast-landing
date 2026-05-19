import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMfaStatus } from "@/hooks/useMfaStatus";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { loading: mfaLoading, error, needsEnrollment, needsChallenge, refetch } = useMfaStatus();

  if (loading || (user && mfaLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <h2 className="font-semibold">Unable to verify account security</h2>
          <p className="mt-1 text-sm text-destructive/90 break-words">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (needsEnrollment) {
    return <Navigate to="/setup-2fa" replace state={{ from: location.pathname }} />;
  }

  if (needsChallenge) {
    return <Navigate to="/verify-2fa" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
