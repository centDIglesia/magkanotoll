import { HugeiconsIcon } from "@hugeicons/react-native";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export default function InfoModal({ visible, onClose, title, description }: {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-[28px] p-6" onPress={(e) => e.stopPropagation()}>
          <View className="w-10 h-10 rounded-xl bg-accent/20 items-center justify-center mb-4">
            <HugeiconsIcon icon={InformationCircleIcon} size={20} color="#ffc400" />
          </View>
          <Text className="text-foreground text-lg mb-2" style={styles.bold}>{title}</Text>
          <Text className="text-muted-foreground text-sm leading-6" style={styles.body}>{description}</Text>
          <Pressable className="bg-primary rounded-2xl py-3.5 items-center mt-5" onPress={onClose}>
            <Text className="text-white text-sm" style={styles.bold}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function InfoButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="w-6 h-6 rounded-lg bg-accent/20 items-center justify-center">
      <HugeiconsIcon icon={InformationCircleIcon} size={13} color="#ffc400" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
