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

export interface TripStats {
  totalKm: number;
  etaMinutes: number;
  gasLiters: number;
  effectiveKmL: number;
}

const GAS_CONSUMPTION_BASE: Record<VehicleClass, number> = {
  1: 15, // km/L — sedan/SUV highway baseline
  2: 8,  // km/L — bus/jeep/light truck
  3: 6,  // km/L — heavy truck/trailer
};

/**
 * Piecewise highway fuel efficiency curve calibrated for PH conditions.
 * Diesel gets +20% bonus over gasoline at highway speeds.
 */
export function kmLFromEngineCc(
  cc: number,
  vehicleClass: VehicleClass,
  fuelType?: string,
): number {
  const base = GAS_CONSUMPTION_BASE[vehicleClass];
  if (cc <= 0) return base;

  let kmL: number;
  if (cc <= 660)       kmL = base + 5.0;
  else if (cc <= 1000) kmL = base + 3.5;
  else if (cc <= 1300) kmL = base + 2.0;
  else if (cc <= 1600) kmL = base + 0.5;
  else if (cc <= 2000) kmL = base - 1.5;
  else if (cc <= 2500) kmL = base - 3.0;
  else if (cc <= 3000) kmL = base - 4.5;
  else                 kmL = base - 6.0;

  if (fuelType?.toLowerCase().includes("diesel")) kmL *= 1.2;

  return Math.max(4, Math.min(28, kmL));
}

function speedEfficiencyMultiplier(avgSpeedKph: number): number {
  if (avgSpeedKph <= 40)  return 0.75;
  if (avgSpeedKph <= 60)  return 0.9;
  if (avgSpeedKph <= 80)  return 1.0;
  if (avgSpeedKph <= 100) return 0.95;
  return 0.88;
}

export async function fetchOsrmTripStats(
  segments: TollSegment[],
  vehicleClass: VehicleClass,
  engineCc?: number,
  fuelType?: string,
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

  // Electric — no fuel consumption
  const isElectric = fuelType?.toLowerCase().includes("electric") ?? false;
  if (isElectric) {
    return { totalKm, etaMinutes, gasLiters: 0, effectiveKmL: 0 };
  }

  const baseKmL =
    engineCc && engineCc > 0
      ? kmLFromEngineCc(engineCc, vehicleClass, fuelType)
      : GAS_CONSUMPTION_BASE[vehicleClass];

  const gasLiters = results.reduce((sum, r) => {
    const multiplier = speedEfficiencyMultiplier(r.avgSpeedKph);
    return sum + r.distanceKm / (baseKmL * multiplier);
  }, 0);

  return {
    totalKm,
    etaMinutes,
    gasLiters: Math.round(gasLiters * 10) / 10,
    effectiveKmL: Math.round(baseKmL * 10) / 10,
  };
}

const EXPRESSWAY_TOLL_API_URL = "https://www.expressway.ph/api/toll-calculator";

export async function fetchExpresswayToll(
  params: TollCalculatorParams,
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
      default:  throw new Error(`API error: ${res.status}`);
    }
  }

  return res.json() as Promise<TollCalculatorResponse>;
}
