import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  UserMultiple02Icon,
  CalculatorIcon,
  BookmarkIcon,
  UserCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { StyleSheet, Text, View } from "react-native";
import Skeleton from "@/components/Skeleton";

interface Stats {
  totalUsers: number;
  totalAnonymous: number;
  totalCalculations: number;
  totalSavedRoutes: number;
  calculationsToday: number;
}

interface PopularRoute {
  origin: string;
  destination: string;
  count: number;
}

interface Props {
  stats: Stats | null;
  popularRoutes: PopularRoute[];
  loading: boolean;
}

export default function OverviewTab({ stats, popularRoutes, loading }: Props) {
  if (loading) {
    return (
      <>
        {/* Stat card skeletons */}
        <View className="flex-row gap-3 mb-3">
          <SkeletonStatCard />
          <SkeletonStatCard />
        </View>
        <View className="flex-row gap-3 mb-3">
          <SkeletonStatCard />
          <SkeletonStatCard />
        </View>
        <View className="flex-row gap-3 mb-4">
          <SkeletonStatCard />
          <View className="flex-1" />
        </View>
        <Skeleton width="40%" height={10} radius={6} style={{ marginBottom: 10, marginLeft: 4 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-white rounded-2xl px-4 py-3.5 border border-neutral-100 mb-2 flex-row items-center gap-3">
            <Skeleton width={28} height={28} radius={10} />
            <Skeleton width="55%" height={12} radius={6} />
            <Skeleton width={32} height={20} radius={99} style={{ marginLeft: "auto" }} />
          </View>
        ))}
      </>
    );
  }

  if (!stats) return null;

  return (
    <>
      <View className="flex-row gap-3 mb-3">
        <StatCard icon={UserMultiple02Icon} label="Registered" value={stats.totalUsers} color="#ffc400" />
        <StatCard icon={UserCircleIcon} label="Anonymous" value={stats.totalAnonymous} color="#A3A3A3" />
      </View>
      <View className="flex-row gap-3 mb-3">
        <StatCard icon={CalculatorIcon} label="Total Calcs" value={stats.totalCalculations} color="#ffc400" />
        <StatCard icon={Clock01Icon} label="Today" value={stats.calculationsToday} color="#22c55e" />
      </View>
      <View className="flex-row gap-3 mb-4">
        <StatCard icon={BookmarkIcon} label="Saved Routes" value={stats.totalSavedRoutes} color="#ffc400" />
      </View>
      <Text className="text-muted-foreground text-xs uppercase tracking-widest ml-1 mb-2" style={styles.body}>
        Top Routes
      </Text>
      {popularRoutes.slice(0, 5).map((r, i) => (
        <View key={i} className="bg-white rounded-2xl px-4 py-3.5 border border-neutral-100 mb-2 flex-row items-center gap-3">
          <View className="w-7 h-7 rounded-xl bg-accent/15 items-center justify-center">
            <Text className="text-accent-foreground text-xs" style={styles.bold}>{i + 1}</Text>
          </View>
          <Text className="text-foreground text-xs flex-1" style={styles.bold} numberOfLines={1}>
            {r.origin} → {r.destination}
          </Text>
          <View className="bg-accent/15 px-2 py-0.5 rounded-full">
            <Text className="text-accent-foreground text-[10px]" style={styles.bold}>{r.count}x</Text>
          </View>
        </View>
      ))}
    </>
  );
}

function SkeletonStatCard() {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-neutral-100">
      <Skeleton width={36} height={36} radius={10} style={{ marginBottom: 12 }} />
      <Skeleton width="50%" height={24} radius={6} style={{ marginBottom: 6 }} />
      <Skeleton width="70%" height={10} radius={6} />
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-neutral-100">
      <View className="w-9 h-9 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: color + "20" }}>
        <HugeiconsIcon icon={icon} size={18} color={color} />
      </View>
      <Text className="text-foreground text-2xl" style={styles.bold}>{value.toLocaleString()}</Text>
      <Text className="text-muted-foreground text-xs mt-0.5" style={styles.body}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
