import { useAuthStore } from "@/stores/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  CheckmarkCircle01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const url = Linking.useLinkingURL();
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  useEffect(() => {
    Linking.getInitialURL().then((u) => {
      if (u) setInitialUrl(u);
    });
  }, []);

  useEffect(() => {
    const activeUrl = url ?? initialUrl;
    if (!activeUrl) return;

    const { params, errorCode } = QueryParams.getQueryParams(activeUrl);
    if (errorCode) return;

    const { access_token, refresh_token } = params;
    if (!access_token) return;

    supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token ?? "",
    });
  }, [url, initialUrl]);

  const handleReset = async () => {
    setError("");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword(password);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image
        source={require("../../assets/images/bg_pattern.png")}
        style={styles.bgPattern}
      />
      <View className="flex-1 justify-center px-6">
        {done ? (
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">
            <View className="items-center pt-2 pb-2">
              <Image
                source={require("../../assets/images/magkanoLogo.png")}
                style={{ width: 180, height: 44 }}
                resizeMode="contain"
              />
            </View>
            <View className="h-px bg-neutral-100" />
            <View className="items-center py-4 gap-3">
              <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={32}
                  color="#ffc400"
                />
              </View>
              <Text
                className="text-foreground text-xl text-center"
                style={styles.bold}
              >
                Password updated!
              </Text>
              <Text
                className="text-muted-foreground text-sm text-center leading-6"
                style={styles.body}
              >
                Your password has been successfully updated. You can now sign in
                with your new password.
              </Text>
            </View>
            <Pressable
              className="bg-accent rounded-2xl py-4 items-center"
              onPress={() => router.replace("/(auth)/login" as any)}
            >
              <Text
                className="text-accent-foreground text-base"
                style={styles.bold}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        ) : (
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
                Almost there — set your new password 🔒
              </Text>
            </View>

            <View className="h-px bg-neutral-100" />

            <View className="items-center gap-1">
              <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  size={28}
                  color="#ffc400"
                />
              </View>
              <Text
                className="text-foreground text-xl mt-2"
                style={styles.bold}
              >
                New Password
              </Text>
              <Text
                className="text-muted-foreground text-sm text-center"
                style={styles.body}
              >
                Enter your new password below.
              </Text>
            </View>

            {/* New Password */}
            <View>
              <Text
                className="text-xs text-muted-foreground mb-1.5"
                style={styles.semibold}
              >
                New Password
              </Text>
              <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  size={18}
                  color="#ffc400"
                />
                <TextInput
                  className="flex-1 py-3.5 px-3 text-foreground"
                  style={styles.body}
                  placeholder="••••••••"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffIcon : ViewIcon}
                    size={18}
                    color="#A3A3A3"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text
                className="text-xs text-muted-foreground mb-1.5"
                style={styles.semibold}
              >
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  size={18}
                  color="#ffc400"
                />
                <TextInput
                  className="flex-1 py-3.5 px-3 text-foreground"
                  style={styles.body}
                  placeholder="••••••••"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                  <HugeiconsIcon
                    icon={showConfirm ? ViewOffIcon : ViewIcon}
                    size={18}
                    color="#A3A3A3"
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text
                className="text-destructive bg-destructive/10 px-3 py-2 rounded-xl text-xs"
                style={styles.body}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              className={`rounded-2xl py-4 items-center ${loading ? "bg-neutral-300" : "bg-accent"}`}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#171717" />
              ) : (
                <Text
                  className="text-accent-foreground text-base"
                  style={styles.bold}
                >
                  Update Password
                </Text>
              )}
            </Pressable>
          </View>
        )}
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