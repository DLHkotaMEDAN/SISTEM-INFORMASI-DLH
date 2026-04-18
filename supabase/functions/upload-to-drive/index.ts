import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfBase64, fileName, folderId, userAccessToken } = await req.json();

    if (!pdfBase64 || !userAccessToken) {
      throw new Error("Data PDF atau Token Akses tidak ditemukan");
    }

    console.log(`[upload-to-drive] Mengunggah ${fileName} ke folder ${folderId}`);

    // Konversi base64 ke Blob
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Persiapkan Multipart Upload untuk Google Drive API
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/pdf',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
      body: form,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Gagal mengunggah ke Google Drive");
    }

    return new Response(
      JSON.stringify({ message: "Berhasil diunggah", fileId: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[upload-to-drive] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})