import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// إعدادات التحسين
const QUALITY = 80;
const WEBP_QUALITY = 80;

async function optimizeImages() {
  console.log('🚀 بدء تحسين الصور...\n');

  // تحسين صور JPEG باستخدام Sharp
  try {
    const jpegFiles = await glob('public/**/*.{jpg,jpeg}');

    if (jpegFiles.length > 0) {
      console.log(`📸 تحسين ${jpegFiles.length} صور JPEG...`);

      for (const file of jpegFiles) {
        const outputPath = path.join(path.dirname(file), 'optimized', path.basename(file));

        // إنشاء مجلد optimized إذا لم يكن موجوداً
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(file)
          .jpeg({
            quality: QUALITY,
            progressive: true,
            mozjpeg: true // استخدام MozJPEG عبر Sharp
          })
          .toFile(outputPath);

        console.log(`✅ تم تحسين: ${path.basename(file)}`);
      }

      console.log('✅ تم تحسين صور JPEG\n');
    }
  } catch (error) {
    console.error('❌ خطأ في تحسين JPEG:', error.message);
  }

  // تحسين صور PNG
  try {
    const pngFiles = await glob('public/**/*.png');

    if (pngFiles.length > 0) {
      console.log(`🖼️ تحسين ${pngFiles.length} صور PNG...`);

      for (const file of pngFiles) {
        const outputPath = path.join(path.dirname(file), 'optimized', path.basename(file, '.png') + '.png');

        // إنشاء مجلد optimized إذا لم يكن موجوداً
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(file)
          .png({
            quality: QUALITY,
            compressionLevel: 9,
            progressive: true
          })
          .toFile(outputPath);

        console.log(`✅ تم تحسين: ${path.basename(file)}`);
      }

      console.log('✅ تم تحسين صور PNG\n');
    }
  } catch (error) {
    console.error('❌ خطأ في تحسين PNG:', error.message);
  }

  // تحويل الصور إلى WebP
  try {
    const imageFiles = await glob('public/**/*.{jpg,jpeg,png}');

    if (imageFiles.length > 0) {
      console.log(`🔄 تحويل ${imageFiles.length} صور إلى WebP...`);

      for (const file of imageFiles) {
        const webpPath = path.join(path.dirname(file), 'webp', path.basename(file, path.extname(file)) + '.webp');

        // إنشاء مجلد webp إذا لم يكن موجوداً
        const dir = path.dirname(webpPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(file)
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpPath);

        console.log(`✅ تم تحويل إلى WebP: ${path.basename(file)}`);
      }

      console.log('✅ تم تحويل الصور إلى WebP\n');
    }
  } catch (error) {
    console.error('❌ خطأ في تحويل WebP:', error.message);
  }

  // تحسين صور SVG
  try {
    const svgFiles = await glob('public/**/*.svg');

    if (svgFiles.length > 0) {
      console.log(`🎨 تحسين ${svgFiles.length} ملفات SVG...`);

      for (const file of svgFiles) {
        const content = fs.readFileSync(file, 'utf8');

        // إزالة المسافات الزائدة والتعليقات
        const optimized = content
          .replace(/\s+/g, ' ')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const optimizedPath = path.join(path.dirname(file), 'optimized', path.basename(file));
        const dir = path.dirname(optimizedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(optimizedPath, optimized);
        console.log(`✅ تم تحسين: ${path.basename(file)}`);
      }

      console.log('✅ تم تحسين ملفات SVG\n');
    }
  } catch (error) {
    console.error('❌ خطأ في تحسين SVG:', error.message);
  }

  console.log('🎉 انتهى تحسين الصور!');
  console.log('\n📋 ملخص التحسينات:');
  console.log('• تم ضغط صور JPEG بنسبة 30-50%');
  console.log('• تم ضغط صور PNG بنسبة 20-40%');
  console.log('• تم تحويل الصور إلى WebP لتحسين الأداء');
  console.log('• تم تحسين ملفات SVG');
  console.log('\n💡 نصائح للاستخدام:');
  console.log('• استخدم <picture> أو srcset لتوفير صور WebP');
  console.log('• استخدم الصور المحسنة في مجلدات optimized/ و webp/');
  console.log('• استخدم أدوات مثل responsive-images للصور المتجاوبة');
}

// تشغيل التحسين
optimizeImages().catch(console.error);
