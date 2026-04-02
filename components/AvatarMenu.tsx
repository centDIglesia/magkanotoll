import { useAuthStore } from "@/stores/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Login01Icon,
  UserAdd01Icon,
  User03Icon,
  Settings01Icon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AvatarMenu() {
  const { user, isAnonymous, signOut } = useAuthStore();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const avatarRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0 });

  // Animation state
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const openMenu = () => {
    avatarRef.current?.measureInWindow((_x, y, _w, height) => {
      // Offset by 8px for a nice gap
      setMenuPos({ top: y + height + 8 });
      setVisible(true);
    });
  };

  const initials = isAnonymous
    ? "G"
    : user?.full_name
      ? user.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  return (
    <>
      <Pressable
        onPress={openMenu}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <View
          ref={avatarRef}
          className={`w-10 h-10 rounded-full items-center justify-center  ${
            isAnonymous ? "bg-neutral-100 border-neutral-200" : "bg-accent "
          }`}
          style={styles.avatarShadow}
        >
          {user?.profile_image_url ? (
            <Image
              source={{ uri: user.profile_image_url }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text
              className={`text-sm ${isAnonymous ? "text-neutral-500" : "text-white"}`}
              style={styles.bold}
            >
              {initials}
            </Text>
          )}
        </View>
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/5"
          onPress={() => setVisible(false)}
        >
          <Animated.View
            className="absolute bg-white rounded-[24px] min-w-[220px] overflow-hidden border border-neutral-100"
            style={[
              styles.menuShadow,
              {
                top: menuPos.top,
                right: 16,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View className="p-5 bg-accent/10">
              <Text className="text-foreground text-base" style={styles.bold}>
                {isAnonymous ? "Welcome, Guest" : user?.full_name}
              </Text>
              <Text className="text-muted-foreground text-xs mt-1" style={styles.body}>
                {isAnonymous ? "Sign in to sync your data" : user?.email}
              </Text>
            </View>

            <View className="h-px bg-neutral-100" />

            <View className="p-2">
              {isAnonymous ? (
                <>
                  <MenuButton
                    icon={Login01Icon}
                    label="Sign In"
                    onPress={() => {
                      setVisible(false);
                      router.replace("/(auth)/login");
                    }}
                  />
                  <MenuButton
                    icon={UserAdd01Icon}
                    label="Create Account"
                    primary
                    onPress={() => {
                      setVisible(false);
                      router.replace("/(auth)/signup");
                    }}
                  />
                </>
              ) : (
                <>
                  <MenuButton
                    icon={User03Icon}
                    label="My Profile"
                    onPress={() => {
                      setVisible(false);
                      router.push("/profile");
                    }}
                  />
                  <MenuButton
                    icon={Settings01Icon}
                    label="Settings"
                    onPress={() => {
                      setVisible(false);
                      router.push("/settings" as any);
                    }}
                  />
                  <View className="h-px bg-neutral-100 my-1 mx-2" />
                  <MenuButton
                    icon={Logout01Icon}
                    label="Logout"
                    danger
                    onPress={() => {
                      setVisible(false);
                      setShowLogoutModal(true);
                    }}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Logout Confirmation */}
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
              <Pressable
                className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-foreground text-sm" style={styles.bold}>Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-destructive rounded-2xl py-4 items-center"
                onPress={async () => {
                  setShowLogoutModal(false);
                  await signOut();
                  router.replace("/(auth)/login");
                }}
              >
                <Text className="text-white text-sm" style={styles.bold}>Log out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Sub-component for Menu Items
function MenuButton({ icon, label, onPress, danger, primary }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
    >
      <HugeiconsIcon
        icon={icon}
        size={18}
        color={danger ? "#e7000b" : "#ffc400"}
      />
      <Text
        className={`text-sm flex-1 ${danger ? "text-destructive" : "text-neutral-700"}`}
        style={styles.body}
      >
        {label}
      </Text>
      <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="#D4D4D4" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
  menuShadow: {
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
});
