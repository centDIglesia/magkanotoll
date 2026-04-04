import InfoModal, { InfoButton } from "@/components/InfoModal";
import { useSavedRoutesStore } from "@/stores/useSavedRoutesStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useAuthStore } from "@/stores/useAuthStore";
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
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
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
import Skeleton from "@/components/Skeleton";

// ── Label input with animated save confirmation ──────────────────────────────
function SaveRouteInline({
  origin,
  destination,
  onSave,
}: {
  origin: string;
  destination: string;
  onSave: (label: string) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;

  const handleSave = async () => {
    if (!label.trim() || saving) return;
    setSaving(true);
    await onSave(label.trim());
    setSaving(false);
    setSaved(true);
    setLabel("");
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 180,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(checkScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setSaved(false));
      }, 1800);
    });
  };

  return (
    <View className="mt-8 mb-4">
      {/* Section label */}
      <Text
        className="text-muted-foreground text-sm mb-3 ml-1"
        style={styles.semibold}
      >
        Save This Route
      </Text>

      <View className="bg-white rounded-3xl border border-neutral-100 px-5 pt-5 pb-5">
        <Text className="text-foreground text-sm mb-1" style={styles.semibold}>
          {origin} → {destination}
        </Text>
        <Text
          className="text-muted-foreground text-xs mb-4"
          style={styles.body}
        >
          Give this route a name to find it quickly later.
        </Text>

        <View className="flex-row gap-3 items-center">
          <TextInput
            className="flex-1 bg-neutral-100 rounded-2xl px-4 py-3 text-foreground text-sm"
            style={styles.body}
            placeholder="e.g. Daily Commute"
            placeholderTextColor="#A3A3A3"
            value={label}
            onChangeText={setLabel}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            editable={!saving && !saved}
          />

          {saved ? (
            <Animated.View
              style={{ transform: [{ scale: checkScale }] }}
              className="w-12 h-12 rounded-2xl bg-green-500 items-center justify-center"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={22}
                color="#fff"
              />
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={!label.trim() || saving}
              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                !label.trim() || saving ? "bg-neutral-200" : "bg-primary"
              }`}
            >
              <HugeiconsIcon
                icon={BookmarkAdd01Icon}
                size={20}
                color={!label.trim() || saving ? "#A3A3A3" : "#fff"}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { isAnonymous } = useAuthStore();
  const [showRfidInfo, setShowRfidInfo] = useState(false);
  const [showBreakdownInfo, setShowBreakdownInfo] = useState(false);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const displaySegments = activeAlt ? activeAlt.segments : result.segments;
  const displayTotal = activeAlt ? activeAlt.totalToll : result.totalToll;

  useEffect(() => {
    if (!isAnonymous) fetchVehicles();
  }, [isAnonymous]);

  const activeVehicle =
    !isAnonymous && vehicles.length > 0 ? vehicles[0] : null;
  const engineCc = activeVehicle?.engine_cc
    ? parseInt(activeVehicle.engine_cc)
    : undefined;
  const fuelType = activeVehicle?.fuel_type ?? undefined;
  const isElectric =
    activeVehicle?.fuel_type?.toLowerCase().includes("electric") ?? false;

  useEffect(() => {
    setStatsLoading(true);
    setTripStats(null);
    fetchOsrmTripStats(displaySegments, vehicleClass, engineCc, fuelType)
      .then(setTripStats)
      .catch(() => setTripStats(null))
      .finally(() => setStatsLoading(false));
  }, [activeAlt, vehicleClass, engineCc, fuelType]);

  const handleSaveRoute = async (label: string) => {
    await addRoute({
      label,
      origin: result.origin,
      destination: result.destination,
      vehicleClass,
      totalToll: result.totalToll,
    });
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <LinearGradient
        colors={["#4b3300", "#0f0f0f"]}
        className="rounded-3xl overflow-hidden border"
      >
        <View className="rounded-3xl items-center p-8 gap-1">
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

          {/* Stat tiles */}
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={Clock01Icon} size={16} color="#ffc400" />
              {statsLoading ? (
                <Skeleton width={48} height={14} radius={6} style={{ marginTop: 6, marginBottom: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
              ) : (
                <Text className="text-white text-sm mt-1" style={styles.bold}>
                  {tripStats ? `~${tripStats.etaMinutes} min` : "N/A"}
                </Text>
              )}
              <Text className="text-white/50 text-[10px]" style={styles.body}>ETA</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={DashboardSpeed02Icon} size={16} color="#ffc400" />
              {statsLoading ? (
                <Skeleton width={48} height={14} radius={6} style={{ marginTop: 6, marginBottom: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
              ) : (
                <Text className="text-white text-sm mt-1" style={styles.bold}>
                  {tripStats ? `~${tripStats.totalKm} km` : "N/A"}
                </Text>
              )}
              <Text className="text-white/50 text-[10px]" style={styles.body}>Distance</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
              <HugeiconsIcon icon={FuelStationIcon} size={16} color="#ffc400" />
              {statsLoading && !isElectric ? (
                <Skeleton width={48} height={14} radius={6} style={{ marginTop: 6, marginBottom: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
              ) : (
                <Text className="text-white text-sm mt-1" style={styles.bold}>
                  {isElectric ? "—" : tripStats ? `~${tripStats.gasLiters.toFixed(1)}L` : "N/A"}
                </Text>
              )}
              {statsLoading && !isElectric ? (
                <Skeleton width={36} height={10} radius={4} style={{ marginTop: 2, backgroundColor: "rgba(255,255,255,0.15)" }} />
              ) : (
                <Text className="text-white/50 text-[10px]" style={styles.body}>
                  {isElectric ? "Electric" : tripStats ? `${tripStats.effectiveKmL} km/L` : "Gas"}
                </Text>
              )}
            </View>
          </View>

          {/* Vehicle badge */}
          {activeVehicle && (
            <View className="flex-row items-center gap-1.5 mt-3 bg-white/10 rounded-xl px-3 py-2">
              <HugeiconsIcon icon={FuelStationIcon} size={12} color="#ffc400" />
              <Text
                className="text-white/70 text-[10px] flex-1"
                style={styles.body}
              >
                Based on {activeVehicle.nickname}
                {activeVehicle.engine_cc
                  ? ` · ${activeVehicle.engine_cc}cc`
                  : ""}
                {activeVehicle.fuel_type ? ` · ${activeVehicle.fuel_type}` : ""}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* ── Alternative Routes ────────────────────────────── */}
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
              className={`px-5 py-3 rounded-2xl mr-3 border-2 ${
                !activeAlt
                  ? "bg-primary border-primary"
                  : "bg-white border-neutral-100"
              }`}
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
                className={`px-5 py-3 rounded-2xl mr-3 border-2 ${
                  activeAlt?.tag === alt.tag
                    ? "bg-primary border-primary"
                    : "bg-white border-neutral-100"
                }`}
                onPress={() => onAltChange(alt)}
              >
                <Text
                  className={`text-xs ${
                    activeAlt?.tag === alt.tag
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                  style={styles.semibold}
                >
                  {alt.label}
                </Text>
                <Text
                  className={`text-sm ${
                    activeAlt?.tag === alt.tag
                      ? "text-white"
                      : "text-foreground"
                  }`}
                  style={styles.bold}
                >
                  ₱{Number(alt.totalToll).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Toll Breakdown ────────────────────────────────── */}
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
                <Text
                  className="text-foreground text-sm"
                  style={styles.semibold}
                >
                  {seg.expresswayName}
                </Text>
                <Text
                  className="text-muted-foreground text-[11px] mt-0.5"
                  style={styles.body}
                >
                  {seg.entryPlaza} → {seg.exitPlaza}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-foreground text-base" style={styles.bold}>
                  ₱{Number(seg.toll).toFixed(2)}
                </Text>
                <Text
                  className="text-muted-foreground/60 text-[9px] mt-0.5 uppercase tracking-tighter"
                  style={styles.body}
                >
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
            const dest = getPlazaCoords(
              displaySegments[displaySegments.length - 1].exitPlaza,
            );
            if (!origin || !dest) return;
            const waypoints = displaySegments
              .slice(1, -1)
              .map((s) => getPlazaCoords(s.entryPlaza))
              .filter(Boolean)
              .map((c) => `${c!.lat},${c!.lng}`)
              .join("|");
            const url =
              `https://www.google.com/maps/dir/?api=1` +
              `&origin=${origin.lat},${origin.lng}` +
              `&destination=${dest.lat},${dest.lng}` +
              `${waypoints ? `&waypoints=${waypoints}` : ""}` +
              `&travelmode=driving`;
            Linking.openURL(url);
          }}
        >
          <HugeiconsIcon icon={MapsSquare01Icon} size={16} color="#ffc400" />
          <Text className="text-accent-foreground text-sm" style={styles.bold}>
            Open in Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      <RouteMap segments={displaySegments} />

      <TripCostSharing
        totalToll={displayTotal}
        gasLiters={tripStats?.gasLiters ?? null}
        activeVehicle={activeVehicle}
        effectiveKmL={tripStats?.effectiveKmL}
      />

      {/* ── RFID Wallets ──────────────────────────────────── */}
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

      {/* ── Inline Save Route (replaces modal) ────────────── */}
      {!isAnonymous && (
        <SaveRouteInline
          origin={result.origin}
          destination={result.destination}
          onSave={handleSaveRoute}
        />
      )}

      {/* ── Reset ─────────────────────────────────────────── */}
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 mt-4 mb-10 py-3"
        onPress={onReset}
      >
        <HugeiconsIcon icon={RefreshIcon} size={15} color="#A3A3A3" />
        <Text className="text-muted-foreground text-sm" style={styles.body}>
          Start a new calculation
        </Text>
      </TouchableOpacity>

      {/* ── Info modals ───────────────────────────────────── */}
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
        description={`Different expressways use different RFID systems. This breakdown shows how much you need loaded on each RFID wallet to complete your trip.\n\nFor example, if your route passes through NLEX (EasyTrip) and SLEX (Autosweep), you'll see the required balance for each tag separately.\n\nMake sure each wallet has enough balance before your trip.`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
});
