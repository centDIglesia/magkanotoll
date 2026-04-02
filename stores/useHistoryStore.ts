import { supabase } from "@/utils/supabase";
import { TollCalculatorResponse, VehicleClass } from "@/utils/tollApi";
import { create } from "zustand";

export interface HistoryEntry {
  id: string;
  origin: string;
  destination: string;
  vehicleClass: VehicleClass;
  result: TollCalculatorResponse;
  calculatedAt: Date;
}

interface HistoryStore {
  history: HistoryEntry[];
  loading: boolean;
  fetchHistory: () => Promise<void>;
  addEntry: (entry: Omit<HistoryEntry, "id" | "calculatedAt">) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: [],
  loading: false,

  fetchHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) {
      set({ history: [], loading: false });
      return;
    }
    set({ loading: true });
    const { data, error } = await supabase
      .from("toll_history")
      .select("*")
      .eq("user_id", user.id)
      .order("calculated_at", { ascending: false });

    if (!error && data) {
      set({
        history: data.map((row) => ({
          id: row.id,
          origin: row.origin,
          destination: row.destination,
          vehicleClass: row.vehicle_class as VehicleClass,
          calculatedAt: new Date(row.calculated_at),
          result: {
            origin: row.origin,
            destination: row.destination,
            vehicleClass: row.vehicle_class,
            totalToll: row.total_toll,
            segments: row.segments,
            rfidBreakdown: row.rfid_breakdown,
            alternativeRoutes: row.alternative_routes ?? [],
          },
        })),
      });
    }
    set({ loading: false });
  },

  addEntry: async (entry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;

    const { data, error } = await supabase
      .from("toll_history")
      .insert({
        user_id: user.id,
        origin: entry.origin,
        destination: entry.destination,
        vehicle_class: entry.vehicleClass,
        total_toll: entry.result.totalToll,
        segments: entry.result.segments,
        rfid_breakdown: entry.result.rfidBreakdown,
        alternative_routes: entry.result.alternativeRoutes,
      })
      .select()
      .single();

    if (!error && data) {
      set((state) => ({
        history: [
          {
            id: data.id,
            origin: data.origin,
            destination: data.destination,
            vehicleClass: data.vehicle_class,
            calculatedAt: new Date(data.calculated_at),
            result: entry.result,
          },
          ...state.history,
        ],
      }));
    }
  },

  clearHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;
    const { error } = await supabase
      .from("toll_history")
      .delete()
      .eq("user_id", user.id);
    if (!error) set({ history: [] });
  },
}));
