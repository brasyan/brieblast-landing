import { useEffect, useState } from "react";
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

export function useSites() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
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
  };

  useEffect(() => {
    fetchSites();
  }, [user?.id]);

  return { sites, loading, error, refetch: fetchSites };
}
