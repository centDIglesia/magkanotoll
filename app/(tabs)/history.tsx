import { useAuthStore } from "@/stores/useAuthStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import FloatingHeader from "@/components/FloatingHeader";
import AppModal, { useAppModal } from "@/components/AppModal";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  LockPasswordIcon,
  Clock01Icon,
  LocationUser01Icon,
  Location01Icon,
  FileDownloadIcon,
} from "@hugeicons/core-free-icons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const CLASS_LABELS: Record<number, string> = {
  1: "Class 1",
  2: "Class 2",
  3: "Class 3",
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function History() {
  const { history, loading, clearHistory } = useHistoryStore();
  const { isAnonymous } = useAuthStore();
  const router = useRouter();
  const { show, modalProps } = useAppModal();

  // Build last 6 months bar data
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = history
      .filter((h) => {
        const hd = new Date(h.calculatedAt);
        return (
          hd.getFullYear() === d.getFullYear() && hd.getMonth() === d.getMonth()
        );
      })
      .reduce((sum, h) => sum + (h.result?.totalToll ?? 0), 0);
    return {
      value: Math.round(total),
      label: MONTH_LABELS[d.getMonth()],
      frontColor: "#ffc400",
      topLabelComponent: () =>
        total > 0 ? (
          <Text
            style={{
              fontSize: 8,
              color: "#737373",
              fontFamily: "LufgaBold",
            }}
          >
            ₱{Math.round(total)}
          </Text>
        ) : null,
    };
  });

  const totalSpent = history.reduce(
    (s, h) => s + (h.result?.totalToll ?? 0),
    0,
  );

  // ✅ Fixed: null guard + sharing availability check + try/catch
const exportCSV = async () => {
  try {
    const header = "Date,Origin,Destination,Vehicle Class,Total Toll\n";
    const rows = history
      .filter((h) => h.result != null)
      .map(
        (h) =>
          `${new Date(h.calculatedAt).toLocaleDateString("en-PH")},${h.origin},${h.destination},Class ${h.vehicleClass},₱${Number(h.result.totalToll).toFixed(2)}`,
      )
      .join("\n");

    const csv = header + rows;
    const path = FileSystem.documentDirectory + "toll_history.csv";

    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: "utf8", // ✅ string literal instead of enum
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      show({ type: "warning", title: "Not Available", message: "Your device doesn't support file sharing.", confirmLabel: "OK" });
      return;
    }

    await Sharing.shareAsync(path, {
      mimeType: "text/csv",
      dialogTitle: "Export Toll History",
    });
  } catch (e: any) {
    show({ type: "error", title: "Export Failed", message: e.message ?? "Something went wrong.", confirmLabel: "OK" });
  }
};

  // ✅ Fixed: wrapped in try/catch
  const handleClearHistory = () => {
    show({
      type: "confirm",
      title: "Clear History",
      message: "Are you sure you want to delete all history? This cannot be undone.",
      confirmLabel: "Clear",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await clearHistory();
        } catch (e: any) {
          show({ type: "error", title: "Error", message: e.message ?? "Failed to clear history.", confirmLabel: "OK" });
        }
      },
    });
  };

  if (isAnonymous) {
    return (
      <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
        <FloatingHeader title="History" />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-2">
            <HugeiconsIcon icon={LockPasswordIcon} size={32} color="#ffc400" />
          </View>
          <Text
            className="text-foreground text-lg text-center"
            style={styles.bold}
          >
            Sign in to save history
          </Text>
          <Text
            className="text-muted-foreground text-sm text-center"
            style={styles.body}
          >
            Create an account to track your toll calculations
          </Text>
          <Pressable
            className="mt-2 bg-primary rounded-2xl px-8 py-3"
            onPress={() => router.replace("/(auth)/login" as any)}
          >
            <Text
              className="text-primary-foreground text-sm"
              style={styles.bold}
            >
              Sign In
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
        <FloatingHeader title="History" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffc400" />
        </View>
      </SafeAreaView>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
        <FloatingHeader title="History" />
        <View className="flex-1 items-center justify-center gap-3">
          <View className="w-16 h-16 rounded-2xl bg-accent/15 items-center justify-center mb-2">
            <HugeiconsIcon icon={Clock01Icon} size={32} color="#ffc400" />
          </View>
          <Text className="text-foreground text-lg" style={styles.bold}>
            No history yet
          </Text>
          <Text className="text-muted-foreground text-sm" style={styles.body}>
            Your toll calculations will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["bottom"]}>
      <FloatingHeader title="History" />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Monthly Chart */}
            <View className="bg-white rounded-3xl p-5 border border-neutral-100 mb-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-foreground text-sm" style={styles.bold}>
                  Monthly Spending
                </Text>
                <Text
                  className="text-accent-foreground text-sm"
                  style={styles.bold}
                >
                  ₱{totalSpent.toFixed(2)} total
                </Text>
              </View>
              <Text
                className="text-muted-foreground text-xs mb-4"
                style={styles.body}
              >
                Last 6 months
              </Text>
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
                yAxisTextStyle={{
                  fontFamily: "LufgaRegular",
                  fontSize: 10,
                  color: "#A3A3A3",
                }}
                xAxisLabelTextStyle={{
                  fontFamily: "LufgaRegular",
                  fontSize: 10,
                  color: "#A3A3A3",
                }}
              />
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-muted-foreground text-sm"
                style={styles.body}
              >
                {history.length} calculation
                {history.length !== 1 ? "s" : ""}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={exportCSV}
                  className="flex-row items-center gap-1"
                >
                  <HugeiconsIcon
                    icon={FileDownloadIcon}
                    size={14}
                    color="#ffc400"
                  />
                  <Text
                    className="text-accent-foreground text-sm"
                    style={styles.bold}
                  >
                    Export
                  </Text>
                </Pressable>
                {/* ✅ Fixed: confirmation dialog + error handling */}
                <Pressable onPress={handleClearHistory}>
                  <Text
                    className="text-muted-foreground text-sm"
                    style={styles.body}
                  >
                    Clear all
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <HugeiconsIcon
                    icon={LocationUser01Icon}
                    size={14}
                    color="#ffc400"
                  />
                  <Text className="text-foreground text-sm" style={styles.body}>
                    {item.origin}
                  </Text>
                </View>
                <View className="w-px h-2.5 bg-accent/30 ml-1.5" />
                <View className="flex-row items-center gap-2">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={14}
                    color="#ffc400"
                  />
                  <Text className="text-foreground text-sm" style={styles.body}>
                    {item.destination}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                {/* ✅ Fixed: null guard on result */}
                <Text className="text-foreground text-2xl" style={styles.black}>
                  ₱{Number(item.result?.totalToll ?? 0).toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="h-px bg-neutral-100 mt-3 mb-2.5" />
            <View className="flex-row items-center gap-2">
              <View className="bg-accent/15 px-2 py-0.5 rounded-full">
                <Text
                  className="text-accent-foreground text-[10px]"
                  style={styles.bold}
                >
                  {CLASS_LABELS[item.vehicleClass]}
                </Text>
              </View>
              <Text
                className="text-muted-foreground text-xs"
                style={styles.body}
              >
                ·
              </Text>
              <Text
                className="text-muted-foreground text-xs"
                style={styles.body}
              >
                {new Date(item.calculatedAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(item.calculatedAt).toLocaleTimeString("en-PH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
      />
      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
  list: { padding: 16, paddingBottom: 110 },
});
