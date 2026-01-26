#!/usr/bin/env node

/**
 * سكريبت إنشاء شارات التغطية
 * يستخدم coverage-final.json لإنشاء شارات SVG
 */

const fs = require('fs');
const path = require('path');

// قراءة ملف التغطية
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
const outputPath = path.join(__dirname, '..', 'coverage', 'badge.svg');

function generateBadge(percentage, color) {
  const width = 120;
  const height = 20;
  const padding = 6;
  const textWidth = 60;
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${textWidth}" height="${height}" fill="#555"/>
  <rect x="${textWidth}" width="${width - textWidth}" height="${height}" fill="${color}"/>
  <text x="${textWidth / 2}" y="14" text-anchor="middle" fill="white" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">coverage</text>
  <text x="${textWidth + (width - textWidth) / 2}" y="14" text-anchor="middle" fill="white" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">${percentage}%</text>
</svg>`;

  return svg;
}

function getColor(percentage) {
  if (percentage >= 80) return '#4c1';
  if (percentage >= 60) return '#97ca00';
  if (percentage >= 40) return '#dfb317';
  if (percentage >= 20) return '#fe7d37';
  return '#e05d44';
}

function main() {
  try {
    // التحقق من وجود ملف التغطية
    if (!fs.existsSync(coveragePath)) {
      console.log('❌ ملف التغطية غير موجود. قم بتشغيل الاختبارات أولاً.');
      process.exit(1);
    }

    // قراءة بيانات التغطية
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    // حساب النسبة المئوية الإجمالية
    let totalStatements = 0;
    let coveredStatements = 0;
    
    Object.values(coverageData).forEach(file => {
      if (file && file.s) {
        Object.values(file.s).forEach(statement => {
          totalStatements++;
          if (statement > 0) coveredStatements++;
        });
      }
    });
    
    const percentage = totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0;
    const color = getColor(percentage);
    
    // إنشاء الشارة
    const badge = generateBadge(percentage, color);
    
    // حفظ الشارة
    fs.writeFileSync(outputPath, badge);
    
    console.log(`✅ تم إنشاء شارة التغطية: ${percentage}%`);
    console.log(`📁 الملف المحفوظ: ${outputPath}`);
    console.log(`🎨 اللون المستخدم: ${color}`);
    
    // إنشاء ملف README للتغطية
    const readmePath = path.join(__dirname, '..', 'coverage', 'README.md');
    const readmeContent = `# 📊 تقرير التغطية

## 📈 الإحصائيات الحالية
- **التغطية الإجمالية:** ${percentage}%
- **العبارات المغطاة:** ${coveredStatements}/${totalStatements}
- **آخر تحديث:** ${new Date().toLocaleString('ar-SA')}

## 🎯 الأهداف
- **الهدف الحالي:** 30%
- **الهدف المتوسط:** 50%
- **الهدف النهائي:** 70%

## 📁 الملفات
- [تقرير HTML](./index.html)
- [تقرير LCOV](./lcov.info)
- [بيانات JSON](./coverage-final.json)
- [شارة التغطية](./badge.svg)

## 🚀 كيفية التحسين
1. إضافة اختبارات للمكونات الأساسية
2. تغطية الحالات الحدية
3. اختبار معالجة الأخطاء
4. اختبارات التكامل

---
*تم إنشاؤه تلقائياً بواسطة سكريبت التغطية*
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`📝 تم إنشاء README للتغطية: ${readmePath}`);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء شارة التغطية:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = { generateBadge, getColor };
