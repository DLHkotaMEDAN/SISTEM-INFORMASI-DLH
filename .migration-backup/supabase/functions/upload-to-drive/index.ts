// @ts-ignore: Deno namespace is available in Supabase Edge Functions
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

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

    // 1. Unggah File
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/pdf',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
      },
      body: form,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadResult.error?.message || "Gagal mengunggah ke Google Drive");
    }

    const fileId = uploadResult.id;

    // 2. Atur Izin File menjadi "Anyone with the link"
    console.log(`[upload-to-drive] Mengatur izin publik untuk file ${fileId}`);
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'role': 'reader', 'type': 'anyone' }),
    });

    // 3. Atur Izin Folder menjadi "Anyone with the link" (jika bukan root)
    if (folderId !== 'root') {
      console.log(`[upload-to-drive] Mengatur izin publik untuk folder ${folderId}`);
      await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'role': 'reader', 'type': 'anyone' }),
      });
    }

    // 4. Ambil Link File & Link Folder
    const getFileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`, {
      headers: { 'Authorization': `Bearer ${userAccessToken}` },
    });
    const fileData = await getFileResponse.json();

    let folderLink = "";
    if (folderId !== 'root') {
      const getFolderResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=webViewLink`, {
        headers: { 'Authorization': `Bearer ${userAccessToken}` },
      });
      const folderData = await getFolderResponse.json();
      folderLink = folderData.webViewLink;
    }

    return new Response(
      JSON.stringify({ 
        message: "Berhasil diunggah", 
        fileId: fileId,
        webViewLink: fileData.webViewLink,
        folderLink: folderLink
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[upload-to-drive] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})