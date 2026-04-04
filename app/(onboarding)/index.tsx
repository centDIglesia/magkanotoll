import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Car01Icon,
  RouteIcon,
  WalletCardsIcon,
  Clock01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const { width, height } = Dimensions.get("window");

// All slides use primary (#171717) + accent (#ffc400) + white only
const SLIDES = [
  {
    id: "1",
    icon: null, // slide 1 shows logo instead
    tag: "Welcome",
    title: "MagkanoToll",
    subtitle:
      "Instant toll fee calculations across all Philippine expressways — NLEX, SLEX, Skyway, TPLEX, and more.",
  },
  {
    id: "2",
    icon: RouteIcon,
    tag: "Route Planner",
    title: "Plan Your\nRoute",
    subtitle:
      "Pick your origin and destination, choose your vehicle class, and get an accurate toll breakdown in seconds.",
  },
  {
    id: "3",
    icon: WalletCardsIcon,
    tag: "RFID & Cost",
    title: "Split Costs\nEasily",
    subtitle:
      "See exactly how much to load on your EasyTrip or Autosweep wallet, and split trip costs with your passengers.",
  },
  {
    id: "4",
    icon: Clock01Icon,
    tag: "History",
    title: "Save Every\nTrip",
    subtitle:
      "All your routes are saved to your account so you can review toll history and re-use frequent routes anytime.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { signInAnonymously } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      (flatListRef.current as any)?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("onboarding_done", "true");
    await signInAnonymously();
    router.replace("/(tabs)" as any);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleMomentumEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#171717" }}>
      <StatusBar barStyle="light-content" />

      {/* ── Slides ── */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [30, 0, 30],
            extrapolate: "clamp",
          });

          return (
            <View style={{ width, height }}>
              <LinearGradient
                colors={["#2a1f00", "#171717"]}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Decorative rings */}
              <View style={styles.ring1} />
              <View style={styles.ring2} />

              <Animated.View
                style={[
                  styles.slideContent,
                  { paddingTop: insets.top + 60, opacity, transform: [{ translateY }] },
                ]}
              >
                {/* Slide 1 — logo; others — HugeIcon */}
                {item.id === "1" ? (
                  <View style={styles.logoWrap}>
                    <Image
                      source={require("../../assets/images/magkanoLogo.png")}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.iconWrap}>
                    <HugeiconsIcon icon={item.icon!} size={44} color="#ffc400" />
                  </View>
                )}

                {/* Tag pill */}
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{item.title}</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      {/* ── Bottom controls ── */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        {/* Counter */}
        <Text style={styles.counter}>{activeIndex + 1} / {SLIDES.length}</Text>

        {/* CTA */}
        <Pressable
          onPress={isLast ? handleGetStarted : handleNext}
          style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.ctaText}>{isLast ? "Get Started" : "Next"}</Text>
          <View style={styles.ctaIconWrap}>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#ffc400" />
          </View>
        </Pressable>

        {/* Skip */}
        {!isLast && (
          <Pressable onPress={handleGetStarted} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
  },

  // Decorative rings — accent color
  ring1: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "#ffc40018",
    top: -width * 0.25,
    alignSelf: "center",
  },
  ring2: {
    position: "absolute",
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "#ffc40010",
    top: -width * 0.05,
    alignSelf: "center",
  },

  // Slide 1 logo
  logoWrap: {
    width: 160,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logo: {
    width: 160,
    height: 60,
  },

  // Other slides icon
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#ffc40040",
    backgroundColor: "#ffc40018",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  tag: {
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#ffc40025",
    marginBottom: 16,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "LufgaSemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#ffc400",
  },
  title: {
    fontSize: 42,
    fontFamily: "LufgaBlack",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 50,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "LufgaRegular",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },

  // Bottom sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 24,
    backgroundColor: "rgba(23,23,23,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,196,0,0.08)",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 8,
  },
  dot: {
    height: 6,
    borderRadius: 99,
    backgroundColor: "#ffc400",
  },
  counter: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "LufgaRegular",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 4,
    backgroundColor: "#171717",
    borderWidth: 1.5,
    borderColor: "#ffc400",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "LufgaBold",
  },
  ctaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: "#ffc40020",
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    fontFamily: "LufgaRegular",
  },
});
