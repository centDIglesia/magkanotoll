import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface Reminder {
  id: string;
  routeId: string;
  routeLabel: string;
  origin: string;
  destination: string;
  hour: number;
  minute: number;
  days: number[]; // 1=Sun, 2=Mon ... 7=Sat
  notificationIds: string[];
  enabled: boolean;
}

const STORAGE_KEY = "reminders";

async function scheduleNotifications(reminder: Reminder): Promise<string[]> {
  const ids: string[] = [];
  for (const day of reminder.days) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to hit the road!`,
        body: `${reminder.routeLabel}: ${reminder.origin} → ${reminder.destination}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: day,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
    ids.push(id);
  }
  return ids;
}

async function cancelNotifications(ids: string[]) {
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

interface ReminderStore {
  reminders: Reminder[];
  load: () => Promise<void>;
  addReminder: (data: Omit<Reminder, "id" | "notificationIds" | "enabled">) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({ reminders: JSON.parse(raw) });
  },

  addReminder: async (data) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") throw new Error("Notification permission denied.");

    const notificationIds = await scheduleNotifications({ ...data, id: "", notificationIds: [], enabled: true });
    const reminder: Reminder = {
      ...data,
      id: Date.now().toString(),
      notificationIds,
      enabled: true,
    };
    const updated = [...get().reminders, reminder];
    set({ reminders: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleReminder: async (id) => {
    const reminders = get().reminders.map(async (r) => {
      if (r.id !== id) return r;
      if (r.enabled) {
        await cancelNotifications(r.notificationIds);
        return { ...r, enabled: false, notificationIds: [] };
      } else {
        const notificationIds = await scheduleNotifications(r);
        return { ...r, enabled: true, notificationIds };
      }
    });
    const updated = await Promise.all(reminders);
    set({ reminders: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteReminder: async (id) => {
    const r = get().reminders.find((r) => r.id === id);
    if (r) await cancelNotifications(r.notificationIds);
    const updated = get().reminders.filter((r) => r.id !== id);
    set({ reminders: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));
