export const getUnitByCategory = (category: string): string => {
  switch (category) {
    case "Tim Babat":
      return "M2";
    case "Tim Siram":
      return "Rit";
    case "Tim Pohon":
      return "Pohon";
    default:
      return "Lokasi";
  }
};