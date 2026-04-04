import "../global.css";
import { supabase } from "@/utils/supabase";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useSavedRoutesStore } from "@/stores/useSavedRoutesStore";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export default function RootLayout() {
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
  const fetchRoutes = useSavedRoutesStore((s) => s.fetchRoutes);

  const [fontsLoaded] = useFonts({
    LufgaRegular: require("../assets/fonts/LufgaRegular.ttf"),
    LufgaMedium: require("../assets/fonts/LufgaMedium.ttf"),
    LufgaSemiBold: require("../assets/fonts/LufgaSemiBold.ttf"),
    LufgaBold: require("../assets/fonts/LufgaBold.ttf"),
    LufgaExtraBold: require("../assets/fonts/LufgaExtraBold.ttf"),
    LufgaBlack: require("../assets/fonts/LufgaBlack.ttf"),
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"].includes(event)) { fetchHistory(); fetchRoutes(); }
      if (event === "SIGNED_OUT") { useHistoryStore.setState({ history: [] }); useSavedRoutesStore.setState({ routes: [] }); }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/confirm-email" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="tollbot" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}
