import { supabase } from "@/utils/supabase";
import { create } from "zustand";

export interface RfidCard {
  id: string;
  user_id: string;
  system: "EasyTrip" | "Autosweep";
  card_number: string;
  nickname: string;
  created_at: string;
}

interface RfidStore {
  cards: RfidCard[];
  loading: boolean;
  fetchCards: () => Promise<void>;
  addCard: (data: { system: RfidCard["system"]; card_number: string; nickname: string }) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

export const useRfidStore = create<RfidStore>((set) => ({
  cards: [],
  loading: false,

  fetchCards: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("rfid_cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) set({ cards: data });
    set({ loading: false });
  },

  addCard: async ({ system, card_number, nickname }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("rfid_cards")
      .insert({ user_id: user.id, system, card_number, nickname })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ cards: [data, ...state.cards] }));
  },

  deleteCard: async (id) => {
    const { error } = await supabase.from("rfid_cards").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) }));
  },
}));
