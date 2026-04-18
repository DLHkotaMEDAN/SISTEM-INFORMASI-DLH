/**
 * Mengompres dan meresize gambar sebelum diunggah
 * Target: Width 2.26" dan Height 2.95"
 * 
 * UPDATE: Logika diubah agar gambar tidak di-crop. 
 * Gambar akan disesuaikan ukurannya (fit) agar seluruh sisinya terlihat.
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

      // Latar belakang putih untuk area kosong (letterboxing)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;

      // Logika 'Contain': Menyesuaikan gambar agar seluruhnya masuk ke bingkai
      if (imgRatio > targetRatio) {
        // Gambar lebih lebar: Lebar mengikuti bingkai, tinggi menyesuaikan
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2; // Tengah secara vertikal
      } else {
        // Gambar lebih tinggi: Tinggi mengikuti bingkai, lebar menyesuaikan
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2; // Tengah secara horizontal
        offsetY = 0;
      }

      // Gambar seluruh foto tanpa pemotongan
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Ekspor sebagai JPG
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      resolve(base64);
    };
  });
};