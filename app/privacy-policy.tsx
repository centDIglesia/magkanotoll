import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide when creating an account (full name, email address) and information generated through app usage (toll calculations, saved routes, history).",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to provide and improve the MagkanoToll service, sync your data across devices, and send important account notifications. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Data Storage",
    body: "Your data is stored securely using Supabase, a trusted cloud database provider. Data is encrypted in transit and at rest. Profile images are stored in secure cloud storage.",
  },
  {
    title: "4. Anonymous Usage",
    body: "You may use MagkanoToll as a guest without creating an account. Guest data is stored locally on your device and is not synced to our servers.",
  },
  {
    title: "5. Third-Party Services",
    body: "MagkanoToll uses the OSRM routing service to estimate travel distances and times. Route queries (coordinates only, no personal data) are sent to OSRM servers. Toll data is fetched from expressway.ph.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time through Settings > Delete Account.",
  },
  {
    title: "7. Your Rights",
    body: "You have the right to access, correct, or delete your personal data. To exercise these rights, use the in-app settings or contact us at support@magkanotoll.app.",
  },
  {
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.",
  },
  {
    title: "9. Contact Us",
    body: "If you have questions about this Privacy Policy, please contact us at support@magkanotoll.app.",
  },
];

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]">
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 bg-white rounded-full items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="#171717" />
        </Pressable>
        <Text className="text-foreground text-lg flex-1" style={styles.bold}>Privacy Policy</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="bg-white rounded-3xl p-5 border border-neutral-100 mb-4">
          <Text className="text-muted-foreground text-xs leading-5" style={styles.body}>
            Last updated: January 1, 2025
          </Text>
          <Text className="text-foreground text-sm leading-6 mt-2" style={styles.body}>
            MagkanoToll is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} className="bg-white rounded-3xl p-5 border border-neutral-100 mb-3">
            <Text className="text-foreground text-sm mb-2" style={styles.bold}>{s.title}</Text>
            <Text className="text-muted-foreground text-sm leading-6" style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
