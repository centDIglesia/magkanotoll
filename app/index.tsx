import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const { signInAnonymously, loadSession } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await loadSession();

        if (!session.user.is_anonymous && session.user.email) {
          const { data: banned } = await supabase
            .from("banned_users")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (banned) {
            await supabase.auth.signOut();
            router.replace("/(auth)/login" as any);
            return;
          }
        }

        router.replace("/(tabs)" as any);
        return;
      }

      const seen = await AsyncStorage.getItem("onboarding_done");
      if (!seen) {
        router.replace("/(onboarding)" as any);
        return;
      }

      await signInAnonymously();
      router.replace("/(tabs)" as any);
    };

    bootstrap().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-[#ffc400] items-center justify-center">
        <ActivityIndicator color="#332300" size="large" />
      </View>
    );
  }

  return <View className="flex-1" />;
}
