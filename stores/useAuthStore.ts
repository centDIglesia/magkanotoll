import { supabase } from "@/utils/supabase";
import { decode } from "base64-arraybuffer";
import { create } from "zustand";
import { makeRedirectUri } from "expo-auth-session";

interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image_url?: string;
  onboarding_completed: boolean;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>; 
  updateProfile: (data: { full_name?: string }) => Promise<void>;
  uploadAvatar: (uri: string, base64: string) => Promise<string>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  isAnonymous: false,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

  
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        const err = new Error("EMAIL_NOT_CONFIRMED");
        throw err;
      }
      throw error;
    }

    if (!data.user.email_confirmed_at) {
      throw new Error("EMAIL_NOT_CONFIRMED");
    }

    set({
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        full_name: data.user.user_metadata?.full_name ?? "",
        profile_image_url: data.user.user_metadata?.profile_image_url,
        onboarding_completed:
          data.user.user_metadata?.onboarding_completed ?? false,
      },
      isAnonymous: false,
      isLoggedIn: true,
    });
  },

  signUp: async (email, password, fullName) => {

     const redirectTo = makeRedirectUri({ scheme: "magkanotoll", path: "confirm-email" });  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectTo 
      },
    });
    if (error) throw error;
    if (data.user?.identities?.length === 0)
      throw new Error("An account with this email already exists.");
    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email ?? "",
          full_name: fullName,
          onboarding_completed: false,
        },
        isAnonymous: false,
        isLoggedIn: true,
      });
    }
  },

  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: "",
          full_name: "Guest",
          onboarding_completed: false,
        },
        isAnonymous: true,
        isLoggedIn: true,
      });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false, isAnonymous: false });
  },

  forgotPassword: async (email) => {
    const redirectTo = makeRedirectUri({
      scheme: "magkanotoll",
      path: "reset-password",
    });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  },

  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  resendConfirmationEmail: async (email) => {
     const redirectTo = makeRedirectUri({
       scheme: "magkanotoll",
       path: "confirm-email",
     });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
  },

  updateProfile: async (data) => {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  uploadAvatar: async (uri, base64) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const rawExt = uri.split(".").pop()?.split("?")[0]?.toLowerCase();
    const ext = ["jpg", "jpeg", "png", "webp"].includes(rawExt ?? "")
      ? rawExt!
      : "jpg";
    const path = `avatars/${user.id}.${ext}`;
    const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

    const arrayBuffer = decode(base64);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, arrayBuffer, { contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.auth.updateUser({ data: { profile_image_url: publicUrl } });
    set((state) => ({
      user: state.user ? { ...state.user, profile_image_url: publicUrl } : null,
    }));
    return publicUrl;
  },

  deleteAccount: async () => {
    const { error } = await supabase.rpc("delete_user");
    if (error) throw error;
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false, isAnonymous: false });
  },
}));
