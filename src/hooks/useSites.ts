import { useEffect, useState } from "react";
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
  error_message: string | null;
  created_at: string;
  updated_at: string;
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
