import { execSync } from 'child_process';
import fs from 'fs';

// قياس الأداء باستخدام lighthouse إذا كان متوفراً
async function measurePerformance(url, name) {
  try {
    console.log(`قياس أداء ${name}: ${url}`);

    // قياس بسيط باستخدام fetch لقياس وقت الاستجابة
    const startTime = Date.now();
    try {
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;

      console.log(`${name} - وقت الاستجابة: ${responseTime}ms`);
      console.log(`${name} - حالة الاستجابة: ${response.status}`);

      return {
        name,
        url,
        responseTime,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (fetchError) {
      console.log(`${name} - خطأ في الاتصال: ${fetchError.message}`);
      return {
        name,
        url,
        error: fetchError.message,
        timestamp: new Date().toISOString()
      };
    }

  } catch (error) {
    console.error(`خطأ في قياس ${name}:`, error.message);
    return {
      name,
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// قياس الشاشات الأساسية
async function measureAllScreens() {
  const baseUrl = 'http://localhost:5173';
  const screens = [
    { path: '/admin', name: 'Home/Dashboard' },
    { path: '/admin/overview', name: 'Overview' },
    { path: '/admin/orders', name: 'Orders List' },
    { path: '/admin/orders/details/1', name: 'Order Details' }
  ];

  console.log('بدء قياس الأداء...\n');

  const results = [];

  for (const screen of screens) {
    const url = `${baseUrl}${screen.path}`;
    const result = await measurePerformance(url, screen.name);
    results.push(result);

    // انتظار ثانيتين بين كل قياس
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // حفظ النتائج
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalScreens: results.length,
      successfulMeasurements: results.filter(r => !r.error).length,
      averageResponseTime: results.filter(r => r.responseTime).reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length || 0
    }
  };

  fs.writeFileSync('performance-results.json', JSON.stringify(report, null, 2));
  console.log('\nتم حفظ النتائج في performance-results.json');

  // تحليل النتائج
  console.log('\n=== تحليل النتائج ===');
  console.log(`إجمالي الشاشات: ${report.summary.totalScreens}`);
  console.log(`قياسات ناجحة: ${report.summary.successfulMeasurements}`);
  if (report.summary.averageResponseTime > 0) {
    console.log(`متوسط وقت الاستجابة: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`الهدف: ≤ 3000ms`);
    console.log(`الحالة: ${report.summary.averageResponseTime <= 3000 ? '✅ نجح' : '❌ فشل'}`);
  }

  return report;
}

// تشغيل القياس
measureAllScreens().catch(console.error);
