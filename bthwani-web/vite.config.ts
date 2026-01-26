import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react(),
      // Sentry plugin for source maps
      ...(isProd ? [sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          name: process.env.npm_package_version,
        },
        sourcemaps: {
          assets: './dist/**',
        },
      })] : [])
    ],

    // تحسينات للتطوير
    server: {
      port: 3000,
      open: true,
      host: true,
    },

    preview: {
      port: 4173,
      open: true,
      host: true,
    },

    // تحسينات البناء للإنتاج
    build: isProd ? {
      minify: "esbuild",
      target: "es2015",
      cssCodeSplit: true,
      cssMinify: true,
      sourcemap: true, // Enable sourcemaps for Sentry
      outDir: "dist",
      emptyOutDir: true,
      chunkSizeWarningLimit: 500,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // تقسيم المكتبات الخارجية
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'mui-vendor';
              }
              if (id.includes('firebase') || id.includes('axios') || id.includes('zustand')) {
                return 'firebase-vendor';
              }
              if (id.includes('framer-motion') || id.includes('swiper')) {
                return 'animation-vendor';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n-vendor';
              }
              return 'other-vendor';
            }
            // تقسيم الكود الخاص بالتطبيق
            if (id.includes('/pages/')) {
              return 'pages';
            }
            if (id.includes('/components/')) {
              return 'components';
            }
            if (id.includes('/features/')) {
              return 'features';
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
        },
      },
    } : undefined,

    // تحسينات CSS
    css: {
      devSourcemap: true,
    },

    // تحسينات التبعيات
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
        'zustand',
        'framer-motion',
        'react-router-dom',
        'react-helmet-async',
      ],
      esbuildOptions: {
        target: 'esnext',
      },
    },

    // تعريف المتغيرات العامة
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
  };
});
