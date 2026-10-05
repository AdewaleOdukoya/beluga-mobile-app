import { router } from "expo-router";
import { AlertCircle, Banknote, Building2, CheckCircle2, ChevronDown, Lock, MapPin, ShoppingBag, Tag, Truck, User } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductImage } from "@/components/product";
import { Sheet } from "@/components/Sheet";
import { Button, Card, EmptyState, Field, Input, Notice, Text } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatNaira, shippingFee } from "@/lib/format";
import { colors, radius, shadow } from "@/lib/theme";
import type { Quote } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";

const empty = { email: "", full_name: "", phone: "", business_name: "", address: "", city: "", state: "Ogun", notes: "" };

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <Card style={{ marginHorizontal: 16, marginTop: 14, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon size={19} color={colors.lime600} />
        <Text weight="extrabold" style={{ fontSize: 16.5 }}>
          {title}
        </Text>
      </View>
      {children}
    </Card>
  );
}

function Option({ selected, onPress, title, detail, right, icon: Icon }: { selected: boolean; onPress: () => void; title: string; detail: string; right?: string; icon?: typeof User }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{ flexDirection: "row", gap: 12, borderRadius: radius.lg, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.lime500 : colors.line, backgroundColor: selected ? colors.lime50 : colors.white, padding: selected ? 13 : 14 }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selected ? colors.lime500 : colors.line, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lime500 }} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={15} color={colors.ink} />}
          <Text weight="bold" style={{ flex: 1 }}>
            {title}
          </Text>
          {right && (
            <Text weight="bold" style={{ color: right === "Free" ? colors.lime600 : colors.ink }}>
              {right}
            </Text>
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 2 }}>{detail}</Text>
      </View>
    </Pressable>
  );
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, user, authReady, clearCart, toast, supabase, catalog } = useStore();
  const [form, setForm] = useState(empty);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("pay_on_delivery");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [statePicker, setStatePicker] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const placedRef = useRef(false);

  const deliveryMethods = catalog?.delivery_methods ?? [];
  const paymentMethods = catalog?.payment_methods ?? [];
  const threshold = catalog?.free_delivery_threshold ?? 150000;

  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Prefill from the signed-in user's profile (same as the web checkout).
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    setForm((f) => ({ ...f, email: f.email || user.email || "", full_name: f.full_name || (meta.full_name as string) || (meta.name as string) || "" }));
    supabase
      ?.from("profiles")
      .select("full_name, phone, address, city, state")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm((f) => ({
          ...f,
          full_name: f.full_name || data.full_name || "",
          phone: f.phone || data.phone || "",
          address: f.address || data.address || "",
          city: f.city || data.city || "",
          state: data.state || f.state,
        }));
      });
  }, [user, supabase]);

  const itemsKey = useMemo(() => cart.map((l) => `${l.product_id}:${l.quantity}`).join(","), [cart]);

  // The server prices every line; the UI shows exactly what will be charged.
  useEffect(() => {
    if (!cart.length) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const q = await api.quote({ items: cart.map((l) => ({ product_id: l.product_id, quantity: l.quantity })), delivery_method: delivery, coupon });
        if (!alive) return;
        setQuote(q);
        setQuoteError(null);
      } catch (e) {
        if (!alive) return;
        setQuote(null);
        setQuoteError(e instanceof Error ? e.message : "Could not price your cart");
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, delivery, coupon]);

  const localFee = shippingFee(deliveryMethods, delivery, cartTotal, threshold) ?? 0;
  const summary = quote ?? { subtotal: cartTotal, shipping_fee: localFee, discount: 0, total: cartTotal + localFee, coupon_code: null, coupon_message: null, problems: [] };
  const pickup = delivery === "pickup";
  const blocked = (quote?.problems.length ?? 0) > 0;

  if (!cart.length && !placedRef.current) {
    return <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add some products before checking out." action={<Button title="Go to shop" onPress={() => router.navigate("/shop")} />} />;
  }

  const submit = async () => {
    setPlacing(true);
    setError(null);
    setFields({});
    try {
      const res = await api.placeOrder({
        ...form,
        delivery_method: delivery,
        payment_method: payment,
        coupon,
        save_address: saveAddress,
        items: cart.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
      });
      placedRef.current = true;
      clearCart();
      toast("Order placed successfully");
      router.replace({ pathname: "/order/[id]", params: { id: res.id, placed: "1" } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not place your order";
      setError(msg);
      const f = e instanceof ApiError ? (e.data.fields as Record<string, string> | undefined) : undefined;
      if (f) setFields(f);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} style={{ flex: 1 }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={{ marginHorizontal: 16, marginTop: 14, flexDirection: "row", gap: 8, backgroundColor: "#fdeeed", borderRadius: radius.lg, padding: 12 }}>
            <AlertCircle size={17} color={colors.sale} />
            <Text weight="semibold" style={{ color: colors.sale, flex: 1, fontSize: 13 }}>
              {error}
            </Text>
          </View>
        )}

        {authReady && !user && (
          <Card style={{ marginHorizontal: 16, marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text weight="bold">Returning customer?</Text>
              <Text style={{ color: colors.muted, fontSize: 12.5 }}>Sign in to track orders and save your address.</Text>
            </View>
            <Button title="Sign in" variant="outline" size="sm" onPress={() => router.push("/login")} />
          </Card>
        )}

        <Section icon={User} title="Contact details">
          <Field label="Full name" error={fields.full_name}>
            <Input value={form.full_name} onChangeText={set("full_name")} autoComplete="name" textContentType="name" error={!!fields.full_name} />
          </Field>
          <Field label="Phone number" error={fields.phone}>
            <Input value={form.phone} onChangeText={set("phone")} placeholder="0802 000 0000" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" error={!!fields.phone} />
          </Field>
          <Field label="Email address" error={fields.email}>
            <Input value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={!!fields.email} />
          </Field>
          <Field label="Business / shop name" optional>
            <Input value={form.business_name} onChangeText={set("business_name")} textContentType="organizationName" />
          </Field>
        </Section>

        <Section icon={Truck} title="Delivery method">
          {deliveryMethods.map((d) => {
            const fee = shippingFee(deliveryMethods, d.id, summary.subtotal, threshold) ?? d.fee ?? 0;
            return <Option key={d.id} selected={delivery === d.id} onPress={() => setDelivery(d.id)} title={d.label} detail={d.detail} right={fee === 0 ? "Free" : formatNaira(fee)} />;
          })}
        </Section>

        <Section icon={MapPin} title={pickup ? "Pickup details" : "Delivery address"}>
          {pickup ? (
            <View style={{ backgroundColor: colors.canvas, borderRadius: radius.lg, padding: 14 }}>
              <Text style={{ lineHeight: 20, fontSize: 13.5 }}>
                Collect your order from <Text weight="bold" style={{ fontSize: 13.5 }}>{catalog?.site.address ?? "77, Lagos Abeokuta Express Road, Sango Otta, Ogun State"}</Text>, Monday to Saturday, 8am to 6pm. We'll call you when it's ready.
              </Text>
            </View>
          ) : (
            <>
              <Field label="Street address" error={fields.address}>
                <Input value={form.address} onChangeText={set("address")} placeholder="House number, street, landmark" textContentType="fullStreetAddress" error={!!fields.address} />
              </Field>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Field label="City / town" error={fields.city} style={{ flex: 1 }}>
                  <Input value={form.city} onChangeText={set("city")} textContentType="addressCity" error={!!fields.city} />
                </Field>
                <Field label="State" error={fields.state} style={{ flex: 1 }}>
                  <Pressable onPress={() => setStatePicker(true)} style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: fields.state ? colors.sale : colors.line, borderRadius: radius.md, minHeight: 48, paddingHorizontal: 14, backgroundColor: colors.white }}>
                    <Text style={{ flex: 1, fontSize: 15 }}>{form.state}</Text>
                    <ChevronDown size={17} color={colors.muted} />
                  </Pressable>
                </Field>
              </View>
            </>
          )}
          <Field label="Order notes" optional>
            <Input value={form.notes} onChangeText={set("notes")} multiline placeholder="Delivery instructions, preferred time, etc." />
          </Field>
          {user && !pickup && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13.5 }}>Save this address to my account</Text>
              <Switch value={saveAddress} onValueChange={setSaveAddress} trackColor={{ true: colors.lime500, false: colors.line }} thumbColor={colors.white} />
            </View>
          )}
        </Section>

        <Section icon={Banknote} title="Payment method">
          {paymentMethods.map((p) => (
            <Option key={p.id} selected={payment === p.id} onPress={() => setPayment(p.id)} title={p.label} detail={p.detail} icon={p.id === "bank_transfer" ? Building2 : Banknote} />
          ))}
        </Section>

        <Section icon={ShoppingBag} title="Order summary">
          {cart.map((l) => (
            <View key={l.product_id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View>
                <ProductImage src={l.image} style={{ width: 52, height: 52, borderRadius: 8, borderWidth: 1, borderColor: colors.line }} />
                <View style={{ position: "absolute", right: -6, top: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brand700, alignItems: "center", justifyContent: "center" }}>
                  <Text weight="bold" style={{ color: colors.white, fontSize: 10 }}>
                    {l.quantity}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="semibold" numberOfLines={1} style={{ fontSize: 13.5 }}>
                  {l.name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{l.unit}</Text>
              </View>
              <Text weight="bold" style={{ fontSize: 13.5 }}>
                {formatNaira(l.price * l.quantity)}
              </Text>
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Input icon={Tag} value={couponInput} onChangeText={(v) => setCouponInput(v.toUpperCase())} placeholder="Coupon code" autoCapitalize="characters" autoCorrect={false} />
            </View>
            <Button title="Apply" variant="dark" onPress={() => setCoupon(couponInput)} />
          </View>
          {summary.coupon_message && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {summary.coupon_code ? <CheckCircle2 size={15} color={colors.lime600} /> : <AlertCircle size={15} color={colors.sale} />}
              <Text weight="semibold" style={{ fontSize: 12.5, color: summary.coupon_code ? colors.lime600 : colors.sale }}>
                {summary.coupon_message}
              </Text>
            </View>
          )}

          <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 8 }}>
            <SummaryRow label="Subtotal" value={formatNaira(summary.subtotal)} />
            <SummaryRow label="Delivery" value={summary.shipping_fee ? formatNaira(summary.shipping_fee) : "Free"} />
            {summary.discount > 0 && <SummaryRow label={`Discount (${summary.coupon_code})`} value={`-${formatNaira(summary.discount)}`} green />}
          </View>

          {blocked && <Notice>{quote!.problems.join("\n")}</Notice>}
          {quoteError && <Notice tone="warn">{quoteError}</Notice>}
        </Section>
      </ScrollView>

      <View style={[{ backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: colors.line }, shadow.raised]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <Text weight="extrabold" style={{ fontSize: 16 }}>
            Total
          </Text>
          <Text weight="extrabold" style={{ fontSize: 21, color: colors.brand700 }}>
            {formatNaira(summary.total)}
          </Text>
        </View>
        <Button title={placing ? "Placing order…" : `Place order · ${formatNaira(summary.total)}`} icon={Lock} size="lg" loading={placing} disabled={blocked} onPress={submit} />
        <Text style={{ textAlign: "center", color: colors.muted, fontSize: 11.5, marginTop: 8 }}>A confirmation email is sent as soon as your order is placed.</Text>
      </View>

      <Sheet visible={statePicker} title="Choose your state" onClose={() => setStatePicker(false)}>
        {(catalog?.states ?? []).map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              set("state")(s);
              setStatePicker(false);
            }}
            style={{ paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: "row", alignItems: "center" }}
          >
            <Text weight={form.state === s ? "bold" : "regular"} style={{ flex: 1, fontSize: 15, color: form.state === s ? colors.brand700 : colors.ink }}>
              {s}
            </Text>
            {form.state === s && <CheckCircle2 size={18} color={colors.lime600} />}
          </Pressable>
        ))}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: green ? colors.lime600 : colors.muted }}>{label}</Text>
      <Text weight="semibold" style={{ color: green ? colors.lime600 : colors.ink }}>
        {value}
      </Text>
    </View>
  );
}
