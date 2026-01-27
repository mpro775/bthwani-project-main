// vite.config.ts
import { defineConfig } from "vite";
// جرّب SWC الأسرع أثناء التطوير
import react from "@vitejs/plugin-react";
// لو واجهت مشكلة مع SWC ارجع لـ @vitejs/plugin-react العادي
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react()],
    base: "/",

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@components": resolve(__dirname, "src/components"),
        "@pages": resolve(__dirname, "src/pages"),
        "@utils": resolve(__dirname, "src/utils"),
        "@seo": resolve(__dirname, "src/seo"),
        "@landing": resolve(__dirname, "src/landing"),
        "@config": resolve(__dirname, "src/config"),
        "@api": resolve(__dirname, "src/api"),
        "@hooks": resolve(__dirname, "src/hooks"),
      },
      // يمنع تحميل نسخ متعددة من React/Emotion (مهم للسرعة وتفادي hook errors)
      dedupe: [
        "react", 
        "react-dom", 
        "@emotion/react", 
        "@emotion/styled",
        "@tanstack/react-query"
      ],
    },

    // اجعل إسقاط console/debugger للإنتاج فقط
    esbuild: isProd ? { drop: ["console", "debugger"] } : undefined,

    // يسرّع الإقلاع والتحديثات بتجميع الديبدنسي الثقيلة
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "framer-motion",
        "dayjs",
        "axios",
        "recharts",
      ],
      // target أعلى = تحويلات أقل في dev
      esbuildOptions: { target: "esnext" },
    },

    server: {
      port: 5173,
      open: true,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
      preTransformRequests: true,
      headers: {
        // ⚠️ DEV-ONLY CSP. للإنتاج استخدم ترويسة من السيرفر/المنصة
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: https:",
          "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com https://api.bithawani.com https://api.bthwani.com http://localhost:3000 ws: wss:",
          "frame-src https://www.google.com https://recaptcha.google.com",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    },

    preview: { port: 4173, open: true },

    // الإنتاج فقط
    build: isProd
      ? {
          minify: "esbuild",
          target: "es2015",
          cssCodeSplit: true,
          cssMinify: true,
          sourcemap: false,
          outDir: "dist",
          emptyOutDir: true,
          chunkSizeWarningLimit: 500,
          assetsInlineLimit: 4096,
          rollupOptions: {
            // الحفاظ على ترتيب التحميل الصحيح للـ chunks
            preserveEntrySignatures: 'strict',
            output: {
              manualChunks: (id) => {
                // تقسيم أكثر تفصيلاً للتحكم في حجم الـ bundles
                if (id.includes('node_modules')) {
                  // فصل React و React-DOM أولاً (يجب تحميلهما أولاً)
                  if (id.includes('react') || id.includes('react-dom')) {
                    return 'react-vendor';
                  }
                  // فصل react-query مع React لتجنب مشاكل التهيئة
                  if (id.includes('@tanstack/react-query') || id.includes('react-query')) {
                    return 'react-vendor';
                  }
                  // فصل MUI و Emotion معاً (يجب تحميلهما بعد React)
                  // ملاحظة: نضع MUI و Emotion في نفس الـ chunk لتجنب التبعيات الدائرية
                  if (id.includes('@mui') || id.includes('@emotion')) {
                    return 'mui-vendor';
                  }
                  // فصل Firebase و Axios
                  if (id.includes('firebase') || id.includes('axios')) {
                    return 'firebase-vendor';
                  }
                  // فصل مكتبات الرسوم المتحركة
                  if (id.includes('framer-motion') || id.includes('recharts')) {
                    return 'animation-vendor';
                  }
                  // فصل مكتبات الخرائط
                  if (id.includes('leaflet') || id.includes('socket.io')) {
                    return 'maps-vendor';
                  }
                  // باقي المكتبات
                  return 'other-vendor';
                }
                // تقسيم الكود الخاص بالتطبيق حسب الوحدات الرئيسية
                if (id.includes('/pages/')) {
                  return 'pages';
                }
                if (id.includes('/components/')) {
                  return 'components';
                }
                if (id.includes('/utils/') || id.includes('/services/')) {
                  return 'utils';
                }
              },
              chunkFileNames: `js/[name]-[hash].js`,
              entryFileNames: "js/[name]-[hash].js",
              assetFileNames: (assetInfo) => {
                const name = assetInfo.name || "";
                const ext = name.split(".").pop() || "";
                if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext))
                  return `images/[name]-[hash].[ext]`;
                if (/css/i.test(ext)) return `css/[name]-[hash].[ext]`;
                if (/woff|woff2|ttf|eot/i.test(ext)) return `fonts/[name]-[hash].[ext]`;
                return `assets/[name]-[hash].[ext]`;
              },
              // تحسين minification لتجنب مشاكل التهيئة
              format: 'es',
              generatedCode: {
                constBindings: true,
              },
            },
            // منع التبعيات الدائرية
            onwarn(warning, warn) {
              // تجاهل تحذيرات التبعيات الدائرية المعروفة
              if (warning.code === 'CIRCULAR_DEPENDENCY') {
                if (warning.message.includes('@mui') || warning.message.includes('@emotion')) {
                  return;
                }
              }
              warn(warning);
            },
          },
        }
      : undefined,

    css: {
      postcss: { plugins: [] },
      preprocessorOptions: {
        scss: { additionalData: `@import "@/styles/variables.scss";` },
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
  };
});
