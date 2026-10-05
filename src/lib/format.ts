// Same rules as the web store's src/lib/pricing.ts.
export function formatNaira(amount: number) {
  return "₦" + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function shippingFee(methods: { id: string; fee?: number }[], method: string, subtotal: number, freeThreshold: number) {
  const m = methods.find((d) => d.id === method);
  if (!m) return null;
  if (m.id === "standard" && subtotal >= freeThreshold) return 0;
  return m.fee ?? 0;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
