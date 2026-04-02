import { supabase } from "@/utils/supabase";
import { VehicleClass } from "@/utils/tollApi";
import { create } from "zustand";

export interface SavedRoute {
  id: string;
  label: string;
  origin: string;
  destination: string;
  vehicleClass: VehicleClass;
  totalToll: number;
  createdAt: Date;
}

interface SavedRoutesStore {
  routes: SavedRoute[];
  loading: boolean;
  fetchRoutes: () => Promise<void>;
  addRoute: (route: Omit<SavedRoute, "id" | "createdAt">) => Promise<void>;
  updateRoute: (id: string, updates: Partial<Pick<SavedRoute, "label" | "origin" | "destination" | "vehicleClass" | "totalToll">>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
}

export const useSavedRoutesStore = create<SavedRoutesStore>((set) => ({
  routes: [],
  loading: false,

  fetchRoutes: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) { set({ routes: [], loading: false }); return; }
    set({ loading: true });
    const { data, error } = await supabase
      .from("saved_routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      set({
        routes: data.map((r) => ({
          id: r.id,
          label: r.label,
          origin: r.origin,
          destination: r.destination,
          vehicleClass: r.vehicle_class as VehicleClass,
          totalToll: r.total_toll ?? 0,
          createdAt: new Date(r.created_at),
        })),
      });
    }
    set({ loading: false });
  },

  addRoute: async (route) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;
    const { data, error } = await supabase
      .from("saved_routes")
      .insert({ user_id: user.id, label: route.label, origin: route.origin, destination: route.destination, vehicle_class: route.vehicleClass, total_toll: route.totalToll })
      .select()
      .single();
    if (!error && data) {
      set((s) => ({
        routes: [{ id: data.id, label: data.label, origin: data.origin, destination: data.destination, vehicleClass: data.vehicle_class, totalToll: data.total_toll ?? 0, createdAt: new Date(data.created_at) }, ...s.routes],
      }));
    }
  },

  updateRoute: async (id, updates) => {
    const payload: any = {};
    if (updates.label !== undefined) payload.label = updates.label;
    if (updates.origin !== undefined) payload.origin = updates.origin;
    if (updates.destination !== undefined) payload.destination = updates.destination;
    if (updates.vehicleClass !== undefined) payload.vehicle_class = updates.vehicleClass;
    if (updates.totalToll !== undefined) payload.total_toll = updates.totalToll;

    const { error } = await supabase.from("saved_routes").update(payload).eq("id", id);
    if (!error) {
      set((s) => ({
        routes: s.routes.map((r) => r.id === id ? { ...r, ...updates } : r),
      }));
    }
  },

  deleteRoute: async (id) => {
    const { error } = await supabase.from("saved_routes").delete().eq("id", id);
    if (!error) set((s) => ({ routes: s.routes.filter((r) => r.id !== id) }));
  },
}));
