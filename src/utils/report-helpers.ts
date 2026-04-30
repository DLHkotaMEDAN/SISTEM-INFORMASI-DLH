import { ReportCategory } from "@/types/report";

export const getUnitByCategory = (category: ReportCategory | string): string => {
  if (category === "Tim Pohon") return "Pohon";
  return "m2";
};

export const allCategories = [
  "Tim Pohon",
  "Tim Siram",
  "Tim Babat",
  "Taman Kota",
  "Taman Area",
  "Taman Amplas"
];

export const categoryOrder = allCategories;

export const sortByCategory = (a: string, b: string) => {
  const indexA = categoryOrder.indexOf(a);
  const indexB = categoryOrder.indexOf(b);
  
  const priorityA = indexA === -1 ? 999 : indexA;
  const priorityB = indexB === -1 ? 999 : indexB;
  
  return priorityA - priorityB;
};