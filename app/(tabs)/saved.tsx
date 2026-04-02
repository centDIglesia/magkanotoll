import FloatingHeader from "@/components/FloatingHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { SavedRoute, useSavedRoutesStore } from "@/stores/useSavedRoutesStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  BookmarkAdd01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  LocationUser01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Modal, Pressable,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CLASS_LABELS: Record<number, string> = { 1: "Class 1", 2: "Class 2", 3: "Class 3" };

function EditModal({ route, onClose }: { route: SavedRoute; onClose: () => void }) {
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

export default function SavedRoutes() {
  const { routes, loading, fetchRoutes, deleteRoute } = useSavedRoutesStore();
  const { isAnonymous } = useAuthStore();
  const router = useRouter();
  const [editingRoute, setEditingRoute] = useState<SavedRoute | null>(null);

  useEffect(() => { fetchRoutes(); }, []);

  if (isAnonymous) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["bottom"]}>
        <FloatingHeader title="Saved Routes" />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-2">
            <HugeiconsIcon icon={BookmarkAdd01Icon} size={32} color="#ffc400" />
          </View>
          <Text className="text-foreground text-lg text-center" style={styles.bold}>Sign in to save routes</Text>
          <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Save your frequent routes for quick access</Text>
          <Pressable className="mt-2 bg-primary rounded-2xl px-8 py-3" onPress={() => router.replace("/(auth)/login" as any)}>
            <Text className="text-white text-sm" style={styles.bold}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["bottom"]}>
        <FloatingHeader title="Saved Routes" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffc400" />
        </View>
      </SafeAreaView>
    );
  }

  if (routes.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["bottom"]}>
        <FloatingHeader title="Saved Routes" />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-2">
            <HugeiconsIcon icon={BookmarkAdd01Icon} size={32} color="#ffc400" />
          </View>
          <Text className="text-foreground text-lg" style={styles.bold}>No saved routes</Text>
          <Text className="text-muted-foreground text-sm text-center" style={styles.body}>Save a route from the calculator to see it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["bottom"]}>
      <FloatingHeader title="Saved Routes" />
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-muted-foreground text-sm mb-3" style={styles.body}>
            {routes.length} saved route{routes.length !== 1 ? "s" : ""}
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center gap-2 flex-1">
              
                <Text className="text-foreground text-base flex-1" style={styles.bold}>{item.label}</Text>
              </View>
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
        )}
      />

      {editingRoute && <EditModal route={editingRoute} onClose={() => setEditingRoute(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
  list: { padding: 16, paddingBottom: 110 },
});
