import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Mail02Icon,
  InformationCircleIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";

import * as Linking from "expo-linking";
import { supabase } from "@/utils/supabase";

export default function ConfirmEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { resendConfirmationEmail } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    const sub = Linking.addEventListener("url", async ({ url }) => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/(tabs)" as any);
      }
    });
    return () => sub.remove();
  }, []);

  const handleResend = async () => {
    if (!email || resending) return;
    setResendError("");
    setResending(true);
    try {
      await resendConfirmationEmail(email);
      setResent(true);
    } catch (e: any) {
      setResendError(e.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image
        source={require("../../assets/images/bg_pattern.png")}
        style={styles.bgPattern}
      />
      <View className="flex-1 justify-center px-6">
        <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">
          {/* Logo */}
          <View className="items-center pt-2 pb-2">
            <Image
              source={require("../../assets/images/magkanoLogo.png")}
              style={{ width: 180, height: 44 }}
              resizeMode="contain"
            />
            <Text
              className="text-muted-foreground text-sm mt-2 text-center"
              style={styles.body}
            >
              One last step to get started
            </Text>
          </View>

          <View className="h-px bg-neutral-100" />

          <View className="items-center py-2 gap-3">
            <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center">
              <HugeiconsIcon icon={Mail02Icon} size={32} color="#ffc400" />
            </View>
            <Text
              className="text-foreground text-xl text-center"
              style={styles.bold}
            >
              Check your email
            </Text>
            <Text
              className="text-muted-foreground text-sm text-center leading-6"
              style={styles.body}
            >
              We've sent a confirmation link to{" "}
              {email ? (
                <Text className="text-primary" style={styles.bold}>
                  {email}
                </Text>
              ) : (
                "your email address"
              )}
              . Please click the link to verify your account before signing in.
            </Text>
          </View>

          <View className="bg-accent/10 rounded-2xl p-4">
            <View className="flex-row items-start gap-3">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={18}
                color="#ffc400"
              />
              <Text
                className="text-accent-foreground text-xs flex-1 leading-5"
                style={styles.body}
              >
                Didn't receive the email? Check your spam folder or tap the
                button below to resend.
              </Text>
            </View>
          </View>

          {/* ✅ NEW: Resend button */}
          {resent ? (
            <Text
              className="text-green-600 text-xs text-center"
              style={styles.semibold}
            >
              ✓ Email resent! Check your inbox.
            </Text>
          ) : (
            <Pressable
              className={`border rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
                resending || !email ? "border-neutral-200" : "border-primary"
              }`}
              onPress={handleResend}
              disabled={resending || !email}
            >
              {resending ? (
                <ActivityIndicator size="small" color="#ffc400" />
              ) : (
                <HugeiconsIcon icon={ReloadIcon} size={16} color="#ffc400" />
              )}
              <Text className="text-primary text-base" style={styles.bold}>
                {resending ? "Resending..." : "Resend confirmation email"}
              </Text>
            </Pressable>
          )}

          {resendError ? (
            <Text
              className="text-destructive bg-destructive/10 px-3 py-2 rounded-xl text-xs"
              style={styles.body}
            >
              {resendError}
            </Text>
          ) : null}

          <Pressable
            className="bg-accent rounded-2xl py-4 items-center"
            onPress={() => router.replace("/(auth)/login" as any)}
          >
            <Text
              className="text-accent-foreground text-base"
              style={styles.bold}
            >
              Go to Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.05,
  },
});
