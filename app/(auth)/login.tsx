import { useAuthStore } from "@/stores/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ViewIcon,
  ViewOffIcon,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function Login() {
  const router = useRouter();
  const { signIn, signInAnonymously } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleAuth = async () => {
  setError("");
  setLoading(true);
  try {
    await signIn(email, password);
    router.replace("/(tabs)" as any);
  } catch (e: any) {
    if (e.message === "EMAIL_NOT_CONFIRMED") {
      router.push({
        pathname: "/(auth)/confirm-email" as any,
        params: { email },
      });
    } else {
      const errorMsg = e.message.toLowerCase();
      if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        setError('No internet connection. Please check your network and try again.');
      } else if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMsg.includes('too many')) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError(e.message || 'Something went wrong. Please try again.');
      }
    }
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
        {/* Card with logo + form */}
        <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">
          {/* Logo & Tagline */}
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
              Mag-sign in na, huwag palampasin ang biyahe mo.
            </Text>
          </View>

          <View className="h-px bg-neutral-100" />

          {/* Email */}
          <View>
            <Text
              className="text-xs text-muted-foreground mb-1.5"
              style={styles.semibold}
            >
              Email
            </Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
             
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

          {/* Password */}
          <View>
            <Text
              className="text-xs text-muted-foreground mb-1.5"
              style={styles.semibold}
            >
              Password
            </Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
            
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

          {error ? (
            <Text
              className="text-destructive bg-destructive/10 px-3 py-2 rounded-xl text-xs"
              style={styles.body}
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password" as any)}
            className="self-end -mt-1"
          >
            <Text className="text-muted-foreground text-xs" style={styles.body}>
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            className={`rounded-2xl py-4 items-center ${loading ? "bg-neutral-300" : "bg-primary"}`}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base" style={styles.bold}>
                Sign In
              </Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <Pressable
          onPress={() => router.replace("/(auth)/signup" as any)}
          className="mt-5"
        >
          <Text
            className="text-center text-sm text-muted-foreground"
            style={styles.body}
          >
            Don't have an account?{" "}
            <Text className="text-foreground" style={styles.bold}>
              Sign up
            </Text>
          </Text>
        </Pressable>

        <View className="flex-row items-center mt-5 gap-3">
          <View className="flex-1 h-px bg-neutral-200" />
          <Text className="text-muted-foreground text-xs" style={styles.body}>
            or
          </Text>
          <View className="flex-1 h-px bg-neutral-200" />
        </View>

        <Pressable
          className={`flex-row items-center justify-center gap-2 bg-white border border-neutral-200 rounded-2xl py-4 mt-4 ${guestLoading ? "opacity-70" : ""}`}
          onPress={async () => {
            setGuestLoading(true);
            try {
              await signInAnonymously();
              router.replace("/(tabs)" as any);
            } catch (e: any) {
              setError(e.message);
            }
            setGuestLoading(false);
          }}
          disabled={guestLoading || loading}
        >
          {guestLoading ? (
            <ActivityIndicator size="small" color="#ffc400" />
          ) : (
            <HugeiconsIcon icon={User03Icon} size={18} color="#ffc400" />
          )}
          <Text className="text-foreground text-sm" style={styles.semibold}>
            Continue as Guest
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
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
