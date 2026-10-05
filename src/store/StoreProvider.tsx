import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setAccessToken } from "@/lib/api";
import { isUuid } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import type { CartLine, Catalog, Product } from "@/lib/types";
import { ToastHost, type Toast } from "@/components/ToastHost";

type Store = {
  catalog: Catalog | null;
  catalogError: string | null;
  reloadCatalog: () => Promise<void>;
  supabase: SupabaseClient | null;
  user: User | null;
  authReady: boolean;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  addToCart: (p: Product, qty?: number, opts?: { silent?: boolean }) => void;
  setQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (p: Product) => void;
  inWishlist: (productId: string) => boolean;
  recentlyViewed: string[];
  trackView: (slug: string) => void;
  toast: (message: string, tone?: Toast["tone"], action?: Toast["action"]) => void;
  signOut: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

// Same keys as the web store's localStorage.
const CART_KEY = "bgc.cart.v1";
const WISH_KEY = "bgc.wishlist.v1";
const RECENT_KEY = "bgc.recent.v1";
const CATALOG_KEY = "bgc.catalog.v1";

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
const write = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

const toLine = (p: Product, quantity: number): CartLine => ({
  product_id: p.id,
  slug: p.slug,
  name: p.name,
  unit: p.unit,
  image: p.image,
  price: p.price,
  stock: p.stock,
  quantity,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecent] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const hydrated = useRef(false);
  const syncedFor = useRef<string | null>(null);

  const supabase = useMemo(() => getSupabase(catalog?.supabase), [catalog?.supabase]);

  const reloadCatalog = useCallback(async () => {
    try {
      const fresh = await api.catalog();
      setCatalog(fresh);
      setCatalogError(null);
      write(CATALOG_KEY, fresh);
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "Could not reach the store");
    }
  }, []);

  // Local state first (instant start, works offline), then refresh the catalog from the API.
  useEffect(() => {
    (async () => {
      const [c, w, r, cached] = await Promise.all([
        read<CartLine[]>(CART_KEY, []),
        read<string[]>(WISH_KEY, []),
        read<string[]>(RECENT_KEY, []),
        read<Catalog | null>(CATALOG_KEY, null),
      ]);
      setCart(c);
      setWishlist(w);
      setRecent(r);
      if (cached) setCatalog(cached);
      hydrated.current = true;
      reloadCatalog();
    })();
  }, [reloadCatalog]);

  useEffect(() => {
    if (hydrated.current) write(CART_KEY, cart);
  }, [cart]);
  useEffect(() => {
    if (hydrated.current) write(WISH_KEY, wishlist);
  }, [wishlist]);

  const toast = useCallback<Store["toast"]>((message, tone = "success", action) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // Auth state
  const hasCatalog = catalog !== null;
  useEffect(() => {
    if (!supabase) {
      if (hasCatalog) setAuthReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAccessToken(session?.access_token ?? null);
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, hasCatalog]);

  // On sign-in, merge the guest cart/wishlist with what is saved in the database (same as the web).
  useEffect(() => {
    if (!supabase || !user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;
    (async () => {
      const [{ data: serverCart }, { data: serverWish }] = await Promise.all([
        supabase.from("cart_items").select("quantity, products(*)").eq("user_id", user.id),
        supabase.from("wishlist_items").select("product_id").eq("user_id", user.id),
      ]);

      const local = (await read<CartLine[]>(CART_KEY, [])).filter((l) => isUuid(l.product_id));
      const merged = new Map(local.map((l) => [l.product_id, l]));
      for (const row of (serverCart ?? []) as unknown as { quantity: number; products: Product | null }[]) {
        if (!row.products) continue;
        const existing = merged.get(row.products.id);
        merged.set(row.products.id, toLine(row.products, Math.max(existing?.quantity ?? 0, row.quantity)));
      }
      const mergedCart = [...merged.values()];
      setCart(mergedCart);
      if (mergedCart.length) {
        await supabase.from("cart_items").upsert(mergedCart.map((l) => ({ user_id: user.id, product_id: l.product_id, quantity: l.quantity })));
      }

      const wish = new Set([...(await read<string[]>(WISH_KEY, [])).filter(isUuid), ...(serverWish ?? []).map((w) => w.product_id as string)]);
      setWishlist([...wish]);
      if (wish.size) {
        await supabase.from("wishlist_items").upsert([...wish].map((id) => ({ user_id: user.id, product_id: id })));
      }
    })();
  }, [supabase, user]);

  const persistLine = useCallback(
    (productId: string, quantity: number) => {
      if (!supabase || !user || !isUuid(productId)) return;
      if (quantity > 0) {
        supabase.from("cart_items").upsert({ user_id: user.id, product_id: productId, quantity, updated_at: new Date().toISOString() }).then();
      } else {
        supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId).then();
      }
    },
    [supabase, user],
  );

  const addToCart = useCallback<Store["addToCart"]>(
    (p, qty = 1, opts) => {
      if (p.stock <= 0) {
        toast("This item is out of stock", "error");
        return;
      }
      const existing = cart.find((l) => l.product_id === p.id);
      const nextQty = Math.min(p.stock, (existing?.quantity ?? 0) + qty);
      setCart((c) =>
        c.some((l) => l.product_id === p.id) ? c.map((l) => (l.product_id === p.id ? toLine(p, nextQty) : l)) : [...c, toLine(p, nextQty)],
      );
      persistLine(p.id, nextQty);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (!opts?.silent) toast(`${p.name} added to cart`, "success", { label: "View cart", href: "/cart" });
    },
    [cart, persistLine, toast],
  );

  const setQuantity = useCallback(
    (productId: string, qty: number) => {
      const stock = cart.find((l) => l.product_id === productId)?.stock || qty;
      const next = Math.max(0, Math.min(qty, stock));
      setCart((c) => (next === 0 ? c.filter((l) => l.product_id !== productId) : c.map((l) => (l.product_id === productId ? { ...l, quantity: next } : l))));
      persistLine(productId, next);
      Haptics.selectionAsync().catch(() => {});
    },
    [cart, persistLine],
  );

  const removeFromCart = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (supabase && user) supabase.from("cart_items").delete().eq("user_id", user.id).then();
  }, [supabase, user]);

  const toggleWishlist = useCallback(
    (p: Product) => {
      const has = wishlist.includes(p.id);
      setWishlist((w) => (has ? w.filter((id) => id !== p.id) : [...w, p.id]));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      toast(has ? "Removed from wishlist" : "Saved to wishlist", has ? "info" : "success");
      if (supabase && user && isUuid(p.id)) {
        if (has) supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", p.id).then();
        else supabase.from("wishlist_items").upsert({ user_id: user.id, product_id: p.id }).then();
      }
    },
    [wishlist, supabase, user, toast],
  );

  const trackView = useCallback((slug: string) => {
    setRecent((r) => {
      const next = [slug, ...r.filter((s) => s !== slug)].slice(0, 12);
      write(RECENT_KEY, next);
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    syncedFor.current = null;
    setAccessToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    toast("You have been signed out", "info");
  }, [supabase, toast]);

  const value = useMemo<Store>(
    () => ({
      catalog,
      catalogError,
      reloadCatalog,
      supabase,
      user,
      authReady,
      cart,
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      cartTotal: cart.reduce((n, l) => n + l.quantity * l.price, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      inWishlist: (id) => wishlist.includes(id),
      recentlyViewed,
      trackView,
      toast,
      signOut,
    }),
    [catalog, catalogError, reloadCatalog, supabase, user, authReady, cart, addToCart, setQuantity, removeFromCart, clearCart, wishlist, toggleWishlist, recentlyViewed, trackView, toast, signOut],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
