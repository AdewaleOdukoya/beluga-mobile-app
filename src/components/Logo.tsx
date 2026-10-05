import { Image } from "expo-image";
import { View } from "react-native";
import { colors } from "@/lib/theme";
import { Text } from "./ui";

export function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }} accessibilityLabel="Beluga Global Concepts">
      <Image source={require("../../assets/images/logo.png")} style={{ width: size * 1.13, height: size }} contentFit="contain" />
      <View>
        <Text weight="extrabold" style={{ fontSize: size * 0.4, letterSpacing: -0.2, color: light ? colors.white : colors.brand700, lineHeight: size * 0.46 }}>
          BELUGA
        </Text>
        <Text weight="bold" style={{ fontSize: size * 0.24, letterSpacing: 1.8, color: light ? colors.lime300 : colors.lime600 }}>
          GLOBAL CONCEPTS
        </Text>
      </View>
    </View>
  );
}
