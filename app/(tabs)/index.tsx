import FloatingHeader from "@/components/FloatingHeader";
import PlazaPicker, { PlazaSection } from "@/components/calculator/PlazaPicker";
import TollResult from "@/components/calculator/TollResult";
import VehicleClassSelector from "@/components/calculator/VehicleClassSelector";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useSavedRoutesStore } from "@/stores/useSavedRoutesStore";
import {
  AlternativeRoute,
  TollCalculatorResponse,
  VehicleClass,
  fetchExpresswayToll,
} from "@/utils/tollApi";
import { tollPlazas, Expressway } from "@/utils/tollData";
import { ArrowRight01Icon, BookmarkIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ExpresswayKey = keyof Omit<typeof tollPlazas, "summary">;

const EXPRESSWAY_KEYS = Object.keys(tollPlazas).filter(
  (k) => k !== "summary",
) as ExpresswayKey[];

const ORIGIN_SECTIONS: PlazaSection[] = EXPRESSWAY_KEYS.map((key) => {
  const ew = tollPlazas[key] as Expressway;
  return { title: ew.fullName, data: ew.plazaList.map((p) => p.name) };
});

export default function Calculator() {
  const { addEntry, history } = useHistoryStore();
  const { user, isAnonymous } = useAuthStore();
  const { routes, fetchRoutes } = useSavedRoutesStore();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"error" | "notice">("error");
  const [result, setResult] = useState<TollCalculatorResponse | null>(null);
  const [activeAlt, setActiveAlt] = useState<AlternativeRoute | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [result]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const destinationSections: PlazaSection[] = ORIGIN_SECTIONS.map(
    (section) => ({
      ...section,
      data: section.data.filter((p) => p !== origin),
    }),
  ).filter((s) => s.data.length > 0);

  const handleOriginChange = (v: string) => {
    setOrigin(v);
    setDestination("");
    setResult(null);
    setActiveAlt(null);
    setError("");
  };

  const calculate = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Please select both origin and destination.");
      return;
    }
    setError("");
    setResult(null);
    setActiveAlt(null);
    setLoading(true);
    try {
      const data = await fetchExpresswayToll({
        origin: origin.trim(),
        dest: destination.trim(),
        class: vehicleClass,
      });
      setResult(data);

      await addEntry({
        origin: origin.trim(),
        destination: destination.trim(),
        vehicleClass,
        result: data,
      });
    } catch (e: any) {
      const isNotice = e.message?.toLowerCase().includes("no route");
      setErrorType(isNotice ? "notice" : "error");
      setError(e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setOrigin("");
    setDestination("");
    setVehicleClass(1);
    setResult(null);
    setActiveAlt(null);
    setError("");
    setErrorType("error");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f7f7f7]" edges={[]}>
      <FloatingHeader title="MagkanoToll" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <LinearGradient
          colors={["#4b3300", "#0f0f0f"]}
          style={styles.greetingCard}
        >
          <Image
            source={require("../../assets/images/phil_toll.png")}
            style={styles.greetingBg}
            resizeMode="cover"
          />

          <View style={styles.overlay} />

          <View className="p-5">
            <Text className="text-white text-xs mb-0.5" style={styles.body}>
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <Text className="text-white text-xl mb-3" style={styles.bold}>
              {isAnonymous
                ? "Hello, Guest 👋"
                : `Hello, ${user?.full_name?.split(" ")[0]} 👋`}
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-white/10 rounded-xl p-3">
                <Text className="text-white/60 text-xs" style={styles.body}>
                  Calculations
                </Text>
                <Text className="text-accent text-xl" style={styles.bold}>
                  {history.length}
                </Text>
              </View>

              <View className="flex-1 bg-white/10 rounded-xl p-3">
                <Text className="text-white/60 text-xs" style={styles.body}>
                  Saved Routes
                </Text>
                <Text className="text-accent text-2xl" style={styles.bold}>
                  {routes.length}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        {!isAnonymous && routes.length > 0 && (
          <>
            <Text
              className="text-muted-foreground text-sm mb-2 ml-1"
              style={styles.semibold}
            >
              Quick Access
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
            >
              {routes.slice(0, 5).map((route) => (
                <Pressable
                  key={route.id}
                  onPress={() => {
                    handleOriginChange(route.origin);
                    setDestination(route.destination);
                    setVehicleClass(route.vehicleClass);
                  }}
                  className="bg-white border border-neutral-100 rounded-2xl px-4 py-3 mr-2.5 min-w-[140px]"
                >
                  <View className="flex-row items-center gap-1.5 mb-1.5">
                    <HugeiconsIcon
                      icon={BookmarkIcon}
                      size={12}
                      color="#ffc400"
                    />
                    <Text
                      className="text-accent-foreground text-[11px] flex-1"
                      numberOfLines={1}
                      style={styles.bold}
                    >
                      {route.label}
                    </Text>
                  </View>
                  <Text
                    className="text-foreground text-xs"
                    numberOfLines={1}
                    style={styles.body}
                  >
                    {route.origin}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={10}
                      color="#A3A3A3"
                    />
                    <Text
                      className="text-muted-foreground text-xs"
                      numberOfLines={1}
                      style={styles.body}
                    >
                      {route.destination}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        <Text
          className="text-muted-foreground text-md mb-2 ml-1"
          style={styles.semibold}
        >
          Calculate Toll
        </Text>

        <LinearGradient
          colors={["#ffcf2e", "#ffc400", "#ffae00"]}
          className=" rounded-3xl p-5 mb-5 overflow-hidden"
        >
          <View>
            <Text className="text-white text-sm  mb-2 ml-1" style={styles.body}>
              Where are you going?
            </Text>
            <PlazaPicker
              label="Origin"
              value={origin}
              sections={ORIGIN_SECTIONS}
              onChange={handleOriginChange}
            />
            <View className="h-px bg-accent mx-2 my-1" />
            <PlazaPicker
              label="Destination"
              value={destination}
              sections={destinationSections}
              onChange={setDestination}
              disabled={!origin}
            />
            <VehicleClassSelector
              value={vehicleClass}
              onChange={setVehicleClass}
            />

            {error ? (
              <Text
                className={`px-4 py-3 rounded-2xl mt-4 text-xs ${errorType === "notice" ? "text-accent-foreground bg-accent/20" : "text-destructive bg-destructive/10"}`}
                style={styles.body}
              >
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mt-4  ${loading ? "bg-neutral-300" : "bg-primary "}`}
              onPress={calculate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base" style={styles.bold}>
                  Calculate Toll
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {result && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TollResult
              result={result}
              activeAlt={activeAlt}
              onAltChange={setActiveAlt}
              onReset={reset}
              vehicleClass={vehicleClass}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  content: { padding: 20, paddingBottom: 110 },

  greetingCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },

  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    width: "100%",
    height: "100%",
  },
  greetingBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },

  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },

  button: {
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },

  text: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#fff",
  },
});
