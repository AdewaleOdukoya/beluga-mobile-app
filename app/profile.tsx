import { router } from "expo-router";
import { CheckCircle2, ChevronDown } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Sheet } from "@/components/Sheet";
import { Button, Card, Field, Input, Notice, Text } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

const empty = { full_name: "", phone: "", address: "", city: "", state: "Ogun" };

// Saved delivery details prefill checkout (the web's ProfileForm). Writes go straight to Supabase under RLS.
export default function ProfileScreen() {
  const { supabase, user, catalog, toast } = useStore();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, address, city, state")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "", state: data.state ?? "Ogun" });
        setLoading(false);
      });
  }, [supabase, user]);

  if (!user) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>Sign in to save your delivery details.</Text>
        <Button title="Sign in" onPress={() => router.replace("/login")} />
      </View>
    );
  }
  if (loading) return <ActivityIndicator color={colors.brand700} style={{ marginTop: 60 }} />;

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name.trim(), phone: form.phone.trim(), address: form.address.trim(), city: form.city.trim(), state: form.state })
      .eq("id", user.id);
    setBusy(false);
    if (error) return setError("Could not save your details. Please try again.");
    toast("Delivery details saved");
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 14 }}>
          <Text style={{ color: colors.muted }}>Used to prefill checkout.</Text>
          <Field label="Full name">
            <Input value={form.full_name} onChangeText={set("full_name")} autoComplete="name" />
          </Field>
          <Field label="Phone number">
            <Input value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" autoComplete="tel" />
          </Field>
          <Field label="Street address">
            <Input value={form.address} onChangeText={set("address")} placeholder="House number, street, landmark" />
          </Field>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Field label="City / town" style={{ flex: 1 }}>
              <Input value={form.city} onChangeText={set("city")} />
            </Field>
            <Field label="State" style={{ flex: 1 }}>
              <Pressable onPress={() => setPicker(true)} style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, minHeight: 48, paddingHorizontal: 14, backgroundColor: colors.white }}>
                <Text style={{ flex: 1, fontSize: 15 }}>{form.state}</Text>
                <ChevronDown size={17} color={colors.muted} />
              </Pressable>
            </Field>
          </View>
          {error && <Notice>{error}</Notice>}
          <Button title="Save details" loading={busy} onPress={save} />
        </Card>
      </ScrollView>
      <Sheet visible={picker} title="Choose your state" onClose={() => setPicker(false)}>
        {(catalog?.states ?? []).map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              set("state")(s);
              setPicker(false);
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
