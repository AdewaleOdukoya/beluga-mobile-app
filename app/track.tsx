import { useLocalSearchParams } from "expo-router";
import { Hash, Mail, PackageSearch } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { OrderDetails } from "@/components/OrderDetails";
import { OrderStatusBadge } from "@/components/product";
import { Button, Card, Field, Input, Notice, Text } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { colors, fonts } from "@/lib/theme";
import type { Order } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";

export default function TrackScreen() {
  const params = useLocalSearchParams<{ order?: string }>();
  const { user, catalog } = useStore();
  const [number, setNumber] = useState(params.order ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Omit<Order, "id"> | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const r = await api.track(number, email);
      setOrder(r.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not find that order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Card style={{ margin: 16, marginBottom: 0, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" }}>
              <PackageSearch size={22} color={colors.brand700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight="extrabold" style={{ fontSize: 17 }}>
                Where's my order?
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12.5 }}>Use the order number from your confirmation email.</Text>
            </View>
          </View>
          <Field label="Order number">
            <Input icon={Hash} value={number} onChangeText={(v) => setNumber(v.toUpperCase())} placeholder="BGC-260105-AB12C" autoCapitalize="characters" autoCorrect={false} />
          </Field>
          <Field label="Email address">
            <Input icon={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" onSubmitEditing={submit} />
          </Field>
          {error && <Notice>{error}</Notice>}
          <Button title="Track order" icon={PackageSearch} loading={busy} disabled={!number.trim() || !email.trim()} onPress={submit} />
        </Card>

        {order && (
          <>
            <Card style={{ marginHorizontal: 16, marginTop: 14, flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text weight="bold" style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.brand700 }}>
                  {order.order_number}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 2 }}>Placed {formatDate(order.created_at)}</Text>
              </View>
              <OrderStatusBadge status={order.status} />
            </Card>
            <OrderDetails order={order} catalog={catalog} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
