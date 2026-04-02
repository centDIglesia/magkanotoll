import { useAuthStore } from "@/stores/useAuthStore";
import AppModal, { useAppModal } from "@/components/AppModal";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  User03Icon,
  Mail01Icon,
  Logout01Icon,
  Settings01Icon,
  PencilEdit01Icon,
  Camera01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user, signOut, updateProfile, uploadAvatar } = useAuthStore();
  const router = useRouter();
  const { show, modalProps } = useAppModal();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
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

    // ✅ FIXED: ensure base64 is always a valid string before uploading
    let base64 = asset.base64;
    if (!base64) {
      try {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
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

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 bg-white rounded-full items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="#171717" />
        </Pressable>
        <Text className="text-foreground text-lg flex-1" style={styles.bold}>
          Profile
        </Text>
        <Pressable
          onPress={() => router.push("/settings" as any)}
          className="w-9 h-9 bg-white rounded-full items-center justify-center"
        >
          <HugeiconsIcon icon={Settings01Icon} size={18} color="#171717" />
        </Pressable>
      </View>

      {/* Avatar */}
      <View className="items-center py-6">
        <Pressable onPress={handlePickImage} className="relative">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center overflow-hidden">
            {user?.profile_image_url ? (
              <Image
                source={{ uri: user.profile_image_url }}
                className="w-full h-full"
              />
            ) : (
              <Text className="text-white text-3xl" style={styles.bold}>
                {initials}
              </Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full items-center justify-center border-2 border-white">
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <HugeiconsIcon icon={Camera01Icon} size={14} color="#fff" />
            )}
          </View>
        </Pressable>
        <View className="flex-row items-center gap-2 mt-3">
          <Text className="text-foreground text-2xl" style={styles.black}>
            {user?.full_name}
          </Text>
          <Pressable
            onPress={() => {
              setFullName(user?.full_name ?? "");
              setShowEditModal(true);
            }}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} color="#A3A3A3" />
          </Pressable>
        </View>
        <Text
          className="text-muted-foreground text-sm mt-1"
          style={styles.body}
        >
          {user?.email}
        </Text>
      </View>

      {/* Info Card */}
      <View className="mx-5 bg-white rounded-2xl px-4 mb-4 border border-neutral-100">
        <View className="flex-row items-center gap-3.5 py-4">
          <HugeiconsIcon icon={User03Icon} size={18} color="#737373" />
          <View className="flex-1">
            <Text
              className="text-muted-foreground text-xs uppercase tracking-wide"
              style={styles.body}
            >
              Full Name
            </Text>
            <Text
              className="text-foreground text-base mt-0.5"
              style={styles.body}
            >
              {user?.full_name || "—"}
            </Text>
          </View>
        </View>
        <View className="h-px bg-neutral-100" />
        <View className="flex-row items-center gap-3.5 py-4">
          <HugeiconsIcon icon={Mail01Icon} size={18} color="#737373" />
          <View className="flex-1">
            <Text
              className="text-muted-foreground text-xs uppercase tracking-wide"
              style={styles.body}
            >
              Email
            </Text>
            <Text
              className="text-foreground text-base mt-0.5"
              style={styles.body}
            >
              {user?.email || "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View className="mx-5">
        <TouchableOpacity
          className="bg-destructive/10 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => setShowLogoutModal(true)}
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} color="#e7000b" />
          <Text className="text-destructive text-base" style={styles.bold}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-6"
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable
            className="bg-white rounded-[28px] p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center mb-4 self-center">
              <HugeiconsIcon icon={Logout01Icon} size={24} color="#e7000b" />
            </View>
            <Text
              className="text-foreground text-xl text-center mb-2"
              style={styles.bold}
            >
              Log out?
            </Text>
            <Text
              className="text-muted-foreground text-sm text-center leading-6 mb-6"
              style={styles.body}
            >
              You'll need to sign in again to access your saved routes and
              history.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-foreground text-sm" style={styles.bold}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-destructive rounded-2xl py-4 items-center"
                onPress={handleLogout}
              >
                <Text className="text-white text-sm" style={styles.bold}>
                  Log out
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowEditModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-[32px] p-6 pb-10"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
            <Text className="text-foreground text-xl mb-5" style={styles.bold}>
              Edit Name
            </Text>
            <Text
              className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide"
              style={styles.body}
            >
              Full Name
            </Text>
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
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base" style={styles.bold}>
                  Save
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { fontFamily: "LufgaBlack" },
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
