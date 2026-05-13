import { supabase } from "@/lib/supabase";

const BASE_URL =
  import.meta.env.VITE_BRIEHOST_API_URL ||
  import.meta.env.VITE_BRIEHOST_URL ||
  import.meta.env.VITE_BRIEHOST_BASE_URL;

const API_KEY =
  import.meta.env.VITE_BRIEHOST_API_KEY ||
  import.meta.env.VITE_API_KEY;

if (!BASE_URL) {
  console.warn(
    "Missing Briehost API URL. Set one of: VITE_BRIEHOST_API_URL, VITE_BRIEHOST_URL, or VITE_BRIEHOST_BASE_URL.",
  );
}

export interface UploadResult {
  siteId: string;
  status: "uploaded" | "provisioning" | "live" | "failed" | "scan_failed";
  reason?: string;
}

export class BriehostApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public reason?: string,
  ) {
    super(message);
    this.name = "BriehostApiError";
  }
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new BriehostApiError("Not authenticated", 401);
  return data.session.access_token;
}

export async function uploadSite(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);

  const token = await getAccessToken();
  const form = new FormData();
  form.append("file", file);

  return await new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/sites/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    if (API_KEY) {
      xhr.setRequestHeader("x-api-key", API_KEY);
    }

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as UploadResult;
          if (result.status === "scan_failed") {
            reject(new BriehostApiError("Scan failed", xhr.status, "scan_failed"));
          } else if (result.status === "failed" && result.reason === "scan_failed") {
            reject(new BriehostApiError("Scan failed", xhr.status, "scan_failed"));
          } else {
            resolve(result);
          }
        } catch {
          reject(new BriehostApiError("Invalid response from server", xhr.status));
        }
      } else {
        let detail = xhr.responseText;
        let reason: string | undefined;
        try {
          const parsed = JSON.parse(xhr.responseText);
          detail = parsed.detail ?? detail;
          reason = parsed.reason;
        } catch {
          // keep raw text
        }
        reject(new BriehostApiError(detail || `Upload failed (${xhr.status})`, xhr.status, reason));
      }
    };

    xhr.onerror = () => reject(new BriehostApiError("Network error", 0));
    xhr.send(form);
  });
}
