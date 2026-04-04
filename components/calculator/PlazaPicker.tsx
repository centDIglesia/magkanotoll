import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  LocationUser01Icon,
  Location01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CancelCircleIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Modal, Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";

export type PlazaSection = { title: string; data: string[] };

export default function PlazaPicker({ label, value, sections, onChange, disabled }: {
  label: string;
  value: string;
  sections: PlazaSection[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered: PlazaSection[] = search
    ? sections
        .map((s) => ({ title: s.title, data: s.data.filter((o) => o.toLowerCase().includes(search.toLowerCase())) }))
        .filter((s) => s.data.length > 0)
    : sections;
  const isOrigin = label === "Origin";

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`flex-row items-center gap-4 px-4 bg-white  rounded-xl py-4 ${disabled ? "opacity-80" : ""}`}
      >
        <View className="w-9 h-9 rounded-lg bg-accent/20 items-center justify-center">
          <HugeiconsIcon
            icon={isOrigin ? LocationUser01Icon : Location01Icon}
            size={18}
            color="#ffc400"
          />
        </View>
        <View className="flex-1 ">
          <Text
            className="text-[9px] uppercase  text-accent-foreground/50 mb-0.5"
            style={styles.bold}
          >
            {label}
          </Text>
          <Text
            numberOfLines={1}
            className={`text-md ${value ? "text-foreground" : "text-muted-foreground"}`}
            style={value ? styles.semibold : styles.body}
          >
            {value || (isOrigin ? "Select origin" : "Select destination")}
          </Text>
        </View>
        <HugeiconsIcon icon={ArrowRight01Icon} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-[36px] p-6 pb-12"
            style={{ maxHeight: "85%" }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 bg-neutral-200 rounded-full self-center mb-6" />

            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text
                  className="text-[10px] uppercase  text-muted-foreground mb-0.5"
                  style={styles.body}
                >
                  {isOrigin ? "Starting from" : "Going to"}
                </Text>
                <Text className="text-xl text-foreground" style={styles.bold}>
                  Select {label}
                </Text>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                className="w-9 h-9 bg-neutral-100 rounded-full items-center justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} color="#171717" />
              </Pressable>
            </View>

            <View className="flex-row items-center bg-neutral-100 rounded-2xl px-4 mb-5">
              <HugeiconsIcon icon={Search01Icon} size={18} color="#ffc400" />
              <TextInput
                className="flex-1 py-3.5 px-3 text-foreground text-sm"
                style={styles.body}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor="#A3A3A3"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <HugeiconsIcon icon={CancelCircleIcon} size={18} color="#A3A3A3" />
                </Pressable>
              )}
            </View>

            <SectionList
              sections={filtered}
              keyExtractor={(item, i) => `${item}-${i}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              stickySectionHeadersEnabled={false}
              ListEmptyComponent={
                search.length > 0 ? (
                  <View className="items-center py-10 gap-2">
                    <HugeiconsIcon icon={Search01Icon} size={32} color="#A3A3A3" />
                    <Text className="text-muted-foreground text-sm text-center" style={styles.body}>
                      No plazas found for "{search}"
                    </Text>
                    <Text className="text-muted-foreground text-xs text-center" style={styles.body}>
                      Try a different search term
                    </Text>
                  </View>
                ) : null
              }
              renderSectionHeader={({ section }) => (
                <View className="bg-neutral-50 px-3 py-2 mt-2 rounded-xl">
                  <Text className="text-[10px] uppercase text-muted-foreground" style={styles.bold}>
                    {section.title}
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <Pressable
                  className={`flex-row items-center justify-between py-4 px-3 rounded-2xl ${item === value ? "bg-accent/10" : ""}`}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-2 h-2 rounded-full ${item === value ? "bg-accent" : "bg-neutral-200"}`}
                    />
                    <Text
                      className={`text-sm ${item === value ? "text-foreground" : "text-foreground/80"}`}
                      style={item === value ? styles.semibold : styles.body}
                    >
                      {item}
                    </Text>
                  </View>
                  {item === value && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#ffc400" />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-neutral-100 mx-3" />
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  semibold: { fontFamily: "LufgaSemiBold" },
  body: { fontFamily: "LufgaRegular" },
});
