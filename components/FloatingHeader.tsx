import AvatarMenu from "@/components/AvatarMenu";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Robot02Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2">
      <View className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-3">
        <Image source={require("../assets/images/magkanoLogo.png")} style={{ width: 120, height: 32, marginTop: 8 }} resizeMode="contain" />
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push("/tollbot" as any)}
            className=""
          >
               <Image source={require("../assets/images/tollbot.png")} style={{ width: 28, height: 28}} resizeMode="contain" />
          </Pressable>
          <AvatarMenu />
        </View>
      </View>
    </View>
  );
}
