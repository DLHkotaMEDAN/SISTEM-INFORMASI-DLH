"use client";

import { FuelType } from "./fuelReport";

export interface FuelSpjLocation {
  street: string;
  subDistrict?: string;
  village?: string;
  fuel_type: FuelType;
  amount_rp: number;
  amount_liter: number;
  remarks?: string;
}

export interface FuelSpjEntry {
  spj_no: string;
  vehicle_operator: string;
  receiver_name: string;
  locations: FuelSpjLocation[];
}

export interface FuelSpjReport {
  id: string;
  date: string;
  region: string;
  team: string; // Field baru
  entries: FuelSpjEntry[];
  remarks: string;
  price_pertamax: number;
  price_dexlite: number;
  created_at?: string;
  deleted_at?: string | null;
}

export interface FuelPrice {
  id: string;
  type: 'Pertamax' | 'Dexlite';
  price: number;
  updated_at: string;
}