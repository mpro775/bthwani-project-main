#!/usr/bin/env node

/**
 * سكريبت لإنشاء أيقونات بأحجام مختلفة للتطبيق
 * يستخدم مكتبة sharp لمعالجة الصور
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  const outputDir = path.join(__dirname, '../public/icons');

  // قائمة بالأحجام المطلوبة
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'maskable-192.png', size: 192 },
    { name: 'maskable-512.png', size: 512 }
  ];

  console.log('🔄 جاري إنشاء أيقونات مؤقتة...');
  console.log('📝 سيتم إنشاء أيقونات بسيطة باللون الأزرق');
  console.log('💡 لاستخدام الأيقونة المطلوبة، قم بما يلي:');
  console.log('   1. احفظ الأيقونة المطلوبة كـ PNG بأي حجم');
  console.log('   2. استخدم خدمة عبر الإنترنت لتغيير الحجم');
  console.log('   3. أو استخدم Photoshop أو أدوات أخرى لإنشاء الأحجام المطلوبة');

  try {
    // إنشاء أيقونات بسيطة مؤقتاً باللون الأزرق مع شعار بسيط
    for (const { name, size } of sizes) {
      const outputPath = path.join(outputDir, name);

      // إنشاء صورة بسيطة باللون الأزرق مع دائرة بيضاء وحرف "B"
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#0ea5e9"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
          <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size/4}"
                font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="#0ea5e9">ب</text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ تم إنشاء: ${name} (${size}x${size}px)`);
    }

    console.log('\n🎉 تم إنشاء أيقونات مؤقتة بنجاح!');
    console.log('📁 الموقع: public/icons/');
    console.log('\n🔄 لاستخدام الأيقونة المطلوبة:');
    console.log('1. احفظ الأيقونة المطلوبة كملف PNG');
    console.log('2. استخدم خدمة مثل https://favicon.io/ لإنشاء جميع الأحجام');
    console.log('3. أو استخدم أدوات مثل ImageMagick أو Photoshop');
    console.log('4. استبدل الملفات في مجلد public/icons/');

  } catch (error) {
    console.error('❌ خطأ في إنشاء الأيقونات:', error.message);
  }
}

// تشغيل السكريبت
generateIcons();
