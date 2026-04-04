import { supabase } from "@/utils/supabase";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppModal, { useAppModal } from "@/components/AppModal";
import OverviewTab from "./components/OverviewTab";
import UsersTab from "./components/UsersTab";
import RoutesTab from "./components/RoutesTab";
import ContentTab from "./components/ContentTab";
import UserDetailModal, { UserRow } from "./components/UserDetailModal";

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

type Section = "overview" | "users" | "routes" | "content";

export default function AdminDashboard() {
  const router = useRouter();
  const { show, modalProps } = useAppModal();

  const [section, setSection] = useState<Section>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchPopularRoutes()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchPopularRoutes()]);
    setRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [
        { count: totalCalc },
        { count: calcToday },
        { count: totalRoutes },
        { data: authUsers },
      ] = await Promise.all([
        supabase.from("toll_history").select("*", { count: "exact", head: true }),
        supabase.from("toll_history").select("*", { count: "exact", head: true }).gte("calculated_at", today.toISOString()),
        supabase.from("saved_routes").select("*", { count: "exact", head: true }),
        supabase.rpc("get_admin_users"),
      ]);
      const allUsers: UserRow[] = authUsers ?? [];
      setStats({
        totalUsers: allUsers.filter((u) => !u.is_anonymous).length,
        totalAnonymous: allUsers.filter((u) => u.is_anonymous).length,
        totalCalculations: totalCalc ?? 0,
        totalSavedRoutes: totalRoutes ?? 0,
        calculationsToday: calcToday ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      show({ type: "error", title: "Error", message: "Failed to load statistics", confirmLabel: "OK" });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc("get_admin_users");
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      show({ type: "error", title: "Error", message: "Failed to load users", confirmLabel: "OK" });
    }
  };

  const fetchPopularRoutes = async () => {
    try {
      const { data, error } = await supabase.rpc("get_popular_routes");
      if (error) throw error;
      if (data) setPopularRoutes(data);
    } catch (error) {
      console.error('Failed to fetch popular routes:', error);
      show({ type: "error", title: "Error", message: "Failed to load popular routes", confirmLabel: "OK" });
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBanToggle = (u: UserRow) => {
    const action = u.is_banned ? "Unban" : "Ban";
    show({
      type: "confirm",
      title: `${action} User`,
      message: `${action} ${u.email || "this user"}?${!u.is_banned ? " They will not be able to use the app." : ""}`,
      confirmLabel: action,
      cancelLabel: "Cancel",
      onConfirm: async () => {
        if (u.is_banned) {
          await supabase.from("banned_users").delete().eq("user_id", u.id);
        } else {
          await supabase.from("banned_users").insert({ user_id: u.id });
        }
        const updated = { ...u, is_banned: !u.is_banned };
        setUsers((prev) => prev.map((x) => x.id === u.id ? updated : x));
        // Update selected user if open
        setSelectedUser((prev) => prev?.id === u.id ? updated : prev);
      },
    });
  };

  const handleDeleteUser = (u: UserRow) => {
    show({
      type: "confirm",
      title: "Delete User",
      message: `Delete ${u.email || "this anonymous user"}? This will remove all their data.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        const { error } = await supabase.rpc("admin_delete_user", { target_user_id: u.id });
        if (error) {
          show({ type: "error", title: "Error", message: error.message, confirmLabel: "OK" });
        } else {
          setUsers((prev) => prev.filter((x) => x.id !== u.id));
          setSelectedUser(null);
        }
      },
    });
  };

  const TABS: { key: Section; label: string }[] = [
    { key: "overview", label: "Stats" },
    { key: "users", label: "Users" },
    { key: "routes", label: "Routes" },
    { key: "content", label: "Content" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 bg-white rounded-full items-center justify-center">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="#171717" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-foreground text-base" style={styles.bold}>Admin Dashboard</Text>
          <Text className="text-muted-foreground text-xs" style={styles.body}>MagkanoToll</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mb-3 bg-white rounded-2xl p-1.5 border border-neutral-100">
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setSection(t.key)}
            className={`flex-1 py-3.5 rounded-xl items-center ${section === t.key ? "bg-accent" : ""}`}
          >
            <Text
              className={`text-xs ${section === t.key ? "text-accent-foreground" : "text-muted-foreground"}`}
              style={section === t.key ? styles.bold : styles.body}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && section !== "content" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {section === "overview" && <OverviewTab stats={null} popularRoutes={[]} loading />}
          {section === "users" && <UsersTab users={[]} loading onSelectUser={() => {}} onBanToggle={() => {}} onDelete={() => {}} />}
          {section === "routes" && <RoutesTab routes={[]} loading />}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            section !== "content"
              ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffc400" />
              : undefined
          }
        >
          {section === "overview" && (
            <OverviewTab stats={stats} popularRoutes={popularRoutes} loading={false} />
          )}
          {section === "users" && (
            <UsersTab
              users={users}
              loading={false}
              onSelectUser={setSelectedUser}
              onBanToggle={handleBanToggle}
              onDelete={handleDeleteUser}
            />
          )}
          {section === "routes" && (
            <RoutesTab routes={popularRoutes} loading={false} />
          )}
          {section === "content" && (
            <ContentTab />
          )}
        </ScrollView>
      )}

      {/* User detail modal */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onBanToggle={handleBanToggle}
        onDelete={handleDeleteUser}
      />

      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
