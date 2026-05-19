import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { PlanId } from "@/lib/plans";

interface Profile {
  id: string;
  plan: PlanId;
  two_factor_required: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Try to fetch existing profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data as Profile);
    } else if (error?.code === "PGRST116") {
      // No row found — create one (handles users created before migration)
      const { data: newProfile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, plan: "none", two_factor_required: false })
        .select()
        .single();
      if (newProfile) {
        setProfile(newProfile as Profile);
      } else if (upsertError) {
        setError(upsertError.message);
      }
    } else if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const updatePlan = async (plan: PlanId) => {
    if (!user) return { error: "Not authenticated" };

    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      return { error: error.message };
    }

    setProfile((prev) => prev ? { ...prev, plan } : null);
    return { error: null };
  };

  return { profile, loading, error, updatePlan, refetch: fetchProfile };
}
