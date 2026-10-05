import Constants from "expo-constants";
import type { Catalog, Order, Product, Quote, Review } from "./types";

// The same Next.js API the web store uses.
export const API_URL: string = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "https://beluga-global-concepts.vercel.app";

/** Catalog images are stored as site-relative paths ("/products/x.jpg"); admin uploads are absolute. */
export const imageUrl = (src: string | null | undefined) => (!src ? null : src.startsWith("http") ? src : `${API_URL}${src}`);

export class ApiError extends Error {
  constructor(message: string, public status: number, public data: Record<string, unknown> = {}) {
    super(message);
  }
}

let accessToken: string | null = null;
/** Set by the store when the Supabase session changes, so signed-in calls carry the user. */
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", ...(init.headers as Record<string, string>) };
  if (init.body) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Network error. Please check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Something went wrong", res.status, data);
  return data as T;
}

export type ProductQuery = {
  category?: string;
  brand?: string;
  company?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: string;
  onSale?: boolean;
  featured?: boolean;
  page?: number;
  perPage?: number;
};

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === false) continue;
    p.set(k, v === true ? "1" : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  catalog: () => request<Catalog>("/api/catalog"),
  products: (q: ProductQuery = {}) => request<{ products: Product[]; total: number; pages: number }>(`/api/products${qs(q)}`),
  productsByIds: (ids: string[]) => request<{ products: Product[] }>(`/api/products${qs({ ids: ids.join(",") })}`),
  productsBySlugs: (slugs: string[]) => request<{ products: Product[] }>(`/api/products${qs({ slugs: slugs.join(",") })}`),
  product: (slug: string) => request<{ product: Product; reviews: Review[]; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`),
  quote: (body: { items: { product_id: string; quantity: number }[]; delivery_method: string; coupon?: string }) =>
    request<Quote>("/api/orders/quote", { method: "POST", body: JSON.stringify(body) }),
  placeOrder: (body: Record<string, unknown>) =>
    request<{ id: string; order_number: string; email_sent: boolean }>("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  order: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),
  track: (order_number: string, email: string) =>
    request<{ order: Omit<Order, "id"> }>("/api/orders/track", { method: "POST", body: JSON.stringify({ order_number, email }) }),
  review: (body: { product_id: string; rating: number; comment: string }) =>
    request<{ review: Review }>("/api/reviews", { method: "POST", body: JSON.stringify(body) }),
  contact: (body: Record<string, string>) => request<{ ok: true }>("/api/contact", { method: "POST", body: JSON.stringify(body) }),
  newsletter: (email: string) => request<{ ok: true }>("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
};
