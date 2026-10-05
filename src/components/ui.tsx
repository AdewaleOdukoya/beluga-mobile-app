import { ArrowRight, type LucideIcon } from "lucide-react-native";
import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radius } from "@/lib/theme";

type Weight = "regular" | "medium" | "semibold" | "bold" | "extrabold" | "display";

export function Text({ weight = "regular", style, ...rest }: TextProps & { weight?: Weight }) {
  return <RNText {...rest} style={[{ fontFamily: fonts[weight], color: colors.ink, fontSize: 14 }, style]} />;
}

type Variant = "primary" | "dark" | "outline" | "amber" | "ghost" | "danger";

const variants: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.lime500, fg: colors.white },
  dark: { bg: colors.brand700, fg: colors.white },
  outline: { bg: colors.white, fg: colors.ink, border: colors.line },
  amber: { bg: colors.amber, fg: colors.ink },
  ghost: { bg: "transparent", fg: colors.brand700 },
  danger: { bg: colors.white, fg: colors.sale, border: colors.line },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon: Icon,
  iconRight,
  loading,
  disabled,
  size = "md",
  style,
}: {
  title: string;
  onPress?: PressableProps["onPress"];
  variant?: Variant;
  icon?: LucideIcon;
  iconRight?: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  const pad = size === "sm" ? 9 : size === "lg" ? 16 : 13;
  const fs = size === "sm" ? 13 : size === "lg" ? 16 : 14.5;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: v.bg,
          borderRadius: radius.md + 2,
          paddingVertical: pad,
          paddingHorizontal: 18,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          opacity: off ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={v.fg} /> : Icon && !iconRight ? <Icon size={fs + 3} color={v.fg} /> : null}
      <Text weight="bold" style={{ color: v.fg, fontSize: fs }}>
        {title}
      </Text>
      {Icon && iconRight && !loading ? <Icon size={fs + 2} color={v.fg} /> : null}
    </Pressable>
  );
}

export const Input = forwardRef<TextInput, TextInputProps & { icon?: LucideIcon; error?: boolean; right?: React.ReactNode }>(function Input(
  { icon: Icon, error, right, style, multiline, ...rest },
  ref,
) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: multiline ? "flex-start" : "center",
        borderWidth: 1,
        borderColor: error ? colors.sale : colors.line,
        borderRadius: radius.md,
        backgroundColor: colors.white,
        paddingHorizontal: 14,
        minHeight: 48,
      }}
    >
      {Icon && <Icon size={17} color={colors.muted} style={{ marginRight: 10, marginTop: multiline ? 14 : 0 }} />}
      <TextInput
        ref={ref}
        placeholderTextColor="#98a5a3"
        multiline={multiline}
        {...rest}
        style={[
          { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, paddingVertical: 12 },
          multiline && { minHeight: 96, textAlignVertical: "top" },
          style as StyleProp<TextStyle>,
        ]}
      />
      {right}
    </View>
  );
});

export function Field({ label, error, optional, children, style }: { label: string; error?: string; optional?: boolean; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text weight="semibold" style={{ fontSize: 13.5 }}>
        {label} {optional && <Text style={{ color: colors.muted, fontSize: 13 }}>(optional)</Text>}
      </Text>
      {children}
      {error ? (
        <Text weight="semibold" style={{ color: colors.sale, fontSize: 12 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 16 }, style]}>{children}</View>;
}

export function SectionHeading({ title, eyebrow, onMore, moreLabel = "See all", style }: { title: string; eyebrow?: string; onMore?: () => void; moreLabel?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, paddingHorizontal: 16 }, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Text weight="bold" style={{ color: colors.lime600, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 2 }}>
            {eyebrow}
          </Text>
        )}
        <Text weight="extrabold" style={{ fontSize: 21, letterSpacing: -0.3 }}>
          {title}
        </Text>
      </View>
      {onMore && (
        <Pressable onPress={onMore} hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text weight="bold" style={{ color: colors.lime600, fontSize: 13.5 }}>
            {moreLabel}
          </Text>
          <ArrowRight size={15} color={colors.lime600} />
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" }}>
        <Icon size={36} color={colors.brand700} strokeWidth={1.5} />
      </View>
      <Text weight="extrabold" style={{ fontSize: 20, marginTop: 16, textAlign: "center" }}>
        {title}
      </Text>
      {text && <Text style={{ color: colors.muted, marginTop: 6, textAlign: "center", lineHeight: 20 }}>{text}</Text>}
      {action && <View style={{ marginTop: 22, alignSelf: "stretch", alignItems: "center" }}>{action}</View>}
    </View>
  );
}

export function Chip({ label, active, onPress, icon: Icon }: { label: string; active?: boolean; onPress?: () => void; icon?: LucideIcon }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: active ? colors.brand700 : colors.line,
        backgroundColor: active ? colors.brand700 : colors.white,
      }}
    >
      {Icon && <Icon size={15} color={active ? colors.white : colors.lime600} />}
      <Text weight={active ? "bold" : "semibold"} style={{ fontSize: 13, color: active ? colors.white : colors.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success" | "warn"; children: React.ReactNode }) {
  const c = tone === "error" ? { bg: "#fdeeed", fg: colors.sale } : tone === "success" ? { bg: colors.lime50, fg: colors.lime600 } : { bg: "#fef5e6", fg: colors.ink };
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: radius.lg, padding: 12 }}>
      <Text weight="semibold" style={{ color: c.fg, fontSize: 13, lineHeight: 19 }}>
        {children}
      </Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}
