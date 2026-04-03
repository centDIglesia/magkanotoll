import { SavedVehicle } from "@/stores/useVehicleStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Car01Icon,
  Delete02Icon,
  FuelStationIcon,
  PencilEdit01Icon,
  PlugSocketIcon,
} from "@hugeicons/core-free-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CLASS_SHORT } from "./VehicleConstants";

interface Props {
  vehicle: SavedVehicle;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: Props) {
  const isElectric = vehicle.fuel_type?.toLowerCase().includes("electric");

  const handleDeletePress = () => {
    Alert.alert(
      "Remove Vehicle",
      `Remove "${vehicle.nickname}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4 border border-neutral-100">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-2xl bg-accent/10 items-center justify-center">
            <HugeiconsIcon
              icon={isElectric ? PlugSocketIcon : Car01Icon}
              size={20}
              color="#ffc400"
            />
          </View>
          <View className="flex-1">
            <Text className="text-foreground text-base" style={styles.bold}>
              {vehicle.nickname}
            </Text>
            <Text
              className="text-muted-foreground text-xs mt-0.5"
              style={styles.body}
            >
              {CLASS_SHORT[vehicle.vehicle_class]}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            className="w-8 h-8 rounded-xl bg-neutral-100 items-center justify-center"
            onPress={onEdit}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={15} color="#404040" />
          </Pressable>
          <Pressable
            className="w-8 h-8 rounded-xl bg-red-50 items-center justify-center"
            onPress={handleDeletePress}
          >
            <HugeiconsIcon icon={Delete02Icon} size={15} color="#e7000b" />
          </Pressable>
        </View>
      </View>

      <View className="h-px bg-neutral-100 mb-3" />

      {/* Badges */}
      <View className="flex-row gap-2 flex-wrap">
        {/* Fuel type */}
        <View className="bg-neutral-100 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <HugeiconsIcon
            icon={isElectric ? PlugSocketIcon : FuelStationIcon}
            size={10}
            color="#737373"
          />
          <Text
            className="text-muted-foreground text-[10px]"
            style={styles.body}
          >
            {vehicle.fuel_type}
          </Text>
        </View>

        {/* Engine CC — ICE/Hybrid only */}
        {!isElectric && vehicle.engine_cc ? (
          <View className="bg-neutral-100 px-2.5 py-1 rounded-full">
            <Text
              className="text-muted-foreground text-[10px]"
              style={styles.body}
            >
              {vehicle.engine_cc}cc
            </Text>
          </View>
        ) : null}

        {/* Battery kWh — Electric only */}
        {isElectric && vehicle.battery_kwh ? (
          <View className="bg-accent/10 px-2.5 py-1 rounded-full">
            <Text
              className="text-accent-foreground text-[10px]"
              style={styles.bold}
            >
              {vehicle.battery_kwh} kWh
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
