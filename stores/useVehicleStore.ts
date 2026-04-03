import { supabase } from "@/utils/supabase";
import { create } from "zustand";

export interface SavedVehicle {
  id: string;
  nickname: string;
  vehicle_class: 1 | 2 | 3;
  fuel_type: string;
  // ICE/Hybrid only — null for electric
  engine_cc: string | null;
  // Electric only — null for ICE/Hybrid
  battery_kwh: string | null;
  created_at: Date;
}

type VehiclePayload = Omit<SavedVehicle, "id" | "created_at">;

interface VehicleStore {
  vehicles: SavedVehicle[];
  loading: boolean;
  fetchVehicles: () => Promise<void>;
  addVehicle: (v: VehiclePayload) => Promise<void>;
  updateVehicle: (id: string, v: VehiclePayload) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

function mapRow(r: Record<string, any>): SavedVehicle {
  return {
    id: r.id,
    nickname: r.nickname,
    vehicle_class: r.vehicle_class,
    fuel_type: r.fuel_type,
    engine_cc: r.engine_cc ?? null,
    battery_kwh: r.battery_kwh ?? null,
    created_at: new Date(r.created_at),
  };
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  loading: false,

  fetchVehicles: async () => {
    if (get().loading) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("saved_vehicles")
      .select(
        "id, nickname, vehicle_class, fuel_type, engine_cc, battery_kwh, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) set({ vehicles: data.map(mapRow) });
    set({ loading: false });
  },

  addVehicle: async (v) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;
    const { data, error } = await supabase
      .from("saved_vehicles")
      .insert({ user_id: user.id, ...v })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data) set((state) => ({ vehicles: [mapRow(data), ...state.vehicles] }));
  },

  updateVehicle: async (id, v) => {
    const previousVehicles = get().vehicles;
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...v } : vehicle,
      ),
    }));
    const { error } = await supabase
      .from("saved_vehicles")
      .update(v)
      .eq("id", id);
    if (error) {
      set({ vehicles: previousVehicles });
      throw new Error(error.message);
    }
  },

  deleteVehicle: async (id) => {
    const previousVehicles = get().vehicles;
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
    const { error } = await supabase
      .from("saved_vehicles")
      .delete()
      .eq("id", id);
    if (error) {
      set({ vehicles: previousVehicles });
      throw new Error(error.message);
    }
  },
}));
