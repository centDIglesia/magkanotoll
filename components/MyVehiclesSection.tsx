import { SavedVehicle, useVehicleStore } from "@/stores/useVehicleStore";
import AppModal, { useAppModal } from "@/components/AppModal";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Car01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VehicleCard from "./vehicles/VehicleCard";
import VehicleFormModal from "./vehicles/VehicleFormModal";
import Skeleton from "@/components/Skeleton";

export default function MyVehiclesSection() {
  const { vehicles, loading, fetchVehicles, deleteVehicle } = useVehicleStore();
  const { show, modalProps } = useAppModal();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<SavedVehicle | null>(null);

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = (vehicle: SavedVehicle) => {
    show({
      type: "confirm",
      title: "Delete Vehicle",
      message: `Delete "${vehicle.nickname}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => deleteVehicle(vehicle.id),
    });
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-muted-foreground text-sm" style={styles.body}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-primary px-3 py-2 rounded-xl"
          onPress={() => setShowAdd(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} color="#fff" />
          <Text className="text-white text-xs" style={styles.bold}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading ? (
        <View className="gap-2.5">
          {[1, 2].map((i) => (
            <View key={i} className="bg-white rounded-2xl p-4 border border-neutral-100">
              <View className="flex-row items-center gap-3 mb-3">
                <Skeleton width={40} height={40} radius={12} />
                <View className="flex-1 gap-2">
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="40%" height={12} />
                </View>
                <Skeleton width={32} height={32} radius={10} />
              </View>
              <Skeleton width="100%" height={1} radius={0} />
              <View className="flex-row gap-2 mt-3">
                <Skeleton width={60} height={20} radius={99} />
                <Skeleton width={70} height={20} radius={99} />
                <Skeleton width={50} height={20} radius={99} />
              </View>
            </View>
          ))}
        </View>
      ) : vehicles.length === 0 ? (
        <View className="items-center py-10 gap-3">
          <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center">
            <HugeiconsIcon icon={Car01Icon} size={28} color="#ffc400" />
          </View>
          <Text className="text-foreground text-base" style={styles.bold}>No vehicles yet</Text>
          <Text className="text-muted-foreground text-sm text-center" style={styles.body}>
            Add your vehicle to get accurate gas estimates
          </Text>
          <TouchableOpacity
            className="mt-1 bg-primary rounded-2xl px-6 py-3 flex-row items-center gap-2"
            onPress={() => setShowAdd(true)}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} color="#fff" />
            <Text className="text-white text-sm" style={styles.bold}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="gap-2.5">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={() => setEditing(v)}
              onDelete={() => handleDelete(v)}
            />
          ))}
        </View>
      )}

      {showAdd && <VehicleFormModal onClose={() => setShowAdd(false)} />}
      {editing && <VehicleFormModal initial={editing} onClose={() => setEditing(null)} />}
      <AppModal {...modalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
