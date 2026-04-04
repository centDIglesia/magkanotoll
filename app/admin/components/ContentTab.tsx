import { supabase } from "@/utils/supabase";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  PencilEdit01Icon,
  Delete02Icon,
  PlusSignIcon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppModal, { useAppModal } from "@/components/AppModal";
import Skeleton from "@/components/Skeleton";

interface ContentSection { title: string; body: string; }
type ContentTab = "terms" | "privacy";

export default function ContentTab() {
  const { show, modalProps } = useAppModal();
  const [contentTab, setContentTab] = useState<ContentTab>("terms");
  const [termsSections, setTermsSections] = useState<ContentSection[]>([]);
  const [privacySections, setPrivacySections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase.from("app_content").select("*").in("id", ["terms", "privacy"]).then(({ data }) => {
      if (data) {
        const terms = data.find((d) => d.id === "terms");
        const privacy = data.find((d) => d.id === "privacy");
        if (terms) setTermsSections(terms.sections);
        if (privacy) setPrivacySections(privacy.sections);
      }
      setLoading(false);
    });
  }, []);

  const activeSections = contentTab === "terms" ? termsSections : privacySections;
  const setActiveSections = contentTab === "terms" ? setTermsSections : setPrivacySections;

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditTitle(activeSections[i].title);
    setEditBody(activeSections[i].body);
  };

  const cancelEdit = () => { setEditingIndex(null); setEditTitle(""); setEditBody(""); };

  const saveEdit = () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setActiveSections(activeSections.map((s, i) =>
      i === editingIndex ? { title: editTitle.trim(), body: editBody.trim() } : s
    ));
    cancelEdit();
  };

  const deleteSection = (i: number) => {
    show({
      type: "confirm",
      title: "Delete Section",
      message: `Delete "${activeSections[i].title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => setActiveSections(activeSections.filter((_, idx) => idx !== i)),
    });
  };

  const addSection = () => {
    const updated = [...activeSections, { title: `${activeSections.length + 1}. New Section`, body: "Enter content here." }];
    setActiveSections(updated);
    setEditingIndex(updated.length - 1);
    setEditTitle(updated[updated.length - 1].title);
    setEditBody(updated[updated.length - 1].body);
  };

  const saveContent = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("save_app_content", {
      content_id: contentTab,
      content_sections: activeSections,
    });
    setSaving(false);
    if (error) {
      show({ type: "error", title: "Save Failed", message: error.message, confirmLabel: "OK" });
    } else {
      show({ type: "success", title: "Saved", message: `${contentTab === "terms" ? "Terms" : "Privacy Policy"} updated.`, confirmLabel: "OK" });
    }
  };

  return (
    <>
      {/* Sub-tabs */}
      <View className="flex-row bg-white rounded-2xl p-1 border border-neutral-100 mb-4">
        {(["terms", "privacy"] as ContentTab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => { setContentTab(t); cancelEdit(); }}
            className={`flex-1 py-2.5 rounded-xl items-center ${contentTab === t ? "bg-accent" : ""}`}
          >
            <Text
              className={`text-xs ${contentTab === t ? "text-accent-foreground" : "text-muted-foreground"}`}
              style={contentTab === t ? styles.bold : styles.body}
            >
              {t === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="bg-white rounded-2xl border border-neutral-100 mb-2 p-4">
              <View className="flex-row items-start gap-2">
                <View className="flex-1 gap-2">
                  <Skeleton width="40%" height={13} radius={6} />
                  <Skeleton width="90%" height={11} radius={6} />
                  <Skeleton width="70%" height={11} radius={6} />
                </View>
                <View className="flex-row gap-1.5">
                  <Skeleton width={28} height={28} radius={8} />
                  <Skeleton width={28} height={28} radius={8} />
                </View>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          {activeSections.map((s, i) => (
            <View key={i} className="bg-white rounded-2xl border border-neutral-100 mb-2 overflow-hidden">
              {editingIndex === i ? (
                <View className="p-4 gap-3">
                  <TextInput
                    className="bg-neutral-100 rounded-xl px-3 py-2.5 text-foreground text-sm"
                    style={styles.bold}
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="Section title"
                    placeholderTextColor="#A3A3A3"
                  />
                  <TextInput
                    className="bg-neutral-100 rounded-xl px-3 py-2.5 text-foreground text-sm"
                    style={styles.body}
                    value={editBody}
                    onChangeText={setEditBody}
                    placeholder="Section content"
                    placeholderTextColor="#A3A3A3"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View className="flex-row gap-2">
                    <Pressable onPress={cancelEdit} className="flex-1 bg-neutral-100 rounded-xl py-2.5 items-center">
                      <Text className="text-foreground text-xs" style={styles.bold}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={saveEdit} className="flex-1 bg-primary rounded-xl py-2.5 items-center">
                      <Text className="text-white text-xs" style={styles.bold}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="p-4">
                  <View className="flex-row items-start gap-2">
                    <View className="flex-1">
                      <Text className="text-foreground text-sm mb-1" style={styles.bold}>{s.title}</Text>
                      <Text className="text-muted-foreground text-xs leading-5" style={styles.body}>{s.body}</Text>
                    </View>
                    <View className="flex-row gap-1.5">
                      <Pressable onPress={() => startEdit(i)} className="w-7 h-7 rounded-lg bg-accent/15 items-center justify-center">
                        <HugeiconsIcon icon={PencilEdit01Icon} size={13} color="#ffc400" />
                      </Pressable>
                      <Pressable onPress={() => deleteSection(i)} className="w-7 h-7 rounded-lg bg-destructive/10 items-center justify-center">
                        <HugeiconsIcon icon={Delete02Icon} size={13} color="#e7000b" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}

          <Pressable
            onPress={addSection}
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-neutral-200 mb-4"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} color="#A3A3A3" />
            <Text className="text-muted-foreground text-sm" style={styles.body}>Add Section</Text>
          </Pressable>

          <Pressable
            onPress={saveContent}
            disabled={saving}
            className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl ${saving ? "bg-neutral-300" : "bg-primary"}`}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <>
                  <HugeiconsIcon icon={FloppyDiskIcon} size={18} color="#ffc400" />
                  <Text className="text-white text-sm" style={styles.bold}>
                    Save {contentTab === "terms" ? "Terms" : "Privacy Policy"}
                  </Text>
                </>
            }
          </Pressable>
        </>
      )}
      <AppModal {...modalProps} />
    </>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: "LufgaBold" },
  body: { fontFamily: "LufgaRegular" },
});
