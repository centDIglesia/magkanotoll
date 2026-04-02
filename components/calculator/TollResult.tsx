import InfoModal, { InfoButton } from "@/components/InfoModal";
import { useSavedRoutesStore } from "@/stores/useSavedRoutesStore";
import {
  AlternativeRoute,
  TollCalculatorResponse,
  TripStats,
  VehicleClass,
  fetchOsrmTripStats,
} from "@/utils/tollApi";
import { getPlazaCoords } from "@/utils/tollData";
import {
  BookmarkAdd01Icon,
  Clock01Icon,
  FuelStationIcon,
  RefreshIcon,
  DashboardSpeed02Icon,
  TrafficLightIcon,
  WalletCardsIcon,
  MapsSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RouteMap from "./RouteMap";
import TripCostSharing from "./TripCostSharing";

export default function TollResult({
  result,
  activeAlt,
  onAltChange,
  onReset,
  vehicleClass,
}: {
  result: TollCalculatorResponse;
  activeAlt: AlternativeRoute | null;
  onAltChange: (alt: AlternativeRoute | null) => void;
  onReset: () => void;
  vehicleClass: VehicleClass;
}) {
  const { addRoute } = useSavedRoutesStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRfidInfo, setShowRfidInfo] = useState(false);
  const [showBreakdownInfo, setShowBreakdownInfo] = useState(false);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const displaySegments = activeAlt ? activeAlt.segments : result.segments;
  const displayTotal = activeAlt ? activeAlt.totalToll : result.totalToll;

  useEffect(() => {
    setStatsLoading(true);
    setTripStats(null);
    fetchOsrmTripStats(displaySegments, vehicleClass)
      .then(setTripStats)
      .catch(() => setTripStats(null))
      .finally(() => setStatsLoading(false));
  }, [activeAlt, vehicleClass]);

  const handleSave = async () => {
    if (!label.trim()) return;
    setSaving(true);
    await addRoute({
      label: label.trim(),
      origin: result.origin,
      destination: result.destination,
      vehicleClass,
      totalToll: result.totalToll,
    });
    setSaving(false);
    setLabel("");
    setShowSaveModal(false);
  };

  return (
    <>
      {/* Hero */}

      <LinearGradient
        colors={["#4b3300", "#0f0f0f"]}
       className="rounded-3xl overflow-hidden border"
      >
        <View className=" rounded-3xl items-center p-8  gap-1 ">
          <Text
            className="text-white/60 text-sm uppercase tracking-[1px]"
            style={styles.body}
          >
            Total Toll Fee
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-accent text-2xl mr-1" style={styles.semibold}>
              ₱
            </Text>
            <Text className="text-white text-6xl" style={styles.black}>
              {Number(displayTotal).toFixed(0)}
            </Text>
            <Text className="text-accent text-2xl" style={styles.semibold}>
              .{Number(displayTotal).toFixed(2).split(".")[1]}
            </Text>
          </View>
          <Text
            className="text-white/80 text-sm mt-2 text-center"
            style={styles.body}
          >
            {result.origin} → {result.destination}
          </Text>
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={Clock01Icon} size={16} color="#ffc400" />
              <Text className="text-white text-sm mt-1" style={styles.bold}>
                {statsLoading ? "..." : tripStats ? `~${tripStats.etaMinutes} min` : "N/A"}
              </Text>
              <Text className="text-white/50 text-[10px]" style={styles.body}>ETA</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={DashboardSpeed02Icon} size={16} color="#ffc400" />
              <Text className="text-white text-sm mt-1" style={styles.bold}>
                {statsLoading ? "..." : tripStats ? `~${tripStats.totalKm} km` : "N/A"}
              </Text>
              <Text className="text-white/50 text-[10px]" style={styles.body}>Distance</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={FuelStationIcon} size={16} color="#ffc400" />
              <Text className="text-white text-sm mt-1" style={styles.bold}>
                {statsLoading ? "..." : tripStats ? `~${tripStats.gasLiters.toFixed(1)}L` : "N/A"}
              </Text>
              <Text className="text-white/50 text-[10px]" style={styles.body}>Gas</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Alternative Routes */}
      {result.alternativeRoutes.length > 0 && (
        <>
          <Text
            className="text-muted-foreground text-md mt-8 mb-2 ml-1"
            style={styles.semibold}
          >
            Available Routes
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              activeOpacity={0.8}
              className={`px-5 py-3 rounded-2xl mr-3 border-2 ${!activeAlt ? "bg-primary border-primary" : "bg-white border-neutral-100"}`}
              onPress={() => onAltChange(null)}
            >
              <Text
                className={`text-xs ${!activeAlt ? "text-white" : "text-muted-foreground"}`}
                style={styles.semibold}
              >
                Main
              </Text>
              <Text
                className={`text-sm ${!activeAlt ? "text-white" : "text-foreground"}`}
                style={styles.bold}
              >
                ₱{Number(result.totalToll).toFixed(2)}
              </Text>
            </TouchableOpacity>
            {result.alternativeRoutes.map((alt) => (
              <TouchableOpacity
                key={alt.tag}
                activeOpacity={0.8}
                className={`px-5 py-3 rounded-2xl mr-3 border-2 ${activeAlt?.tag === alt.tag ? "bg-primary border-primary" : "bg-white border-neutral-100"}`}
                onPress={() => onAltChange(alt)}
              >
                <Text
                  className={`text-xs ${activeAlt?.tag === alt.tag ? "text-white" : "text-muted-foreground"}`}
                  style={styles.semibold}
                >
                  {alt.label}
                </Text>
                <Text
                  className={`text-sm ${activeAlt?.tag === alt.tag ? "text-white" : "text-foreground"}`}
                  style={styles.bold}
                >
                  ₱{Number(alt.totalToll).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Toll Breakdown */}
      <View className="flex-row items-center justify-between mt-8 mb-2 ml-1">
        <Text className="text-muted-foreground text-md" style={styles.semibold}>
          Toll Breakdown
        </Text>
        <InfoButton onPress={() => setShowBreakdownInfo(true)} />
      </View>
      <View className="bg-white rounded-2xl px-5 border border-neutral-100">
        {displaySegments.map((seg, i) => (
          <View key={i}>
            <View className="flex-row items-center py-5 gap-4">
              <HugeiconsIcon icon={TrafficLightIcon} color="#332300" />
              <View className="flex-1">
                <Text className="text-foreground text-sm" style={styles.semibold}>
                  {seg.expresswayName}
                </Text>
                <Text className="text-muted-foreground text-[11px] mt-0.5" style={styles.body}>
                  {seg.entryPlaza} → {seg.exitPlaza}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-foreground text-base" style={styles.bold}>
                  ₱{Number(seg.toll).toFixed(2)}
                </Text>
                <Text className="text-muted-foreground/60 text-[9px] mt-0.5 uppercase tracking-tighter" style={styles.body}>
                  {seg.rfidSystem}
                </Text>
              </View>
            </View>
            {i < displaySegments.length - 1 && (
              <View className="h-px bg-neutral-50" />
            )}
          </View>
        ))}
        <View className="h-px bg-neutral-100" />
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4"
          onPress={() => {
            const origin = getPlazaCoords(displaySegments[0].entryPlaza);
            const dest = getPlazaCoords(displaySegments[displaySegments.length - 1].exitPlaza);
            if (!origin || !dest) return;
            const waypoints = displaySegments
              .slice(1, -1)
              .map((s) => getPlazaCoords(s.entryPlaza))
              .filter(Boolean)
              .map((c) => `${c!.lat},${c!.lng}`)
              .join("|");
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}${waypoints ? `&waypoints=${waypoints}` : ``}&travelmode=driving`;
            Linking.openURL(url);
          }}
        >
          <HugeiconsIcon icon={MapsSquare01Icon} size={16} color="#ffc400" />
          <Text className="text-accent-foreground text-sm" style={styles.bold}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>

      <RouteMap segments={displaySegments} />

      <TripCostSharing totalToll={displayTotal} gasLiters={tripStats?.gasLiters ?? null} />

      {/* RFID Wallets */}
      {result.rfidBreakdown.length > 0 && (
        <>
          <View className="flex-row items-center justify-between mt-8 mb-2 ml-1">
            <Text
              className="text-muted-foreground text-md"
              style={styles.semibold}
            >
              RFID Wallets
            </Text>
            <InfoButton onPress={() => setShowRfidInfo(true)} />
          </View>
          <View className="flex-row gap-3 mb-4">
            {result.rfidBreakdown.map((rfid) => (
              <View
                key={rfid.system}
                className="flex-1 bg-white p-5 rounded-[24px] border border-neutral-100 items-center"
              >
                <View className="p-2 rounded-lg mb-2 bg-accent/20">
                  <HugeiconsIcon icon={WalletCardsIcon} color="#ffc400" />
                </View>
                <Text
                  className="text-muted-foreground text-[11px]"
                  style={styles.body}
                >
                  {rfid.system}
                </Text>
                <Text className="text-foreground text-lg" style={styles.bold}>
                  ₱{Number(rfid.total).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Reset + Save */}
      <View className="flex-row items-center justify-center gap-4 mt-6 mb-10">
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={onReset}
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} color="#737373" />
          <Text className="text-muted-foreground text-sm" style={styles.body}>
            Reset
          </Text>
        </TouchableOpacity>
        <View className="w-px h-4 bg-border" />
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={() => setShowSaveModal(true)}
        >
          <HugeiconsIcon icon={BookmarkAdd01Icon} size={16} color="#ffc400" />
          <Text className="text-accent-foreground text-sm" style={styles.bold}>
            Save Route
          </Text>
        </TouchableOpacity>
      </View>

      <InfoModal
        visible={showBreakdownInfo}
        onClose={() => setShowBreakdownInfo(false)}
        title="What is Toll Breakdown?"
        description="This shows each expressway segment of your route and the corresponding toll fee. If your trip passes through multiple expressways, each one is listed separately with its entry and exit plaza."
      />

      <InfoModal
        visible={showRfidInfo}
        onClose={() => setShowRfidInfo(false)}
        title="What is RFID Breakdown?"
        description={`Different expressways use different RFID systems. This breakdown shows how much you need loaded on each RFID wallet to complete your trip.

For example, if your route passes through NLEX (EasyTrip) and SLEX (Autosweep), you'll see the required balance for each tag separately.

Make sure each wallet has enough balance before your trip.`}
      />

      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSaveModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowSaveModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-[32px] p-6 pb-10"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
            <Text className="text-xl mb-1" style={styles.bold}>
              Save Route
            </Text>
            <Text
              className="text-muted-foreground text-sm mb-5"
              style={styles.body}
            >
              {result.origin} → {result.destination}
            </Text>
            <Text
              className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1.5"
              style={styles.semibold}
            >
              Label
            </Text>
            <TextInput
              className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-5"
              style={styles.body}
              placeholder="e.g. Daily Commute"
              placeholderTextColor="#A3A3A3"
              value={label}
              onChangeText={setLabel}
              autoFocus
            />
            <Pressable
              className={`rounded-2xl py-4 items-center ${!label.trim() || saving ? "bg-neutral-300" : "bg-primary"}`}
              onPress={handleSave}
              disabled={!label.trim() || saving}
            >
              <Text className="text-white text-base" style={styles.bold}>
                Save
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
});
