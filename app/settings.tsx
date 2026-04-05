import { useAuthStore } from "@/stores/useAuthStore";
import AppModal, { useAppModal } from "@/components/AppModal";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft01Icon,
  LockPasswordIcon,
  Notification01Icon,
  Delete01Icon,
  ViewIcon,
  ViewOffIcon,
  ArrowRight01Icon,
  InformationCircleIcon,
  ShieldKeyIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { resetPassword, deleteAccount, signOut, user } = useAuthStore();
  const router = useRouter();
  const { show, modalProps } = useAppModal();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const push = await AsyncStorage.getItem('push_notifications');
        const email = await AsyncStorage.getItem('email_notifications');
        if (push !== null) setPushEnabled(JSON.parse(push));
        if (email !== null) setEmailEnabled(JSON.parse(email));
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword.length < 6) return setPasswordError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match.");
    setPasswordLoading(true);
    try {
      await resetPassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword(""); setConfirmPassword("");
      show({ type: "success", title: "Password Updated", message: "Your password has been updated successfully.", confirmLabel: "OK" });
    } catch (e: any) {
      setPasswordError(e.message);
    }
    setPasswordLoading(false);
  };

  const handleTogglePush = async (value: boolean) => {
    setPushEnabled(value);
    try {
      await AsyncStorage.setItem('push_notifications', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save push notification preference:', error);
    }
  };

  const handleToggleEmail = async (value: boolean) => {
    setEmailEnabled(value);
    try {
      await AsyncStorage.setItem('email_notifications', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save email notification preference:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      router.replace("/(auth)/login");
    } catch (e: any) {
      setDeleteLoading(false);
      show({ type: "error", title: "Error", message: e.message, confirmLabel: "OK" });
    }
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
        <Text className="text-foreground text-lg flex-1" style={styles.bold}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>

        {/* Account */}
        <Text className="text-muted-foreground text-xs uppercase tracking-widest ml-1 mb-1" style={styles.body}>Account</Text>
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <SettingsRow
            icon={LockPasswordIcon}
            label="Change Password"
            onPress={() => setShowPasswordModal(true)}
          />
          <View className="h-px bg-neutral-100 mx-4" />
          <SettingsRow
            icon={ShieldKeyIcon}
            label="Two-Factor Authentication"
            onPress={() => show({ type: "info", title: "Coming Soon", message: "2FA support is coming in a future update.", confirmLabel: "Got it" })}
          />
        </View>

        {/* Notifications */}
        <Text className="text-muted-foreground text-xs uppercase tracking-widest ml-1 mb-1 mt-2" style={styles.body}>Notifications</Text>
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="flex-row items-center gap-3 px-4 py-4">
            <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
              <HugeiconsIcon icon={Notification01Icon} size={16} color="#ffc400" />
            </View>
            <Text className="text-foreground text-sm flex-1" style={styles.body}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: "#e5e5e5", true: "#ffc400" }}
              thumbColor="#fff"
            />
          </View>
          <View className="h-px bg-neutral-100 mx-4" />
          <View className="flex-row items-center gap-3 px-4 py-4">
            <View className="w-8 h-8 rounded-lg bg-accent/10 items-center justify-center">
              <HugeiconsIcon icon={Notification01Icon} size={16} color="#ffc400" />
            </View>
            <Text className="text-foreground text-sm flex-1" style={styles.body}>Email Notifications</Text>
            <Switch
              value={emailEnabled}
              onValueChange={handleToggleEmail}
              trackColor={{ false: "#e5e5e5", true: "#ffc400" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* About */}
        <Text className="text-muted-foreground text-xs uppercase tracking-widest ml-1 mb-1 mt-2" style={styles.body}>About</Text>
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <SettingsRow
            icon={InformationCircleIcon}
            label="App Version"
            value={Constants.expoConfig?.version ?? "1.0.0"}
          />
        </View>

        {/* Admin */}
        {(user as any)?.is_admin && (
          <>
            <Text className="text-muted-foreground text-xs uppercase tracking-widest ml-1 mb-1 mt-2" style={styles.body}>Admin</Text>
            <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <SettingsRow
                icon={Settings02Icon}
                label="Admin Dashboard"
                onPress={() => router.push("/admin" as any)}
              />
            </View>
          </>
        )}

        {/* Danger Zone */}
        <Text className="text-destructive text-xs uppercase tracking-widest ml-1 mb-1 mt-2" style={styles.body}>Danger Zone</Text>
        <View className="bg-white rounded-2xl border border-destructive/20 overflow-hidden">
          <SettingsRow
            icon={Delete01Icon}
            label="Delete Account"
            danger
            onPress={() => setShowDeleteModal(true)}
          />
        </View>

      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowPasswordModal(false)}>
          <Pressable className="bg-white rounded-t-[32px] p-6 pb-10" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />
            <Text className="text-foreground text-xl mb-5" style={styles.bold}>Change Password</Text>

            <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <View className="mb-3" />
            <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />

            {passwordError ? (
              <Text className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-xl mt-3" style={styles.body}>{passwordError}</Text>
            ) : null}

            <Pressable
              className={`rounded-2xl py-4 items-center mt-5 ${passwordLoading || !newPassword || !confirmPassword ? "bg-neutral-300" : "bg-primary"}`}
              onPress={handleChangePassword}
              disabled={passwordLoading || !newPassword || !confirmPassword}
            >
              {passwordLoading ? <ActivityIndicator color="#fff" /> : (
                <Text className="text-white text-base" style={styles.bold}>Update Password</Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setShowDeleteModal(false)}>
          <Pressable className="bg-white rounded-[28px] p-6" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center mb-4 self-center">
              <HugeiconsIcon icon={Delete01Icon} size={24} color="#e7000b" />
            </View>
            <Text className="text-foreground text-xl text-center mb-2" style={styles.bold}>Delete Account?</Text>
            <Text className="text-muted-foreground text-sm text-center leading-6 mb-6" style={styles.body}>
              This will permanently delete your account, saved routes, and history. This action cannot be undone.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-foreground text-sm" style={styles.bold}>Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-destructive rounded-2xl py-4 items-center"
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? <ActivityIndicator color="#fff" /> : (
                  <Text className="text-white text-sm" style={styles.bold}>Delete</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <AppModal {...modalProps} />
    </SafeAreaView>
  );
}

function SettingsRow({ icon, label, value, onPress, danger }: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-3 px-4 py-4"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className={`w-8 h-8 rounded-lg items-center justify-center ${danger ? "bg-destructive/10" : "bg-accent/10"}`}>
        <HugeiconsIcon icon={icon} size={16} color={danger ? "#e7000b" : "#ffc400"} />
      </View>
      <Text className={`text-sm flex-1 ${danger ? "text-destructive" : "text-foreground"}`} style={styles.body}>{label}</Text>
      {value ? (
        <Text className="text-muted-foreground text-sm" style={styles.body}>{value}</Text>
      ) : onPress ? (
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#D4D4D4" />
      ) : null}
    </Pressable>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View>
      <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide" style={styles.body}>{label}</Text>
      <View className="flex-row items-center bg-neutral-100 rounded-2xl px-4 border border-neutral-200">
        <HugeiconsIcon icon={LockPasswordIcon} size={18} color="#ffc400" />
        <TextInput
          className="flex-1 py-3.5 px-3 text-foreground"
          style={styles.body}
          placeholder="••••••••"
          placeholderTextColor="#A3A3A3"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
        />
        <Pressable onPress={onToggle}>
          <HugeiconsIcon icon={show ? ViewOffIcon : ViewIcon} size={18} color="#A3A3A3" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
