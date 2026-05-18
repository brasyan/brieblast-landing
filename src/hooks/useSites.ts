import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type SiteStatus = "uploaded" | "provisioning" | "live" | "failed" | "scan_failed";

export interface Site {
  id: string;
  user_id: string;
  name: string;
  original_filename: string;
  size_bytes: number;
  status: SiteStatus;
  proxmox_vmid: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  // Populated by the API worker once the site is live. Optional because the
  // columns are added by sql/004 in briehost-api and may not exist yet.
  subdomain?: string | null;
  ip_address?: string | null;
  vmid?: number | null;
}

// Statuses where the worker is still doing something — UI should poll for
// updates until every row is in a terminal state.
const PENDING_STATUSES = new Set<SiteStatus>(["uploaded", "provisioning"]);
const POLL_INTERVAL_MS = 4000;

export function useSites() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track latest sites without re-triggering effects on every update — the
  // polling effect only needs to know whether anything is pending, not the
  // full list contents.
  const sitesRef = useRef<Site[]>([]);
  sitesRef.current = sites;

  const fetchSites = useCallback(async () => {
    if (!user) {
      setSites([]);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error: queryError } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(queryError.message);
    } else {
      setSites((data ?? []) as Site[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchSites();
  }, [fetchSites]);

  // Poll while any site is still uploading/provisioning so the badge flips to
  // "Live" (or "Failed") without the user reloading. Pauses when the tab is
  // hidden and fires once on re-show so we don't burn API calls in background
  // tabs but still catch up quickly.
  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        const hasPending = sitesRef.current.some((s) => PENDING_STATUSES.has(s.status));
        if (hasPending) void fetchSites();
      }, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchSites();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, fetchSites]);

  return { sites, loading, error, refetch: fetchSites };
}
