import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type SiteStatus = "uploaded" | "provisioning" | "live" | "failed";

export interface Site {
  id: string;
  user_id: string;
  name: string;
  original_filename: string;
  size_bytes: number;
  status: SiteStatus;
  proxmox_vmid: number | null;
  url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function useSites() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchSites();

    if (!user) return;

    // Subscribe to real-time changes on the user's own sites so the status
    // badge updates automatically (e.g. provisioning → live) without a
    // manual refresh.
    const channel = supabase
      .channel(`sites:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sites",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSites((prev) =>
              [payload.new as Site, ...prev].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              ),
            );
          } else if (payload.eventType === "UPDATE") {
            setSites((prev) =>
              prev.map((s) =>
                s.id === (payload.new as Site).id ? (payload.new as Site) : s,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setSites((prev) =>
              prev.filter((s) => s.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { sites, loading, error, refetch: fetchSites };
}
