import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/profile" as any);
  }, []);
  return <View className="flex-1 bg-[#ebebeb]" />;
}
