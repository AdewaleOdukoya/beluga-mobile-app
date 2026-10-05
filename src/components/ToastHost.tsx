import { router } from "expo-router";
import { CheckCircle2, Info, XCircle } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadow } from "@/lib/theme";
import { Text } from "./ui";

export type Toast = { id: number; message: string; tone: "success" | "error" | "info"; action?: { label: string; href: string } };

export function ToastHost({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: insets.top + 8, alignItems: "center", gap: 8, paddingHorizontal: 16 }}>
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? XCircle : t.tone === "info" ? Info : CheckCircle2;
        return (
          <Animated.View key={t.id} entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(180)} style={{ width: "100%", maxWidth: 480 }}>
            <Pressable
              onPress={() => onDismiss(t.id)}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: radius.lg,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  backgroundColor: t.tone === "error" ? colors.sale : t.tone === "info" ? colors.brand800 : colors.brand700,
                },
                shadow.raised,
              ]}
            >
              <Icon size={18} color={t.tone === "success" ? colors.lime300 : colors.white} />
              <Text weight="semibold" numberOfLines={2} style={{ color: colors.white, flex: 1, fontSize: 13.5 }}>
                {t.message}
              </Text>
              {t.action && (
                <Pressable
                  onPress={() => {
                    onDismiss(t.id);
                    router.navigate(t.action!.href as never);
                  }}
                  hitSlop={8}
                  style={{ backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                >
                  <Text weight="bold" style={{ color: colors.lime300, fontSize: 12.5 }}>
                    {t.action.label}
                  </Text>
                </Pressable>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
