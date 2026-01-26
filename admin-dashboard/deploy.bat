@echo off
chcp 65001 >nul

echo 🚀 بدء عملية البناء والرفع...

REM تنظيف المجلدات السابقة
echo 🧹 تنظيف المجلدات السابقة...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

REM تثبيت التبعيات
echo 📦 تثبيت التبعيات...
call npm install

REM بناء المشروع للإنتاج
echo 🔨 بناء المشروع للإنتاج...
call npm run build

REM التحقق من نجاح البناء
if not exist dist (
    echo ❌ فشل في البناء!
    pause
    exit /b 1
)

echo ✅ تم البناء بنجاح!

REM عرض حجم الملفات
echo 📊 حجم الملفات:
dir dist

REM نسخ ملفات إضافية مهمة
echo 📋 نسخ الملفات الإضافية...
copy public\.htaccess dist\
copy public\robots.txt dist\
copy public\sitemap.xml dist\

REM إنشاء ملف معلومات البناء
echo 📝 إنشاء ملف معلومات البناء...
echo Build Date: %date% %time% > dist\build-info.txt
echo Build Version: unknown >> dist\build-info.txt
echo Node Version: >> dist\build-info.txt
node --version >> dist\build-info.txt 2>&1
echo NPM Version: >> dist\build-info.txt
npm --version >> dist\build-info.txt 2>&1

echo 🎉 تم إعداد الملفات للرفع!
echo.
echo 📁 مجلد dist جاهز للرفع إلى الاستضافة
echo 📋 الملفات المطلوبة:
echo    - dist/ (المجلد الرئيسي)
echo    - .htaccess (إعدادات الخادم)
echo    - robots.txt (SEO)
echo    - sitemap.xml (SEO)
echo.
echo 💡 نصائح للرفع:
echo    1. ارفع محتويات مجلد dist إلى المجلد الجذر للموقع
echo    2. تأكد من وجود ملف .htaccess
echo    3. تأكد من تفعيل mod_rewrite على الخادم
echo    4. اختبر الروابط بعد الرفع
echo.
echo 🔗 روابط مهمة للاختبار:
echo    - الصفحة الرئيسية: /
echo    - الخدمات: /services
echo    - للتجار: /for-merchants
echo    - للكباتن: /become-captain
echo    - الدعم: /support
echo    - من نحن: /about
echo    - التواصل: /contact

pause
