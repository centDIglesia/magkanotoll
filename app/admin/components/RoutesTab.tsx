import { HugeiconsIcon } from "@hugeicons/react-native";
import { ChartBarLineIcon } from "@hugeicons/core-free-icons";
import { StyleSheet, Text, View } from "react-native";
import Skeleton from "@/components/Skeleton";

interface PopularRoute {
  origin: string;
  destination: string;
  count: number;
}

interface Props {
  routes: PopularRoute[];
  loading: boolean;
}

export default function RoutesTab({ routes, loading }: Props) {
  if (loading) {
    return (
      <>
        <Skeleton width="55%" height={10} radius={6} style={{ marginBottom: 12 }} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} className="bg-white rounded-2xl px-4 py-4 border border-neutral-100 mb-2">
            <View className="flex-row items-center gap-3">
              <Skeleton width={32} height={32} radius={10} />
              <View className="flex-1 gap-2">
                <Skeleton width="50%" height={13} radius={6} />
                <Skeleton width="35%" height={11} radius={6} />
              </View>
              <View className="items-end gap-1">
                <Skeleton width={28} height={22} radius={6} />
                <Skeleton width={28} height={10} radius={6} />
              </View>
            </View>
          </View>
        ))}
      </>
    );
  }
  return (
    <>
      <Text className="text-muted-foreground text-xs mb-3" style={styles.body}>
        Most calculated routes across all users
      </Text>
      {routes.map((r, i) => (
        <View key={i} className="bg-white rounded-2xl px-4 py-4 border border-neutral-100 mb-2">
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-xl bg-accent/15 items-center justify-center">
              <Text className="text-accent-foreground text-sm" style={styles.bold}>{i + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-foreground text-sm" style={styles.bold}>{r.origin}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <HugeiconsIcon icon={ChartBarLineIcon} size={10} color="#A3A3A3" />
                <Text className="text-muted-foreground text-xs" style={styles.body}>{r.destination}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-foreground text-lg" style={styles.bold}>{r.count}</Text>
              <Text className="text-muted-foreground text-[10px]" style={styles.body}>times</Text>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
