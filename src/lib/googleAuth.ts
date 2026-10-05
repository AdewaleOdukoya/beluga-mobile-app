import type { SupabaseClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_URL } from "./api";

WebBrowser.maybeCompleteAuthSession();

const usedCodes = new Set<string>();

/** Exchanges an OAuth code once; both the browser session and the deep-link route may see the same code. */
export async function exchangeCode(supabase: SupabaseClient, code: string) {
  if (usedCodes.has(code)) return null;
  usedCodes.add(code);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error;
}

/**
 * Google sign-in through the system browser. Supabase redirects to the web store's /auth/callback
 * (already on the allow-list), which hands the one-time code back to the app via its deep link.
 */
export async function signInWithGoogle(supabase: SupabaseClient) {
  const returnUrl = Linking.createURL("auth");
  const redirectTo = `${API_URL}/auth/callback?app=${encodeURIComponent(returnUrl)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) throw error ?? new Error("Could not start Google sign-in");

  const result = await WebBrowser.openAuthSessionAsync(data.url, returnUrl);
  if (result.type !== "success") return false;

  const url = new URL(result.url);
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (err) throw new Error(err);
  if (!code) throw new Error("Google sign-in did not complete. Please try again.");
  const exErr = await exchangeCode(supabase, code);
  if (exErr) throw exErr;
  return true;
}
