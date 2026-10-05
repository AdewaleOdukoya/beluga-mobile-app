import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Award, BadgeCheck, Building2, Flame, Heart, Phone, Search, Tags, Truck, Zap } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { categoryIcon, Countdown, ProductGrid, ProductRail } from "@/components/product";
import { SectionHeading, Text } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { colors, fonts, radius } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";
import { useStore } from "@/store/StoreProvider";

const { width: SCREEN } = Dimensions.get("window");

const slides = [
  {
    image: "/images/hero-aisle.jpg",
    eyebrow: "Wholesale distribution since 2015",
    title: ["Reliable products, ", "delivered timely", " for every need."],
    accent: colors.lime300,
    text: "Stock your supermarket, mini-mart or home with trusted brands at true wholesale prices.",
    cta: { label: "Shop now", href: "/shop" },
  },
  {
    image: "/images/hero-store.jpg",
    eyebrow: "Crown Flour Mill · CHI · Hayat · Bel Impex",
    title: ["Leading brands, ", "one trusted distributor.", ""],
    accent: colors.lime300,
    text: "Flour, pasta, juices, dairy, diapers, tissue and home care, all from one order.",
    cta: { label: "Explore brands", href: "/brands" },
  },
  {
    image: "/images/basket.jpg",
    eyebrow: "Flash deals this week",
    title: ["Save up to ", "10%", " on fast-moving cartons."],
    accent: colors.amber,
    text: "Limited-time prices on best sellers. Use code BELUGA10 on orders over ₦50,000.",
    cta: { label: "See deals", href: "/deals" },
  },
];

const features = [
  { icon: BadgeCheck, title: "Trusted Brands", text: "Authorised distributor" },
  { icon: Tags, title: "Wholesale Prices", text: "Carton & bale pricing" },
  { icon: Zap, title: "Fast Delivery", text: "Own fleet, Ogun & Lagos" },
  { icon: Award, title: "Since 2015", text: "A decade of supply" },
];

const promos = [
  { title: "Juices & Drinks", line: "Chivita, CHI Exotic and more", category: "juices-drinks", image: "/products/chivita-active.jpg", bg: colors.lime50, dark: false, tag: "Deals inside" },
  { title: "Flour for Every Bakery", line: "Mama Gold & Semovita bags", category: "flour-baking", image: "/products/flour-bag.jpg", bg: colors.brand700, dark: true, tag: "Best seller" },
  { title: "Baby Care Essentials", line: "Molfix diapers by the bale", category: "baby-care", image: "/products/molfix.jpg", bg: "#fdf3e7", dark: false, tag: "New stock" },
  { title: "Tissue by the Bale", line: "Rose, Finetex, Softwave, Papia", category: "tissue-paper", image: "/products/tp-stack.jpg", bg: colors.brand50, dark: false, tag: "From ₦12,500" },
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  const w = SCREEN - 32;

  useEffect(() => {
    const t = setInterval(() => {
      setI((x) => {
        const n = (x + 1) % slides.length;
        ref.current?.scrollToIndex({ index: n, animated: true });
        return n;
      });
    }, 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <View>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.image}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / (w + 12)))}
        snapToInterval={w + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        getItemLayout={(_, index) => ({ length: w + 12, offset: (w + 12) * index, index })}
        renderItem={({ item: s }) => (
          <Pressable onPress={() => router.navigate(s.cta.href as never)} style={{ width: w, height: 300, borderRadius: radius.xxl, overflow: "hidden", backgroundColor: colors.brand900 }}>
            <Image source={{ uri: `${API_URL}${s.image}` }} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" transition={300} />
            <LinearGradient colors={["rgba(6,58,60,0.95)", "rgba(8,74,76,0.82)", "rgba(10,92,95,0.25)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, padding: 22, justifyContent: "center" }}>
              <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text weight="semibold" style={{ color: colors.lime300, fontSize: 11.5 }}>
                  {s.eyebrow}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.display, color: colors.white, fontSize: 30, lineHeight: 34, marginTop: 14 }}>
                {s.title[0]}
                <Text style={{ fontFamily: fonts.display, color: s.accent, fontSize: 30 }}>{s.title[1]}</Text>
                {s.title[2]}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 10, lineHeight: 20, fontSize: 13.5 }} numberOfLines={3}>
                {s.text}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.amber, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 16 }}>
                <Text weight="bold" style={{ color: colors.ink }}>
                  {s.cta.label}
                </Text>
                <ArrowRight size={16} color={colors.ink} />
              </View>
            </View>
          </Pressable>
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {slides.map((_, idx) => (
          <View key={idx} style={{ height: 7, width: idx === i ? 24 : 7, borderRadius: 4, backgroundColor: idx === i ? colors.lime500 : colors.line }} />
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { catalog, wishlist, recentlyViewed, reloadCatalog } = useStore();
  const shop = (params: Record<string, string>) => router.navigate({ pathname: "/shop", params });

  const home = useFetch(
    () =>
      Promise.all([
        api.products({ featured: true, perPage: 10 }),
        api.products({ onSale: true, sort: "price-desc", perPage: 6 }),
        api.products({ sort: "newest", perPage: 8 }),
        api.products({ category: "dairy", perPage: 4 }),
      ]).then(([best, deals, latest, dairy]) => ({ best: best.products, deals: deals.products, latest: latest.products, dairy: dairy.products })),
    [],
  );
  const recent = useFetch(() => (recentlyViewed.length ? api.productsBySlugs(recentlyViewed.slice(0, 8)).then((r) => r.products) : Promise.resolve([])), [recentlyViewed.join(",")]);

  const threshold = catalog?.free_delivery_threshold ?? 150000;
  const phone = catalog?.site.phones[0] ?? "+234 802 918 9777";

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={36} />
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Pressable onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`)} style={iconBtn} accessibilityLabel="Call to order">
              <Phone size={19} color={colors.lime600} />
            </Pressable>
            <Pressable onPress={() => router.push("/wishlist")} style={iconBtn} accessibilityLabel={`Wishlist, ${wishlist.length} items`}>
              <Heart size={20} color={colors.brand700} />
              {wishlist.length > 0 && (
                <View style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.sale, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}>
                  <Text weight="bold" style={{ color: colors.white, fontSize: 9.5 }}>
                    {wishlist.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => router.navigate({ pathname: "/shop", params: { focus: "1" } })}
          style={{ marginTop: 10, flexDirection: "row", alignItems: "center", backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: "hidden" }}
        >
          <Text style={{ flex: 1, color: "#98a5a3", paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 }}>Search flour, juice, diapers, tissue…</Text>
          <View style={{ backgroundColor: colors.brand700, alignSelf: "stretch", width: 48, alignItems: "center", justifyContent: "center" }}>
            <Search size={18} color={colors.white} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={home.refreshing}
            onRefresh={() => {
              home.refetch();
              recent.refetch();
              reloadCatalog();
            }}
            tintColor={colors.brand700}
          />
        }
      >
        <HeroCarousel />

        <View style={{ marginHorizontal: 16, marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.lime50, borderRadius: radius.lg, padding: 12 }}>
          <Truck size={20} color={colors.lime600} />
          <Text weight="semibold" style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}>
            Free standard delivery on orders over {formatNaira(threshold)} within Lagos & Ogun.
          </Text>
        </View>

        {/* categories */}
        <SectionHeading eyebrow="Find it fast" title="Shop by Category" onMore={() => shop({})} moreLabel="All" style={{ marginTop: 26 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
          {(catalog?.categories ?? []).map((c) => {
            const Icon = categoryIcon(c.icon);
            return (
              <Pressable key={c.slug} onPress={() => shop({ category: c.slug })} style={{ width: 76, alignItems: "center" }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={27} color={colors.brand700} strokeWidth={1.8} />
                </View>
                <Text weight="bold" numberOfLines={2} style={{ fontSize: 11.5, textAlign: "center", marginTop: 7, lineHeight: 14 }}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* features */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginTop: 24 }}>
          {features.map(({ icon: Icon, title, text }) => (
            <View key={title} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Icon size={26} color={colors.lime500} strokeWidth={1.7} />
              <View>
                <Text weight="bold" style={{ fontSize: 13 }}>
                  {title}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.muted }}>{text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* best sellers */}
        <SectionHeading eyebrow="Top picks for retailers" title="Best-Selling Products" onMore={() => shop({})} style={{ marginTop: 28 }} />
        {home.data ? <ProductRail products={home.data.best} /> : <RailSkeleton />}

        {/* promo tiles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={262} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginTop: 28 }}>
          {promos.map((p) => (
            <Pressable key={p.title} onPress={() => shop({ category: p.category })} style={{ width: 250, height: 170, borderRadius: radius.xl, overflow: "hidden", backgroundColor: p.bg, padding: 16 }}>
              <View style={{ alignSelf: "flex-start", backgroundColor: colors.sale, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text weight="bold" style={{ color: colors.white, fontSize: 10.5 }}>
                  {p.tag}
                </Text>
              </View>
              <Text weight="extrabold" style={{ fontSize: 17, lineHeight: 21, marginTop: 8, maxWidth: "62%", color: p.dark ? colors.white : colors.ink }}>
                {p.title}
              </Text>
              <Text style={{ fontSize: 11.5, marginTop: 3, maxWidth: "58%", color: p.dark ? "rgba(255,255,255,0.75)" : colors.muted }}>{p.line}</Text>
              <View style={{ position: "absolute", right: -18, bottom: -18, width: 124, height: 124, borderRadius: 62, borderWidth: 5, borderColor: "rgba(255,255,255,0.7)", overflow: "hidden", backgroundColor: colors.white }}>
                <Image source={{ uri: `${API_URL}${p.image}` }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* banner */}
        <View style={{ marginHorizontal: 16, marginTop: 28, borderRadius: radius.xxl, overflow: "hidden", backgroundColor: colors.brand700 }}>
          <Image source={{ uri: `${API_URL}/images/basket.jpg` }} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%" }} contentFit="cover" />
          <LinearGradient colors={[colors.brand700, "rgba(10,92,95,0.85)", "rgba(10,92,95,0.2)"]} start={{ x: 0.35, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={{ padding: 22 }}>
            <Text weight="bold" style={{ color: colors.lime300, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" }}>
              For supermarkets & mini-marts
            </Text>
            <Text style={{ fontFamily: fonts.display, color: colors.white, fontSize: 26, lineHeight: 30, marginTop: 8, maxWidth: "80%" }}>Stock your shelves for less, every week.</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, lineHeight: 19, fontSize: 13, maxWidth: "78%" }}>
              New customers get 5% off their first order with code <Text weight="extrabold" style={{ color: colors.white, fontSize: 13 }}>WELCOME5</Text>.
            </Text>
            <Pressable onPress={() => shop({})} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.amber, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 16 }}>
              <Text weight="bold">Start an order</Text>
              <ArrowRight size={16} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        {/* flash deals */}
        {home.data && home.data.deals.length > 0 && (
          <>
            <SectionHeading eyebrow="Ends Sunday midnight" title="Flash Deals of the Week" onMore={() => router.navigate("/deals")} moreLabel="All deals" style={{ marginTop: 28 }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, marginBottom: 14 }}>
              <Flame size={20} color={colors.sale} />
              <Countdown />
            </View>
            <ProductGrid products={home.data.deals} />
          </>
        )}

        {/* distributors */}
        <SectionHeading eyebrow="Core distributors" title="Brands We Proudly Supply" onMore={() => router.push("/brands")} moreLabel="Brands" style={{ marginTop: 28 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={252} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {(catalog?.companies ?? []).map((c) => (
            <Pressable key={c.name} onPress={() => shop({ company: c.name })} style={{ width: 240, borderWidth: 1, borderColor: colors.line, borderRadius: radius.xl, padding: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.brand700, alignItems: "center", justifyContent: "center" }}>
                <Building2 size={22} color={colors.white} strokeWidth={1.7} />
              </View>
              <Text weight="extrabold" style={{ fontSize: 16, marginTop: 12 }}>
                {c.name}
              </Text>
              <Text numberOfLines={3} style={{ fontSize: 12.5, color: colors.muted, marginTop: 6, lineHeight: 18 }}>
                {c.blurb}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {c.brands.map((b) => (
                  <View key={b} style={{ backgroundColor: colors.lime50, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Text weight="semibold" style={{ color: colors.lime600, fontSize: 11 }}>
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* dairy */}
        {home.data && home.data.dairy.length > 0 && (
          <>
            <SectionHeading title="Dairy Favourites" onMore={() => shop({ category: "dairy" })} style={{ marginTop: 28 }} />
            <ProductGrid products={home.data.dairy} />
          </>
        )}

        {/* new arrivals */}
        <SectionHeading eyebrow="Just landed" title="New Arrivals" onMore={() => shop({ sort: "newest" })} style={{ marginTop: 28 }} />
        {home.data ? <ProductRail products={home.data.latest} /> : <RailSkeleton />}

        {recent.data && recent.data.length > 0 && (
          <>
            <SectionHeading eyebrow="Pick up where you left off" title="Recently Viewed" onMore={() => router.push("/recently-viewed")} style={{ marginTop: 28 }} />
            <ProductRail products={recent.data} />
          </>
        )}

        {home.error && (
          <Text style={{ color: colors.sale, textAlign: "center", marginTop: 20, paddingHorizontal: 24 }}>
            {home.error} Pull down to retry.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const iconBtn = { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.canvas, alignItems: "center", justifyContent: "center" } as const;

function RailSkeleton() {
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 168, height: 290, borderRadius: radius.lg, backgroundColor: colors.canvas }} />
      ))}
    </View>
  );
}
