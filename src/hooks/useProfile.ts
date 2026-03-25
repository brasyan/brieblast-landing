import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { PlanId } from "@/lib/plans";

interface Profile {
  id: string;
  plan: PlanId;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
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
      const { data: newProfile } = await supabase
        .from("profiles")
        .upsert({ id: user.id, plan: "none" })
        .select()
        .single();
      if (newProfile) {
        setProfile(newProfile as Profile);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const updatePlan = async (plan: PlanId) => {
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user.id);

    if (error) return { error: error.message };

    setProfile((prev) => prev ? { ...prev, plan } : null);
    return { error: null };
  };

  return { profile, loading, updatePlan, refetch: fetchProfile };
}
