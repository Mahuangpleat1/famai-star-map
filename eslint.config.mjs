import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * ESLint v9 flat config · 法脉星图
 *
 * 规则分级:
 *   - error: CI 必 fail
 *   - warn:  本地 console 提示,CI 不 fail(给渐进修复空间)
 *   - off:   项目内显式不需要的规则
 *
 * 关键决策:
 *   - react-hooks/exhaustive-deps 设 warn:历史 hook 量大,全量改要单开 PR
 *   - jsx-a11y 关键 3 条设 error,其余设 warn
 *   - 任何文件允许 `// eslint-disable-next-line <rule> -- <reason>` 行内豁免
 */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "**/*.min.js",
      // Service Worker 文件跑在 SW 上下文,不在 Node 也不在 React 上下文,需独立 globals
      "public/sw.js"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // ===== 脚本层:Node globals + ECMAScript 2022 =====
  {
    files: ["scripts/**/*.mjs", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  },
  // ===== 测试文件:vitest + jsdom globals =====
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "scripts/__tests__/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // vitest globals
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        // testing-library
        render: "readonly",
        screen: "readonly",
        fireEvent: "readonly",
        waitFor: "readonly",
        act: "readonly",
        renderHook: "readonly"
      }
    }
  },
  // ===== 早期启动脚本:浏览器上下文,非模块 =====
  {
    files: ["public/early-boot.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    }
  },
  // ===== 业务源码:React + browser globals =====
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // React Hooks:仅 warn,不全 error(避免一次性爆大量,渐进修)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // JSX a11y:核心 3 条 error,其余 warn
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "warn"
    }
  }
);
