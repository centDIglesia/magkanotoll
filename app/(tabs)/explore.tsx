import FloatingHeader from "@/components/FloatingHeader";
import { tollPlazas, Expressway } from "@/utils/tollData";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  RoadIcon,
  DashboardSpeed01Icon,
  Call02Icon,
  NewTwitterIcon,
  FacebookIcon,
  InformationCircleIcon,
  ArrowRight01Icon,
  Alert01Icon,
  DashboardSpeed02Icon,
} from "@hugeicons/core-free-icons";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EwKey = keyof typeof tollPlazas;
const EW_KEYS = Object.keys(tollPlazas) as EwKey[];

// Static toll rates per expressway (Class 1 / Class 2 / Class 3 base rates)
const TOLL_RATES: Record<string, { class1: string; class2: string; class3: string; note: string }> = {
  NLEX:           { class1: "₱11–₱217", class2: "₱22–₱434", class3: "₱33–₱651", note: "Balintawak to Dau" },
  SCTEX:          { class1: "₱45–₱268", class2: "₱90–₱536", class3: "₱135–₱804", note: "Dau to Tarlac" },
  TPLEX:          { class1: "₱28–₱196", class2: "₱56–₱392", class3: "₱84–₱588", note: "La Paz to Rosario" },
  SLEX:           { class1: "₱11–₱163", class2: "₱22–₱326", class3: "₱33–₱489", note: "Magallanes to Calamba" },
  Skyway:         { class1: "₱11–₱110", class2: "₱22–₱220", class3: "₱33–₱330", note: "Buendia to NAIAX" },
  Skyway_Stage_3: { class1: "₱11–₱110", class2: "₱22–₱220", class3: "₱33–₱330", note: "Buendia to NLEX" },
  CALAX:          { class1: "₱28–₱168", class2: "₱56–₱336", class3: "₱84–₱504", note: "Greenfield to Silang" },
  CAVITEX:        { class1: "₱11–₱88",  class2: "₱22–₱176", class3: "₱33–₱264", note: "Parañaque to Kawit" },
  MCX:            { class1: "₱33",       class2: "₱66",       class3: "₱99",       note: "Flat rate" },
  STAR_Tollway:   { class1: "₱11–₱163", class2: "₱22–₱326", class3: "₱33–₱489", note: "Calamba to Batangas" },
  NAIAX:          { class1: "₱11–₱88",  class2: "₱22–₱176", class3: "₱33–₱264", note: "Skyway to CAVITEX" },
  NLEX_Connector: { class1: "₱55",       class2: "₱110",      class3: "₱165",      note: "Flat rate" },
  Harbor_Link:    { class1: "₱11–₱66",  class2: "₱22–₱132", class3: "₱33–₱198", note: "Karuhatan to Port" },
};

const TRAFFIC_LINKS = [
  { name: "MMDA Traffic", handle: "@mmda", url: "https://twitter.com/mmda", color: "#1DA1F2", icon: NewTwitterIcon },
  { name: "MMDA Facebook", handle: "MMDA Official", url: "https://www.facebook.com/mmda.official", color: "#1877F2", icon: FacebookIcon },
  { name: "NLEX Traffic", handle: "@NLEXexpressway", url: "https://twitter.com/NLEXexpressway", color: "#1DA1F2", icon: NewTwitterIcon },
  { name: "SLEX / Skyway", handle: "@SkywayOMC", url: "https://twitter.com/SkywayOMC", color: "#1DA1F2", icon: NewTwitterIcon },
  { name: "DPWH Traffic", handle: "@dpwh_ph", url: "https://twitter.com/dpwh_ph", color: "#1DA1F2", icon: NewTwitterIcon },
  { name: "LTO Philippines", handle: "@LTO_Philippines", url: "https://twitter.com/LTO_Philippines", color: "#1DA1F2", icon: NewTwitterIcon },
];

type Section = "expressways" | "rates" | "traffic";

export default function Explore() {
  const [section, setSection] = useState<Section>("expressways");
  const [expandedEw, setExpandedEw] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
      <FloatingHeader title="Explore" />

      {/* Section Tabs */}
      <View className="flex-row mx-4 mb-3 bg-white rounded-2xl p-1 border border-neutral-100">
        {(["expressways", "rates", "traffic"] as Section[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSection(s)}
            className={`flex-1 py-2.5 rounded-xl items-center ${section === s ? "bg-accent" : ""}`}
          >
            <Text
              className={`text-xs capitalize ${section === s ? "text-accent-foreground" : "text-muted-foreground"}`}
              style={section === s ? styles.bold : styles.body}
            >
              {s === "expressways" ? "Info" : s === "rates" ? "Rates" : "Traffic"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* EXPRESSWAY INFO */}
        {section === "expressways" && EW_KEYS.map((key) => {
          const ew = tollPlazas[key] as Expressway;
          const isOpen = expandedEw === key;
          return (
            <View key={key} className="bg-white rounded-3xl border border-neutral-100 mb-3 overflow-hidden">
              <Pressable
                className="flex-row items-center gap-4 p-4"
                onPress={() => setExpandedEw(isOpen ? null : key)}
              >
                <View className="w-10 h-10 rounded-2xl bg-accent/10 items-center justify-center">
                  <HugeiconsIcon icon={RoadIcon} size={18} color="#ffc400" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-sm" style={styles.bold}>{ew.fullName}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5" style={styles.body}>{ew.region} · {ew.kilometers} km</Text>
                </View>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#D4D4D4" />
              </Pressable>

              {isOpen && (
                <>
                  <View className="h-px bg-neutral-100 mx-4" />
                  <View className="p-4 gap-3">
                    {/* Speed limit */}
                    <View className="flex-row items-center gap-3">
                      <HugeiconsIcon icon={DashboardSpeed01Icon} size={16} color="#737373" />
                      <Text className="text-muted-foreground text-xs" style={styles.body}>Speed Limit</Text>
                      <Text className="text-foreground text-xs ml-auto" style={styles.bold}>
                        {ew.speedLimit?.minKph ?? "—"}–{ew.speedLimit?.maxKph ?? "—"} kph
                      </Text>
                    </View>
                    {/* Operator */}
                    <View className="flex-row items-center gap-3">
                      <HugeiconsIcon icon={InformationCircleIcon} size={16} color="#737373" />
                      <Text className="text-muted-foreground text-xs" style={styles.body}>Operator</Text>
                      <Text className="text-foreground text-xs ml-auto flex-1 text-right" style={styles.bold}>{ew.operator ?? "—"}</Text>
                    </View>
                    {/* Hotline */}
                    <Pressable className="flex-row items-center gap-3" onPress={() => ew.hotline && Linking.openURL(`tel:${ew.hotline}`)}>
                      <HugeiconsIcon icon={Call02Icon} size={16} color="#737373" />
                      <Text className="text-muted-foreground text-xs" style={styles.body}>Hotline</Text>
                      <Text className="text-accent-foreground text-xs ml-auto" style={styles.bold}>{ew.hotline ?? "—"}</Text>
                    </Pressable>
                    {/* RFID */}
                    <View className="flex-row items-center gap-3">
                      <HugeiconsIcon icon={DashboardSpeed02Icon} size={16} color="#737373" />
                      <Text className="text-muted-foreground text-xs" style={styles.body}>RFID System</Text>
                      <Text className="text-foreground text-xs ml-auto" style={styles.bold}>{ew.rfidSystem ?? "—"}</Text>
                    </View>
                    {/* Plazas */}
                    <View className="bg-neutral-50 rounded-2xl p-3">
                      <Text className="text-muted-foreground text-[10px] uppercase tracking-widest mb-2" style={styles.body}>
                        {ew.plazas} Toll Plazas
                      </Text>
                      <Text className="text-foreground text-xs leading-5" style={styles.body}>
                        {ew.plazaList?.map((p: any) => p.name).join("  ·  ") ?? "—"}
                      </Text>
                    </View>
                    {/* Social */}
                    <View className="flex-row gap-2">
                      {ew.facebook && (
                        <Pressable
                          onPress={() => Linking.openURL(ew.facebook)}
                          className="flex-1 flex-row items-center justify-center gap-2 bg-[#1877F2]/10 rounded-xl py-2.5"
                        >
                          <HugeiconsIcon icon={FacebookIcon} size={14} color="#1877F2" />
                          <Text className="text-[#1877F2] text-xs" style={styles.bold}>Facebook</Text>
                        </Pressable>
                      )}
                      {ew.twitter && (
                        <Pressable
                          onPress={() => Linking.openURL(ew.twitter)}
                          className="flex-1 flex-row items-center justify-center gap-2 bg-[#1DA1F2]/10 rounded-xl py-2.5"
                        >
                          <HugeiconsIcon icon={NewTwitterIcon} size={14} color="#1DA1F2" />
                          <Text className="text-[#1DA1F2] text-xs" style={styles.bold}>Twitter/X</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          );
        })}

        {/* TOLL RATES */}
        {section === "rates" && (
          <>
            <View className="bg-accent/10 rounded-2xl p-3 mb-4 flex-row items-start gap-2">
              <HugeiconsIcon icon={InformationCircleIcon} size={16} color="#ffc400" />
              <Text className="text-accent-foreground text-xs flex-1 leading-5" style={styles.body}>
                Rates shown are approximate ranges. Actual toll depends on entry/exit plazas. Use the calculator for exact amounts.
              </Text>
            </View>

            {/* Header */}
            <View className="flex-row bg-neutral-200 rounded-xl px-3 py-2 mb-2">
              <Text className="flex-[2] text-muted-foreground text-[10px] uppercase" style={styles.bold}>Expressway</Text>
              <Text className="flex-1 text-muted-foreground text-[10px] uppercase text-center" style={styles.bold}>C1</Text>
              <Text className="flex-1 text-muted-foreground text-[10px] uppercase text-center" style={styles.bold}>C2</Text>
              <Text className="flex-1 text-muted-foreground text-[10px] uppercase text-center" style={styles.bold}>C3</Text>
            </View>

            {EW_KEYS.map((key) => {
              const ew = tollPlazas[key] as Expressway;
              const rates = TOLL_RATES[key];
              if (!rates) return null;
              return (
                <View key={key} className="bg-white rounded-2xl px-3 py-3.5 border border-neutral-100 mb-2">
                  <View className="flex-row items-center mb-1.5">
                    <View className="flex-[2]">
                      <Text className="text-foreground text-xs" style={styles.bold}>{ew.fullName}</Text>
                      <Text className="text-muted-foreground text-[10px]" style={styles.body}>{rates.note}</Text>
                    </View>
                    <Text className="flex-1 text-foreground text-[10px] text-center" style={styles.body}>{rates.class1}</Text>
                    <Text className="flex-1 text-foreground text-[10px] text-center" style={styles.body}>{rates.class2}</Text>
                    <Text className="flex-1 text-foreground text-[10px] text-center" style={styles.body}>{rates.class3}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* TRAFFIC ALERTS */}
        {section === "traffic" && (
          <>
            <View className="bg-accent/10 rounded-2xl p-3 mb-4 flex-row items-start gap-2">
              <HugeiconsIcon icon={Alert01Icon} size={16} color="#ffc400" />
              <Text className="text-accent-foreground text-xs flex-1 leading-5" style={styles.body}>
                Real-time traffic updates from official expressway and government social media accounts.
              </Text>
            </View>

            {TRAFFIC_LINKS.map((link) => (
              <Pressable
                key={link.url}
                onPress={() => Linking.openURL(link.url)}
                className="bg-white rounded-2xl p-4 border border-neutral-100 mb-3 flex-row items-center gap-4"
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: link.color + "20" }}>
                  <HugeiconsIcon icon={link.icon} size={20} color={link.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-sm" style={styles.bold}>{link.name}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5" style={styles.body}>{link.handle}</Text>
                </View>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#D4D4D4" />
              </Pressable>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
