import { router } from "expo-router";
import { Heart, ShoppingCart } from "lucide-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ProductCard } from "@/components/product";
import { Button, EmptyState } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";
import { useStore } from "@/store/StoreProvider";

export default function WishlistScreen() {
  const { wishlist, addToCart } = useStore();
  const { data, loading } = useFetch(() => (wishlist.length ? api.productsByIds(wishlist).then((r) => r.products) : Promise.resolve([])), [wishlist.join(",")]);
  // Keep only items still in the wishlist so removals disappear instantly.
  const items = (data ?? []).filter((p) => wishlist.includes(p.id));
  const inStock = items.filter((p) => p.stock > 0);

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
      ListHeaderComponent={
        inStock.length > 1 ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Button title={`Add all ${inStock.length} to cart`} icon={ShoppingCart} variant="dark" onPress={() => inStock.forEach((p, i) => addToCart(p, 1, { silent: i < inStock.length - 1 }))} />
          </View>
        ) : null
      }
      ListEmptyComponent={<EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it for later." action={<Button title="Browse products" onPress={() => router.navigate("/shop")} />} />}
    />
  );
}
