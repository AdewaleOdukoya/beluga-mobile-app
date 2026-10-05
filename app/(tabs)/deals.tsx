import { Flame, Tag } from "lucide-react-native";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Countdown, ProductCard } from "@/components/product";
import { EmptyState, Text } from "@/components/ui";
import { api } from "@/lib/api";
import { colors, fonts, radius } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";

export default function DealsScreen() {
  const insets = useSafeAreaInsets();
  const deals = useFetch(() => api.products({ onSale: true, sort: "price-desc", perPage: 100 }).then((r) => r.products), []);

  const header = (
    <View style={{ backgroundColor: colors.brand700, paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Flame size={18} color={colors.amber} fill={colors.amber} />
        <Text weight="bold" style={{ color: colors.lime300, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" }}>
          Ends Sunday midnight
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.display, color: colors.white, fontSize: 30, marginTop: 8 }}>Flash Deals of the Week</Text>
      <Text style={{ color: "rgba(255,255,255,0.78)", marginTop: 6, lineHeight: 20 }}>Limited-time prices on fast-moving cartons. Use code BELUGA10 on orders over ₦50,000.</Text>
      <View style={{ marginTop: 16 }}>
        <Countdown dark />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <FlatList
        data={deals.data ?? []}
        keyExtractor={(p) => p.id}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <>
            <ProductCard product={item} />
            {index === (deals.data?.length ?? 0) - 1 && (deals.data?.length ?? 0) % 2 === 1 && <View style={{ flex: 1 }} />}
          </>
        )}
        refreshControl={<RefreshControl refreshing={deals.refreshing} onRefresh={deals.refetch} tintColor={colors.white} />}
        ListEmptyComponent={
          deals.loading ? (
            <ActivityIndicator color={colors.brand700} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState icon={Tag} title={deals.error ? "Couldn't load deals" : "No deals right now"} text={deals.error ?? "New flash deals drop every week. Check back soon."} />
          )
        }
      />
    </View>
  );
}
