import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error, refetch } = useProfile();

  if (authLoading || profileLoading) {
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
          <h2 className="font-semibold">Unable to verify admin access</h2>
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

  if (profile?.plan !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
