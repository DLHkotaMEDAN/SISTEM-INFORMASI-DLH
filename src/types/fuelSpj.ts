"use client";

export type FuelSpjTeam = "Tim Pohon" | "Tim Siram" | "Tim Babat";
export type FuelSpjRegion = "Wilayah 1 Utara" | "Wilayah 2 Barat" | "Wilayah 3 Timur" | "Wilayah 4" | "Wilayah 5 Selatan";

export interface FuelSpj {
  id: string;
  date: string;
  spj_number: string;
  vehicle: string;
  usage_pertamax: number;
  usage_dexlite: number;
  usage_solar: number;
  usage_oil: number;
  location_street: string;
  location_village: string;
  location_district: string;
  team: FuelSpjTeam;
  region: FuelSpjRegion;
  remarks: string;
  created_at: string;
  deleted_at?: string | null;
}