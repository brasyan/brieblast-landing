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
  suggestedSubdomain?: string;
}

export interface ProvisionResult {
  siteId: string;
  status: "uploaded" | "provisioning" | "live" | "failed" | "scan_failed";
  subdomain: string;
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

export async function uploadSiteFromRepo(
  repoUrl: string,
  branch?: string,
): Promise<UploadResult> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const body: { repoUrl: string; branch?: string } = { repoUrl };
  if (branch && branch.trim()) body.branch = branch.trim();

  const resp = await fetch(`${BASE_URL}/api/sites/upload-repo`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    let detail = await resp.text();
    let reason: string | undefined;
    try {
      const parsed = JSON.parse(detail);
      detail = parsed.detail ?? detail;
      reason = parsed.reason;
    } catch {
      // keep raw text
    }
    throw new BriehostApiError(
      detail || `Repo import failed (${resp.status})`,
      resp.status,
      reason,
    );
  }

  return (await resp.json()) as UploadResult;
}

export async function provisionSite(
  siteId: string,
  subdomain: string,
): Promise<ProvisionResult> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const resp = await fetch(`${BASE_URL}/api/sites/${siteId}/provision`, {
    method: "POST",
    headers,
    body: JSON.stringify({ subdomain }),
  });

  if (!resp.ok) {
    let detail = await resp.text();
    let reason: string | undefined;
    try {
      const parsed = JSON.parse(detail);
      detail = parsed.detail ?? detail;
      reason = parsed.reason;
    } catch {
      // keep raw text
    }
    throw new BriehostApiError(detail || `Provision failed (${resp.status})`, resp.status, reason);
  }

  return (await resp.json()) as ProvisionResult;
}

// --- Payments ---------------------------------------------------------------
//
// All providers (Stripe / PayPal / CoinGate / skip) share the same dispatch
// endpoint. createPaymentIntent returns a checkout URL the caller redirects to;
// getPaymentIntent is polled on the return page until status leaves 'pending'.
// See briehost-api/docs/PAYMENTS.md for the architecture.

export type PaymentProvider = "stripe" | "paypal" | "coingate" | "skip";
export type PaymentStatusValue = "pending" | "succeeded" | "failed" | "cancelled";

export interface CreatePaymentIntentResult {
  intentId: string;
  checkoutUrl: string;
  provider: PaymentProvider;
}

export interface PaymentIntent {
  id: string;
  plan_id: string;
  provider: PaymentProvider;
  status: PaymentStatusValue;
  amount_cents: number;
  currency: string;
  created_at: string;
}

export async function createPaymentIntent(
  planId: string,
  provider: PaymentProvider,
): Promise<CreatePaymentIntentResult> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const resp = await fetch(`${BASE_URL}/api/payments/intents`, {
    method: "POST",
    headers,
    body: JSON.stringify({ planId, provider }),
  });

  if (!resp.ok) {
    let detail = await resp.text();
    try {
      detail = JSON.parse(detail).detail ?? detail;
    } catch {
      // keep raw text
    }
    throw new BriehostApiError(
      detail || `Create payment intent failed (${resp.status})`,
      resp.status,
    );
  }
  return (await resp.json()) as CreatePaymentIntentResult;
}

export async function getPaymentIntent(intentId: string): Promise<PaymentIntent> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const resp = await fetch(`${BASE_URL}/api/payments/intents/${intentId}`, {
    headers,
  });
  if (!resp.ok) {
    throw new BriehostApiError(
      `Get payment intent failed (${resp.status})`,
      resp.status,
    );
  }
  return (await resp.json()) as PaymentIntent;
}

export async function skipPayment(planId: string): Promise<{ plan: string; intentId: string }> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const resp = await fetch(`${BASE_URL}/api/payments/skip`, {
    method: "POST",
    headers,
    body: JSON.stringify({ planId }),
  });
  if (!resp.ok) {
    let detail = await resp.text();
    try {
      detail = JSON.parse(detail).detail ?? detail;
    } catch {
      // keep raw text
    }
    throw new BriehostApiError(detail || `Skip failed (${resp.status})`, resp.status);
  }
  return (await resp.json()) as { plan: string; intentId: string };
}

export async function deleteSite(siteId: string): Promise<void> {
  if (!BASE_URL) throw new BriehostApiError("API URL not configured", 0);
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const resp = await fetch(`${BASE_URL}/api/sites/${siteId}`, {
    method: "DELETE",
    headers,
  });
  if (!resp.ok && resp.status !== 404) {
    throw new BriehostApiError(`Delete failed (${resp.status})`, resp.status);
  }
}
