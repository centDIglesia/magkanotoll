import { supabase } from "@/utils/supabase";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  UserCircleIcon,
  CalculatorIcon,
  Clock01Icon,
  Mail01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  BookmarkIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppModal, { useAppModal } from "@/components/AppModal";
import Skeleton from "@/components/Skeleton";

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_anonymous: boolean;
  calc_count: number;
  is_banned: boolean;
}

interface UserStats {
  savedRoutes: number;
  lastActive: string | null;
}

interface Props {
  user: UserRow | null;
  onClose: () => void;
  onBanToggle: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
}

export default function UserDetailModal({ user, onClose, onBanToggle, onDelete }: Props) {
  const { show, modalProps } = useAppModal();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUserStats(null);
    setLoadingStats(true);
    Promise.all([
      supabase.from("saved_routes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("toll_history").select("calculated_at").eq("user_id", user.id).order("calculated_at", { ascending: false }).limit(1),
    ]).then(([{ count }, { data: lastCalc }]) => {
      setUserStats({
        savedRoutes: count ?? 0,
        lastActive: lastCalc?.[0]?.calculated_at ?? null,
      });
      setLoadingStats(false);
    });
  }, [user?.id]);

  if (!user) return null;

  const initials = user.is_anonymous
    ? "G"
    : user.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleBan = () => {
    onClose();
    setTimeout(() => onBanToggle(user), 300);
  };

  const handleDelete = () => {
    onClose();
    setTimeout(() => onDelete(user), 300);
  };

  return (
    <>
      <Modal visible={!!user} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
          <Pressable className="bg-[#ebebeb] rounded-t-[32px] pb-10" onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View className="w-12 h-1 bg-neutral-300 rounded-full self-center mt-4 mb-2" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 12 }}>

              {/* Avatar + name */}
              <View className="items-center py-4 gap-2">
                <View className={`w-20 h-20 rounded-full items-center justify-center ${user.is_banned ? "bg-destructive/15" : user.is_anonymous ? "bg-neutral-200" : "bg-accent/20"}`}>
                  <Text className="text-3xl" style={[styles.bold, { color: user.is_banned ? "#e7000b" : user.is_anonymous ? "#A3A3A3" : "#ffc400" }]}>
                    {initials}
                  </Text>
                </View>
                <View className="items-center gap-1">
                  <Text className="text-foreground text-xl" style={styles.bold}>
                    {user.is_anonymous ? "Anonymous User" : (user.full_name || "No name")}
                  </Text>
                  <View className="flex-row gap-2">
                    {user.is_anonymous && (
                      <View className="bg-neutral-200 px-2.5 py-0.5 rounded-full">
                        <Text className="text-muted-foreground text-[10px]" style={styles.bold}>GUEST</Text>
                      </View>
                    )}
                    {user.is_banned && (
                      <View className="bg-destructive/15 px-2.5 py-0.5 rounded-full">
                        <Text className="text-destructive text-[10px]" style={styles.bold}>BANNED</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Details card */}
              <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <DetailRow icon={Mail01Icon} label="Email" value={user.email || "No email"} />
                <View className="h-px bg-neutral-100 mx-4" />
                <DetailRow icon={Calendar01Icon} label="Joined" value={new Date(user.created_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} />
                <View className="h-px bg-neutral-100 mx-4" />
                <DetailRow icon={UserCircleIcon} label="User ID" value={user.id.slice(0, 18) + "..."} mono />
              </View>

              {/* Stats card */}
              <View className="bg-white rounded-2xl border border-neutral-100 p-4">
                <Text className="text-muted-foreground text-xs uppercase tracking-widest mb-3" style={styles.body}>Activity</Text>
                {loadingStats ? (
                  <View className="flex-row gap-3">
                    {[1, 2, 3].map((i) => (
                      <View key={i} className="flex-1 bg-neutral-50 rounded-xl p-3 items-center gap-2">
                        <Skeleton width={24} height={24} radius={6} />
                        <Skeleton width="60%" height={20} radius={6} />
                        <Skeleton width="80%" height={10} radius={6} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-accent/10 rounded-xl p-3 items-center gap-1">
                      <HugeiconsIcon icon={CalculatorIcon} size={18} color="#ffc400" />
                      <Text className="text-foreground text-xl" style={styles.bold}>{user.calc_count}</Text>
                      <Text className="text-muted-foreground text-[10px]" style={styles.body}>Calculations</Text>
                    </View>
                    <View className="flex-1 bg-accent/10 rounded-xl p-3 items-center gap-1">
                      <HugeiconsIcon icon={BookmarkIcon} size={18} color="#ffc400" />
                      <Text className="text-foreground text-xl" style={styles.bold}>{userStats?.savedRoutes ?? 0}</Text>
                      <Text className="text-muted-foreground text-[10px]" style={styles.body}>Saved Routes</Text>
                    </View>
                    <View className="flex-1 bg-accent/10 rounded-xl p-3 items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} size={18} color="#ffc400" />
                      <Text className="text-foreground text-sm" style={styles.bold}>
                        {userStats?.lastActive
                          ? new Date(userStats.lastActive).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                          : "—"}
                      </Text>
                      <Text className="text-muted-foreground text-[10px]" style={styles.body}>Last Active</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action buttons */}
              {!user.is_anonymous && (
                <Pressable
                  onPress={handleBan}
                  className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl ${user.is_banned ? "bg-green-500/10" : "bg-orange-500/10"}`}
                >
                  <HugeiconsIcon
                    icon={user.is_banned ? CheckmarkCircle01Icon : Cancel01Icon}
                    size={18}
                    color={user.is_banned ? "#22c55e" : "#f97316"}
                  />
                  <Text className="text-sm" style={[styles.bold, { color: user.is_banned ? "#22c55e" : "#f97316" }]}>
                    {user.is_banned ? "Unban User" : "Ban User"}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10"
              >
                <HugeiconsIcon icon={Delete02Icon} size={18} color="#e7000b" />
                <Text className="text-destructive text-sm" style={styles.bold}>Delete Account</Text>
              </Pressable>

              <Pressable onPress={onClose} className="py-4 rounded-2xl bg-white border border-neutral-100 items-center">
                <Text className="text-foreground text-sm" style={styles.bold}>Close</Text>
              </Pressable>

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <AppModal {...modalProps} />
    </>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
        <HugeiconsIcon icon={icon} size={15} color="#ffc400" />
      </View>
      <Text className="text-muted-foreground text-xs w-16" style={styles.body}>{label}</Text>
      <Text className="text-foreground text-xs flex-1 text-right" style={mono ? styles.mono : styles.body} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
  mono: { fontFamily: "LufgaRegular", letterSpacing: 0.5 },
});
