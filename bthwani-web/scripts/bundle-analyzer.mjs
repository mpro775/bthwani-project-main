import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// تحليل حجم الـ bundle بعد البناء
async function analyzeBundle() {
  console.log('🔍 تحليل حجم الـ bundle...\n');

  try {
    // بناء المشروع أولاً
    console.log('🏗️ بناء المشروع...');
    execSync('npm run build', { stdio: 'inherit' });

    // قراءة ملف الإحصائيات إذا كان موجوداً
    const distPath = 'dist';
    if (!fs.existsSync(distPath)) {
      console.log('❌ مجلد dist غير موجود');
      return;
    }

    // تحليل الملفات في مجلد dist
    const files = fs.readdirSync(distPath, { recursive: true });
    const fileSizes = {};

    function analyzeDirectory(dir, relativePath = '') {
      const fullPath = path.join(distPath, relativePath);

      if (!fs.existsSync(fullPath)) return;

      const items = fs.readdirSync(fullPath);

      items.forEach(item => {
        const itemPath = path.join(fullPath, item);
        const relativeItemPath = path.join(relativePath, item);

        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          analyzeDirectory(dir, relativeItemPath);
        } else if (stats.isFile()) {
          fileSizes[relativeItemPath] = {
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          };
        }
      });
    }

    analyzeDirectory(distPath);

    // ترتيب الملفات حسب الحجم
    const sortedFiles = Object.entries(fileSizes)
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 20); // أكبر 20 ملف

    console.log('\n📊 أكبر 20 ملف في الـ bundle:');
    console.log('═'.repeat(80));
    console.log('الملف'.padEnd(50) + 'الحجم (KB)'.padEnd(15) + 'الحجم (MB)'.padEnd(15));
    console.log('═'.repeat(80));

    sortedFiles.forEach(([file, info]) => {
      const sizeKB = parseFloat(info.sizeKB);
      const sizeMB = parseFloat(info.sizeMB);

      // تحديد الألوان حسب الحجم
      let color = '\x1b[0m'; // أبيض
      if (sizeMB > 1) color = '\x1b[31m'; // أحمر للملفات الكبيرة جداً
      else if (sizeKB > 500) color = '\x1b[33m'; // أصفر للملفات الكبيرة
      else if (sizeKB > 100) color = '\x1b[36m'; // سماوي للملفات المتوسطة

      console.log(
        `${color}${file.padEnd(50)}${info.sizeKB.padStart(10)}\x1b[0m${sizeMB.padStart(10)}\x1b[0m`
      );
    });

    // إحصائيات عامة
    const totalSize = Object.values(fileSizes).reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log('═'.repeat(80));
    console.log(`إجمالي حجم الـ bundle: ${totalSizeMB} MB`);

    // تحليل حسب النوع
    const byType = {};
    Object.entries(fileSizes).forEach(([file, info]) => {
      const ext = path.extname(file).toLowerCase() || 'other';
      if (!byType[ext]) byType[ext] = { count: 0, size: 0 };
      byType[ext].count++;
      byType[ext].size += info.size;
    });

    console.log('\n📈 تحليل حسب النوع:');
    console.log('═'.repeat(50));
    Object.entries(byType)
      .sort(([, a], [, b]) => b.size - a.size)
      .forEach(([type, stats]) => {
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        const percentage = ((stats.size / totalSize) * 100).toFixed(1);
        console.log(`${type.padEnd(10)}: ${stats.count} ملفات, ${sizeMB} MB (${percentage}%)`);
      });

    // اقتراحات للتحسين
    console.log('\n💡 اقتراحات لتحسين حجم الـ bundle:');
    console.log('═'.repeat(60));

    if (byType['.js']?.size > 1024 * 1024) {
      console.log('• ملفات JavaScript كبيرة جداً - فكر في تقسيم المزيد من الكود');
    }
    if (byType['.css']?.size > 500 * 1024) {
      console.log('• ملفات CSS كبيرة - استخدم CSS purging أو تقسيم');
    }
    if (byType['.png']?.size > 200 * 1024 || byType['.jpg']?.size > 200 * 1024) {
      console.log('• صور كبيرة - استخدم WebP أو ضغط أفضل');
    }
    if (byType['.woff']?.size > 100 * 1024 || byType['.woff2']?.size > 100 * 1024) {
      console.log('• خطوط كبيرة - استخدم متغيرات الخطوط أو subsetting');
    }

    console.log('• استخدم dynamic imports للكود غير الضروري في البداية');
    console.log('• فعّل gzip/brotli للضغط على الخادم');
    console.log('• استخدم CDN للمكتبات الخارجية');
    console.log('• راقب حجم الـ vendor bundle وقم بتحديث المكتبات بانتظام');

    // حفظ التقرير
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: totalSizeMB + ' MB',
      largestFiles: sortedFiles.slice(0, 10),
      byType,
      suggestions: [
        'استخدام dynamic imports للكود غير الضروري في البداية',
        'تفعيل gzip/brotli للضغط على الخادم',
        'استخدام CDN للمكتبات الخارجية',
        'مراقبة حجم الـ vendor bundle وتحديث المكتبات بانتظام'
      ]
    };

    fs.writeFileSync('bundle-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ تم حفظ التقرير في bundle-analysis-report.json');

  } catch (error) {
    console.error('❌ خطأ في تحليل الـ bundle:', error.message);
  }
}

// تشغيل التحليل
analyzeBundle().catch(console.error);
