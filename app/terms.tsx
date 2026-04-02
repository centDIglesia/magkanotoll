import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using MagkanoToll, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.",
  },
  {
    title: "2. Use of the App",
    body: "MagkanoToll provides toll fee estimates for Philippine expressways. The information is provided for convenience only and may not reflect real-time toll rates. Always verify with official toll operators before travel.",
  },
  {
    title: "3. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
  },
  {
    title: "4. Saved Data",
    body: "Saved routes and calculation history are stored securely in your account. You may delete your data at any time through the Settings page.",
  },
  {
    title: "5. Accuracy of Information",
    body: "Toll rates are sourced from publicly available data and third-party APIs. MagkanoToll does not guarantee the accuracy, completeness, or timeliness of toll information.",
  },
  {
    title: "6. Limitation of Liability",
    body: "MagkanoToll shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the app or reliance on toll estimates provided.",
  },
  {
    title: "7. Changes to Terms",
    body: "We reserve the right to update these Terms at any time. Continued use of the app after changes constitutes acceptance of the new Terms.",
  },
  {
    title: "8. Contact",
    body: "For questions about these Terms, contact us at support@magkanotoll.app.",
  },
];

export default function Terms() {
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
        <Text className="text-foreground text-lg flex-1" style={styles.bold}>Terms & Conditions</Text>
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
            Please read these Terms & Conditions carefully before using MagkanoToll.
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
