import { router } from "expo-router";
import { Lock, ShoppingBag, Trash2, Truck } from "lucide-react-native";
import { Alert, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductImage } from "@/components/product";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button, EmptyState, Text } from "@/components/ui";
import { formatNaira } from "@/lib/format";
import { colors, radius, shadow } from "@/lib/theme";
import type { CartLine } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";

function Line({ line }: { line: CartLine }) {
  const { setQuantity, removeFromCart } = useStore();
  return (
    <View style={{ flexDirection: "row", gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 12 }}>
      <Pressable onPress={() => router.push(`/product/${line.slug}`)}>
        <ProductImage src={line.image} style={{ width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderColor: colors.line }} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Text weight="semibold" numberOfLines={2} style={{ flex: 1, fontSize: 14, lineHeight: 19 }}>
            {line.name}
          </Text>
          <Pressable onPress={() => removeFromCart(line.product_id)} hitSlop={10} accessibilityLabel={`Remove ${line.name}`}>
            <Trash2 size={18} color={colors.muted} />
          </Pressable>
        </View>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
          {line.unit} · {formatNaira(line.price)} each
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <QuantityStepper small value={line.quantity} max={line.stock} onChange={(n) => setQuantity(line.product_id, n)} />
          <Text weight="extrabold" style={{ fontSize: 15.5, color: colors.brand700 }}>
            {formatNaira(line.price * line.quantity)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartCount, cartTotal, clearCart, catalog } = useStore();
  const threshold = catalog?.free_delivery_threshold ?? 150000;
  const remaining = Math.max(0, threshold - cartTotal);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View>
          <Text weight="extrabold" style={{ fontSize: 24, letterSpacing: -0.3 }}>
            My Cart
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            {cartCount} item{cartCount === 1 ? "" : "s"}
          </Text>
        </View>
        {cart.length > 0 && (
          <Pressable
            hitSlop={10}
            onPress={() =>
              Alert.alert("Clear cart?", "This removes every item from your cart.", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearCart },
              ])
            }
          >
            <Text weight="bold" style={{ color: colors.sale, fontSize: 13.5 }}>
              Clear all
            </Text>
          </Pressable>
        )}
      </View>

      {cart.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Browse our wholesale catalogue and add products to get started." action={<Button title="Start shopping" onPress={() => router.navigate("/shop")} style={{ minWidth: 200 }} />} />
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(l) => l.product_id}
            renderItem={({ item }) => <Line line={item} />}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            ListHeaderComponent={
              <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, marginBottom: 2, borderWidth: 1, borderColor: colors.line }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Truck size={18} color={colors.lime600} />
                  <Text weight="semibold" style={{ fontSize: 12.5, flex: 1 }}>
                    {remaining > 0 ? (
                      <>
                        Add <Text weight="extrabold" style={{ fontSize: 12.5 }}>{formatNaira(remaining)}</Text> more for free standard delivery
                      </>
                    ) : (
                      "You've unlocked free standard delivery!"
                    )}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.canvas, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${Math.min(100, (cartTotal / threshold) * 100)}%`, backgroundColor: colors.lime500, borderRadius: 3 }} />
                </View>
              </View>
            }
          />
          <View style={[{ backgroundColor: colors.white, padding: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.line }, shadow.raised]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ color: colors.muted }}>Subtotal</Text>
              <Text weight="extrabold" style={{ fontSize: 20, color: colors.brand700 }}>
                {formatNaira(cartTotal)}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Delivery and coupons are applied at checkout.</Text>
            <Button title="Proceed to checkout" icon={Lock} size="lg" style={{ marginTop: 12 }} onPress={() => router.push("/checkout")} />
          </View>
        </>
      )}
    </View>
  );
}
