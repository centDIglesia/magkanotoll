import { SavedVehicle } from "@/stores/useVehicleStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  UserGroupIcon,
  FuelStationIcon,
  MinusSignIcon,
  PlusSignIcon,
  Car01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  totalToll: number;
  gasLiters: number | null;
  activeVehicle: SavedVehicle | null;
  effectiveKmL?: number;
}

const GAS_PRICE_GASOLINE = 65;
const GAS_PRICE_DIESEL   = 60;

export default function TripCostSharing({ totalToll, gasLiters, activeVehicle, effectiveKmL }: Props) {
  const isElectric = activeVehicle?.fuel_type?.toLowerCase().includes("electric") ?? false;
  const isDiesel   = activeVehicle?.fuel_type?.toLowerCase().includes("diesel") ?? false;
  const defaultPrice = isDiesel ? GAS_PRICE_DIESEL : GAS_PRICE_GASOLINE;

  const [passengers, setPassengers] = useState(2);
  const [gasPrice, setGasPrice] = useState(String(defaultPrice));

  const parsedPrice = parseFloat(gasPrice) || defaultPrice;
  const gasCost     = (!isElectric && gasLiters) ? gasLiters * parsedPrice : 0;
  const totalCost   = totalToll + gasCost;
  const perPerson   = passengers > 0 ? totalCost / passengers : totalCost;

  return (
    <View className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4">
      <View className="flex-row items-center gap-2 mb-4">
        <HugeiconsIcon icon={UserGroupIcon} size={18} color="#ffc400" />
        <Text className="text-foreground text-sm flex-1" style={styles.bold}>
          Trip Cost Sharing
        </Text>
      </View>

      {/* Vehicle badge */}
      <View className={`flex-row items-center gap-2 rounded-2xl px-3 py-2.5 mb-3 ${activeVehicle ? "bg-accent/10" : "bg-neutral-50 border border-neutral-100"}`}>
        <HugeiconsIcon icon={Car01Icon} size={14} color={activeVehicle ? "#ffc400" : "#A3A3A3"} />
        <Text className="text-xs flex-1" style={[styles.body, { color: activeVehicle ? "#78580a" : "#A3A3A3" }]}>
          {activeVehicle
            ? isElectric
              ? `${activeVehicle.nickname} · Electric — no fuel cost`
              : `${activeVehicle.nickname}${activeVehicle.engine_cc ? ` · ${activeVehicle.engine_cc}cc` : ""}${activeVehicle.fuel_type ? ` · ${activeVehicle.fuel_type}` : ""}${effectiveKmL ? ` · ${effectiveKmL} km/L` : ""}`
            : "Using default estimate — save a vehicle for better accuracy"}
        </Text>
      </View>

      {/* Gas price input — hidden for electric */}
      {!isElectric && gasLiters ? (
        <View className="flex-row items-center bg-neutral-50 rounded-2xl px-4 border border-neutral-100 mb-3">
          <HugeiconsIcon icon={FuelStationIcon} size={16} color="#ffc400" />
          <Text className="text-muted-foreground text-xs ml-2 mr-1" style={styles.body}>₱</Text>
          <TextInput
            className="flex-1 py-3 text-foreground text-sm"
            style={styles.body}
            keyboardType="numeric"
            value={gasPrice}
            onChangeText={setGasPrice}
            placeholder="Gas price per liter"
            placeholderTextColor="#A3A3A3"
          />
          <Text className="text-muted-foreground text-xs" style={styles.body}>
            /L · {gasLiters.toFixed(1)}L
          </Text>
        </View>
      ) : null}

      {/* Passenger counter */}
      <View className="flex-row items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3 border border-neutral-100 mb-4">
        <Text className="text-muted-foreground text-sm" style={styles.body}>Passengers</Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => setPassengers((p) => Math.max(1, p - 1))}
            className="w-8 h-8 bg-white rounded-xl border border-neutral-200 items-center justify-center"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={14} color="#171717" />
          </Pressable>
          <Text className="text-foreground text-base w-6 text-center" style={styles.bold}>
            {passengers}
          </Text>
          <Pressable
            onPress={() => setPassengers((p) => Math.min(20, p + 1))}
            className="w-8 h-8 bg-white rounded-xl border border-neutral-200 items-center justify-center"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} color="#171717" />
          </Pressable>
        </View>
      </View>

      {/* Breakdown */}
      <View className="gap-2 mb-4">
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-xs" style={styles.body}>Toll</Text>
          <Text className="text-foreground text-xs" style={styles.body}>₱{totalToll.toFixed(2)}</Text>
        </View>
        {!isElectric && gasLiters ? (
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground text-xs" style={styles.body}>
              Gas ({gasLiters.toFixed(1)}L × ₱{parsedPrice})
            </Text>
            <Text className="text-foreground text-xs" style={styles.body}>₱{gasCost.toFixed(2)}</Text>
          </View>
        ) : null}
        <View className="h-px bg-neutral-100" />
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-xs" style={styles.body}>Total</Text>
          <Text className="text-foreground text-xs" style={styles.bold}>₱{totalCost.toFixed(2)}</Text>
        </View>
      </View>

      {/* Per person */}
      <View className="bg-accent/10 rounded-2xl p-4 items-center">
        <Text className="text-muted-foreground text-xs mb-1" style={styles.body}>Each person pays</Text>
        <Text className="text-accent-foreground text-3xl" style={styles.bold}>
          ₱{perPerson.toFixed(2)}
        </Text>
        <Text className="text-muted-foreground text-xs mt-1" style={styles.body}>
          split among {passengers} {passengers === 1 ? "person" : "people"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
