export type VehicleClass = 1 | 2 | 3;

export interface TollSegment {
  expresswaySlug: string;
  expresswayName: string;
  expresswayColor: string;
  rfidSystem: string;
  entryPlaza: string;
  exitPlaza: string;
  toll: number;
}

export interface RfidBreakdown {
  system: string;
  total: number;
}

export interface AlternativeRoute {
  label: string;
  tag: string;
  totalToll: number;
  segments: TollSegment[];
}

export interface TollCalculatorResponse {
  origin: string;
  destination: string;
  vehicleClass: VehicleClass;
  totalToll: number;
  segments: TollSegment[];
  rfidBreakdown: RfidBreakdown[];
  alternativeRoutes: AlternativeRoute[];
}

export interface TollCalculatorParams {
  origin: string;
  dest: string;
  class?: VehicleClass;
}

const GAS_CONSUMPTION_BASE: Record<VehicleClass, number> = {
  1: 15, // km/L baseline for highway (sedan/SUV)
  2: 8, // km/L (buses/jeeps)
  3: 6, // km/L (heavy trucks)
};


export interface TripStats {
  totalKm: number;
  etaMinutes: number;
  gasLiters: number;
}

function speedEfficiencyMultiplier(avgSpeedKph: number): number {
  // Peak efficiency ~70-80 kph, drops above 100 kph or below 50 kph
  if (avgSpeedKph <= 40) return 0.75;
  if (avgSpeedKph <= 60) return 0.9;
  if (avgSpeedKph <= 80) return 1.0; // sweet spot
  if (avgSpeedKph <= 100) return 0.95;
  return 0.88; // above 100 kph burns more
}

export async function fetchOsrmTripStats(
  segments: TollSegment[],
  vehicleClass: VehicleClass,
): Promise<TripStats> {
  const { getDrivingRouteBetweenPlazas } = await import("@/utils/tollData");

  const results = await Promise.all(
    segments.map((seg) =>
      getDrivingRouteBetweenPlazas(seg.entryPlaza, seg.exitPlaza),
    ),
  );

  const totalKm =
    Math.round(results.reduce((sum, r) => sum + r.distanceKm, 0) * 10) / 10;
  const etaMinutes = Math.round(
    results.reduce((sum, r) => sum + r.durationMin, 0),
  );

  // Per-segment gas with speed adjustment
  const gasLiters = results.reduce((sum, r) => {
    const multiplier = speedEfficiencyMultiplier(r.avgSpeedKph);
    const effectiveKmL = GAS_CONSUMPTION_BASE[vehicleClass] * multiplier;
    return sum + r.distanceKm / effectiveKmL;
  }, 0);

  return {
    totalKm,
    etaMinutes,
    gasLiters: Math.round(gasLiters * 10) / 10,
  };
}

const EXPRESSWAY_TOLL_API_URL = "https://www.expressway.ph/api/toll-calculator";

export async function fetchExpresswayToll(
  params: TollCalculatorParams
): Promise<TollCalculatorResponse> {
  const url = new URL(EXPRESSWAY_TOLL_API_URL);
  url.searchParams.set("origin", params.origin);
  url.searchParams.set("dest", params.dest);
  url.searchParams.set("class", String(params.class ?? 1));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    switch (res.status) {
      case 400: throw new Error("Missing or invalid parameters.");
      case 404: throw new Error("No route found between the given plazas.");
      default: throw new Error(`API error: ${res.status}`);
    }
  }

  return res.json() as Promise<TollCalculatorResponse>;
}
