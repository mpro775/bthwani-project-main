/**
 * رفع صور كنز إلى Bunny CDN.
 * يُستخدم من KenzCreateScreen / KenzEditScreen بعد اختيار الصور عبر expo-image-picker.
 */

const BUNNY_STORAGE_ZONE =
  (process.env as any).EXPO_PUBLIC_BUNNY_STORAGE_ZONE ?? "bthwani-storage";
const BUNNY_ACCESS_KEY =
  (process.env as any).EXPO_PUBLIC_BUNNY_ACCESS_KEY ??
  "2ea49c52-481c-48f9-a7ce4d882e42-0cf4-4dca";
const BUNNY_CDN_BASE =
  (process.env as any).EXPO_PUBLIC_BUNNY_CDN_BASE ?? "https://cdn.bthwani.com";

function getMimeFromUri(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function getFileName(uri: string): string {
  const base = uri.split("/").pop() ?? "image.jpg";
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}-${safe}`;
}

/**
 * رفع صورة واحدة من URI محلي (expo-image-picker) إلى Bunny وتُرجع رابط CDN.
 * @param folder مجلد التخزين: 'kenz' أو 'arabon'
 */
async function uploadImageToBunnyFolder(
  localUri: string,
  folder: "kenz" | "arabon",
  mime?: string
): Promise<string> {
  const resolvedMime = mime ?? getMimeFromUri(localUri);
  const fileName = getFileName(localUri);
  const storagePath = `${folder}/${fileName}`;
  const uploadUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${storagePath}`;

  const fileResp = await fetch(localUri);
  const arrayBuffer = await fileResp.arrayBuffer();
  const contentLength = arrayBuffer.byteLength;

  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY_ACCESS_KEY,
      "Content-Type": resolvedMime,
      "Content-Length": String(contentLength),
    },
    body: arrayBuffer,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "<no body>");
    throw new Error(`فشل رفع الصورة (${resp.status}): ${txt}`);
  }

  return `${BUNNY_CDN_BASE}/${storagePath}`;
}

export async function uploadKenzImageToBunny(
  localUri: string,
  mime?: string
): Promise<string> {
  return uploadImageToBunnyFolder(localUri, "kenz", mime);
}

/**
 * رفع صورة عربون إلى Bunny CDN.
 * يُستخدم من ArabonCreateScreen / ArabonEditScreen بعد اختيار الصور عبر expo-image-picker.
 */
export async function uploadArabonImageToBunny(
  localUri: string,
  mime?: string
): Promise<string> {
  return uploadImageToBunnyFolder(localUri, "arabon", mime);
}
