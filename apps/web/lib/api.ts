import type { Settings } from "@modern-airbnd/contracts";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const server = typeof window === "undefined";
  const base = server
    ? process.env.API_INTERNAL_URL || "http://127.0.0.1:4000"
    : "";
  const response = await fetch(`${base}/api/v1${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
    signal: init?.signal || AbortSignal.timeout(15000),
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.error?.message || "Unable to complete the request.",
      body.error?.details,
    );
  return body.data as T;
}
export const emptySettings: Settings = {
  defaultWhatsappNumber: "",
  supportPhone: "",
  supportEmail: "",
  businessAddress: "",
  operatorName: "",
  aboutText: "",
  privacyText: "",
  termsText: "",
};
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export function queryString(values: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) if (v) p.set(k, v);
  return p.toString();
}
export function cloudImage(url: string, width = 900) {
  return url.includes("/image/upload/")
    ? url.replace(
        "/image/upload/",
        `/image/upload/f_auto,q_auto,w_${width},c_limit/`,
      )
    : url;
}
