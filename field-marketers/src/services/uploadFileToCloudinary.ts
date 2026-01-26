// src/services/uploadFileToBunny.ts
import { auth } from "../config/firebaseConfig";

export async function uploadFileToBunny(file: File): Promise<string> {
  // 1) تأكد من أن المستخدم مسجل دخول
  const user = auth.currentUser;
  if (!user) throw new Error("🚫 لا يوجد توكن مصادقة");
  await user.getIdToken(true); // (اختياري، حسب الباك-إند)

  // 2) حدد اسم الملف (يفضل unique)
  const fileName = `${Date.now()}-${file.name}`;

  // 3) جهّز FormData
  const form = new FormData();
  form.append("file", file);

  // 4) ارفع إلى Bunny Storage Zone
  // ⚠️ استبدل ZONENAME و AccessKey حسب إعدادك
  const storageZone = "bthwani-storage";
  const accessKey = "2ea49c52-481c-48f9-a7ce4d882e42-0cf4-4dca";
  const url = `https://storage.bunnycdn.com/${storageZone}/stores/${fileName}`;

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
    },
    body: file,
  });

  if (!resp.ok) {
    throw new Error(`فشل رفع الملف إلى Bunny: ${resp.status}`);
  }

  // 5) الرابط العام (من الـ Pull Zone)
  const cdnUrl = `https://cdn.bthwani.com/stores/${fileName}`;
  return cdnUrl;
}
