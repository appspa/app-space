/* eslint-disable */
import legacyPlugin from '@vitejs/plugin-legacy';
import * as path from 'path';

import {
  createVuePlugin
} from 'vite-plugin-vue2';
import {defineConfig,loadEnv} from "vite";
import config from "./config";
// @see https://cn.vitejs.dev/config/
export default defineConfig(({command, mode,ssrBuild}) => {
  let rollupOptions = {};

  let optimizeDeps = {};

  let alias = {
    '@': path.resolve(__dirname, './src'),
    '@Components': path.resolve(__dirname, './src/components'),
    'vue': 'vue/dist/vue.esm.js',
  };

  let esbuild = {};
  return {
    server: {
      // 代理
      proxy: {
        // '/x/app/': {
        //   target: config.domain,
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/x\/app/, '')
        // },
        '/api/': {
          target: config.domain ,
          changeOrigin: true,
        },
      },
      host:'0.0.0.0'
    },
    base: '/',
    // root: './', // js导入的资源路径，src
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias,
    },
    define: {
      'process.env': process.env,
    },
    build: {
      target: 'es2015',
      minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
      manifest: false, // 是否产出maifest.json
      sourcemap: false, // 是否产出soucemap.json
      outDir: 'dist', // 产出目录
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            // elementPlus: ['element-plus'],
            vue: ['vue'],
            vueRouter: ['vue-router']
          }
          // manualChunks(id) {
          //   console.log(id)
          //   return ''
          //   // 将pinia的全局库实例打包进vendor，避免和页面一起打包造成资源重复引入
          //   // if (id.includes(path.resolve(__dirname, '/src/store/index.ts'))) {
          //   //   return 'vendor'
          //   // }
          // }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    esbuild,
    optimizeDeps,
    plugins: [
      legacyPlugin({
        targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'],
      }),
      createVuePlugin()
    ],
    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
        }
      }
    },
  };
})
