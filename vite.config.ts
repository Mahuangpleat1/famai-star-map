import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 项目站点部署在 /<repo-name>/ 子路径下,CD workflow 里注入
  // VITE_BASE(见 .github/workflows/deploy.yml);本地构建/其他平台默认 "/"
  base: process.env.VITE_BASE ?? "/",
  // Vite build 配置
  build: {
    target: "es2020",
    cssTarget: "chrome108",
    sourcemap: false, // 生产关闭 sourcemap,减小体积
    minify: "esbuild",
    cssMinify: "esbuild",
    assetsInlineLimit: 4096, // 4KB 以下资源 inline
    reportCompressedSize: true, // 报告 gzip 后体积,便于优化
    chunkSizeWarningLimit: 600, // pdfjs 比较大,提高警告阈值到 600KB
    // 拆 chunk:把大型库拆出来单独加载,首屏只下载必要代码
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // three.js 单独拆(3D 场景专用)
            if (id.includes("three") || id.includes("@react-three")) {
              return "three";
            }
            // pdfjs 单独拆(只有用户上传 PDF 才用)
            if (id.includes("pdfjs-dist")) {
              return "pdfjs";
            }
            // lucide-react 图标库
            if (id.includes("lucide-react")) {
              return "icons";
            }
            // d3-force 力导向图布局
            if (id.includes("d3-force")) {
              return "d3";
            }
            // React core
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/scheduler/")
            ) {
              return "react";
            }
            return "vendor";
          }
          return undefined;
        }
      }
    }
  },
  // Dev server 配置
  server: {
    port: 5173,
    strictPort: false,
    open: false
  },
  // 预览(serve dist)配置
  preview: {
    port: 4173,
    strictPort: false
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "data/**/*.test.ts"]
  }
});
