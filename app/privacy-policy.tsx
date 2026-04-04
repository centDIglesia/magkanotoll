import { supabase } from "@/utils/supabase";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContentSection { title: string; body: string; }

export default function PrivacyPolicy() {
  const router = useRouter();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("app_content").select("*").eq("id", "privacy").single().then(({ data }) => {
      if (data) { setSections(data.sections); setUpdatedAt(data.updated_at); }
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#ebebeb]">
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 bg-white rounded-full items-center justify-center">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="#171717" />
        </Pressable>
        <Text className="text-foreground text-lg flex-1" style={styles.bold}>Privacy Policy</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffc400" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View className="bg-white rounded-3xl p-5 border border-neutral-100 mb-4">
            <Text className="text-muted-foreground text-xs leading-5" style={styles.body}>
              Last updated: {updatedAt ? new Date(updatedAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "January 1, 2025"}
            </Text>
            <Text className="text-foreground text-sm leading-6 mt-2" style={styles.body}>
              MagkanoToll is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
            </Text>
          </View>
          {sections.map((s, i) => (
            <View key={i} className="bg-white rounded-3xl p-5 border border-neutral-100 mb-3">
              <Text className="text-foreground text-sm mb-2" style={styles.bold}>{s.title}</Text>
              <Text className="text-muted-foreground text-sm leading-6" style={styles.body}>{s.body}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
