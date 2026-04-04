import { useAuthStore } from "@/stores/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { User03Icon, Mail01Icon, LockPasswordIcon, ViewIcon, ViewOffIcon, CheckmarkSquare01Icon, SquareIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async () => {
    setError("");
    if (!fullName.trim()) return setError("Full name is required.");
    if (!agreedToTerms) return setError("Please agree to the Terms & Conditions and Privacy Policy.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      router.replace("/(auth)/confirm-email" as any);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image source={require("../../assets/images/bg_pattern.png")} style={styles.bgPattern}  />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">

        {/* Card with logo + form */}
        <View className="bg-white rounded-[32px] p-6 border border-neutral-100 gap-4">

          {/* Logo & Tagline */}
          <View className="items-center pt-2 pb-2">
            <Image source={require("../../assets/images/magkanoLogo.png")} style={{ width: 180, height: 44 }} resizeMode="contain" />
            <Text className="text-muted-foreground text-sm mt-2 text-center" style={styles.body}>
              Libre mag-sign up, libre ang kaalaman sa toll.
            </Text>
          </View>

          <View className="h-px bg-neutral-100" />

          {/* Full Name */}
          <View>
            <Text className="text-xs text-muted-foreground mb-1.5" style={styles.semibold}>Full Name</Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
              
              <TextInput className="flex-1 py-3.5 px-3 text-foreground" style={styles.body} placeholder="Juan dela Cruz" placeholderTextColor="#A3A3A3" value={fullName} onChangeText={setFullName} />
            </View>
          </View>

          {/* Email */}
          <View>
            <Text className="text-xs text-muted-foreground mb-1.5" style={styles.semibold}>Email</Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
              
              <TextInput className="flex-1 py-3.5 px-3 text-foreground" style={styles.body} placeholder="you@example.com" placeholderTextColor="#A3A3A3" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text className="text-xs text-muted-foreground mb-1.5" style={styles.semibold}>Password</Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
             
              <TextInput className="flex-1 py-3.5 px-3 text-foreground" style={styles.body} placeholder="••••••••" placeholderTextColor="#A3A3A3" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} color="#A3A3A3" />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View>
            <Text className="text-xs text-muted-foreground mb-1.5" style={styles.semibold}>Confirm Password</Text>
            <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100">
            
              <TextInput className="flex-1 py-3.5 px-3 text-foreground" style={styles.body} placeholder="••••••••" placeholderTextColor="#A3A3A3" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <HugeiconsIcon icon={showConfirmPassword ? ViewOffIcon : ViewIcon} size={18} color="#A3A3A3" />
              </Pressable>
            </View>
          </View>

          {error ? (
            <Text className="text-destructive bg-destructive/10 px-3 py-2 rounded-xl text-xs" style={styles.body}>{error}</Text>
          ) : null}

          {/* Terms */}
          <Pressable className="flex-row items-center gap-3" onPress={() => setAgreedToTerms(!agreedToTerms)}>
            <HugeiconsIcon icon={agreedToTerms ? CheckmarkSquare01Icon : SquareIcon} size={20} color={agreedToTerms ? "#ffc400" : "#A3A3A3"} />
            <Text className="text-muted-foreground text-xs flex-1 leading-5" style={styles.body}>
              I agree to the{" "}
              <Text className="text-foreground" style={styles.bold} onPress={() => router.push("/terms" as any)}>Terms & Conditions</Text>
              {" "}and{" "}
              <Text className="text-foreground" style={styles.bold} onPress={() => router.push("/privacy-policy" as any)}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <Pressable
            className={`rounded-2xl py-4 items-center ${loading || !agreedToTerms ? "bg-neutral-300" : "bg-accent"}`}
            onPress={handleSignUp}
            disabled={loading || !agreedToTerms}
          >
            {loading ? <ActivityIndicator color="#171717" /> : (
              <Text className="text-primary text-base" style={styles.bold}>Create Account</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/(auth)/login" as any)} className="mt-5">
          <Text className="text-center text-sm text-muted-foreground" style={styles.body}>
            Already have an account?{" "}
            <Text className="text-accent-foreground" style={styles.bold}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  bgPattern: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", opacity: 0.05 },
});
