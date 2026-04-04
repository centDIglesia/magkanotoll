import { useAuthStore } from "@/stores/useAuthStore";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, isAnonymous } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAnonymous || !user || !(user as any).is_admin) {
      router.replace("/(tabs)" as any);
    }
  }, [user, isAnonymous]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
