import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { defineConfig, ESBuildOptions } from 'vite';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [vue()],
    base: '/goblin-slayer/',

    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },

    server: {
      host: true,
      port: 47291,
      open: true,
    },

    build: {
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string): string | undefined {
            if (id.includes('node_modules')) {
              if (id.includes('vue')) return 'vendor-vue';
              if (id.includes('@vueuse')) return 'vendor-vueuse';
              if (id.includes('pinia')) return 'vendor-pinia';
              if (id.includes('three')) return 'vendor-three';
              if (id.includes('@tresjs')) return 'vendor-tresjs';
              if (id.includes('howler')) return 'vendor-howler';
              if (id.includes('marked')) return 'vendor-marked';
              if (id.includes('dompurify')) return 'vendor-dompurify';
              if (id.includes('@tanstack')) return 'vendor-tanstack';
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    esbuild: (isProd ? { drop: ['console', 'debugger'] } : undefined) as ESBuildOptions | undefined,

    optimizeDeps: {
      include: [
        'vue',
        '@vueuse/core',
        'pinia',
        'three',
        '@tresjs/core',
        'howler',
        'marked',
        'dompurify',
        '@tanstack/vue-virtual',
      ],
    },
  };
});
