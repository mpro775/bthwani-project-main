// src/services/uploadFileToBunny.ts

export async function uploadFileToBunny(localUri: string, mime = "image/jpeg") {
  const storageZone = "bthwani-storage";
  const accessKey = "2ea49c52-481c-48f9-a7ce4d882e42-0cf4-4dca"; // DEV only
  const fileName = `${Date.now()}-${localUri.split("/").pop()}`;
  const uploadUrl = `https://storage.bunnycdn.com/${storageZone}/stores/${fileName}`;

  const fileResp = await fetch(localUri);
  const arrayBuffer = await fileResp.arrayBuffer();
  const contentLength = arrayBuffer.byteLength;

  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
      "Content-Type": mime,
      "Content-Length": String(contentLength),
    },
    body: arrayBuffer,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "<no body>");
    throw new Error(`فشل الرفع (status ${resp.status}): ${txt}`);
  }

  return `https://cdn.bthwani.com/stores/${fileName}`;
}
