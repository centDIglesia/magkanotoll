import { useAuthStore } from "@/stores/useAuthStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useSavedRoutesStore, SavedRoute } from "@/stores/useSavedRoutesStore";
import AppModal, { useAppModal } from "@/components/AppModal";
import MyVehiclesSection from "@/components/MyVehiclesSection";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  User03Icon,
  Mail01Icon,
  Logout01Icon,
  Settings01Icon,
  PencilEdit01Icon,
  Camera01Icon,
  Clock01Icon,
  LocationUser01Icon,
  Location01Icon,
  FileDownloadIcon,
  BookmarkAdd01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";

type Section = "history" | "saved" | "vehicles";

const CLASS_LABELS: Record<number, string> = { 1: "Class 1", 2: "Class 2", 3: "Class 3" };
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function EditRouteModal({ route, onClose }: { route: SavedRoute; onClose: () => void }) {
  const { updateRoute } = useSavedRoutesStore();
  const [label, setLabel] = useState(route.label);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!label.trim()) return;
    setSaving(true);
    await updateRoute(route.id, { label: label.trim() });
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-[32px] p-6 pb-10" onPress={(e) => e.stopPropagation()}>
          <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
          <Text className="text-xl mb-1" style={styles.bold}>Edit Label</Text>
          <Text className="text-muted-foreground text-sm mb-5" style={styles.body}>{route.origin} → {route.destination}</Text>
          <Text className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1.5" style={styles.semibold}>Label</Text>
          <TextInput
            className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-6"
            style={styles.body}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Daily Commute"
            placeholderTextColor="#A3A3A3"
            autoFocus
          />
          <Pressable
            className={`rounded-2xl py-4 items-center ${!label.trim() || saving ? "bg-neutral-300" : "bg-primary"}`}
            onPress={save}
            disabled={!label.trim() || saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base" style={styles.bold}>Save</Text>}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Profile() {
  const { user, signOut, updateProfile, uploadAvatar } = useAuthStore();
  const { history, loading: histLoading, clearHistory, fetchHistory } = useHistoryStore();
  const { routes, loading: routesLoading, fetchRoutes, deleteRoute } = useSavedRoutesStore();
  const router = useRouter();
  const { show, modalProps } = useAppModal();

  const [section, setSection] = useState<Section>("history");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SavedRoute | null>(null);

  useEffect(() => {
    fetchRoutes();
    fetchHistory();
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    router.replace("/(auth)/login");
  };

  const handleSaveName = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim() });
      setShowEditModal(false);
    } catch (e: any) {
      show({ type: "error", title: "Error", message: e.message, confirmLabel: "OK" });
    }
    setSaving(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      show({ type: "warning", title: "Permission Required", message: "Please allow access to your photo library.", confirmLabel: "OK" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    let base64 = asset.base64;
    if (!base64) {
      try {
        base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      } catch {
        show({ type: "error", title: "Upload Failed", message: "Could not read image data.", confirmLabel: "OK" });
        return;
      }
    }
    setUploading(true);
    try {
      await uploadAvatar(asset.uri, base64);
    } catch (e: any) {
      show({ type: "error", title: "Upload Failed", message: e.message ?? "Something went wrong.", confirmLabel: "OK" });
    }
    setUploading(false);
  };

  // ── History helpers ──────────────────────────────────────────────────────
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = history
      .filter((h) => {
        const hd = new Date(h.calculatedAt);
        return hd.getFullYear() === d.getFullYear() && hd.getMonth() === d.getMonth();
      })
      .reduce((sum, h) => sum + (h.result?.totalToll ?? 0), 0);
    return {
      value: Math.round(total),
      label: MONTH_LABELS[d.getMonth()],
      frontColor: "#ffc400",
      topLabelComponent: () =>
        total > 0 ? (
          <Text style={{ fontSize: 8, color: "#737373", fontFamily: "LufgaBold" }}>
            ₱{Math.round(total)}
          </Text>
        ) : null,
    };
  });
  const totalSpent = history.reduce((s, h) => s + (h.result?.totalToll ?? 0), 0);

  const exportCSV = async () => {
    try {
      const header = "Date,Origin,Destination,Vehicle Class,Total Toll\n";
      const rows = history
        .filter((h) => h.result != null)
        .map((h) => `${new Date(h.calculatedAt).toLocaleDateString("en-PH")},${h.origin},${h.destination},Class ${h.vehicleClass},₱${Number(h.result.totalToll).toFixed(2)}`)
        .join("\n");
      const path = FileSystem.documentDirectory + "toll_history.csv";
      await FileSystem.writeAsStringAsync(path, header + rows, { encoding: "utf8" });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        show({ type: "warning", title: "Not Available", message: "Your device doesn't support file sharing.", confirmLabel: "OK" });
        return;
      }
      await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Export Toll History" });
    } catch (e: any) {
      show({ type: "error", title: "Export Failed", message: e.message ?? "Something went wrong.", confirmLabel: "OK" });
    }
  };

  const handleClearHistory = () => {
    show({
      type: "confirm",
      title: "Clear History",
      message: "Are you sure you want to delete all history? This cannot be undone.",
      confirmLabel: "Clear",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try { await clearHistory(); } catch (e: any) {
          show({ type: "error", title: "Error", message: e.message ?? "Failed to clear history.", confirmLabel: "OK" });
        }
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View className="flex-row items-center mb-4 gap-3">
          <Text className="text-foreground text-xl flex-1" style={styles.bold}>Profile</Text>
          <Pressable
            onPress={() => router.push("/settings" as any)}
            className="w-9 h-9 bg-white rounded-full items-center justify-center"
          >
            <HugeiconsIcon icon={Settings01Icon} size={18} color="#171717" />
          </Pressable>
        </View>


        {/* ── Avatar + name ── */}
        <View className="items-center mb-5">
          <Pressable onPress={handlePickImage} className="relative">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center overflow-hidden">
              {user?.profile_image_url ? (
                <Image source={{ uri: user.profile_image_url }} className="w-full h-full" />
              ) : (
                <Text className="text-white text-2xl" style={styles.bold}>{initials}</Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full items-center justify-center border-2 border-[#ebebeb]">
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <HugeiconsIcon icon={Camera01Icon} size={12} color="#fff" />}
            </View>
          </Pressable>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-foreground text-xl" style={styles.black}>{user?.full_name}</Text>
            <Pressable onPress={() => { setFullName(user?.full_name ?? ""); setShowEditModal(true); }}>
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} color="#A3A3A3" />
            </Pressable>
          </View>
          <Text className="text-muted-foreground text-sm mt-0.5" style={styles.body}>{user?.email}</Text>
        </View>

        {/* ── Info card ── */}
        <View className="bg-white rounded-2xl px-4 mb-4 border border-neutral-100">
          <View className="flex-row items-center gap-3.5 py-4">
            <HugeiconsIcon icon={User03Icon} size={16} color="#737373" />
            <View className="flex-1">
              <Text className="text-muted-foreground text-[10px] uppercase tracking-wide" style={styles.body}>Full Name</Text>
              <Text className="text-foreground text-sm mt-0.5" style={styles.body}>{user?.full_name || "—"}</Text>
            </View>
          </View>
          <View className="h-px bg-neutral-100" />
          <View className="flex-row items-center gap-3.5 py-4">
            <HugeiconsIcon icon={Mail01Icon} size={16} color="#737373" />
            <View className="flex-1">
              <Text className="text-muted-foreground text-[10px] uppercase tracking-wide" style={styles.body}>Email</Text>
              <Text className="text-foreground text-sm mt-0.5" style={styles.body}>{user?.email || "—"}</Text>
            </View>
          </View>
        </View>

        {/* ── Section tabs ── */}
        <View className="flex-row bg-white rounded-2xl p-1 border border-neutral-100 mb-4">
          {(["history", "saved", "vehicles"] as Section[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSection(s)}
              className={`flex-1 py-2.5 rounded-xl items-center ${section === s ? "bg-accent" : ""}`}
            >
              <Text
                className={`text-xs capitalize ${section === s ? "text-accent-foreground" : "text-muted-foreground"}`}
                style={section === s ? styles.bold : styles.body}
              >
                {s === "history" ? "History" : s === "saved" ? "Saved" : "Vehicles"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── HISTORY SECTION ── */}
        {section === "history" && (
          <>
            {!user || histLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffc400" />
              </View>
            ) : history.length === 0 ? (
              <View className="items-center py-10 gap-3">
                <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center">
                  <HugeiconsIcon icon={Clock01Icon} size={28} color="#ffc400" />
                </View>
                <Text className="text-foreground text-base" style={styles.bold}>No history yet</Text>
                <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Your toll calculations will appear here</Text>
              </View>
            ) : (
              <>
                {/* Monthly chart */}
                <View className="bg-white rounded-3xl p-5 border border-neutral-100 mb-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-foreground text-sm" style={styles.bold}>Monthly Spending</Text>
                    <Text className="text-accent-foreground text-sm" style={styles.bold}>₱{totalSpent.toFixed(2)} total</Text>
                  </View>
                  <Text className="text-muted-foreground text-xs mb-4" style={styles.body}>Last 6 months</Text>
                  <BarChart
                    data={barData}
                    barWidth={32}
                    spacing={12}
                    roundedTop
                    hideRules
                    hideAxesAndRules
                    noOfSections={3}
                    maxValue={Math.max(...barData.map((d) => d.value), 100)}
                    height={120}
                    barBorderRadius={6}
                    yAxisTextStyle={{ fontFamily: "LufgaRegular", fontSize: 10, color: "#A3A3A3" }}
                    xAxisLabelTextStyle={{ fontFamily: "LufgaRegular", fontSize: 10, color: "#A3A3A3" }}
                  />
                </View>

                {/* Actions row */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-muted-foreground text-sm" style={styles.body}>
                    {history.length} calculation{history.length !== 1 ? "s" : ""}
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable onPress={exportCSV} className="flex-row items-center gap-1">
                      <HugeiconsIcon icon={FileDownloadIcon} size={14} color="#ffc400" />
                      <Text className="text-accent-foreground text-sm" style={styles.bold}>Export</Text>
                    </Pressable>
                    <Pressable onPress={handleClearHistory}>
                      <Text className="text-muted-foreground text-sm" style={styles.body}>Clear all</Text>
                    </Pressable>
                  </View>
                </View>

                {/* History list */}
                {history.map((item, idx) => (
                  <View key={item.id}>
                    <View className="bg-white rounded-2xl p-4 border border-neutral-100">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1 gap-1">
                          <View className="flex-row items-center gap-2">
                            <HugeiconsIcon icon={LocationUser01Icon} size={14} color="#ffc400" />
                            <Text className="text-foreground text-sm" style={styles.body}>{item.origin}</Text>
                          </View>
                          <View className="w-px h-2.5 bg-accent/30 ml-1.5" />
                          <View className="flex-row items-center gap-2">
                            <HugeiconsIcon icon={Location01Icon} size={14} color="#ffc400" />
                            <Text className="text-foreground text-sm" style={styles.body}>{item.destination}</Text>
                          </View>
                        </View>
                        <Text className="text-foreground text-2xl" style={styles.black}>
                          ₱{Number(item.result?.totalToll ?? 0).toFixed(2)}
                        </Text>
                      </View>
                      <View className="h-px bg-neutral-100 mt-3 mb-2.5" />
                      <View className="flex-row items-center gap-2">
                        <View className="bg-accent/15 px-2 py-0.5 rounded-full">
                          <Text className="text-accent-foreground text-[10px]" style={styles.bold}>{CLASS_LABELS[item.vehicleClass]}</Text>
                        </View>
                        <Text className="text-muted-foreground text-xs" style={styles.body}>·</Text>
                        <Text className="text-muted-foreground text-xs" style={styles.body}>
                          {new Date(item.calculatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}{" "}
                          {new Date(item.calculatedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                    </View>
                    {idx < history.length - 1 && <View className="h-2.5" />}
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── SAVED ROUTES SECTION ── */}
        {section === "saved" && (
          <>
            {routesLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffc400" />
              </View>
            ) : routes.length === 0 ? (
              <View className="items-center py-10 gap-3 px-4">
                <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center">
                  <HugeiconsIcon icon={BookmarkAdd01Icon} size={28} color="#ffc400" />
                </View>
                <Text className="text-foreground text-base" style={styles.bold}>No saved routes</Text>
                <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Save a route from the calculator to see it here</Text>
              </View>
            ) : (
              <>
                <Text className="text-muted-foreground text-sm mb-3" style={styles.body}>
                  {routes.length} saved route{routes.length !== 1 ? "s" : ""}
                </Text>
                {routes.map((item, idx) => (
                  <View key={item.id}>
                    <View className="bg-white rounded-2xl p-4 border border-neutral-100">
                      <View className="flex-row items-start justify-between mb-3">
                        <Text className="text-foreground text-base flex-1" style={styles.bold}>{item.label}</Text>
                        <View className="flex-row gap-1 items-center">
                          {item.totalToll > 0 && (
                            <Text className="text-foreground text-base mr-2" style={styles.bold}>₱{Number(item.totalToll).toFixed(2)}</Text>
                          )}
                          <Pressable
                            className="w-8 h-8 rounded-xl bg-accent items-center justify-center"
                            onPress={() => setEditingRoute(item)}
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={15} color="white" />
                          </Pressable>
                          <Pressable
                            className="w-8 h-8 rounded-xl bg-red-500 items-center justify-center"
                            onPress={() => deleteRoute(item.id)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={15} color="white" />
                          </Pressable>
                        </View>
                      </View>
                      <View className="gap-1 mb-3">
                        <View className="flex-row items-center gap-2">
                          <HugeiconsIcon icon={LocationUser01Icon} size={13} color="#ffc400" />
                          <Text className="text-foreground text-sm" style={styles.body}>{item.origin}</Text>
                        </View>
                        <View className="w-px h-2.5 bg-accent/30 ml-1.5" />
                        <View className="flex-row items-center gap-2">
                          <HugeiconsIcon icon={Location01Icon} size={13} color="#ffc400" />
                          <Text className="text-foreground text-sm" style={styles.body}>{item.destination}</Text>
                        </View>
                      </View>
                      <View className="h-px bg-neutral-100 mb-2.5" />
                      <View className="flex-row items-center justify-between">
                        <View className="bg-accent/15 px-2 py-0.5 rounded-full">
                          <Text className="text-accent-foreground text-[10px]" style={styles.bold}>{CLASS_LABELS[item.vehicleClass]}</Text>
                        </View>
                        <Text className="text-muted-foreground text-[10px]" style={styles.body}>
                          Saved {item.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </Text>
                      </View>
                    </View>
                    {idx < routes.length - 1 && <View className="h-2.5" />}
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── VEHICLES SECTION ── */}
        {section === "vehicles" && <MyVehiclesSection />}

        {/* ── Logout ── */}
        <TouchableOpacity
          className="bg-destructive/10 rounded-2xl py-4 flex-row items-center justify-center gap-2 mt-6"
          onPress={() => setShowLogoutModal(true)}
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} color="#e7000b" />
          <Text className="text-destructive text-base" style={styles.bold}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Logout modal ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setShowLogoutModal(false)}>
          <Pressable className="bg-white rounded-[28px] p-6" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center mb-4 self-center">
              <HugeiconsIcon icon={Logout01Icon} size={24} color="#e7000b" />
            </View>
            <Text className="text-foreground text-xl text-center mb-2" style={styles.bold}>Log out?</Text>
            <Text className="text-muted-foreground text-sm text-center leading-6 mb-6" style={styles.body}>
              You'll need to sign in again to access your saved routes and history.
            </Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center" onPress={() => setShowLogoutModal(false)}>
                <Text className="text-foreground text-sm" style={styles.bold}>Cancel</Text>
              </Pressable>
              <Pressable className="flex-1 bg-destructive rounded-2xl py-4 items-center" onPress={handleLogout}>
                <Text className="text-white text-sm" style={styles.bold}>Log out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Edit name modal ── */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowEditModal(false)}>
          <Pressable className="bg-white rounded-t-[32px] p-6 pb-10" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
            <Text className="text-foreground text-xl mb-5" style={styles.bold}>Edit Name</Text>
            <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide" style={styles.body}>Full Name</Text>
            <TextInput
              className="bg-neutral-100 rounded-2xl px-4 py-3.5 text-foreground mb-5"
              style={styles.body}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor="#A3A3A3"
              autoFocus
            />
            <Pressable
              className={`rounded-2xl py-4 items-center ${!fullName.trim() || saving ? "bg-neutral-300" : "bg-primary"}`}
              onPress={handleSaveName}
              disabled={!fullName.trim() || saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base" style={styles.bold}>Save</Text>}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {editingRoute && <EditRouteModal route={editingRoute} onClose={() => setEditingRoute(null)} />}
      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 110 },
});
