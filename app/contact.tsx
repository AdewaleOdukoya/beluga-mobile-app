import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Send } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from "react-native";
import { Button, Card, Field, Input, Notice, Text } from "@/components/ui";
import { api } from "@/lib/api";
import { colors, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactScreen() {
  const { catalog, user } = useStore();
  const site = catalog?.site;
  const phone = site?.phones[0] ?? "+234 802 918 9777";
  const [form, setForm] = useState({ ...empty, email: user?.email ?? "", name: (user?.user_metadata?.full_name as string) ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.contact(form);
      setSent(true);
      setForm(empty);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  };

  const cards = [
    { icon: MapPin, title: "Head office", body: site?.address ?? "", onPress: () => Linking.openURL(Platform.OS === "ios" ? `maps:0,0?q=${encodeURIComponent(site?.address ?? "")}` : `geo:0,0?q=${encodeURIComponent(site?.address ?? "")}`) },
    { icon: Phone, title: "Phone", body: site?.phones.join(", ") ?? phone, onPress: () => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`) },
    { icon: Mail, title: "Email", body: site?.email ?? "", onPress: () => Linking.openURL(`mailto:${site?.email}`) },
    { icon: Clock, title: "Opening hours", body: "Monday - Saturday, 8:00am - 6:00pm" },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }} keyboardShouldPersistTaps="handled">
        <Text weight="extrabold" style={{ fontSize: 22 }}>
          We'd love to supply your shop
        </Text>
        <Text style={{ color: colors.muted, lineHeight: 20, marginBottom: 6 }}>Bulk quotes, delivery questions or a new account: our team usually replies within one working day.</Text>

        {cards.map(({ icon: Icon, title, body, onPress }) => (
          <Pressable key={title} onPress={onPress} disabled={!onPress} style={{ flexDirection: "row", gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.xl, padding: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime400, alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={colors.brand900} />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight="bold">{title}</Text>
              <Text style={{ color: colors.muted, fontSize: 13.5, marginTop: 2 }}>{body}</Text>
            </View>
            {onPress && <Navigation size={16} color={colors.muted} style={{ alignSelf: "center" }} />}
          </Pressable>
        ))}

        <Button title="Chat with us on WhatsApp" icon={MessageCircle} style={{ backgroundColor: "#25D366" }} onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`)} />

        <Card style={{ marginTop: 10, gap: 14 }}>
          <Text weight="extrabold" style={{ fontSize: 18 }}>
            Send us a message
          </Text>
          {sent ? (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <CheckCircle2 size={44} color={colors.lime500} strokeWidth={1.7} />
              <Text weight="bold" style={{ marginTop: 8, fontSize: 16 }}>
                Message sent
              </Text>
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 4 }}>Thanks for reaching out. We'll get back to you within one working day.</Text>
              <Button title="Send another" variant="outline" size="sm" style={{ marginTop: 12 }} onPress={() => setSent(false)} />
            </View>
          ) : (
            <>
              <Field label="Your name *">
                <Input value={form.name} onChangeText={set("name")} autoComplete="name" />
              </Field>
              <Field label="Email *">
                <Input value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              </Field>
              <Field label="Phone" optional>
                <Input value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" autoComplete="tel" />
              </Field>
              <Field label="Subject" optional>
                <Input value={form.subject} onChangeText={set("subject")} placeholder="Bulk quote, delivery, new account…" />
              </Field>
              <Field label="Message *">
                <Input value={form.message} onChangeText={set("message")} multiline placeholder="Tell us what you need" />
              </Field>
              {error && <Notice>{error}</Notice>}
              <Button title="Send message" icon={Send} loading={busy} onPress={submit} />
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
