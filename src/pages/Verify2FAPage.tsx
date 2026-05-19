import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMfaStatus } from "@/hooks/useMfaStatus";
import { supabase } from "@/lib/supabase";

export default function Verify2FAPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error: statusError, verifiedFactors, needsEnrollment, needsChallenge, refetch } = useMfaStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const from = typeof location.state?.from === "string" ? location.state.from : "/dashboard";

  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const factorId = verifiedFactors[0]?.id ?? null;

  useEffect(() => {
    if (!factorId || challengeId) return;

    let isMounted = true;

    const createChallenge = async () => {
      setError(null);
      const { data, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

      if (!isMounted) return;

      if (challengeError) {
        setError(challengeError.message);
      } else {
        setChallengeId(data.id);
      }
    };

    void createChallenge();

    return () => {
      isMounted = false;
    };
  }, [factorId, challengeId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsEnrollment) {
    return <Navigate to="/setup-2fa" replace state={{ from }} />;
  }

  if (!needsChallenge) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!factorId || !challengeId) {
      setError("Your verification challenge is still loading.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setChallengeId(null);
      setCode("");
    } else {
      await refetch();
      navigate(from, { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <span className="font-bold text-3xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Two-factor verification</h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Enter the 6-digit code from your authenticator app.
          </p>

          {(statusError || error) && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
              {statusError ?? error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1.5">
                Verification code
              </label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-[0.4em] text-center"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6 || !challengeId}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
