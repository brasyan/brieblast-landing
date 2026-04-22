import { supabase } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_BRIEHOST_API_URL;

if (!BASE_URL) {
  console.warn("Missing VITE_BRIEHOST_API_URL. Site uploads will fail until it is set.");
}

export interface UploadResult {
  siteId: string;
  status: "uploaded" | "provisioning" | "live" | "failed";
}

export class BriehostApiError extends Error {
  constructor(message: string, public status: number) {
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

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResult);
        } catch {
          reject(new BriehostApiError("Invalid response from server", xhr.status));
        }
      } else {
        let detail = xhr.responseText;
        try {
          detail = JSON.parse(xhr.responseText).detail ?? detail;
        } catch {
          // keep raw text
        }
        reject(new BriehostApiError(detail || `Upload failed (${xhr.status})`, xhr.status));
      }
    };

    xhr.onerror = () => reject(new BriehostApiError("Network error", 0));
    xhr.send(form);
  });
}
