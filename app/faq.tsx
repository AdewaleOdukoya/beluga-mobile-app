import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { LayoutAnimation, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui";
import { formatNaira } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

export default function FaqScreen() {
  const { catalog } = useStore();
  const [open, setOpen] = useState<number | null>(0);
  const fee = catalog?.delivery_methods[0]?.fee ?? 2500;
  const threshold = catalog?.free_delivery_threshold ?? 150000;
  const phone = catalog?.site.phones[0] ?? "+234 802 918 9777";

  // Same questions as the web store's /faq page.
  const faqs = [
    { q: "Who can buy from Beluga Global Concepts?", a: "Anyone. We mainly supply supermarkets, mini-marts, provision stores and wholesalers, but households buying in bulk are welcome too. No account is needed: you can check out as a guest." },
    { q: "Where do you deliver?", a: `We deliver daily across Ogun State and the Lagos metropolis from our Dalemo warehouse, and to other states by interstate delivery. Standard delivery costs ${formatNaira(fee)} and is free on orders over ${formatNaira(threshold)}.` },
    { q: "How do I pay?", a: "Pay on delivery (cash, POS or transfer when your goods arrive) or by bank transfer. Our account details are in your order confirmation email; use your order number as the payment reference." },
    { q: "How will I know my order was received?", a: "You get a confirmation email with your order number as soon as you check out, and another email whenever the status changes. You can also check progress on the Track Order screen." },
    { q: "Are your products genuine?", a: "Yes. We are an authorised distributor for Crown Flour Mill, CHI Limited, Hayat Kimya and Bel Impex, and buy directly from manufacturers." },
    { q: "What if goods arrive damaged?", a: "Inspect your delivery before signing. Damaged or wrong items are replaced at no cost. Just tell the driver or call us within 24 hours." },
    { q: "Can I get a custom quote for very large orders?", a: `Absolutely. Send us your list through the contact screen or call ${phone} and our sales team will prepare a quote.` },
    { q: "Do I need an account?", a: "Only if you want to track orders, save addresses and keep your wishlist across devices. Guest checkout works without signing in." },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <Pressable
            key={f.q}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpen(isOpen ? null : i);
            }}
            style={{ borderRadius: radius.xl, borderWidth: 1, borderColor: isOpen ? colors.lime400 : colors.line, backgroundColor: isOpen ? colors.lime50 : colors.white, padding: 16 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text weight="bold" style={{ flex: 1, fontSize: 14.5, lineHeight: 20 }}>
                {f.q}
              </Text>
              <ChevronDown size={19} color={colors.lime600} style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }} />
            </View>
            {isOpen && <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 10 }}>{f.a}</Text>}
          </Pressable>
        );
      })}
      <Pressable onPress={() => router.push("/contact")} style={{ alignItems: "center", marginTop: 14 }}>
        <Text style={{ color: colors.muted }}>
          Still have questions? <Text weight="bold" style={{ color: colors.brand700 }}>Contact our team</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
