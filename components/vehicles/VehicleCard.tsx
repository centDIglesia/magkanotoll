import { SavedVehicle, useVehicleStore } from "@/stores/useVehicleStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Car01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  FuelStationIcon,
  PencilEdit01Icon,
  PlugSocketIcon,
} from "@hugeicons/core-free-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppModal, { useAppModal } from "@/components/AppModal";
import { CLASS_SHORT } from "./VehicleConstants";

interface Props {
  vehicle: SavedVehicle;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: Props) {
  const isElectric = vehicle.fuel_type?.toLowerCase().includes("electric");
  const { show, modalProps } = useAppModal();
  const { defaultVehicleId, setDefaultVehicle } = useVehicleStore();
  const isDefault = defaultVehicleId === vehicle.id;

  const handleDeletePress = () => {
    show({
      type: "confirm",
      title: "Remove Vehicle",
      message: `Remove "${vehicle.nickname}"? This cannot be undone.`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      onConfirm: onDelete,
    });
  };

  return (
    <View className="bg-white rounded-3xl p-4 gap-3 border border-neutral-100">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center ${
              isElectric ? "bg-green-100" : "bg-accent/10"
            }`}
          >
            <HugeiconsIcon
              icon={isElectric ? PlugSocketIcon : Car01Icon}
              size={18}
              color={isElectric ? "#16a34a" : "#ffc400"}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base text-foreground" style={styles.bold}>
              {vehicle.nickname}
            </Text>
            <Text className="text-xs text-muted-foreground" style={styles.body}>
              {CLASS_SHORT[vehicle.vehicle_class]}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEdit}
            className="w-8 h-8 items-center justify-center rounded-xl bg-neutral-100"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} color="#737373" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeletePress}
            className="w-8 h-8 items-center justify-center rounded-xl bg-red-50"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges row */}
      <View className="flex-row flex-wrap gap-2">
        {/* Fuel type */}
        <View className="flex-row items-center gap-1 bg-neutral-100 rounded-lg px-2.5 py-1">
          <HugeiconsIcon icon={FuelStationIcon} size={12} color="#737373" />
          <Text className="text-xs text-muted-foreground" style={styles.body}>
            {vehicle.fuel_type}
          </Text>
        </View>

        {/* Engine CC — ICE/Hybrid only */}
        {!isElectric && vehicle.engine_cc ? (
          <View className="bg-neutral-100 rounded-lg px-2.5 py-1">
            <Text className="text-xs text-muted-foreground" style={styles.body}>
              {vehicle.engine_cc}cc
            </Text>
          </View>
        ) : null}

        {/* Battery kWh — Electric only */}
        {isElectric && vehicle.battery_kwh ? (
          <View className="bg-neutral-100 rounded-lg px-2.5 py-1">
            <Text className="text-xs text-muted-foreground" style={styles.body}>
              {vehicle.battery_kwh} kWh
            </Text>
          </View>
        ) : null}
      </View>

      {/* Default toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !isDefault && setDefaultVehicle(vehicle.id)}
        className={`flex-row items-center gap-2 rounded-xl px-3 py-2 self-start ${
          isDefault ? "bg-primary/10" : "bg-neutral-100"
        }`}
      >
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={15}
          color={isDefault ? "#ffc400" : "#a3a3a3"}
        />
        <Text
          className={`text-xs ${isDefault ? "text-primary" : "text-muted-foreground"}`}
          style={isDefault ? styles.bold : styles.body}
        >
          {isDefault ? "Default Vehicle" : "Set as Default"}
        </Text>
      </TouchableOpacity>

      <AppModal {...modalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
