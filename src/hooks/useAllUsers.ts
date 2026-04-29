import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/lib/plans";

export interface AdminUser {
  id: string;
  email: string;
  plan: PlanId;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  sites_count: number;
  total_storage_bytes: number;
}

export function useAllUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    try {
      setError(null);
      
      // Fetch all profiles (RLS policy allows admins to read all)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Fetch all sites to calculate storage per user
      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select("*");

      if (sitesError) throw sitesError;

      // Fetch auth metadata from a custom function or table if you have one
      // For now, we'll combine profiles with sites and use profile data
      const combinedUsers: AdminUser[] = (profiles || []).map((profile) => {
        const userSites = sites?.filter((s) => s.user_id === profile.id) || [];
        const totalStorage = userSites.reduce((sum, site) => sum + (site.size_bytes || 0), 0);

        return {
          id: profile.id,
          email: "user@example.com", // TODO: Fetch from auth metadata table
          plan: profile.plan,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_sign_in_at: null, // TODO: Create auth_logs table to track this
          sites_count: userSites.length,
          total_storage_bytes: totalStorage,
        };
      });

      setUsers(combinedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return { users, loading, error, refetch: fetchAllUsers };
}
