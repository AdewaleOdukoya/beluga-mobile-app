import { router, Stack, useLocalSearchParams } from "expo-router";
import { BadgeCheck, Banknote, Building2, ChevronLeft, Heart, MessageSquareText, RotateCcw, Share2, ShoppingCart, Star, Truck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductImage, ProductRail, Stars } from "@/components/product";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button, Divider, EmptyState, Input, SectionHeading, Text } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { discountPercent, formatDate, formatNaira } from "@/lib/format";
import { colors, radius, shadow } from "@/lib/theme";
import type { Product, Review } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { useStore } from "@/store/StoreProvider";

function Reviews({ product, initial }: { product: Product; initial: Review[] }) {
  const { user, toast } = useStore();
  const [reviews, setReviews] = useState(initial);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setReviews(initial), [initial]);

  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const mine = user && reviews.find((r) => r.user_id === user.id);

  const submit = async () => {
    setBusy(true);
    try {
      const { review } = await api.review({ product_id: product.id, rating, comment });
      setReviews((r) => [review, ...r]);
      setComment("");
      toast("Thanks for your review");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not post review", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 24, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 16 }}>
      <Text weight="extrabold" style={{ fontSize: 19 }}>
        Customer reviews
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12 }}>
        <Text weight="extrabold" style={{ fontSize: 42 }}>
          {avg ? avg.toFixed(1) : "-"}
        </Text>
        <View style={{ flex: 1, gap: 3 }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const n = reviews.filter((r) => r.rating === s).length;
            return (
              <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ width: 10, fontSize: 11.5 }}>{s}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.canvas, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${reviews.length ? (n / reviews.length) * 100 : 0}%`, backgroundColor: colors.amber }} />
                </View>
                <Text style={{ width: 18, fontSize: 11.5, color: colors.muted, textAlign: "right" }}>{n}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 4 }}>
        {reviews.length} review{reviews.length === 1 ? "" : "s"}
      </Text>

      <View style={{ marginTop: 16 }}>
        {!user ? (
          <View style={{ backgroundColor: colors.canvas, borderRadius: radius.lg, padding: 14 }}>
            <Text weight="semibold">Bought this product?</Text>
            <Text style={{ color: colors.muted, marginTop: 2, fontSize: 13 }}>Sign in to share your experience with other retailers.</Text>
            <Button title="Sign in to review" variant="dark" size="sm" style={{ marginTop: 12 }} onPress={() => router.push("/login")} />
          </View>
        ) : mine ? (
          <View style={{ backgroundColor: colors.lime50, borderRadius: radius.lg, padding: 14 }}>
            <Text weight="semibold" style={{ color: colors.lime600 }}>
              Thanks, you have reviewed this product.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text weight="bold">Write a review</Text>
            <View style={{ flexDirection: "row", gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel="Rating">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setRating(s)} hitSlop={4} accessibilityLabel={`${s} star${s > 1 ? "s" : ""}`}>
                  <Star size={30} color={rating >= s ? colors.amber : colors.line} fill={rating >= s ? colors.amber : colors.line} />
                </Pressable>
              ))}
            </View>
            <Input value={comment} onChangeText={setComment} multiline maxLength={1000} placeholder="How did this product sell in your shop? How was the quality?" />
            <Button title="Submit review" loading={busy} onPress={submit} />
          </View>
        )}
      </View>

      <Divider style={{ marginTop: 18 }} />
      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="No reviews yet" text="Reviews from verified customers will appear here." />
      ) : (
        reviews.map((r, i) => (
          <View key={r.id} style={{ paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" }}>
                <Text weight="bold" style={{ color: colors.brand700 }}>
                  {r.author_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="semibold">{r.author_name}</Text>
                <Stars value={r.rating} />
              </View>
              <Text style={{ fontSize: 11.5, color: colors.muted }}>{formatDate(r.created_at)}</Text>
            </View>
            {r.comment ? <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20, fontSize: 13.5 }}>{r.comment}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { addToCart, toggleWishlist, inWishlist, trackView, cart } = useStore();
  const [qty, setQty] = useState(1);
  const { data, error, loading } = useFetch(() => api.product(slug), [slug]);

  useEffect(() => {
    if (data) trackView(data.product.slug);
    setQty(1);
  }, [data, trackView]);

  const headerBtn = { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center", ...shadow.card } as const;

  const p = data?.product;
  const saved = p ? inWishlist(p.id) : false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.navigate("/"))} style={headerBtn} accessibilityLabel="Back">
              <ChevronLeft size={22} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () =>
            p ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable onPress={() => Share.share({ message: `${p.name} – ${formatNaira(p.price)}\n${API_URL}/product/${p.slug}` })} style={headerBtn} accessibilityLabel="Share">
                  <Share2 size={18} color={colors.ink} />
                </Pressable>
                <Pressable onPress={() => toggleWishlist(p)} style={headerBtn} accessibilityLabel={saved ? "Remove from wishlist" : "Add to wishlist"}>
                  <Heart size={19} color={saved ? colors.sale : colors.ink} fill={saved ? colors.sale : "transparent"} />
                </Pressable>
              </View>
            ) : null,
        }}
      />

      {loading && !data ? (
        <ActivityIndicator color={colors.brand700} style={{ marginTop: insets.top + 120 }} />
      ) : error || !p ? (
        <View style={{ paddingTop: insets.top + 60 }}>
          <EmptyState icon={ShoppingCart} title="Product not found" text={error ?? undefined} action={<Button title="Back to shop" onPress={() => router.navigate("/shop")} />} />
        </View>
      ) : (
        <ProductBody product={p} reviews={data!.reviews} related={data!.related} />
      )}

      {p && (
        <View style={[{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", gap: 12, alignItems: "center" }, shadow.raised]}>
          {p.stock > 0 ? (
            <>
              <QuantityStepper value={qty} max={Math.max(1, p.stock - (cart.find((l) => l.product_id === p.id)?.quantity ?? 0))} onChange={(n) => setQty(Math.max(1, n))} />
              <Button title={`Add · ${formatNaira(p.price * qty)}`} icon={ShoppingCart} style={{ flex: 1 }} size="lg" onPress={() => addToCart(p, qty)} />
            </>
          ) : (
            <Button title="Out of stock" disabled style={{ flex: 1 }} size="lg" />
          )}
        </View>
      )}
    </View>
  );
}

function ProductBody({ product: p, reviews, related }: { product: Product; reviews: Review[]; related: Product[] }) {
  const insets = useSafeAreaInsets();
  const { catalog } = useStore();
  const category = catalog?.categories.find((c) => c.slug === p.category);
  const off = discountPercent(p.price, p.compare_at_price);
  const standardFee = catalog?.delivery_methods[0]?.fee ?? 2500;
  const threshold = catalog?.free_delivery_threshold ?? 150000;
  const shop = (params: Record<string, string>) => router.navigate({ pathname: "/shop", params });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: colors.white, paddingTop: insets.top + 50, paddingBottom: 12, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl }}>
          <ProductImage src={p.image} style={{ width: "100%", height: 320 }} />
          <View style={{ position: "absolute", left: 16, bottom: 18, flexDirection: "row", gap: 6 }}>
            {off > 0 && (
              <View style={{ backgroundColor: colors.sale, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text weight="bold" style={{ color: colors.white, fontSize: 12 }}>
                  -{off}%
                </Text>
              </View>
            )}
            {p.badge && (
              <View style={{ borderWidth: 1, borderColor: colors.lime500, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text weight="bold" style={{ color: colors.lime600, fontSize: 12 }}>
                  {p.badge}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
          <Pressable onPress={() => shop({ brand: p.brand })}>
            <Text weight="bold" style={{ color: colors.lime600, fontSize: 12.5, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {p.brand}
            </Text>
          </Pressable>
          <Text weight="extrabold" style={{ fontSize: 24, lineHeight: 30, marginTop: 4, letterSpacing: -0.3 }}>
            {p.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {p.rating_count > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Stars value={p.rating} size={14} />
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {p.rating} ({p.rating_count})
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.muted, fontSize: 13 }}>No reviews yet</Text>
            )}
            <Text style={{ color: colors.line }}>|</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              Pack: <Text weight="bold" style={{ fontSize: 13 }}>{p.unit}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
            <Text weight="extrabold" style={{ fontSize: 30, color: colors.sale }}>
              {formatNaira(p.price)}
            </Text>
            {off > 0 && (
              <>
                <Text style={{ fontSize: 16, color: colors.muted, textDecorationLine: "line-through", paddingBottom: 4 }}>{formatNaira(p.compare_at_price!)}</Text>
                <View style={{ backgroundColor: "rgba(214,49,43,0.1)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 }}>
                  <Text weight="bold" style={{ color: colors.sale, fontSize: 12 }}>
                    Save {off}%
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.stock > 0 ? colors.lime500 : colors.sale }} />
            <Text weight="semibold" style={{ color: p.stock > 0 ? colors.lime600 : colors.sale, fontSize: 13.5 }}>
              {p.stock > 20 ? "In stock, ready to ship" : p.stock > 0 ? `Only ${p.stock} left in stock` : "Out of stock"}
            </Text>
          </View>

          {p.description ? <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 14, fontSize: 14.5 }}>{p.description}</Text> : null}

          <View style={{ marginTop: 18, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 14 }}>
            {[
              { icon: Truck, t: `Delivery from ${formatNaira(standardFee)}`, s: `Free over ${formatNaira(threshold)} in Lagos & Ogun` },
              { icon: Banknote, t: "Pay on delivery", s: "Cash, POS or bank transfer" },
              { icon: BadgeCheck, t: "100% genuine", s: `Sourced from ${p.company}` },
              { icon: RotateCcw, t: "Easy returns", s: "Damaged goods replaced on delivery" },
            ].map(({ icon: Icon, t, s }) => (
              <View key={t} style={{ flexDirection: "row", gap: 12 }}>
                <Icon size={20} color={colors.lime600} />
                <View style={{ flex: 1 }}>
                  <Text weight="bold" style={{ fontSize: 13.5 }}>
                    {t}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12.5 }}>{s}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 16, gap: 8 }}>
            {[
              { k: "SKU", v: p.slug.toUpperCase() },
              { k: "Category", v: category?.name ?? p.category, onPress: () => shop({ category: p.category }) },
              { k: "Supplier", v: p.company, onPress: () => shop({ company: p.company }), icon: true },
            ].map((r) => (
              <Pressable key={r.k} onPress={r.onPress} disabled={!r.onPress} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ width: 80, color: colors.muted, fontSize: 13 }}>{r.k}</Text>
                {r.icon && <Building2 size={14} color={colors.muted} style={{ marginTop: 2 }} />}
                <Text weight={r.onPress ? "semibold" : "regular"} style={{ flex: 1, fontSize: 13, color: r.onPress ? colors.brand700 : colors.ink }}>
                  {r.v}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Reviews product={p} initial={reviews} />

        {related.length > 0 && (
          <>
            <SectionHeading title="You May Also Like" onMore={() => shop({ category: p.category })} style={{ marginTop: 28 }} />
            <ProductRail products={related} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
