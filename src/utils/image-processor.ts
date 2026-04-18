/**
 * Mengompres dan meresize gambar sebelum diunggah
 * Target: Width 2.26" dan Height 2.95"
 * 
 * UPDATE: Logika diubah agar gambar ditarik (stretch) mengikuti 
 * dimensi bingkai tabel secara penuh tanpa pemotongan (crop) 
 * atau ruang kosong (letterboxing).
 */
export const compressImage = (
  base64: string, 
  targetWidthInches = 2.26, 
  targetHeightInches = 2.95, 
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Konversi Inci ke Piksel (96 DPI)
      const width = Math.round(targetWidthInches * 96);
      const height = Math.round(targetHeightInches * 96);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Gambar ditarik (stretch) untuk mengisi seluruh area canvas
      // Ini memastikan tidak ada bagian yang terpotong dan tidak ada area putih
      ctx.drawImage(img, 0, 0, width, height);

      // Ekspor sebagai JPG
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      resolve(base64);
    };
  });
};