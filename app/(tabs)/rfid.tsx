import FloatingHeader from "@/components/FloatingHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { RfidCard, useRfidStore } from "@/stores/useRfidStore";
import AppModal, { useAppModal } from "@/components/AppModal";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  CreditCardIcon,
  Message01Icon,
  InformationCircleIcon,
  Copy01Icon,
  Delete02Icon,
  PlusSignIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const RFID_SYSTEMS = [
  {
    name: "EasyTrip" as const,
    color: "#0057A8",
    expressways: ["NLEX", "SCTEX", "TPLEX", "NLEX Connector", "NLEX Harbor Link"],
    smsNumber: "2929",
    hotline: "1-800-10-EASYTRIP",
    website: "https://www.easytrip.ph",
  },
  {
    name: "Autosweep" as const,
    color: "#E30613",
    expressways: ["SLEX", "STAR Tollway", "Skyway", "CALAX", "CAVITEX", "MCX", "NAIAX"],
    smsNumber: "29290",
    hotline: "(02) 8888-7777",
    website: "https://www.autosweep.com.ph",
  },
];

import * as Haptics from "expo-haptics";

function notify(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export default function RfidBalance() {
  const { isAnonymous } = useAuthStore();
  const { cards, loading, fetchCards, addCard, deleteCard } = useRfidStore();
  const router = useRouter();
  const { show, modalProps } = useAppModal();
  const [expanded, setExpanded] = useState<string | null>("EasyTrip");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSystem, setAddSystem] = useState<"EasyTrip" | "Autosweep">("EasyTrip");
  const [cardNumber, setCardNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (!isAnonymous) fetchCards(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  };

  const openAddModal = (system: "EasyTrip" | "Autosweep") => {
    setAddSystem(system);
    setCardNumber("");
    setNickname("");
    setAddError("");
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setAddError("");
    const cleaned = cardNumber.replace(/\s/g, "");
    if (cleaned.length !== 16 || !/^\d+$/.test(cleaned))
      return setAddError("Card number must be exactly 16 digits.");
    if (!nickname.trim()) return setAddError("Please enter a nickname.");
    setSaving(true);
    try {
      await addCard({ system: addSystem, card_number: cleaned, nickname: nickname.trim() });
      setShowAddModal(false);
      notify("Card saved!");
    } catch (e: any) {
      setAddError(e.message);
    }
    setSaving(false);
  };

  const handleDelete = (card: RfidCard) => {
    show({
      type: "confirm",
      title: "Delete Card",
      message: `Remove "${card.nickname}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => deleteCard(card.id),
    });
  };

  const sendSms = (card: RfidCard) => {
    const sys = RFID_SYSTEMS.find((s) => s.name === card.system)!;
    Linking.openURL(`sms:${sys.smsNumber}?body=${encodeURIComponent(`BAL ${card.card_number}`)}`);
  };

  if (isAnonymous) {
    return (
      <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
        <FloatingHeader title="RFID Balance" />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-2">
            <HugeiconsIcon icon={CreditCardIcon} size={32} color="#ffc400" />
          </View>
          <Text className="text-foreground text-lg text-center" style={styles.bold}>Sign in to save your cards</Text>
          <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Save your RFID card numbers for quick balance checks</Text>
          <Pressable className="mt-2 bg-primary rounded-2xl px-8 py-3" onPress={() => router.replace("/(auth)/login" as any)}>
            <Text className="text-white text-sm" style={styles.bold}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
      <FloatingHeader title="RFID Balance" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffc400"
          />
        }
      >

        {/* Info Banner */}
        <View className="bg-accent/15 rounded-2xl p-4 mb-5 flex-row items-start gap-3">
          <HugeiconsIcon icon={InformationCircleIcon} size={18} color="#ffc400" />
          <Text className="text-accent-foreground text-xs flex-1 leading-5" style={styles.body}>
            Save your RFID card numbers and check your balance via SMS with one tap. Standard SMS rates apply.
          </Text>
        </View>

        {RFID_SYSTEMS.map((sys) => {
          const systemCards = cards.filter((c) => c.system === sys.name);
          const isOpen = expanded === sys.name;

          return (
            <View key={sys.name} className="bg-white rounded-3xl border border-neutral-100 mb-4 overflow-hidden">
              {/* Header */}
              <Pressable
                className="flex-row items-center gap-4 p-5"
                onPress={() => setExpanded(isOpen ? null : sys.name)}
              >
                <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: sys.color + "20" }}>
                  <HugeiconsIcon icon={CreditCardIcon} size={22} color={sys.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-base" style={styles.bold}>{sys.name}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5" style={styles.body} numberOfLines={1}>
                    {sys.expressways.join(" · ")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {systemCards.length > 0 && (
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: sys.color + "20" }}>
                      <Text className="text-xs" style={[styles.bold, { color: sys.color }]}>{systemCards.length}</Text>
                    </View>
                  )}
                  <Text className="text-muted-foreground text-lg" style={styles.body}>{isOpen ? "−" : "+"}</Text>
                </View>
              </Pressable>

              {isOpen && (
                <>
                  <View className="h-px bg-neutral-100" />
                  <View className="p-5 gap-3">

                    {/* Saved Cards */}
                    {loading ? (
                      <ActivityIndicator color="#ffc400" />
                    ) : systemCards.length === 0 ? (
                      <Text className="text-muted-foreground text-sm text-center py-2" style={styles.body}>
                        No saved cards yet
                      </Text>
                    ) : (
                      systemCards.map((card) => (
                        <View key={card.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-1">
                              <Text className="text-foreground text-sm" style={styles.bold}>{card.nickname}</Text>
                              <Text className="text-muted-foreground text-xs mt-0.5 tracking-widest" style={styles.body}>
                                {card.card_number.replace(/(.{4})/g, "$1 ").trim()}
                              </Text>
                            </View>
                            <View className="flex-row gap-2">
                              <Pressable
                                className="w-8 h-8 rounded-xl items-center justify-center"
                                style={{ backgroundColor: sys.color + "20" }}
                                onPress={() => {
                                  Clipboard.setStringAsync(card.card_number);
                                  notify("Card number copied!");
                                }}
                              >
                                <HugeiconsIcon icon={Copy01Icon} size={14} color={sys.color} />
                              </Pressable>
                              <Pressable
                                className="w-8 h-8 rounded-xl bg-destructive/10 items-center justify-center"
                                onPress={() => handleDelete(card)}
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={14} color="#e7000b" />
                              </Pressable>
                            </View>
                          </View>
                          <TouchableOpacity
                            className="flex-row items-center justify-center gap-2 py-3 rounded-xl"
                            style={{ backgroundColor: sys.color }}
                            onPress={() => sendSms(card)}
                          >
                            <HugeiconsIcon icon={Message01Icon} size={16} color="#fff" />
                            <Text className="text-white text-xs" style={styles.bold}>
                              Check Balance via SMS ({sys.smsNumber})
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}

                    {/* Add Card Button */}
                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-neutral-200"
                      onPress={() => openAddModal(sys.name)}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={16} color="#A3A3A3" />
                      <Text className="text-muted-foreground text-sm" style={styles.body}>Add {sys.name} Card</Text>
                    </TouchableOpacity>

                    {/* Contact */}
                    <View className="flex-row justify-between pt-1">
                      <Text className="text-muted-foreground text-xs" style={styles.body}>{sys.hotline}</Text>
                      <Pressable onPress={() => Linking.openURL(sys.website)}>
                        <Text className="text-xs" style={[styles.body, { color: sys.color }]}>Website ↗</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowAddModal(false)}>
            <Pressable className="bg-white rounded-t-[32px] p-6 pb-10" onPress={(e) => e.stopPropagation()}>
              <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-foreground text-xl" style={styles.bold}>Add {addSystem} Card</Text>
                <Pressable onPress={() => setShowAddModal(false)} className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center">
                  <HugeiconsIcon icon={Cancel01Icon} size={16} color="#171717" />
                </Pressable>
              </View>

              <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide" style={styles.body}>Nickname</Text>
              <TextInput
                className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-4"
                style={styles.body}
                placeholder="e.g. My EasyTrip Card"
                placeholderTextColor="#A3A3A3"
                value={nickname}
                onChangeText={setNickname}
              />

              <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide" style={styles.body}>16-Digit Card Number</Text>
              <TextInput
                className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-1 tracking-widest"
                style={styles.body}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#A3A3A3"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, "");
                  setCardNumber(cleaned);
                }}
              />
              <Text className="text-muted-foreground text-xs mb-4 ml-1" style={styles.body}>
                Found on the back of your {addSystem} RFID card
              </Text>

              {addError ? (
                <Text className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-xl mb-4" style={styles.body}>{addError}</Text>
              ) : null}

              <Pressable
                className={`rounded-2xl py-4 items-center ${saving || !cardNumber || !nickname ? "bg-neutral-300" : "bg-primary"}`}
                onPress={handleSave}
                disabled={saving || !cardNumber || !nickname}
              >
                {saving ? <ActivityIndicator color="#fff" /> : (
                  <Text className="text-white text-base" style={styles.bold}>Save Card</Text>
                )}
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
