/**
 * سكربت حذف فهرس firebase_uid من مجموعة users
 *
 * يحل خطأ: E11000 duplicate key error collection: bthwani.users index: firebase_uid_unique dup key: { firebaseUid: null }
 *
 * الاستخدام (من مجلد backend-nest):
 *   npm run script:drop-firebase-uid-index
 * أو مع تحديد الاتصال:
 *   MONGODB_URI=mongodb://localhost:27017/bthwani npm run script:drop-firebase-uid-index
 */

import { connect, connection } from 'mongoose';

// MONGODB_URI من البيئة أو القيمة الافتراضية

const MONGODB_URI ='mongodb+srv://smartagencyyem_db_user:IazzxQxHifWrtv1p@cluster0.sma4e8a.mongodb.net/bthwani?appName=Cluster0';

const INDEX_NAMES = [
  'firebase_uid_unique',
  'firebaseUid_1',
  'firebaseUid_1_sparse',
];

async function dropFirebaseUidIndex() {
  try {
    console.log('🔗 الاتصال بـ MongoDB...');
    await connect(MONGODB_URI);
    console.log('✅ تم الاتصال\n');

    const usersCollection = connection.collection('users');

    for (const indexName of INDEX_NAMES) {
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`✅ تم حذف الفهرس: ${indexName}`);
      } catch (err: unknown) {
        const error = err as { code?: number; message?: string };
        if (error.code === 27 || error.message?.includes('index not found')) {
          console.log(`ℹ️  الفهرس ${indexName} غير موجود (تم حذفه مسبقاً أو لم يُنشأ)`);
        } else {
          console.warn(`⚠️  تعذر حذف ${indexName}:`, error.message);
        }
      }
    }

    console.log('\n✅ انتهى التنفيذ بنجاح');
  } catch (error) {
    console.error('❌ فشل التنفيذ:', error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log('🔌 تم قطع الاتصال');
    process.exit(0);
  }
}

dropFirebaseUidIndex();
