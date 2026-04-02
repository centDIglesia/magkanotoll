import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SLIDES = [
  { id: "1", icon: "car-outline" as const, title: "MagkanoToll", subtitle: "Calculate toll fees instantly across Philippine expressways." },
  { id: "2", icon: "navigate-outline" as const, title: "Plan Your Route", subtitle: "Pick your origin, destination, and vehicle class to get an accurate toll breakdown." },
  { id: "3", icon: "time-outline" as const, title: "Track Your History", subtitle: "Every calculation is saved to your account so you can review it anytime." },
];

export default function Onboarding() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("onboarding_done", "true");
    router.replace("/(auth)/login" as any);
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-10">
            <View className="w-28 h-28 rounded-3xl bg-secondary items-center justify-center mb-10">
              <Ionicons name={item.icon} size={64} color="#171717" />
            </View>
            <Text className="text-foreground text-3xl text-center mb-4" style={styles.black}>{item.title}</Text>
            <Text className="text-muted-foreground text-base text-center leading-6" style={styles.body}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View className="flex-row justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <View key={i} className={`h-2 rounded-full ${i === activeIndex ? "bg-primary w-6" : "bg-border w-2"}`} />
        ))}
      </View>

      <View className="px-7 pb-6 gap-3">
        <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center" onPress={isLast ? handleGetStarted : handleNext}>
          <Text className="text-primary-foreground text-base" style={styles.bold}>{isLast ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>
        {!isLast && (
          <TouchableOpacity onPress={handleGetStarted}>
            <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
