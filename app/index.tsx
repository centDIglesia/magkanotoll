import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/(tabs)" as any);
        return;
      }
      const seen = await AsyncStorage.getItem("onboarding_done");
      if (seen) {
        router.replace("/(auth)/login" as any);
      } else {
        router.replace("/(onboarding)" as any);
      }
    };
    bootstrap();
  }, []);

  return <View className="bg-red-500 flex-1" />;
}
