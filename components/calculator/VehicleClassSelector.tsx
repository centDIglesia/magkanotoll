import InfoModal, { InfoButton } from "@/components/InfoModal";
import { VehicleClass } from "@/utils/tollApi";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react-native";
import { Car04Icon, Bus03Icon, TruckIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const VEHICLE_CLASSES: {
  label: string;
  sublabel: string;
  value: VehicleClass;
  icon: IconSvgElement;
}[] = [
  { label: "Class 1", sublabel: "Cars / SUVs", value: 1, icon: Car04Icon },
  { label: "Class 2", sublabel: "Buses / Trucks", value: 2, icon: Bus03Icon },
  { label: "Class 3", sublabel: "Heavy Cargo", value: 3, icon: TruckIcon },
];

export default function VehicleClassSelector({
  value,
  onChange,
}: {
  value: VehicleClass;
  onChange: (v: VehicleClass) => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-sm mt-4 mb-2 ml-1" style={styles.body}>
          What type of vehicle are you driving?
        </Text>
        <InfoButton onPress={() => setShowInfo(true)} />
      </View>
      <View className="flex-row gap-3 bg-white rounded-2xl p-3  ">
        {VEHICLE_CLASSES.map((cls) => {
          const isActive = value === cls.value;
          return (
            <Pressable
              key={cls.value}
              onPress={() => onChange(cls.value)}
              className={`flex-1 rounded-xl  p-3 gap-2 items-center ${
                isActive
                  ? "bg-primary  "
                  : "bg-zinc-100"
              }`}
            >
              <View className="items-center justify-center rounded-xl">
                <HugeiconsIcon
                  icon={cls.icon}
                  size={22}
                  color={isActive ? "#ffc400" : "#737373"}
                />
              </View>

              <View className="items-center justify-center rounded-xl">
                <Text
                  className={`text-sm ${isActive ? "text-accent" : "text-foreground/50"}`}
                  style={styles.semibold}
                >
                  {cls.label}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`text-[10px] text-center ${isActive ? "text-accent/60" : "text-muted-foreground"}`}
                  style={styles.body}
                >
                  {cls.sublabel}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Vehicle Classes"
        description={`Class 1 — Cars, SUVs, and light vehicles. Most common.\n\nClass 2 — Buses and light trucks.\n\nClass 3 — Large trucks and heavy cargo vehicles.\n\nHigher classes pay higher toll fees.`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
});
