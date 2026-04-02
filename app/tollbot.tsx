import { ChatMessage, resetChat, sendMessage } from "@/utils/gemini";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  SentIcon,
  BubbleChatIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUGGESTIONS = [
  "Anong RFID ang kailangan sa NLEX?",
  "Ilang plazas ang SLEX?",
  "Ano ang speed limit sa Skyway?",
  "Sino ang operator ng TPLEX?",
  "Paano mag-check ng EasyTrip balance?",
];

const WELCOME: ChatMessage = {
  role: "model",
  text: "Kamusta! Ako si TollBot 👋 Handa akong sumagot sa iyong mga tanong tungkol sa mga expressway sa Pilipinas — toll info, RFID, speed limits, at iba pa. Ano ang gusto mong malaman?",
};

export default function TollBot() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    resetChat();
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", text: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await sendMessage(msg, updated);
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `Error: ${e.message}` },
      ]);
    }
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleClear = () => {
    resetChat();
    setMessages([WELCOME]);
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
        <View className="flex-1">
          <Text className="text-foreground text-base" style={styles.bold}>TollBot</Text>
          <Text className="text-muted-foreground text-xs" style={styles.body}>Powered by Gemini AI</Text>
        </View>
        <Pressable
          onPress={handleClear}
          className="w-9 h-9 bg-white rounded-full items-center justify-center"
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} color="#737373" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View className="flex-row items-center gap-2 mt-2">
                <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
                  <HugeiconsIcon icon={BubbleChatIcon} size={16} color="#ffc400" />
                </View>
                <View className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-neutral-100">
                  <ActivityIndicator size="small" color="#ffc400" />
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View className={`flex-row ${item.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
              {item.role === "model" && (
                <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center mb-1">
                  <HugeiconsIcon icon={BubbleChatIcon} size={16} color="#ffc400" />
                </View>
              )}
              <View
                className={`max-w-[78%] px-4 py-3 rounded-2xl ${
                  item.role === "user"
                    ? "bg-primary rounded-tr-sm"
                    : "bg-white border border-neutral-100 rounded-tl-sm"
                }`}
              >
                <Text
                  className={item.role === "user" ? "text-white text-sm" : "text-foreground text-sm"}
                  style={styles.body}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Suggestions — show only at start */}
        {messages.length === 1 && (
          <View className="px-4 pb-2">
            <Text className="text-muted-foreground text-xs mb-2 ml-1" style={styles.body}>Mga maaaring itanong:</Text>
            <View className="flex-row flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleSend(s)}
                  className="bg-white border border-neutral-200 rounded-2xl px-3 py-2"
                >
                  <Text className="text-foreground text-xs" style={styles.body}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-t border-neutral-100">
          <TextInput
            className="flex-1 bg-neutral-100 rounded-2xl px-4 py-3 text-foreground text-sm"
            style={styles.body}
            placeholder="Magtanong tungkol sa toll..."
            placeholderTextColor="#A3A3A3"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-2xl items-center justify-center ${!input.trim() || loading ? "bg-neutral-200" : "bg-primary"}`}
          >
            <HugeiconsIcon icon={SentIcon} size={18} color={!input.trim() || loading ? "#A3A3A3" : "#fff"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
