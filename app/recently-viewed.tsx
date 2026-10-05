import { router } from "expo-router";
import { History } from "lucide-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ProductCard } from "@/components/product";
import { Button, EmptyState } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";
import { useStore } from "@/store/StoreProvider";

export default function RecentlyViewedScreen() {
  const { recentlyViewed } = useStore();
  const { data, loading } = useFetch(() => (recentlyViewed.length ? api.productsBySlugs(recentlyViewed).then((r) => r.products) : Promise.resolve([])), [recentlyViewed.join(",")]);
  const items = data ?? [];

  if (loading && !data) return <ActivityIndicator color={colors.brand700} style={{ marginTop: 60 }} />;

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
      renderItem={({ item, index }) => (
        <>
          <ProductCard product={item} />
          {index === items.length - 1 && items.length % 2 === 1 && <View style={{ flex: 1 }} />}
        </>
      )}
      ListEmptyComponent={<EmptyState icon={History} title="Nothing viewed yet" text="Products you open will show up here." action={<Button title="Start browsing" onPress={() => router.navigate("/shop")} />} />}
    />
  );
}
