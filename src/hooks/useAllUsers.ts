import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/lib/plans";
import type { SiteStatus } from "@/hooks/useSites";

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

export interface AdminSite {
  id: string;
  user_id: string;
  name: string;
  size_bytes: number;
  status: SiteStatus;
  proxmox_vmid: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActivityEvent {
  id: string;
  kind: "profile_created" | "profile_updated" | "site_uploaded" | "site_updated" | "site_failed";
  actor: string;
  summary: string;
  timestamp: string;
}

interface SiteRow {
  id: string;
  user_id: string;
  name: string;
  size_bytes: number;
  status: SiteStatus;
  proxmox_vmid: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  plan: PlanId;
  created_at: string;
  updated_at: string;
}

const SITE_STATUSES: SiteStatus[] = ["live", "provisioning", "uploaded", "failed"];

function getUserLabel(userId: string) {
  return `user-${userId.slice(0, 8)}`;
}

function buildActivity(profiles: ProfileRow[], sites: SiteRow[]) {
  const events: AdminActivityEvent[] = [];

  for (const profile of profiles) {
    const actor = getUserLabel(profile.id);
    events.push({
      id: `profile-created-${profile.id}`,
      kind: "profile_created",
      actor,
      summary: `${actor} profile created`,
      timestamp: profile.created_at,
    });

    if (profile.updated_at !== profile.created_at) {
      events.push({
        id: `profile-updated-${profile.id}-${profile.updated_at}`,
        kind: "profile_updated",
        actor,
        summary: `${actor} profile updated (plan: ${profile.plan.replace("_", " ")})`,
        timestamp: profile.updated_at,
      });
    }
  }

  for (const site of sites) {
    const actor = getUserLabel(site.user_id);
    events.push({
      id: `site-created-${site.id}`,
      kind: "site_uploaded",
      actor,
      summary: `${actor} uploaded site ${site.name}`,
      timestamp: site.created_at,
    });

    if (site.updated_at !== site.created_at) {
      events.push({
        id: `site-updated-${site.id}-${site.updated_at}`,
        kind: site.status === "failed" ? "site_failed" : "site_updated",
        actor,
        summary:
          site.status === "failed"
            ? `${actor} site ${site.name} failed`
            : `${actor} site ${site.name} status is ${site.status}`,
        timestamp: site.updated_at,
      });
    }
  }

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 100);
}

export function useAllUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [activity, setActivity] = useState<AdminActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    try {
      setError(null);

      // Fetch all profiles (RLS policy allows admins to read all)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, plan, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all sites for usage and activity metrics
      const { data: allSites, error: sitesError } = await supabase
        .from("sites")
        .select("id, user_id, name, size_bytes, status, proxmox_vmid, error_message, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (sitesError) throw sitesError;

      const profileRows = (profiles ?? []) as ProfileRow[];
      const siteRows = (allSites ?? []) as SiteRow[];

      const combinedUsers: AdminUser[] = profileRows.map((profile) => {
        const userSites = siteRows.filter((s) => s.user_id === profile.id);
        const totalStorage = userSites.reduce((sum, site) => sum + (site.size_bytes || 0), 0);

        return {
          id: profile.id,
          email: getUserLabel(profile.id),
          plan: profile.plan,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_sign_in_at: null,
          sites_count: userSites.length,
          total_storage_bytes: totalStorage,
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUsers(combinedUsers);
      setSites(siteRows);
      setActivity(buildActivity(profileRows, siteRows));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const updateUserPlan = async (userId: string, plan: PlanId) => {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", userId);

    if (updateError) {
      return { error: updateError.message };
    }

    await fetchAllUsers();
    return { error: null };
  };

  const statusCounts = SITE_STATUSES.reduce((acc, status) => {
    acc[status] = sites.filter((site) => site.status === status).length;
    return acc;
  }, {} as Record<SiteStatus, number>);

  const totalStorageBytes = sites.reduce((sum, site) => sum + (site.size_bytes || 0), 0);
  const proxmoxAttachedSites = sites.filter((site) => site.proxmox_vmid !== null).length;

  return {
    users,
    sites,
    activity,
    loading,
    error,
    statusCounts,
    totalStorageBytes,
    proxmoxAttachedSites,
    updateUserPlan,
    refetch: fetchAllUsers,
  };
}
