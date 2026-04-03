import { SavedVehicle, useVehicleStore } from "@/stores/useVehicleStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Car01Icon, PlugSocketIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CLASS_LABELS,
  FUEL_OPTIONS,
  NICKNAME_MAX_LENGTH,
} from "./VehicleConstants";

interface Props {
  initial?: SavedVehicle;
  onClose: () => void;
}

export default function VehicleFormModal({ initial, onClose }: Props) {
  const { addVehicle, updateVehicle } = useVehicleStore();

  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [vehicleClass, setVehicleClass] = useState<1 | 2 | 3>(
    initial?.vehicle_class ?? 1,
  );
  const [fuelType, setFuelType] = useState(initial?.fuel_type ?? "Gasoline");
  const [engineCc, setEngineCc] = useState(initial?.engine_cc ?? "");
  const [batteryKwh, setBatteryKwh] = useState(initial?.battery_kwh ?? "");
  const [saving, setSaving] = useState(false);

  const isElectric = fuelType.toLowerCase().includes("electric");

  const canSave =
    nickname.trim().length > 0 &&
    nickname.trim().length <= NICKNAME_MAX_LENGTH &&
    // Electric needs battery kWh; ICE/Hybrid needs engine cc
    (isElectric ? batteryKwh.trim().length > 0 : engineCc.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        nickname: nickname.trim(),
        vehicle_class: vehicleClass,
        fuel_type: fuelType,
        engine_cc: isElectric ? null : engineCc.trim() || null,
        battery_kwh: isElectric ? batteryKwh.trim() || null : null,
      };
      if (initial) {
        await updateVehicle(initial.id, payload);
      } else {
        await addVehicle(payload);
      }
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-[32px] p-6 pb-10"
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Handle */}
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />

            {/* Title */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-2xl bg-accent/10 items-center justify-center">
                <HugeiconsIcon
                  icon={isElectric ? PlugSocketIcon : Car01Icon}
                  size={20}
                  color="#ffc400"
                />
              </View>
              <Text className="text-xl text-foreground" style={styles.bold}>
                {initial ? "Edit Vehicle" : "Add Vehicle"}
              </Text>
            </View>

            {/* ── Nickname ─────────────────────────────────────── */}
            <Label>Nickname</Label>
            <TextInput
              className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-1"
              style={styles.body}
              placeholder="e.g. My Innova, Daily Driver"
              placeholderTextColor="#A3A3A3"
              value={nickname}
              onChangeText={setNickname}
              maxLength={NICKNAME_MAX_LENGTH}
              autoFocus={!initial}
            />
            <Text
              className="text-muted-foreground text-[10px] text-right mb-4"
              style={styles.body}
            >
              {nickname.length}/{NICKNAME_MAX_LENGTH}
            </Text>

            {/* ── Vehicle Class ─────────────────────────────────── */}
            <Label>Vehicle Class</Label>
            <View className="gap-2 mb-4">
              {([1, 2, 3] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.8}
                  className={`px-4 py-3 rounded-2xl border-2 ${
                    vehicleClass === c
                      ? "bg-primary border-primary"
                      : "bg-neutral-50 border-neutral-100"
                  }`}
                  onPress={() => setVehicleClass(c)}
                >
                  <Text
                    className={`text-sm ${vehicleClass === c ? "text-white" : "text-foreground"}`}
                    style={styles.semibold}
                  >
                    {CLASS_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Fuel Type ─────────────────────────────────────── */}
            <Label>Fuel Type</Label>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2">
                {FUEL_OPTIONS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    activeOpacity={0.8}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      fuelType === f
                        ? "bg-primary border-primary"
                        : "bg-neutral-50 border-neutral-100"
                    }`}
                    onPress={() => setFuelType(f)}
                  >
                    <Text
                      className={`text-sm ${fuelType === f ? "text-white" : "text-foreground"}`}
                      style={styles.semibold}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* ── Engine CC (ICE / Hybrid only) ─────────────────── */}
            {!isElectric && (
              <>
                <Label>Engine Displacement</Label>
                <View className="flex-row items-center bg-neutral-100 rounded-2xl px-4 mb-4">
                  <TextInput
                    className="flex-1 py-3.5 text-foreground"
                    style={styles.body}
                    placeholder="e.g. 1500"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    value={engineCc}
                    onChangeText={(t) => setEngineCc(t.replace(/[^0-9]/g, ""))}
                    maxLength={5}
                  />
                  <Text
                    className="text-muted-foreground text-sm"
                    style={styles.body}
                  >
                    cc
                  </Text>
                </View>
              </>
            )}

            {/* ── Battery kWh (Electric only) ───────────────────── */}
            {isElectric && (
              <>
                <Label>Battery Capacity</Label>
                <View className="flex-row items-center bg-neutral-100 rounded-2xl px-4 mb-2">
                  <TextInput
                    className="flex-1 py-3.5 text-foreground"
                    style={styles.body}
                    placeholder="e.g. 40.2"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="decimal-pad"
                    value={batteryKwh}
                    onChangeText={(t) =>
                      setBatteryKwh(t.replace(/[^0-9.]/g, ""))
                    }
                    maxLength={6}
                  />
                  <Text
                    className="text-muted-foreground text-sm"
                    style={styles.body}
                  >
                    kWh
                  </Text>
                </View>
                <Text
                  className="text-muted-foreground text-[10px] mb-4"
                  style={styles.body}
                >
                  Used to estimate energy consumption per trip.
                </Text>
              </>
            )}

            {/* ── Save ──────────────────────────────────────────── */}
            <Pressable
              className={`rounded-2xl py-4 items-center mt-2 ${
                !canSave || saving ? "bg-neutral-300" : "bg-primary"
              }`}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              <Text className="text-white text-base" style={styles.bold}>
                {saving ? "Saving…" : initial ? "Save Changes" : "Add Vehicle"}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text
      className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1.5"
      style={{ fontFamily: "LufgaSemiBold" }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
});
