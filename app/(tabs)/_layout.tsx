import { Tabs } from "expo-router";
import { Flame, Home, LayoutGrid, ShoppingCart, User } from "lucide-react-native";
import { Platform } from "react-native";
import { colors, fonts } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

export default function TabLayout() {
  const { cartCount } = useStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand700,
        tabBarInactiveTintColor: "#8a9896",
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: Platform.OS === "ios" ? 86 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        tabBarBadgeStyle: { backgroundColor: colors.amber, color: colors.ink, fontFamily: fonts.bold, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Home size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} /> }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: ({ color, focused }) => <LayoutGrid size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} /> }} />
      <Tabs.Screen
        name="deals"
        options={{ title: "Deals", tabBarIcon: ({ focused }) => <Flame size={23} color={colors.sale} fill={focused ? colors.sale : "transparent"} strokeWidth={focused ? 2.4 : 1.9} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined,
          tabBarIcon: ({ color, focused }) => <ShoppingCart size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />,
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color, focused }) => <User size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} /> }} />
    </Tabs>
  );
}
