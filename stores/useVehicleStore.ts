import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface SavedVehicle {
  id: string;
  nickname: string;
  vehicle_class: 1 | 2 | 3;
  fuel_type: string;
  engine_cc: string | null;
  battery_kwh: string | null;
  created_at: Date;
}

type VehiclePayload = Omit<SavedVehicle, "id" | "created_at">;

interface VehicleStore {
  vehicles: SavedVehicle[];
  loading: boolean;
  defaultVehicleId: string | null;           // ← new
  fetchVehicles: () => Promise<void>;
  addVehicle: (v: VehiclePayload) => Promise<void>;
  updateVehicle: (id: string, v: VehiclePayload) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setDefaultVehicle: (id: string) => Promise<void>; // ← new
  getDefaultVehicle: () => SavedVehicle | null;      // ← new
}

const DEFAULT_VEHICLE_KEY = "default_vehicle_id";

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
  defaultVehicleId: null,

  fetchVehicles: async () => {
    if (get().loading) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;
    set({ loading: true });

    // Load persisted default alongside vehicles
    const storedDefault = await AsyncStorage.getItem(DEFAULT_VEHICLE_KEY);

    const { data, error } = await supabase
      .from("saved_vehicles")
      .select("id, nickname, vehicle_class, fuel_type, engine_cc, battery_kwh, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const vehicles = data.map(mapRow);
      // Validate stored default still exists
      const validDefault =
        storedDefault && vehicles.some((v) => v.id === storedDefault)
          ? storedDefault
          : vehicles[0]?.id ?? null;
      set({ vehicles, defaultVehicleId: validDefault });
    }
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
    if (data) {
      const newVehicle = mapRow(data);
      set((state) => {
        // Auto-set as default if it's the first vehicle
        const isFirst = state.vehicles.length === 0;
        if (isFirst) AsyncStorage.setItem(DEFAULT_VEHICLE_KEY, newVehicle.id);
        return {
          vehicles: [newVehicle, ...state.vehicles],
          defaultVehicleId: isFirst ? newVehicle.id : state.defaultVehicleId,
        };
      });
    }
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
    set((state) => {
      const vehicles = state.vehicles.filter((v) => v.id !== id);
      // If deleted vehicle was default, fall back to first remaining
      let defaultVehicleId = state.defaultVehicleId;
      if (state.defaultVehicleId === id) {
        defaultVehicleId = vehicles[0]?.id ?? null;
        if (defaultVehicleId) AsyncStorage.setItem(DEFAULT_VEHICLE_KEY, defaultVehicleId);
        else AsyncStorage.removeItem(DEFAULT_VEHICLE_KEY);
      }
      return { vehicles, defaultVehicleId };
    });
    const { error } = await supabase
      .from("saved_vehicles")
      .delete()
      .eq("id", id);
    if (error) {
      set({ vehicles: previousVehicles });
      throw new Error(error.message);
    }
  },

  setDefaultVehicle: async (id) => {
    await AsyncStorage.setItem(DEFAULT_VEHICLE_KEY, id);
    set({ defaultVehicleId: id });
  },

  getDefaultVehicle: () => {
    const { vehicles, defaultVehicleId } = get();
    return vehicles.find((v) => v.id === defaultVehicleId) ?? vehicles[0] ?? null;
  },
}));