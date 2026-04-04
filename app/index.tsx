import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const { signInAnonymously } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
   //   DEV: uncomment to reset onboarding
     // await AsyncStorage.removeItem("onboarding_done");

      const { data: { session } } = await supabase.auth.getSession();

      // Already has a session (real or anonymous) — go straight to tabs
      if (session) {
        router.replace("/(tabs)" as any);
        return;
      }

      // Show onboarding first time, then auto sign in as guest
      const seen = await AsyncStorage.getItem("onboarding_done");
      if (!seen) {
        router.replace("/(onboarding)" as any);
        return;
      }

      // No session + onboarding done — sign in as guest automatically
      await signInAnonymously();
      router.replace("/(tabs)" as any);
    };
    bootstrap();
  }, []);

  return <View className="flex-1" />;
}
