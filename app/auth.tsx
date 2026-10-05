import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { exchangeCode } from "@/lib/googleAuth";
import { colors } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

// Landing route for the Google sign-in deep link (belugastore://auth?code=...). On Android the link
// can open this route on top of the sign-in screen; it finishes the exchange if needed and closes itself.
export default function AuthReturn() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { supabase } = useStore();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      if (code) await exchangeCode(supabase, code);
      if (router.canGoBack()) router.back();
      else router.replace("/account");
    })();
  }, [supabase, code]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
      <ActivityIndicator color={colors.brand700} />
    </View>
  );
}
