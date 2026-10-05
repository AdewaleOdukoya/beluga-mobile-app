import { router } from "expo-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Logo } from "@/components/Logo";
import { Button, Field, Input, Notice, Text } from "@/components/ui";
import { API_URL } from "@/lib/api";
import { signInWithGoogle } from "@/lib/googleAuth";
import { colors, radius } from "@/lib/theme";
import { useStore } from "@/store/StoreProvider";

type Mode = "signin" | "signup" | "forgot";

// Same messages as the web store's AuthPanel.
const friendly = (msg: string) => {
  if (/invalid login credentials/i.test(msg)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email first. Check your inbox for the link we sent.";
  if (/already registered|already exists/i.test(msg)) return "An account with this email already exists. Sign in instead.";
  if (/rate limit|too many/i.test(msg)) return "Too many attempts. Please wait a few minutes and try again.";
  return msg;
};

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <Path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <Path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <Path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { supabase, user } = useStore();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  // Close once a session exists, however it arrived (password, Google, or the deep-link route).
  useEffect(() => {
    if (user && router.canGoBack()) router.back();
  }, [user]);

  const switchTo = (m: Mode) => {
    setMode(m);
    setError(null);
    setSent(null);
    setNeedsConfirm(false);
  };

  // Confirmation and reset emails open the web store, which finishes the flow in the browser.
  const webCallback = (to: string) => `${API_URL}/auth/callback?next=${encodeURIComponent(to)}`;

  const submit = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNeedsConfirm(false);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setNeedsConfirm(/email not confirmed/i.test(error.message));
          throw error;
        }
      } else if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Enter your full name.");
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: webCallback("/account") },
        });
        if (error) throw error;
        // Supabase returns a user with no identities when the email is already registered.
        if (data.user && data.user.identities?.length === 0) throw new Error("already registered");
        if (!data.session) setSent("confirm");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: webCallback("/reset-password") });
        if (error) throw error;
        setSent("reset");
      }
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!supabase || !email) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: webCallback("/account") } });
    setBusy(false);
    if (error) setError(friendly(error.message));
    else {
      setError(null);
      setNeedsConfirm(false);
      setSent("confirm");
    }
  };

  const google = async () => {
    if (!supabase) return;
    setGoogleBusy(true);
    setError(null);
    try {
      await signInWithGoogle(supabase);
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : "Google sign-in failed"));
    } finally {
      setGoogleBusy(false);
    }
  };

  if (!supabase) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 20 }}>
          <Logo size={44} />
        </View>

        {sent ? (
          <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: radius.xl, padding: 22, alignItems: "center" }}>
            <CheckCircle2 size={48} color={colors.lime500} strokeWidth={1.7} />
            <Text weight="extrabold" style={{ fontSize: 20, marginTop: 12 }}>
              Check your email
            </Text>
            <Text style={{ textAlign: "center", color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              {sent === "confirm" ? (
                <>
                  We sent a confirmation link to <Text weight="bold">{email}</Text>. Open it to activate your account, then sign in here.
                </>
              ) : (
                <>
                  If an account exists for <Text weight="bold">{email}</Text>, we've sent a link to reset your password.
                </>
              )}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 10 }}>Can't find it? Check your spam or promotions folder.</Text>
            <Button title="Back to sign in" icon={ArrowLeft} variant="outline" style={{ marginTop: 18 }} onPress={() => switchTo("signin")} />
          </View>
        ) : (
          <>
            {mode !== "forgot" ? (
              <>
                <View style={{ flexDirection: "row", backgroundColor: colors.canvas, borderRadius: radius.lg, padding: 4, marginBottom: 20 }} accessibilityRole="tablist">
                  {(["signin", "signup"] as const).map((m) => (
                    <Pressable key={m} onPress={() => switchTo(m)} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.md, backgroundColor: mode === m ? colors.white : "transparent", alignItems: "center" }}>
                      <Text weight="bold" style={{ color: mode === m ? colors.brand700 : colors.muted }}>
                        {m === "signin" ? "Sign in" : "Create account"}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={google}
                  disabled={googleBusy}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingVertical: 14, opacity: googleBusy ? 0.6 : pressed ? 0.85 : 1 })}
                >
                  {googleBusy ? <ActivityIndicator color={colors.brand700} /> : <GoogleIcon />}
                  <Text weight="bold" style={{ fontSize: 15 }}>
                    Continue with Google
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 20 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
                  <Text weight="semibold" style={{ fontSize: 11.5, color: colors.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                    or use your email
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
                </View>
              </>
            ) : (
              <View style={{ marginBottom: 20 }}>
                <Pressable onPress={() => switchTo("signin")} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <ArrowLeft size={16} color={colors.brand700} />
                  <Text weight="bold" style={{ color: colors.brand700 }}>
                    Back to sign in
                  </Text>
                </Pressable>
                <Text weight="extrabold" style={{ fontSize: 20, marginTop: 14 }}>
                  Reset your password
                </Text>
                <Text style={{ color: colors.muted, marginTop: 4 }}>Enter your account email and we'll send you a reset link.</Text>
              </View>
            )}

            <View style={{ gap: 14 }}>
              {mode === "signup" && (
                <Field label="Full name">
                  <Input icon={User} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
                </Field>
              )}
              <Field label="Email address">
                <Input icon={Mail} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
              </Field>
              {mode !== "forgot" && (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text weight="semibold" style={{ fontSize: 13.5 }}>
                      Password
                    </Text>
                    {mode === "signin" && (
                      <Pressable onPress={() => switchTo("forgot")} hitSlop={8}>
                        <Text weight="bold" style={{ fontSize: 12.5, color: colors.lime600 }}>
                          Forgot password?
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Input
                    icon={Lock}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    textContentType={mode === "signup" ? "newPassword" : "password"}
                    onSubmitEditing={submit}
                    right={
                      <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityLabel={show ? "Hide password" : "Show password"}>
                        {show ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
                      </Pressable>
                    }
                  />
                  {mode === "signup" && <Text style={{ fontSize: 12, color: colors.muted }}>At least 8 characters.</Text>}
                </View>
              )}

              {error && (
                <View style={{ gap: 6 }}>
                  <Notice>{error}</Notice>
                  {needsConfirm && (
                    <Pressable onPress={resend}>
                      <Text weight="bold" style={{ color: colors.sale, textDecorationLine: "underline", fontSize: 13 }}>
                        Resend confirmation email
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              <Button title={mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"} size="lg" loading={busy} onPress={submit} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
