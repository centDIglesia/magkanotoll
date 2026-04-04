import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  UserCircleIcon,
  CalculatorIcon,
  Clock01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  Search01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { UserRow } from "./UserDetailModal";
import Skeleton from "@/components/Skeleton";
import AppModal, { useAppModal } from "@/components/AppModal";

type Filter = "all" | "registered" | "anonymous" | "banned";

interface Props {
  users: UserRow[];
  loading: boolean;
  onSelectUser: (u: UserRow) => void;
  onBanToggle: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
}

export default function UsersTab({ users, loading, onSelectUser, onBanToggle, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { show, modalProps } = useAppModal();

  const handleDeletePress = (e: any, u: UserRow) => {
    e.stopPropagation();
    show({
      type: "confirm",
      title: "Delete User",
      message: `Delete ${u.email || "this user"}? This will permanently remove all their data.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => onDelete(u),
    });
  };

  if (loading) {
    return (
      <>
        <Skeleton width="30%" height={10} radius={6} style={{ marginBottom: 12 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-white rounded-2xl p-4 border border-neutral-100 mb-2">
            <View className="flex-row items-center gap-3">
              <Skeleton width={40} height={40} radius={99} />
              <View className="flex-1 gap-2">
                <Skeleton width="45%" height={13} radius={6} />
                <Skeleton width="60%" height={11} radius={6} />
              </View>
              <Skeleton width={32} height={32} radius={10} />
              <Skeleton width={32} height={32} radius={10} />
            </View>
            <Skeleton width="100%" height={1} radius={0} style={{ marginVertical: 12 }} />
            <View className="flex-row gap-3">
              <Skeleton width={80} height={10} radius={6} />
              <Skeleton width={90} height={10} radius={6} />
            </View>
          </View>
        ))}
      </>
    );
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "registered" && !u.is_anonymous) ||
      (filter === "anonymous" && u.is_anonymous) ||
      (filter === "banned" && u.is_banned);

    return matchesSearch && matchesFilter;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "registered", label: "Registered" },
    { key: "anonymous", label: "Guest" },
    { key: "banned", label: "Banned" },
  ];

  return (
    <>
      {/* Search */}
      <View className="flex-row items-center bg-white rounded-2xl px-4 border border-neutral-100 mb-3">
        <HugeiconsIcon icon={Search01Icon} size={16} color="#A3A3A3" />
        <TextInput
          className="flex-1 py-3 px-3 text-foreground text-sm"
          style={styles.body}
          placeholder="Search by name or email..."
          placeholderTextColor="#A3A3A3"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <HugeiconsIcon icon={Cancel01Icon} size={16} color="#A3A3A3" />
          </Pressable>
        )}
      </View>

      {/* Filter chips */}
      <View className="flex-row gap-2 mb-3">
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl border ${filter === f.key ? "bg-accent border-accent" : "bg-white border-neutral-100"}`}
          >
            <Text
              className={`text-xs ${filter === f.key ? "text-accent-foreground" : "text-muted-foreground"}`}
              style={filter === f.key ? styles.bold : styles.body}
            >
              {f.label}
              {f.key === "banned" && users.filter((u) => u.is_banned).length > 0
                ? ` (${users.filter((u) => u.is_banned).length})`
                : ""}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-muted-foreground text-xs mb-3" style={styles.body}>
        {filtered.length} of {users.length} accounts
      </Text>

      {filtered.length === 0 ? (
        <View className="items-center py-10 gap-2">
          <HugeiconsIcon icon={FilterIcon} size={28} color="#A3A3A3" />
          <Text className="text-muted-foreground text-sm" style={styles.body}>No users match your search</Text>
        </View>
      ) : (
        filtered.map((u) => (
          <Pressable
            key={u.id}
            onPress={() => onSelectUser(u)}
            className={`bg-white rounded-2xl p-4 border mb-2 ${u.is_banned ? "border-destructive/30" : "border-neutral-100"}`}
          >
            <View className="flex-row items-center gap-3">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${u.is_banned ? "bg-destructive/10" : u.is_anonymous ? "bg-neutral-100" : "bg-accent/20"}`}>
                <HugeiconsIcon
                  icon={UserCircleIcon}
                  size={20}
                  color={u.is_banned ? "#e7000b" : u.is_anonymous ? "#A3A3A3" : "#ffc400"}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-foreground text-sm" style={styles.bold} numberOfLines={1}>
                    {u.is_anonymous ? "Anonymous" : (u.full_name || "No name")}
                  </Text>
                  {u.is_anonymous && (
                    <View className="bg-neutral-100 px-2 py-0.5 rounded-full">
                      <Text className="text-muted-foreground text-[9px]" style={styles.bold}>GUEST</Text>
                    </View>
                  )}
                  {u.is_banned && (
                    <View className="bg-destructive/10 px-2 py-0.5 rounded-full">
                      <Text className="text-destructive text-[9px]" style={styles.bold}>BANNED</Text>
                    </View>
                  )}
                </View>
                <Text className="text-muted-foreground text-xs mt-0.5" style={styles.body} numberOfLines={1}>
                  {u.email || "No email"}
                </Text>
              </View>

              <Pressable
                onPress={(e) => { e.stopPropagation(); onBanToggle(u); }}
                className={`w-8 h-8 rounded-xl items-center justify-center ${u.is_banned ? "bg-green-500/10" : "bg-orange-500/10"}`}
              >
                <HugeiconsIcon
                  icon={u.is_banned ? CheckmarkCircle01Icon : Cancel01Icon}
                  size={15}
                  color={u.is_banned ? "#22c55e" : "#f97316"}
                />
              </Pressable>

              <Pressable
                onPress={(e) => handleDeletePress(e, u)}
                className="w-8 h-8 rounded-xl bg-destructive/10 items-center justify-center"
              >
                <HugeiconsIcon icon={Delete02Icon} size={15} color="#e7000b" />
              </Pressable>
            </View>

            <View className="h-px bg-neutral-100 mt-3 mb-2.5" />
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <HugeiconsIcon icon={CalculatorIcon} size={12} color="#A3A3A3" />
                <Text className="text-muted-foreground text-xs" style={styles.body}>{u.calc_count} calcs</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <HugeiconsIcon icon={Clock01Icon} size={12} color="#A3A3A3" />
                <Text className="text-muted-foreground text-xs" style={styles.body}>
                  {new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
              <Text className="text-muted-foreground text-xs ml-auto" style={styles.body}>Tap for details →</Text>
            </View>
          </Pressable>
        ))
      )}
      <AppModal {...modalProps} />
    </>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
