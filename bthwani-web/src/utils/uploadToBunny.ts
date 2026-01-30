/**
 * رفع صور العربون إلى Bunny CDN.
 * يُستخدم من ArabonForm عند إضافة صور للمنشآت/الشاليهات/الصالات.
 */

const BUNNY_STORAGE_ZONE =
  (import.meta.env.VITE_BUNNY_STORAGE_ZONE as string) ?? "bthwani-storage";
const BUNNY_ACCESS_KEY =
  (import.meta.env.VITE_BUNNY_ACCESS_KEY as string) ??
  "2ea49c52-481c-48f9-a7ce4d882e42-0cf4-4dca";
const BUNNY_CDN_BASE =
  (import.meta.env.VITE_BUNNY_CDN_BASE as string) ?? "https://cdn.bthwani.com";

function getFileName(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `arabon/${Date.now()}-${base}.${ext}`;
}

/**
 * رفع صورة عربون من File (input type=file) إلى Bunny وتُرجع رابط CDN.
 */
export async function uploadArabonImageToBunny(file: File): Promise<string> {
  const storagePath = getFileName(file);
  const uploadUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${storagePath}`;

  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY_ACCESS_KEY,
      "Content-Type": file.type || "image/jpeg",
    },
    body: file,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "<no body>");
    throw new Error(`فشل رفع الصورة (${resp.status}): ${txt}`);
  }

  return `${BUNNY_CDN_BASE}/${storagePath}`;
}
