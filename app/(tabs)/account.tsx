import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import {
  Building2,
  ChevronRight,
  CircleHelp,
  Heart,
  History,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackageSearch,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderStatusBadge } from "@/components/product";
import { Button, Text } from "@/components/ui";
import { API_URL } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/format";
import { colors, fonts, radius } from "@/lib/theme";
import type { Order } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";

type Profile = { full_name: string | null; phone: string | null; address: string | null; city: string | null; state: string | null };

function Row({ icon: Icon, label, value, onPress, danger }: { icon: LucideIcon; label: string; value?: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: pressed ? colors.canvas : colors.white })}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: danger ? "rgba(214,49,43,0.08)" : colors.brand50, alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={danger ? colors.sale : colors.brand700} />
      </View>
      <Text weight="semibold" style={{ flex: 1, fontSize: 15, color: danger ? colors.sale : colors.ink }}>
        {label}
      </Text>
      {value ? <Text style={{ color: colors.muted, fontSize: 13 }}>{value}</Text> : null}
      {!danger && <ChevronRight size={18} color={colors.muted} />}
    </Pressable>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      {title && (
        <Text weight="bold" style={{ fontSize: 12, color: colors.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginLeft: 20 }}>
          {title}
        </Text>
      )}
      <View style={{ marginHorizontal: 16, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>{children}</View>
    </View>
  );
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, supabase, wishlist, signOut, catalog, authReady } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<(Order & { order_items: { id: string }[] })[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !user) return;
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, address, city, state").eq("id", user.id).maybeSingle(),
      supabase.from("orders").select("*, order_items(id)").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p as Profile | null);
    setOrders((o ?? []) as never);
  }, [supabase, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const name = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0];
  const avatar = (user?.user_metadata?.avatar_url as string) || null;
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);
  const phone = catalog?.site.phones[0] ?? "+234 802 918 9777";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        user ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.white}
          />
        ) : undefined
      }
    >
      <View style={{ backgroundColor: colors.brand700, paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl }}>
        {user ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "rgba(255,255,255,0.2)" }} />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                <Text weight="extrabold" style={{ color: colors.white, fontSize: 24 }}>
                  {name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.lime300, fontSize: 13 }}>Welcome back</Text>
              <Text weight="extrabold" numberOfLines={1} style={{ color: colors.white, fontSize: 21 }}>
                {name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                <Mail size={13} color="rgba(255,255,255,0.75)" />
                <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>
                  {user.email}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text weight="extrabold" style={{ color: colors.white, fontSize: 24 }}>
              Your account
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 20 }}>Sign in to track orders, save your delivery address and keep your wishlist across devices.</Text>
            <Button title={authReady ? "Sign in or create account" : "Loading…"} variant="amber" disabled={!authReady} style={{ marginTop: 16 }} onPress={() => router.push("/login")} />
          </View>
        )}
      </View>

      {user && (
        <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 16 }}>
          {[
            { label: "Orders", value: String(orders.length) },
            { label: "Total spent", value: formatNaira(spent) },
            { label: "Wishlist", value: String(wishlist.length) },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.line }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>{s.label}</Text>
              <Text weight="extrabold" numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 17, marginTop: 2 }}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {user && (
        <View style={{ marginTop: 20 }}>
          <Text weight="bold" style={{ fontSize: 12, color: colors.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginLeft: 20 }}>
            Order history
          </Text>
          <View style={{ marginHorizontal: 16, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>
            {orders.length === 0 ? (
              <View style={{ alignItems: "center", padding: 24 }}>
                <Package size={32} color={colors.brand200} strokeWidth={1.5} />
                <Text weight="bold" style={{ marginTop: 8 }}>
                  No orders yet
                </Text>
                <Button title="Start shopping" size="sm" style={{ marginTop: 12 }} onPress={() => router.navigate("/shop")} />
              </View>
            ) : (
              orders.slice(0, 10).map((o, i) => (
                <Pressable
                  key={o.id}
                  onPress={() => router.push(`/order/${o.id}`)}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line, backgroundColor: pressed ? colors.canvas : colors.white })}
                >
                  <View style={{ flex: 1 }}>
                    <Text weight="bold" style={{ fontFamily: fonts.mono, color: colors.brand700, fontSize: 14 }}>
                      {o.order_number}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                      {formatDate(o.created_at)} · {o.order_items.length} item{o.order_items.length === 1 ? "" : "s"}
                    </Text>
                    <View style={{ marginTop: 6 }}>
                      <OrderStatusBadge status={o.status} />
                    </View>
                  </View>
                  <Text weight="extrabold">{formatNaira(o.total)}</Text>
                  <ChevronRight size={18} color={colors.muted} />
                </Pressable>
              ))
            )}
          </View>
        </View>
      )}

      {user && (
        <Group title="Delivery details">
          <Row icon={MapPin} label={profile?.address ? `${profile.address}, ${profile.city ?? ""}` : "Add your delivery address"} onPress={() => router.push("/profile")} />
        </Group>
      )}

      <Group title="Shopping">
        <Row icon={Heart} label="My Wishlist" value={wishlist.length ? String(wishlist.length) : undefined} onPress={() => router.push("/wishlist")} />
        <Row icon={History} label="Recently Viewed" onPress={() => router.push("/recently-viewed")} />
        <Row icon={PackageSearch} label="Track an Order" onPress={() => router.push("/track")} />
        <Row icon={Building2} label="Our Brands" onPress={() => router.push("/brands")} />
      </Group>

      <Group title="Help & information">
        <Row icon={Info} label="About Beluga" onPress={() => router.push("/about")} />
        <Row icon={MessageCircle} label="Contact Us" onPress={() => router.push("/contact")} />
        <Row icon={CircleHelp} label="FAQs" onPress={() => router.push("/faq")} />
        <Row icon={Phone} label="Call to order" value={phone} onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`)} />
        <Row icon={ShieldCheck} label="Privacy Policy" onPress={() => Linking.openURL(`${API_URL}/privacy`)} />
      </Group>

      {user && (
        <Group>
          <Row
            icon={LogOut}
            label="Sign out"
            danger
            onPress={() =>
              Alert.alert("Sign out?", undefined, [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: signOut },
              ])
            }
          />
        </Group>
      )}

      <Text style={{ textAlign: "center", color: colors.muted, fontSize: 12, marginTop: 24 }}>© {new Date().getFullYear()} Beluga Global Concepts</Text>
    </ScrollView>
  );
}
