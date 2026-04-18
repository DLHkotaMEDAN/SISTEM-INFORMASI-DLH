/**
 * Mengompres dan meresize gambar sebelum diunggah
 * Target: Width 2.26" dan Height 2.95"
 * Konversi ke Piksel (asumsi 96 DPI): 217px x 283px
 * 
 * UPDATE: Logika cropping diubah dari 'center' ke 'bottom-right' 
 * agar timestamp di pojok kanan bawah tidak terpotong.
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
      
      // Konversi Inci ke Piksel (96 DPI adalah standar web)
      const width = Math.round(targetWidthInches * 96);
      const height = Math.round(targetHeightInches * 96);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Menggunakan logika 'cover' tapi disejajarkan ke kanan bawah (bottom-right)
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > targetRatio) {
        // Gambar lebih lebar dari target: Tinggi disesuaikan, lebar dipotong
        drawHeight = height;
        drawWidth = img.width * (height / img.height);
        // Geser ke kanan agar bagian kanan tetap terlihat
        offsetX = width - drawWidth; 
        offsetY = 0;
      } else {
        // Gambar lebih tinggi dari target: Lebar disesuaikan, tinggi dipotong
        drawWidth = width;
        drawHeight = img.height * (width / img.width);
        offsetX = 0;
        // Geser ke bawah agar bagian bawah tetap terlihat
        offsetY = height - drawHeight;
      }

      // Gambar ulang ke canvas dengan dimensi baru dan perataan kanan bawah
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
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