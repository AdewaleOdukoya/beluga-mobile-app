import { router } from "expo-router";
import { Building2, ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Card, Text } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

export default function BrandsScreen() {
  const { catalog } = useStore();
  const brands = catalog?.brands ?? [];
  const shop = (params: Record<string, string>) => router.navigate({ pathname: "/shop", params });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}>
      <Text style={{ color: colors.muted, lineHeight: 20 }}>We are an authorised distributor for four of Nigeria's leading manufacturers. Tap a brand to see its products.</Text>
      {(catalog?.companies ?? []).map((c) => (
        <Card key={c.name} style={{ padding: 0, overflow: "hidden" }}>
          <Pressable onPress={() => shop({ company: c.name })} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.brand700 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={21} color={colors.white} strokeWidth={1.7} />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight="extrabold" style={{ color: colors.white, fontSize: 16.5 }}>
                {c.name}
              </Text>
              <Text style={{ color: colors.lime300, fontSize: 12 }}>Shop all products</Text>
            </View>
            <ChevronRight size={20} color={colors.white} />
          </Pressable>
          <Text style={{ color: colors.muted, lineHeight: 20, fontSize: 13.5, padding: 16, paddingBottom: 8 }}>{c.blurb}</Text>
          <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
            {c.brands.map((b) => {
              const count = brands.find((x) => x.brand === b)?.count ?? 0;
              return (
                <Pressable key={b} onPress={() => shop({ brand: b })} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 11, borderRadius: radius.md, backgroundColor: pressed ? colors.canvas : "transparent" })}>
                  <Text weight="semibold" style={{ flex: 1 }}>
                    {b}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12.5, marginRight: 6 }}>
                    {count} product{count === 1 ? "" : "s"}
                  </Text>
                  <ChevronRight size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
