import { Minus, Plus } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { colors } from "@/lib/theme";
import { Text } from "./ui";

export function QuantityStepper({ value, max, onChange, small }: { value: number; max: number; onChange: (n: number) => void; small?: boolean }) {
  const h = small ? 34 : 48;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, height: h, backgroundColor: colors.white }}>
      <Pressable onPress={() => onChange(value - 1)} hitSlop={6} style={{ width: h, height: h, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Decrease quantity">
        <Minus size={small ? 15 : 18} color={colors.ink} />
      </Pressable>
      <Text weight="bold" style={{ minWidth: small ? 26 : 34, textAlign: "center", fontSize: small ? 14 : 16 }}>
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={value >= max}
        hitSlop={6}
        style={{ width: h, height: h, alignItems: "center", justifyContent: "center", opacity: value >= max ? 0.35 : 1 }}
        accessibilityLabel="Increase quantity"
      >
        <Plus size={small ? 15 : 18} color={colors.ink} />
      </Pressable>
    </View>
  );
}
