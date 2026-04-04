import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const hapticLight = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const hapticMedium = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

export const hapticHeavy = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

export const hapticSuccess = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

export const hapticWarning = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

export const hapticError = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

export const hapticSelection = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.selectionAsync();
  }
};
