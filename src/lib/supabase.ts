import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

let client: SupabaseClient | null = null;
let clientKey = "";

/** The Supabase URL and anon key come from /api/catalog, so the app ships without hard-coded keys. */
export function getSupabase(config: { url: string; anon_key: string } | null | undefined) {
  if (!config) return null;
  const key = `${config.url}|${config.anon_key}`;
  if (client && clientKey === key) return client;
  client = createClient(config.url, config.anon_key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
  clientKey = key;
  return client;
}

// Refresh tokens only while the app is in the foreground, as Supabase recommends for React Native.
AppState.addEventListener("change", (state) => {
  if (!client) return;
  if (state === "active") client.auth.startAutoRefresh();
  else client.auth.stopAutoRefresh();
});
