import { useAuthStore } from "@/stores/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { CheckmarkCircle01Icon, LockIcon, Mail01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return setError("Please enter your email.");
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image source={require("../../assets/images/bg_pattern.png")} style={styles.bgPattern}  />
      <View className="flex-1 justify-center px-6">

        {sent ? (
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">
            <View className="items-center pt-2 pb-2">
              <Image source={require("../../assets/images/magkanoLogo.png")} style={{ width: 180, height: 44 }}  />
            </View>
            <View className="h-px bg-neutral-100" />
            <View className="items-center py-4 gap-3">
              <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} color="#ffc400" />
              </View>
              <Text className="text-foreground text-xl text-center" style={styles.bold}>Email sent!</Text>
              <Text className="text-muted-foreground text-sm text-center leading-6" style={styles.body}>
                We've sent a password reset link to {email}. Check your inbox and follow the instructions.
              </Text>
            </View>
            <Pressable className="bg-accent rounded-2xl py-4 items-center" onPress={() => router.replace("/(auth)/login" as any)}>
              <Text className="text-accent-foreground text-base" style={styles.bold}>Back to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">
            {/* Logo */}
            <View className="items-center pt-2 pb-2">
              <Image source={require("../../assets/images/magkanoLogo.png")} style={{ width: 180, height: 44 }} resizeMode="contain" />
              <Text className="text-muted-foreground text-sm mt-2 text-center" style={styles.body}>
                No worries, we've got you covered 🔑
              </Text>
            </View>

            <View className="h-px bg-neutral-100" />

            <View className="items-center gap-1">
              <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center">
                <HugeiconsIcon icon={LockIcon} size={28} color="#ffc400" />
              </View>
              <Text className="text-foreground text-xl mt-2" style={styles.bold}>Forgot Password?</Text>
              <Text className="text-muted-foreground text-sm text-center" style={styles.body}>
                Enter your email and we'll send you a reset link.
              </Text>
            </View>

            <View>
              <Text className="text-xs text-muted-foreground mb-1.5" style={styles.semibold}>Email</Text>
              <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
                <HugeiconsIcon icon={Mail01Icon} size={18} color="#ffc400" />
                <TextInput
                  className="flex-1 py-3.5 px-3 text-foreground"
                  style={styles.body}
                  placeholder="you@example.com"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {error ? (
              <Text className="text-destructive bg-destructive/10 px-3 py-2 rounded-xl text-xs" style={styles.body}>{error}</Text>
            ) : null}

            <Pressable
              className={`rounded-2xl py-4 items-center ${loading ? "bg-neutral-300" : "bg-accent"}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#171717" /> : (
                <Text className="text-accent-foreground text-base" style={styles.bold}>Send Reset Link</Text>
              )}
            </Pressable>
          </View>
        )}

        <Pressable onPress={() => router.back()} className="mt-5 flex-row items-center justify-center gap-2">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="#A3A3A3" />
          <Text className="text-muted-foreground text-sm" style={styles.body}>Back to Sign In</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  bgPattern: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: 0.05 },
});
