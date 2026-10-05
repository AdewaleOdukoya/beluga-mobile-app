import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Baby,
  Check,
  CupSoda,
  Flower2,
  Heart,
  Milk,
  Package,
  Plus,
  Scroll,
  SprayCan,
  Star,
  UtensilsCrossed,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { imageUrl } from "@/lib/api";
import { discountPercent, formatNaira } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import type { OrderStatus, Product } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";
import { Text } from "./ui";

export function ProductImage({ src, style, contentFit = "contain" }: { src: string | null; style?: StyleProp<ViewStyle>; contentFit?: "contain" | "cover" }) {
  const uri = imageUrl(src);
  if (!uri) {
    return (
      <View style={[{ backgroundColor: colors.canvas, alignItems: "center", justifyContent: "center" }, style]}>
        <Package size={36} color={colors.brand200} strokeWidth={1.2} />
      </View>
    );
  }
  return <Image source={{ uri }} style={[{ backgroundColor: colors.white }, style] as never} contentFit={contentFit} transition={200} cachePolicy="memory-disk" />;
}

export function Stars({ value, count, size = 12 }: { value: number; count?: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} color={value >= s - 0.25 ? colors.amber : colors.line} fill={value >= s - 0.25 ? colors.amber : colors.line} />
      ))}
      {count !== undefined && <Text style={{ fontSize: size - 1, color: colors.muted, marginLeft: 4 }}>({count})</Text>}
    </View>
  );
}

const iconMap: Record<string, LucideIcon> = { Wheat, UtensilsCrossed, CupSoda, Milk, Baby, SprayCan, Scroll, Flower2 };
export const categoryIcon = (name: string | null): LucideIcon => (name && iconMap[name]) || Package;

export function ProductCard({ product: p, width }: { product: Product; width?: number }) {
  const { addToCart, toggleWishlist, inWishlist, cart } = useStore();
  const off = discountPercent(p.price, p.compare_at_price);
  const saved = inWishlist(p.id);
  const soldOut = p.stock <= 0;
  const inCart = cart.some((l) => l.product_id === p.id);

  return (
    <Pressable
      onPress={() => router.push(`/product/${p.slug}`)}
      style={({ pressed }) => ({
        width,
        flex: width ? undefined : 1,
        backgroundColor: colors.white,
        borderRadius: radius.lg + 2,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 10,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ aspectRatio: 1, borderRadius: radius.md, overflow: "hidden" }}>
        <ProductImage src={p.image} style={{ width: "100%", height: "100%" }} />
        <View style={{ position: "absolute", left: 4, top: 4, gap: 4 }}>
          {off > 0 && (
            <View style={{ backgroundColor: colors.sale, borderRadius: 999, width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <Text weight="bold" style={{ color: colors.white, fontSize: 11 }}>
                -{off}%
              </Text>
            </View>
          )}
          {p.badge && !off ? (
            <View style={{ borderWidth: 1, borderColor: colors.lime500, backgroundColor: colors.white, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text weight="bold" style={{ color: colors.lime600, fontSize: 10 }}>
                {p.badge}
              </Text>
            </View>
          ) : null}
          {soldOut && (
            <View style={{ backgroundColor: colors.ink, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text weight="bold" style={{ color: colors.white, fontSize: 10 }}>
                Sold out
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => toggleWishlist(p)}
          hitSlop={8}
          accessibilityLabel={saved ? "Remove from wishlist" : "Add to wishlist"}
          style={{ position: "absolute", right: 4, top: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}
        >
          <Heart size={15} color={saved ? colors.sale : colors.muted} fill={saved ? colors.sale : "transparent"} />
        </Pressable>
      </View>

      <View style={{ marginTop: 8, flex: 1 }}>
        <Text style={{ fontSize: 10.5, color: colors.muted, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: "hidden" }}>
          {p.brand}
        </Text>
        <Text weight="semibold" numberOfLines={2} style={{ fontSize: 13.5, lineHeight: 18, marginTop: 6, minHeight: 36 }}>
          {p.name}
        </Text>
        <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
          {p.unit}
        </Text>
        <View style={{ height: 16, marginTop: 4 }}>{p.rating_count > 0 && <Stars value={p.rating} count={p.rating_count} size={11} />}</View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            {off > 0 && <Text style={{ fontSize: 11.5, color: colors.muted, textDecorationLine: "line-through" }}>{formatNaira(p.compare_at_price!)}</Text>}
            <Text weight="extrabold" style={{ fontSize: 15.5, color: colors.sale }}>
              {formatNaira(p.price)}
            </Text>
          </View>
          <Pressable
            onPress={() => addToCart(p)}
            disabled={soldOut}
            hitSlop={6}
            accessibilityLabel={soldOut ? "Out of stock" : "Add to cart"}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: soldOut ? colors.line : inCart ? colors.brand700 : colors.lime500,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            {soldOut ? <X size={18} color={colors.muted} /> : inCart ? <Check size={18} color={colors.white} strokeWidth={3} /> : <Plus size={20} color={colors.white} strokeWidth={2.6} />}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

/** Horizontal, swipeable product row (the web's ProductCarousel). */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <FlatList
      horizontal
      data={products}
      keyExtractor={(p) => p.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      renderItem={({ item }) => <ProductCard product={item} width={168} />}
      snapToInterval={180}
      decelerationRate="fast"
    />
  );
}

/** Two-column grid built from rows so it can sit inside a ScrollView. */
export function ProductGrid({ products }: { products: Product[] }) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      {rows.map((r) => (
        <View key={r[0].id} style={{ flexDirection: "row", gap: 12 }}>
          <ProductCard product={r[0]} />
          {r[1] ? <ProductCard product={r[1]} /> : <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

// Counts down to the end of the current week (Sunday 23:59 Lagos time, UTC+1); deals reset weekly.
function endOfWeek() {
  const now = Date.now();
  const lagos = new Date(now + 60 * 60 * 1000);
  const end = new Date(lagos);
  end.setUTCDate(lagos.getUTCDate() + ((7 - lagos.getUTCDay()) % 7));
  end.setUTCHours(23, 59, 59, 999);
  return end.getTime() - 60 * 60 * 1000;
}

export function Countdown({ dark = false }: { dark?: boolean }) {
  const [left, setLeft] = useState(() => Math.max(0, endOfWeek() - Date.now()));
  useEffect(() => {
    const target = endOfWeek();
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: "Days" },
    { v: Math.floor((s % 86400) / 3600), l: "Hrs" },
    { v: Math.floor((s % 3600) / 60), l: "Min" },
    { v: s % 60, l: "Sec" },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 8 }} accessibilityLabel="Time left on deals">
      {parts.map((p) => (
        <View key={p.l} style={{ minWidth: 54, borderRadius: 10, paddingVertical: 6, alignItems: "center", backgroundColor: dark ? "rgba(255,255,255,0.12)" : colors.brand700 }}>
          <Text weight="extrabold" style={{ color: colors.white, fontSize: 18, fontVariant: ["tabular-nums"] }}>
            {String(p.v).padStart(2, "0")}
          </Text>
          <Text weight="semibold" style={{ color: "rgba(255,255,255,0.75)", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase" }}>
            {p.l}
          </Text>
        </View>
      ))}
    </View>
  );
}

const statusStyles: Record<OrderStatus, { bg: string; fg: string }> = {
  pending: { bg: "rgba(245,166,35,0.15)", fg: "#9a5b00" },
  confirmed: { bg: colors.brand50, fg: colors.brand700 },
  processing: { bg: "#e8f0fe", fg: "#1a56c4" },
  shipped: { bg: "#f1e8fb", fg: colors.berry500 },
  delivered: { bg: colors.lime100, fg: colors.lime600 },
  cancelled: { bg: "rgba(214,49,43,0.1)", fg: colors.sale },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = statusStyles[status] ?? statusStyles.pending;
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
      <Text weight="bold" style={{ color: s.fg, fontSize: 11.5, textTransform: "capitalize" }}>
        {status}
      </Text>
    </View>
  );
}

export const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(214,49,43,0.06)", borderRadius: radius.lg, padding: 14 }}>
        <X size={16} color={colors.sale} />
        <Text weight="semibold" style={{ color: colors.sale }}>
          This order was cancelled.
        </Text>
      </View>
    );
  }
  const current = STATUS_FLOW.indexOf(status);
  return (
    <View style={{ flexDirection: "row" }}>
      {STATUS_FLOW.map((s, i) => {
        const done = i <= current;
        return (
          <View key={s} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
              {i > 0 && <View style={{ position: "absolute", right: "50%", width: "100%", height: 4, backgroundColor: i <= current ? colors.lime500 : colors.line }} />}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: done ? colors.lime500 : colors.line,
                  backgroundColor: done ? colors.lime500 : colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {done ? <Check size={15} color={colors.white} strokeWidth={3} /> : <Text weight="bold" style={{ fontSize: 11, color: colors.muted }}>{i + 1}</Text>}
              </View>
            </View>
            <Text weight="bold" style={{ fontSize: 10.5, marginTop: 6, textTransform: "capitalize", color: done ? colors.ink : colors.muted }}>
              {s}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
