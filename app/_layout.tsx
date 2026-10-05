import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors, fonts } from "@/lib/theme";
import { StoreProvider } from "@/store/StoreProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerTintColor: colors.brand700,
              headerTitleStyle: { fontFamily: fonts.extrabold, color: colors.ink, fontSize: 17 },
              headerBackTitle: "Back",
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.white },
              contentStyle: { backgroundColor: colors.canvas },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[slug]" options={{ title: "", headerTransparent: true }} />
            <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
            <Stack.Screen name="order/[id]" options={{ title: "Order", headerBackVisible: true }} />
            <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
            <Stack.Screen name="wishlist" options={{ title: "My Wishlist" }} />
            <Stack.Screen name="recently-viewed" options={{ title: "Recently Viewed" }} />
            <Stack.Screen name="track" options={{ title: "Track Order" }} />
            <Stack.Screen name="brands" options={{ title: "Our Brands" }} />
            <Stack.Screen name="about" options={{ title: "About Us" }} />
            <Stack.Screen name="contact" options={{ title: "Contact Us" }} />
            <Stack.Screen name="faq" options={{ title: "FAQs" }} />
            <Stack.Screen name="profile" options={{ title: "Delivery Details" }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
