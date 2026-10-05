import { router, Stack, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Mail, Package } from "lucide-react-native";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderDetails } from "@/components/OrderDetails";
import { OrderStatusBadge } from "@/components/product";
import { Button, Card, EmptyState, Text } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { colors, fonts, radius } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";
import { useStore } from "@/store/StoreProvider";

export default function OrderScreen() {
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const insets = useSafeAreaInsets();
  const { catalog } = useStore();
  const { data, error, loading, refreshing, refetch } = useFetch(() => api.order(id).then((r) => r.order), [id]);
  const justPlaced = placed === "1";

  if (loading && !data) return <ActivityIndicator color={colors.brand700} style={{ marginTop: 80 }} />;
  if (error || !data) return <EmptyState icon={Package} title="Order not found" text={error ?? undefined} action={<Button title="Go home" onPress={() => router.navigate("/")} />} />;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.brand700} />}>
      <Stack.Screen options={{ title: justPlaced ? "Order confirmed" : data.order_number, headerBackVisible: !justPlaced, gestureEnabled: !justPlaced }} />

      {justPlaced ? (
        <Card style={{ marginHorizontal: 16, marginTop: 16, alignItems: "center", paddingVertical: 26 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.lime50, alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={44} color={colors.lime500} strokeWidth={1.7} />
          </View>
          <Text weight="extrabold" style={{ fontSize: 24, marginTop: 14 }}>
            Thank you, {data.full_name.split(" ")[0]}!
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Your order has been placed and is being prepared.</Text>
          <View style={{ backgroundColor: colors.brand50, borderRadius: radius.lg, paddingHorizontal: 18, paddingVertical: 10, marginTop: 14 }}>
            <Text weight="bold" style={{ fontFamily: fonts.mono, fontSize: 18, color: colors.brand700 }} selectable>
              {data.order_number}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 12 }}>
            <Mail size={15} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 12.5, flexShrink: 1, textAlign: "center" }}>
              {data.email_sent ? "A confirmation email has been sent to " : "Your confirmation will be sent to "}
              <Text weight="bold" style={{ fontSize: 12.5 }}>{data.email}</Text>
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={{ marginHorizontal: 16, marginTop: 16, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text weight="bold" style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.brand700 }} selectable>
              {data.order_number}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 2 }}>Placed {formatDate(data.created_at)}</Text>
          </View>
          <OrderStatusBadge status={data.status} />
        </Card>
      )}

      <OrderDetails order={data} catalog={catalog} />

      <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 20 }}>
        {justPlaced ? (
          <>
            <Button title="Continue shopping" variant="primary" style={{ flex: 1 }} onPress={() => router.dismissTo("/shop")} />
            <Button title="My account" variant="outline" style={{ flex: 1 }} onPress={() => router.dismissTo("/account")} />
          </>
        ) : (
          <Button title="Contact us about this order" variant="outline" style={{ flex: 1 }} onPress={() => router.push("/contact")} />
        )}
      </View>
    </ScrollView>
  );
}
