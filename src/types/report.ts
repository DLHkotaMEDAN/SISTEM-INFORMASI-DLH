export interface Equipment {
  type: string;
  quantity: number;
}

export interface FuelUsage {
  pertamax: number;
  dexlite: number;
  solar: number;
  remarks: string;
}

export interface Personnel {
  coordinator: string;
  members: number;
}

export interface Location {
  street: string;
  village: string;
  subDistrict: string;
}

export interface Task {
  description: string;
  location: Location;
}

export interface Photos {
  zero: string;
  fifty: string;
  hundred: string;
}

export type ReportCategory = 
  | "Taman Kota" 
  | "Taman Amplas" 
  | "Taman Area" 
  | "Tim Babat" 
  | "Tim Siram" 
  | "Tim Pohon";

export interface Report {
  id: string;
  date: string;
  category: ReportCategory;
  description: string; // Deskripsi utama/ringkasan
  location: Location;    // Lokasi utama (untuk kompatibilitas)
  tasks?: Task[];       // Daftar kegiatan & lokasi (khusus Tim Siram)
  photos: Photos;
  volume: number;
  unit: string;
  equipment: Equipment[];
  heavyEquipment: Equipment[];
  fuel: FuelUsage;
  personnel: Personnel;
  remarks: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending';
}