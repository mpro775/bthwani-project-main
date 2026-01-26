import mongoose from "mongoose";
import { admin } from "./src/config/firebaseAdmin.js";
import { User } from "./models/user.js"; // نموذج المستخدم من مشروعك

// ⚠️ SECURITY: Never commit real credentials to version control
const MONGO_URI = process.env.MONGODB_URI || "MONGODB_URI_NOT_SET";

const email = process.env.ADMIN_EMAIL || "admin@bthwani.com";
const password = process.env.ADMIN_PASSWORD || "ADMIN_PASSWORD_NOT_SET";
const fullName = "مدير النظام";
const role = "superadmin"; // 👈 غيّره إن أردت

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // تحقق إذا كان موجود مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ المستخدم موجود بالفعل في قاعدة البيانات");
      return;
    }

    // إنشاء المستخدم في Firebase
    const fbUser = await admin.auth().createUser({ email, password });
    console.log("✅ Firebase user created:", fbUser.uid);

    // حفظ المستخدم في MongoDB
    const newUser = new User({
      fullName,
      email,
      firebaseUID: fbUser.uid,
      role,
    });

    await newUser.save();
    console.log(`✅ MongoDB user saved with role: ${role}`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

run();
