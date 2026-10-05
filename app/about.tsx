import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowRight, Eye, Handshake, MapPin, Store, Target, Truck, Users, Warehouse } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Button, Text } from "@/components/ui";
import { API_URL } from "@/lib/api";
import { colors, fonts, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

// Copy matches the web store's /about page.
const capacity = [
  { icon: Warehouse, title: "Strategic warehouse", text: "Located in Dalemo, Ogun State, with excellent access to major roads and Lagos markets.", image: "/images/capacity-0.jpg" },
  { icon: Truck, title: "Reliable delivery fleet", text: "Our own vehicles make sure products reach retailers when they need them.", image: "/images/capacity-1.jpg" },
  { icon: Store, title: "Growing clientele", text: "Retail businesses, supermarkets, mini-marts and wholesalers across Ogun State and Lagos.", image: "/images/capacity-2.jpg" },
];

export default function AboutScreen() {
  const { catalog } = useStore();
  const founded = catalog?.site.founded ?? 2015;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ backgroundColor: colors.brand700, padding: 22, paddingTop: 18 }}>
        <Text weight="bold" style={{ color: colors.lime300, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase" }}>
          Who we are
        </Text>
        <Text style={{ fontFamily: fonts.display, color: colors.white, fontSize: 28, lineHeight: 33, marginTop: 8 }}>Reliable products, delivered timely for every need.</Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 10, lineHeight: 21 }}>
          Established in {founded}, Beluga Global Concepts is a prominent wholesale distribution company based in Dalemo, Ogun State, Nigeria.
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text weight="extrabold" style={{ fontSize: 21 }}>
          A decade of supplying the region's retailers
        </Text>
        <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 10 }}>
          Beluga Global Concepts (BGC) has been providing a diverse range of essential products to retail businesses since {founded}, making sure our customers have access to high-quality goods at competitive prices. Our dedicated team works tirelessly to meet the needs of our clients.
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          {[
            { v: `${new Date().getFullYear() - founded}+`, l: "Years in business" },
            { v: "4", l: "Core manufacturers" },
            { v: "2", l: "States served daily" },
          ].map((s) => (
            <View key={s.l} style={{ flex: 1, backgroundColor: colors.lime50, borderRadius: radius.lg, padding: 12, alignItems: "center" }}>
              <Text weight="extrabold" style={{ fontSize: 26, color: colors.brand700 }}>
                {s.v}
              </Text>
              <Text weight="semibold" style={{ fontSize: 11, color: colors.muted, textAlign: "center" }}>
                {s.l}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: colors.brand700, borderRadius: radius.xxl, padding: 20, marginTop: 18 }}>
          <Eye size={28} color={colors.lime300} strokeWidth={1.7} />
          <Text weight="extrabold" style={{ color: colors.white, fontSize: 18, marginTop: 10 }}>
            Our vision
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 20, fontSize: 13.5 }}>
            To become a leading wholesale distributor recognised for our broad product range and exceptional service, meeting the diverse needs of our customers.
          </Text>
        </View>
        <View style={{ backgroundColor: colors.lime400, borderRadius: radius.xxl, padding: 20, marginTop: 12 }}>
          <Target size={28} color={colors.brand900} strokeWidth={1.7} />
          <Text weight="extrabold" style={{ color: colors.brand900, fontSize: 18, marginTop: 10 }}>
            Our mission
          </Text>
          <Text style={{ color: colors.brand900, marginTop: 6, lineHeight: 20, fontSize: 13.5 }}>
            To supply retail businesses with a wide range of essential products at competitive prices, ensuring reliable service and high quality, and to build lasting relationships with our clients and partners for mutual growth.
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.white, paddingVertical: 20 }}>
        <Text weight="bold" style={{ color: colors.lime600, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", paddingHorizontal: 16 }}>
          Capacity
        </Text>
        <Text weight="extrabold" style={{ fontSize: 21, marginTop: 4, paddingHorizontal: 16 }}>
          Distribution network & logistics
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={272} decelerationRate="fast" contentContainerStyle={{ gap: 12, paddingHorizontal: 16, marginTop: 14 }}>
          {capacity.map(({ icon: Icon, title, text, image }) => (
            <View key={title} style={{ width: 260, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>
              <Image source={{ uri: `${API_URL}${image}` }} style={{ width: "100%", height: 160 }} contentFit="cover" />
              <View style={{ padding: 14 }}>
                <Icon size={24} color={colors.lime600} strokeWidth={1.7} />
                <Text weight="extrabold" style={{ fontSize: 16, marginTop: 8 }}>
                  {title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 }}>{text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        {["Strong partnerships with leading manufacturers guarantee consistent stock", "A dedicated team focused on order accuracy and customer satisfaction"].map((t) => (
          <View key={t} style={{ flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 12, backgroundColor: colors.canvas, borderRadius: radius.lg, padding: 14 }}>
            <Handshake size={19} color={colors.lime600} />
            <Text weight="semibold" style={{ flex: 1, fontSize: 13.5 }}>
              {t}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ padding: 16, alignItems: "center" }}>
        <View style={{ width: 200, height: 200, borderRadius: 100, borderWidth: 8, borderColor: colors.lime400, overflow: "hidden", backgroundColor: colors.brand700, marginTop: 8 }}>
          <Image source={{ uri: `${API_URL}/images/ceo.jpg` }} style={{ width: "118%", height: "118%", marginLeft: "-9%", marginTop: "-9%" }} contentFit="cover" accessibilityLabel="Mrs. Odukoya Temitope Oreofe, CEO of Beluga Global Concepts" />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 }}>
          <Users size={15} color={colors.lime600} />
          <Text weight="bold" style={{ color: colors.lime600, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Management & team
          </Text>
        </View>
        <Text weight="extrabold" style={{ fontSize: 21, marginTop: 4, textAlign: "center" }}>
          Mrs. Odukoya Temitope Oreofe
        </Text>
        <Text weight="semibold" style={{ color: colors.brand700 }}>
          Chief Executive Officer / MD
        </Text>
        <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 10 }}>
          A business manager and entrepreneur with over 20 years of professional experience in marketing, logistics, supply chain management, customer service and secretarial administration. She holds an MBA in Marketing and a Postgraduate Diploma in Marketing from Ladoke Akintola University of Technology, Ogbomoso, and an HND in Secretarial Administration from The Polytechnic, Ibadan.
        </Text>
        <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 10 }}>
          At Lafarge Africa Plc she was appointed the company's first female Logistics Manager. She played a key role in the Proud Foot Project that saved €606,376 in 2014, chaired the Health and Safety Month Programme, and held leadership roles including Depot Head and Sourcing Manager.
        </Text>
      </View>

      <View style={{ marginHorizontal: 16, backgroundColor: colors.brand700, borderRadius: radius.xxl, padding: 20 }}>
        <Text weight="extrabold" style={{ color: colors.white, fontSize: 20 }}>
          Our core distributors
        </Text>
        {(catalog?.companies ?? []).map((c) => (
          <View key={c.name} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.lg, padding: 14, marginTop: 10 }}>
            <Text weight="extrabold" style={{ color: colors.white, fontSize: 15.5 }}>
              {c.name}
            </Text>
            <Text style={{ color: colors.lime300, fontSize: 12.5, marginTop: 2 }}>{c.brands.join(" · ")}</Text>
          </View>
        ))}
        <Button title="Shop the catalogue" icon={ArrowRight} iconRight variant="amber" style={{ marginTop: 16 }} onPress={() => router.navigate("/shop")} />
        <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
          <MapPin size={15} color="rgba(255,255,255,0.75)" />
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, flex: 1 }}>{catalog?.site.address}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
