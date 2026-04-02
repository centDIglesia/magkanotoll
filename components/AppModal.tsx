import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  CheckmarkCircle01Icon,
  Alert01Icon,
  InformationCircleIcon,
  Delete02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type AppModalType = "success" | "error" | "info" | "confirm" | "warning";

interface AppModalProps {
  visible: boolean;
  type?: AppModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const CONFIG: Record<AppModalType, { icon: any; color: string; bg: string }> = {
  success: { icon: CheckmarkCircle01Icon, color: "#16a34a", bg: "#dcfce7" },
  error:   { icon: Alert01Icon,           color: "#e7000b", bg: "#fee2e2" },
  warning: { icon: Alert01Icon,           color: "#f59e0b", bg: "#fef3c7" },
  info:    { icon: InformationCircleIcon, color: "#ffc400", bg: "#fef9c3" },
  confirm: { icon: Delete02Icon,          color: "#e7000b", bg: "#fee2e2" },
};

export default function AppModal({
  visible,
  type = "info",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: AppModalProps) {
  const { icon, color, bg } = CONFIG[type];
  const isConfirm = type === "confirm";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-[28px] p-6" onPress={(e) => e.stopPropagation()}>
          <View className="items-center mb-4">
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <HugeiconsIcon icon={icon} size={28} color={color} />
            </View>
            <Text className="text-foreground text-xl text-center" style={styles.bold}>{title}</Text>
            <Text className="text-muted-foreground text-sm text-center leading-6 mt-2" style={styles.body}>{message}</Text>
          </View>

          {isConfirm ? (
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center" onPress={onClose}>
                <Text className="text-foreground text-sm" style={styles.bold}>{cancelLabel}</Text>
              </Pressable>
              <Pressable className="flex-1 rounded-2xl py-4 items-center" style={{ backgroundColor: color }} onPress={() => { onConfirm?.(); onClose(); }}>
                <Text className="text-white text-sm" style={styles.bold}>{confirmLabel}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable className="rounded-2xl py-4 items-center" style={{ backgroundColor: color }} onPress={onClose}>
              <Text className="text-white text-sm" style={styles.bold}>{confirmLabel}</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Hook for easy usage
import { useState } from "react";

interface ModalState {
  visible: boolean;
  type: AppModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

export function useAppModal() {
  const [modal, setModal] = useState<ModalState>({
    visible: false, type: "info", title: "", message: "",
  });

  const show = (opts: Omit<ModalState, "visible">) =>
    setModal({ ...opts, visible: true });

  const hide = () => setModal((m) => ({ ...m, visible: false }));

  const modalProps = {
    ...modal,
    onClose: hide,
  };

  return { show, hide, modalProps };
}
