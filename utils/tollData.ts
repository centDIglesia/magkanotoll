import { useVehicleStore } from "@/stores/useVehicleStore";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface TollPlaza {
  name: string;
  coordinates: { lat: number; lng: number };
}

export interface Expressway {
  fullName: string;
  region: string;
  plazas: number;
  kilometers: number;
  speedLimit: { minKph: number; maxKph: number };
  operator: string;
  hotline: string;
  rfidSystem: string;
  facebook: string;
  twitter: string;
  plazaList: TollPlaza[];
}

// ─── Default Vehicle Resolver ─────────────────────────────────────────────────

interface ResolvedVehicleParams {
  vehicleClass: VehicleClass;
  engineCc?: number;
  fuelType?: string;
}

/**
 * Merges explicit overrides with the saved default vehicle.
 * Explicit values always win; missing values fall back to the default vehicle.
 */
function resolveVehicleParams(
  overrides?: Partial<ResolvedVehicleParams>,
): ResolvedVehicleParams {
  const defaultVehicle = useVehicleStore.getState().getDefaultVehicle();

  const vehicleClass: VehicleClass =
    overrides?.vehicleClass ?? defaultVehicle?.vehicle_class ?? 1;

  const fuelType: string | undefined =
    overrides?.fuelType ?? defaultVehicle?.fuel_type ?? undefined;

  const isElectric = fuelType?.toLowerCase().includes("electric") ?? false;

  const engineCc: number | undefined =
    overrides?.engineCc ??
    (!isElectric && defaultVehicle?.engine_cc
      ? parseFloat(defaultVehicle.engine_cc)
      : undefined);

  return { vehicleClass, engineCc, fuelType };
}

// ─── Fuel Efficiency ──────────────────────────────────────────────────────────

const GAS_CONSUMPTION_BASE: Record<VehicleClass, number> = {
  1: 15,
  2: 8,
  3: 6,
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

// ─── Trip Stats ───────────────────────────────────────────────────────────────

export async function fetchOsrmTripStats(
  segments: TollSegment[],
  vehicleClassOverride?: VehicleClass,
  engineCcOverride?: number,
  fuelTypeOverride?: string,
): Promise<TripStats> {
  const { vehicleClass, engineCc, fuelType } = resolveVehicleParams({
    vehicleClass: vehicleClassOverride,
    engineCc: engineCcOverride,
    fuelType: fuelTypeOverride,
  });

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

// ─── Toll Fetch ───────────────────────────────────────────────────────────────

const EXPRESSWAY_TOLL_API_URL = "https://www.expressway.ph/api/toll-calculator";

export async function fetchExpresswayToll(
  params: TollCalculatorParams,
): Promise<TollCalculatorResponse> {
  const { vehicleClass } = resolveVehicleParams({
    vehicleClass: params.class,
  });

  const url = new URL(EXPRESSWAY_TOLL_API_URL);
  url.searchParams.set("origin", params.origin);
  url.searchParams.set("dest", params.dest);
  url.searchParams.set("class", String(vehicleClass));

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

// ─── Plaza Data ───────────────────────────────────────────────────────────────

export const tollPlazas: Record<string, Expressway> = {
  NLEX: {
    fullName: "North Luzon Expressway",
    region: "North Luzon",
    plazas: 18,
    kilometers: 84,
    speedLimit: { minKph: 60, maxKph: 100 },
    operator: "NLEX Corporation",
    hotline: "(02) 8580-8888",
    rfidSystem: "EasyTrip",
    facebook: "https://www.facebook.com/NLEXexpressway",
    twitter: "https://twitter.com/NLEXexpressway",
    plazaList: [
      { name: "Balintawak",           coordinates: { lat: 14.6568, lng: 121.0022 } },
      { name: "Mindanao Ave.",         coordinates: { lat: 14.6853, lng: 121.0205 } },
      { name: "Karuhatan",             coordinates: { lat: 14.6833, lng: 120.9781 } },
      { name: "Valenzuela",            coordinates: { lat: 14.7042, lng: 120.9856 } },
      { name: "Meycauayan",            coordinates: { lat: 14.7397, lng: 120.9708 } },
      { name: "Marilao",               coordinates: { lat: 14.7578, lng: 120.9575 } },
      { name: "Ciudad de Victoria",    coordinates: { lat: 14.7958, lng: 120.9389 } },
      { name: "Bocaue",                coordinates: { lat: 14.8092, lng: 120.925  } },
      { name: "Tambubong",             coordinates: { lat: 14.8217, lng: 120.91   } },
      { name: "Balagtas",              coordinates: { lat: 14.8275, lng: 120.8931 } },
      { name: "Tabang",                coordinates: { lat: 14.8322, lng: 120.8406 } },
      { name: "Sta. Rita",             coordinates: { lat: 14.8472, lng: 120.8492 } },
      { name: "Pulilan",               coordinates: { lat: 14.8967, lng: 120.8358 } },
      { name: "San Simon",             coordinates: { lat: 14.9961, lng: 120.7817 } },
      { name: "San Fernando",          coordinates: { lat: 15.0483, lng: 120.7061 } },
      { name: "Mexico",                coordinates: { lat: 15.0881, lng: 120.6767 } },
      { name: "Angeles",               coordinates: { lat: 15.1583, lng: 120.6128 } },
      { name: "Dau",                   coordinates: { lat: 15.1844, lng: 120.59   } },
    ],
  },

  SCTEX: {
    fullName: "Subic-Clark-Tarlac Expressway",
    region: "Central Luzon",
    plazas: 12,
    kilometers: 93.77,
    speedLimit: { minKph: 60, maxKph: 100 },
    operator: "NLEX Corporation",
    hotline: "(02) 8580-8888",
    rfidSystem: "EasyTrip",
    facebook: "https://www.facebook.com/NLEXexpressway",
    twitter: "https://twitter.com/NLEXexpressway",
    plazaList: [
      { name: "Tipo/Subic",            coordinates: { lat: 14.8361, lng: 120.32   } },
      { name: "Dinalupihan",           coordinates: { lat: 14.8875, lng: 120.4578 } },
      { name: "Floridablanca",         coordinates: { lat: 14.9789, lng: 120.505  } },
      { name: "Porac",                 coordinates: { lat: 15.0681, lng: 120.5472 } },
      { name: "Clark South",           coordinates: { lat: 15.1575, lng: 120.5489 } },
      { name: "Mabalacat (Mabiga)",    coordinates: { lat: 15.2017, lng: 120.575  } },
      { name: "Clark North",           coordinates: { lat: 15.2153, lng: 120.5606 } },
      { name: "Dolores",               coordinates: { lat: 15.2344, lng: 120.5622 } },
      { name: "Bamban/New Clark City", coordinates: { lat: 15.305,  lng: 120.5469 } },
      { name: "Concepcion",            coordinates: { lat: 15.3528, lng: 120.5703 } },
      { name: "Hacienda Luisita",      coordinates: { lat: 15.4389, lng: 120.6019 } },
      { name: "Tarlac",                coordinates: { lat: 15.46,   lng: 120.6106 } },
    ],
  },

  TPLEX: {
    fullName: "Tarlac-Pangasinan-La Union Expressway",
    region: "Northern Luzon",
    plazas: 11,
    kilometers: 89.21,
    speedLimit: { minKph: 60, maxKph: 100 },
    operator: "NLEX Corporation",
    hotline: "(02) 8580-8888",
    rfidSystem: "EasyTrip",
    facebook: "https://www.facebook.com/NLEXexpressway",
    twitter: "https://twitter.com/NLEXexpressway",
    plazaList: [
      { name: "La Paz",          coordinates: { lat: 15.5317, lng: 120.6275 } },
      { name: "Victoria",        coordinates: { lat: 15.5892, lng: 120.6381 } },
      { name: "Gerona",          coordinates: { lat: 15.6178, lng: 120.6167 } },
      { name: "Paniqui",         coordinates: { lat: 15.6806, lng: 120.5897 } },
      { name: "Moncada",         coordinates: { lat: 15.7481, lng: 120.5694 } },
      { name: "Carmen",          coordinates: { lat: 15.8925, lng: 120.5892 } },
      { name: "Urdaneta",        coordinates: { lat: 15.9867, lng: 120.5728 } },
      { name: "Binalonan",       coordinates: { lat: 16.0547, lng: 120.5969 } },
      { name: "Pozorrubbio",     coordinates: { lat: 16.1044, lng: 120.5408 } },
      { name: "Sison",           coordinates: { lat: 16.1681, lng: 120.5033 } },
      { name: "Rosario/Baguio",  coordinates: { lat: 16.2239, lng: 120.4858 } },
    ],
  },

  SLEX: {
    fullName: "South Luzon Expressway",
    region: "South Luzon",
    plazas: 15,
    kilometers: 49.56,
    speedLimit: { minKph: 60, maxKph: 100 },
    operator: "San Miguel Corporation",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/SLEXofficial",
    twitter: "https://twitter.com/SLEXofficial",
    plazaList: [
      { name: "Magallanes",       coordinates: { lat: 14.5367, lng: 121.0189 } },
      { name: "Bicutan",          coordinates: { lat: 14.4886, lng: 121.0458 } },
      { name: "Sucat",            coordinates: { lat: 14.4533, lng: 121.0478 } },
      { name: "Alabang",          coordinates: { lat: 14.4144, lng: 121.0436 } },
      { name: "Filinvest",        coordinates: { lat: 14.4108, lng: 121.0425 } },
      { name: "Susana Heights",   coordinates: { lat: 14.3828, lng: 121.0442 } },
      { name: "San Pedro",        coordinates: { lat: 14.3533, lng: 121.0547 } },
      { name: "Southwoods",       coordinates: { lat: 14.3283, lng: 121.0561 } },
      { name: "Carmona",          coordinates: { lat: 14.3103, lng: 121.06   } },
      { name: "Mamplasan",        coordinates: { lat: 14.2889, lng: 121.0825 } },
      { name: "Sta. Rosa",        coordinates: { lat: 14.2642, lng: 121.0967 } },
      { name: "ABI/Greenfield",   coordinates: { lat: 14.2492, lng: 121.1089 } },
      { name: "Cabuyao",          coordinates: { lat: 14.2361, lng: 121.1217 } },
      { name: "Silangan",         coordinates: { lat: 14.2081, lng: 121.1342 } },
      { name: "Calamba",          coordinates: { lat: 14.1953, lng: 121.1444 } },
    ],
  },

  Skyway: {
    fullName: "Metro Manila Skyway",
    region: "Metro Manila",
    plazas: 5,
    kilometers: 38.6,
    speedLimit: { minKph: 60, maxKph: 80 },
    operator: "Skyway O&M Corporation",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/SkywayOMC",
    twitter: "https://twitter.com/SkywayOMC",
    plazaList: [
      { name: "Buendia",              coordinates: { lat: 14.5558, lng: 121.0064 } },
      { name: "Amorsolo",             coordinates: { lat: 14.5517, lng: 121.0125 } },
      { name: "C-5",                  coordinates: { lat: 14.5167, lng: 121.0319 } },
      { name: "Magallanes (Skyway)",  coordinates: { lat: 14.5386, lng: 121.0183 } },
      { name: "NAIAX",                coordinates: { lat: 14.5244, lng: 121.0139 } },
    ],
  },

  Skyway_Stage_3: {
    fullName: "Metro Manila Skyway Stage 3",
    region: "Metro Manila",
    plazas: 8,
    kilometers: 18.83,
    speedLimit: { minKph: 40, maxKph: 60 },
    operator: "Skyway O&M Corporation",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/SkywayOMC",
    twitter: "https://twitter.com/SkywayOMC",
    plazaList: [
      { name: "Buendia",      coordinates: { lat: 14.5558, lng: 121.0064 } },
      { name: "Quirino",      coordinates: { lat: 14.5772, lng: 121.0028 } },
      { name: "Plaza Dilao",  coordinates: { lat: 14.5847, lng: 120.9981 } },
      { name: "Nagtahan",     coordinates: { lat: 14.6019, lng: 121.0025 } },
      { name: "E. Rodriguez", coordinates: { lat: 14.6225, lng: 121.0161 } },
      { name: "Quezon Ave.",  coordinates: { lat: 14.6406, lng: 121.0117 } },
      { name: "Balintawak",   coordinates: { lat: 14.6547, lng: 121.0006 } },
      { name: "NLEX",         coordinates: { lat: 14.6568, lng: 121.0022 } },
    ],
  },

  CALAX: {
    fullName: "Cavite-Laguna Expressway",
    region: "South Luzon",
    plazas: 6,
    kilometers: 44.6,
    speedLimit: { minKph: 60, maxKph: 80 },
    operator: "San Miguel Corporation",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/CALAXofficial",
    twitter: "https://twitter.com/CALAXofficial",
    plazaList: [
      { name: "Greenfield",           coordinates: { lat: 14.2481, lng: 121.1075 } },
      { name: "Technopark",           coordinates: { lat: 14.2614, lng: 121.0667 } },
      { name: "Laguna Blvd.",         coordinates: { lat: 14.2522, lng: 121.0494 } },
      { name: "Sta. Rosa/Tagaytay",   coordinates: { lat: 14.2386, lng: 121.0333 } },
      { name: "Silang East",          coordinates: { lat: 14.2239, lng: 120.995  } },
      { name: "Silang Interchange",   coordinates: { lat: 14.2125, lng: 120.9667 } },
    ],
  },

  CAVITEX: {
    fullName: "Manila-Cavite Expressway",
    region: "South Metro Manila",
    plazas: 5,
    kilometers: 14,
    speedLimit: { minKph: 60, maxKph: 80 },
    operator: "Cavitex Infrastructure Corporation",
    hotline: "(046) 472-0000",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/CAVITEXofficial",
    twitter: "https://twitter.com/CAVITEXofficial",
    plazaList: [
      { name: "Parañaque",                    coordinates: { lat: 14.4882, lng: 120.9823 } },
      { name: "Bacoor/Zapote",                coordinates: { lat: 14.4608, lng: 120.9575 } },
      { name: "Kawit",                        coordinates: { lat: 14.4414, lng: 120.9103 } },
      { name: "Sucat Rd./Dr. A. Santos Ave.", coordinates: { lat: 14.4817, lng: 120.9892 } },
      { name: "C5 Rd. Ext./C.P. Garcia",      coordinates: { lat: 14.4828, lng: 120.9867 } },
    ],
  },

  MCX: {
    fullName: "Muntinlupa-Cavite Expressway",
    region: "South Metro Manila",
    plazas: 2,
    kilometers: 4,
    speedLimit: { minKph: 60, maxKph: 80 },
    operator: "MCX Tollways Inc.",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/MCXtollway",
    twitter: "https://twitter.com/MCXtollway",
    plazaList: [
      { name: "SLEX (Susana Heights)", coordinates: { lat: 14.3828, lng: 121.0442 } },
      { name: "Daang Hari",            coordinates: { lat: 14.3831, lng: 121.0139 } },
    ],
  },

  STAR_Tollway: {
    fullName: "Southern Tagalog Arterial Road",
    region: "South Luzon",
    plazas: 8,
    kilometers: 41.9,
    speedLimit: { minKph: 60, maxKph: 80 },
    operator: "Star Infrastructure Dev. Corp.",
    hotline: "(043) 723-0000",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/STARtollway",
    twitter: "https://twitter.com/STARtollway",
    plazaList: [
      { name: "Calamba",      coordinates: { lat: 14.1953, lng: 121.1444 } },
      { name: "Sto. Tomas",   coordinates: { lat: 14.1089, lng: 121.1447 } },
      { name: "Tanauan",      coordinates: { lat: 14.0883, lng: 121.1294 } },
      { name: "Malvar",       coordinates: { lat: 14.0433, lng: 121.1517 } },
      { name: "Sto. Toribio", coordinates: { lat: 13.9878, lng: 121.1564 } },
      { name: "Lipa",         coordinates: { lat: 13.9578, lng: 121.1633 } },
      { name: "Ibaan",        coordinates: { lat: 13.8406, lng: 121.1206 } },
      { name: "Batangas",     coordinates: { lat: 13.7844, lng: 121.0681 } },
    ],
  },

  NAIAX: {
    fullName: "Ninoy Aquino International Airport Expressway",
    region: "Metro Manila",
    plazas: 8,
    kilometers: 12.65,
    speedLimit: { minKph: 40, maxKph: 60 },
    operator: "Skyway O&M Corporation",
    hotline: "(02) 8888-7777",
    rfidSystem: "Autosweep",
    facebook: "https://www.facebook.com/SkywayOMC",
    twitter: "https://twitter.com/SkywayOMC",
    plazaList: [
      { name: "Skyway",                    coordinates: { lat: 14.5244, lng: 121.0139 } },
      { name: "Andrews Ave./Terminal 3",   coordinates: { lat: 14.5231, lng: 121.0167 } },
      { name: "Aurora Blvd. (Tramo)",      coordinates: { lat: 14.5283, lng: 121.0039 } },
      { name: "NAIA Terminal 1",           coordinates: { lat: 14.5094, lng: 121.0028 } },
      { name: "NAIA Terminal 2",           coordinates: { lat: 14.5092, lng: 121.0078 } },
      { name: "Entertainment City",        coordinates: { lat: 14.5186, lng: 120.9889 } },
      { name: "Macapagal Blvd.",           coordinates: { lat: 14.5206, lng: 120.9872 } },
      { name: "CAVITEX",                   coordinates: { lat: 14.5122, lng: 120.9861 } },
    ],
  },

  NLEX_Connector: {
    fullName: "NLEX Connector Road",
    region: "Metro Manila",
    plazas: 3,
    kilometers: 7.7,
    speedLimit: { minKph: 40, maxKph: 60 },
    operator: "NLEX Corporation",
    hotline: "(02) 8580-8888",
    rfidSystem: "EasyTrip",
    facebook: "https://www.facebook.com/NLEXexpressway",
    twitter: "https://twitter.com/NLEXexpressway",
    plazaList: [
      { name: "España",           coordinates: { lat: 14.6147, lng: 120.9939 } },
      { name: "Magsaysay",        coordinates: { lat: 14.6025, lng: 121.0022 } },
      { name: "C-3 Road/5th Ave.", coordinates: { lat: 14.6431, lng: 120.9814 } },
    ],
  },

  Harbor_Link: {
    fullName: "NLEX Harbor Link",
    region: "Metro Manila",
    plazas: 5,
    kilometers: 5.65,
    speedLimit: { minKph: 40, maxKph: 60 },
    operator: "NLEX Corporation",
    hotline: "(02) 8580-8888",
    rfidSystem: "EasyTrip",
    facebook: "https://www.facebook.com/NLEXexpressway",
    twitter: "https://twitter.com/NLEXexpressway",
    plazaList: [
      { name: "Karuhatan/Valenzuela",   coordinates: { lat: 14.6833, lng: 120.9781 } },
      { name: "C-3 Road/5th Ave.",      coordinates: { lat: 14.6431, lng: 120.9814 } },
      { name: "Malabon/Dagat-Dagatan",  coordinates: { lat: 14.6533, lng: 120.9639 } },
      { name: "R-10/Port of Manila",    coordinates: { lat: 14.6347, lng: 120.9572 } },
      { name: "Harbor Link Interchange",coordinates: { lat: 14.6586, lng: 120.9744 } },
    ],
  },
};

// ─── Plaza Utilities ──────────────────────────────────────────────────────────

type Coord = { lat: number; lng: number };

export function getPlazaCoords(name: string): Coord | null {
  for (const ew of Object.values(tollPlazas)) {
    const found = ew.plazaList.find((p) => p.name === name);
    if (found) return found.coordinates;
  }
  return null;
}

function toOsrmCoord(c: Coord) {
  return `${c.lng},${c.lat}`;
}

// ─── OSRM Route Utilities ─────────────────────────────────────────────────────

export async function getDrivingRouteBetweenPlazas(
  fromPlaza: string,
  toPlaza: string,
) {
  const from = getPlazaCoords(fromPlaza);
  const to = getPlazaCoords(toPlaza);
  if (!from || !to) throw new Error("Plaza not found");

  const url = `https://router.project-osrm.org/route/v1/driving/${toOsrmCoord(from)};${toOsrmCoord(to)}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch route");

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route found");

  const distanceKm = route.distance / 1000;
  const durationMin = route.duration / 60;
  const avgSpeedKph = distanceKm / (durationMin / 60);

  return { from: fromPlaza, to: toPlaza, distanceKm, durationMin, avgSpeedKph };
}

export async function getDrivingRouteGeometry(
  fromPlaza: string,
  toPlaza: string,
): Promise<[number, number][]> {
  const from = getPlazaCoords(fromPlaza);
  const to = getPlazaCoords(toPlaza);
  if (!from || !to) return [];

  const url = `https://router.project-osrm.org/route/v1/driving/${toOsrmCoord(from)};${toOsrmCoord(to)}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
  return (data.routes?.[0]?.geometry?.coordinates ?? []).map(
    ([lng, lat]: [number, number]) => [lat, lng],
  );
}