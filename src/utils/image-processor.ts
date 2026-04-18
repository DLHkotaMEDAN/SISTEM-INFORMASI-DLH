/**
 * Mengompres dan meresize gambar sebelum diunggah
 * Melakukan 'Center Crop' agar gambar mengisi bingkai (object-fit: cover)
 * Target: Width 2.26" dan Height 2.95" dengan resolusi 150 PPI
 */
export const compressImage = (
  base64: string, 
  targetWidthInches = 2.26, 
  targetHeightInches = 2.95, 
  quality = 0.9
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Konversi Inci ke Piksel (150 DPI/PPI)
      const PPI = 150;
      const targetWidth = Math.round(targetWidthInches * PPI);
      const targetHeight = Math.round(targetHeightInches * PPI);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Hitung rasio untuk Center Crop (Object-fit: cover)
      const imgWidth = img.width;
      const imgHeight = img.height;
      const targetRatio = targetWidth / targetHeight;
      const imgRatio = imgWidth / imgHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = imgWidth;
      let sourceHeight = imgHeight;

      if (imgRatio > targetRatio) {
        // Gambar terlalu lebar (landscape), potong sisi kiri & kanan
        sourceWidth = imgHeight * targetRatio;
        sourceX = (imgWidth - sourceWidth) / 2;
      } else {
        // Gambar terlalu tinggi (portrait), potong sisi atas & bawah
        sourceHeight = imgWidth / targetRatio;
        sourceY = (imgHeight - sourceHeight) / 2;
      }

      // Gambar ke canvas dengan pemotongan dari tengah
      ctx.drawImage(
        img, 
        sourceX, sourceY, sourceWidth, sourceHeight, // Area sumber (crop)
        0, 0, targetWidth, targetHeight              // Area tujuan (canvas)
      );

      // Ekspor sebagai JPG dengan kualitas tinggi
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      resolve(base64);
    };
  });
};