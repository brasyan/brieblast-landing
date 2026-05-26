import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Factor } from "@supabase/supabase-js";

interface MfaStatus {
  loading: boolean;
  error: string | null;
  profileRequires2fa: boolean;
  verifiedFactors: Factor<"totp", "verified">[];
  currentLevel: "aal1" | "aal2" | null;
  needsEnrollment: boolean;
  needsChallenge: boolean;
  refetch: () => Promise<void>;
}

export function useMfaStatus(): MfaStatus {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileRequires2fa, setProfileRequires2fa] = useState(false);
  const [verifiedFactors, setVerifiedFactors] = useState<Factor<"totp", "verified">[]>([]);
  const [currentLevel, setCurrentLevel] = useState<"aal1" | "aal2" | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError(null);
      setProfileRequires2fa(false);
      setVerifiedFactors([]);
      setCurrentLevel(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [{ data: profile, error: profileError }, factorsResult, aalResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("two_factor_required")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);

      if (profileError) {
        setError(profileError.message);
      } else if (factorsResult.error) {
        setError(factorsResult.error.message);
      } else if (aalResult.error) {
        setError(aalResult.error.message);
      } else {
        setProfileRequires2fa(Boolean(profile?.two_factor_required));
        setVerifiedFactors(factorsResult.data.totp);
        setCurrentLevel(aalResult.data.currentLevel);
      }
    } catch (err) {
      // A thrown rejection (network blip, aborted fetch) used to leave
      // loading=true forever and stick ProtectedRoute on "Loading…" until a
      // hard reload. Always surface as an error and release the spinner.
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const hasVerifiedFactor = verifiedFactors.length > 0;

  return {
    loading,
    error,
    profileRequires2fa,
    verifiedFactors,
    currentLevel,
    needsEnrollment: profileRequires2fa && !hasVerifiedFactor,
    needsChallenge: hasVerifiedFactor && currentLevel !== "aal2",
    refetch: fetchStatus,
  };
}
