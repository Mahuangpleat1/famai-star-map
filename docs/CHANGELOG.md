# Changelog · 法脉星图

所有用户可见变更记录于此。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased] · 上线优化 v3 · 2026-08-23

> 第二轮"全量上线级别优化" — 在 v2 基础上,把"非阻塞但能再上一档"的项清完。4 个并行 track (G/H/I/J),所有 8 项门禁 (lint / typecheck / data / test / build / verify:sw / audit:contrast / test:contrast) 全绿,首屏 gzip 守在 291.9KB。

### 新增

**Track G — 代码质量 (lint 归零 + chunk 拆解)**
- **37 条 lint 警告归零**:`react-hooks/exhaustive-deps` (36) + `jsx-a11y/no-static-element-interactions` (1)
  - `RelationBeams` useMemo 抽 const 一次性清 7 条 complex expression 警告
  - `WorkbenchPanel` 上传区真改 a11y (`role="button"` + `tabIndex={0}` + `onKeyDown` Enter/Space 触发 file picker),不是塞 disable
  - `LabPage` 编排层 hook wrapper 决策: 内部 setter 来自 useState dispatch 引用稳定,deps 加 wrapper 整体反而污染下游 memo
- **2 panels 拆出主 chunk**:`useCommandPaletteHotkey` + `usePathProgress` 抽到独立 hook 文件,`rollup` 能 dynamic split
  - `LawUniverseCommandPalette-*.js` 4.71KB / 2.01KB gzip
  - `LawUniverseLearningPathPanel-*.js` 4.25KB / 1.41KB gzip
  - 11 panels 全部独立 chunk,LabPage 主入口 4.27KB gzip
- 清理 6 条 unused `eslint-disable-next-line no-undef` + 1 条 `no-new`

**Track H — CI/CD 加固**
- **Lighthouse CI workflow** (`.github/workflows/lighthouse-ci.yml`) — `treosh/lighthouse-ci-action@v12` + 现有 `lighthouse-budget.json`,PR 时跑分失败直接 fail
- **Dependabot config** (`.github/dependabot.yml`) — npm weekly + actions monthly,3 个 npm group (react-three / test / lint) + 1 actions group,合并 PR 减少噪音
- **Node matrix 20 + 22** (`.github/workflows/ci.yml`) — `fail-fast: false` 让一个版本失败不影响另一个
- **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) — lint / test / bundle / 截图 / 文档 5 项 checklist
- artifact retention 7 → 14 天

**Track I — a11y 颜色对比度 (WCAG AA 全过)**
- **100 处颜色对比度修复** (14 fail + 64 warn + 22 borderline → 0 / 0 / 0)
- 新增 9 个 CSS 变量 (`--universe-text-primary/secondary/hint/meta/disabled` + `-pri/sec/hi/me/dis`)
- 阈值 0.78 (WCAG AA 在深背景 rgb(5,7,10) 上的精确最低 + 5% 余量,实测 10.8:1 AAA)
- **自动化 audit 脚本** `scripts/audit-color-contrast.mjs` (4 档: FAIL/WARN/BORDERLINE/PASS)
- **自动化 test 脚本** `scripts/__tests__/a11y-contrast.test.mjs` (7 个 case,集成进 verify-all)
- **完整 audit 文档** `docs/A11Y-AUDIT.md` (294 行,逐文件修改前后对比 + 关键决策)
- `package.json` 加 `audit:contrast` + `test:contrast` scripts

**Track J — 整合验证 + 部署烟测**
- **`scripts/verify-all.mjs`** — 8 步串行门禁 (lint → typecheck → data → test → build → verify:sw → audit:contrast → test:contrast),16-19s 跑完,失败立即 exit 1
- **`scripts/smoke-deploy.mjs`** — 5 步部署烟测 (主页面 / manifest / favicon / SPA fallback / 安全 header),`STAGING_URL` 环境变量配置,`SKIP_SMOKE=1` 跳过,`SMOKE_SKIP_SECURITY_HEADERS=1` 本地模式旁路
- **`npm run verify:all`** + **`npm run smoke:deploy`** scripts
- **CI 整合**:`.github/workflows/ci.yml` 把 Track H 的 inline 7 命令 `&&` 串行替换为 `npm run verify:all`,删除原 `verify:sw` 单步,避免重复 (single source of truth)
- **bundle 复盘** `docs/BUNDLE-REPORT-2026-08-23.md` (124 行,首屏 291.9KB / 500KB = 58% 利用率,3 chunk 接近预算已标注,Phase 5 路径清晰)

### 修改
- 现有 ESLint v9 config: 阈值已设 `warn`,本轮全部触发清零
- `LabPage.tsx` 编排层 hook 结构: 暴露具体 setter 而非 wrapper 整体,下游 useMemo 缓存更稳
- CI workflow: 删原 `verify:sw` step,verify-all 包含在内

### 验证
- `npm run verify:all` — **8/8 PASS, 17.4s**
- `npm test` — **392/392 pass** (59 files)
- `node --test scripts/__tests__/a11y-contrast.test.mjs` — **7/7 pass**
- `node scripts/verify-sw.mjs` — **21/21 PASS**
- `node scripts/audit-color-contrast.mjs` — **0 FAIL / 0 WARN / 0 BORDERLINE / 82 PASS**
- `npm run build` — **0 errors, first-load gzip 291.9KB** (< 305KB 预算, 远低于 500KB Lighthouse 预算)
- `SKIP_SMOKE=1 npm run smoke:deploy` — **PASS**
- `STAGING_URL=http://127.0.0.1:4173 SMOKE_SKIP_SECURITY_HEADERS=1 npm run smoke:deploy` (本地 preview) — **5/5 PASS**

### 风险
- 上线前仍需 1 次真实浏览器人工 smoke (脚本覆盖不到的部分):3D 场景渲染 / 11 panel 按需加载 / PWA 离线 / SW 激活 / Lighthouse 跑分
- 详见 `docs/BUNDLE-REPORT-2026-08-23.md` 末尾"上线前人工 smoke 清单"

## [Unreleased] · 2026-08-22

### Added
- a11y 组件:SkipLink / OnboardingHint / KeyboardCheatsheet
- 备份功能:LawUniverseBackupPanel + useStorageQuota + JSON round-trip
- 错误样式:law-universe-lab-errors.css(ErrorBoundary 配套)
- 文档:DEPLOYMENT / PERFORMANCE / SECURITY / PRIVACY / TERMS
- 仓库卫生:editorconfig / npmrc / nvmrc / CONTRIBUTING / README
- 公共资产:favicon / mask-icon / og-image / robots / security / sitemap
- 体积优化:LabPage code-split (Track B)
- PWA 收口:apple-touch-icon + manifest 完整字段
- 性能监控:Web Vitals 接线 (Track D)
- 卫星 LOD:按 importance 决定 sphere 段数
- vite manualChunks:three / pdfjs / icons / d3 / react / vendor 拆分
- 测试覆盖:useCinematicIntro / LawUniverseSatelliteNode.lod / useStorageQuota / legalUniverseBackup
- **CI workflow**:`.github/workflows/ci.yml` 跑 lint / typecheck / data-check / test / build / verify:sw
- **Lighthouse 预算**:`lighthouse-budget.json` (script 500KB / stylesheet 100KB / LCP 2.5s / CLS 0.1)
- **技术债清单**:`docs/TECH-DEBT.md` 汇总 TODO / 颜色对比度 / chunk 拆解 / 上线前必做
- **数据校验增强**:`npm run check:legal-universe` 自动 warn 节点含 `pending-manual-check` 占位
- **Per-panel 体积报告**:`scripts/report-bundle-size.mjs` 列出每个 panel chunk 的 raw / gzip / budget
- **PWA 资产**:apple-touch-icon (180/192/512) + icon-192 + icon-512 由 sharp 从 favicon.svg 渲染
- **ESLint 加严**:react-hooks + jsx-a11y 插件,关键 3 条 jsx-a11y 规则为 error
- **Engine 字段**:package.json 强制 Node 20+ / npm 10+

### Changed
- LawUniverseSatelliteNode: 加 getSphereSegments LOD
- LawUniverseScene: 加 id="law-universe-scene" 给 SkipLink 锚点
- vite.config.ts: target es2020 + manualChunks + chunkSizeWarningLimit 600
- eslint.config.mjs: 拆 scripts / test / 业务 三段,分别加 node / vitest / browser globals
- index.html: 加 `theme-color` light media meta (深色主,light 模式 #0a0d12)
- package.json: 加 `lint:fix` / `typecheck` / `verify:sw` scripts + `engines`
- 模态 backdrop:KeyboardCheatsheet / LawUniverseBackupPanel 加 onKeyDown Escape

### Fixed
- 测试:onboarding/cheatsheet localStorage 跨测试污染
- 测试:Suspense fallback mount 后消失断言
- 模态 a11y:onClick 配 onKeyDown Escape,满足 jsx-a11y/click-events-have-key-events
- scripts 真错:删未用 err/isRule/totalRaw 变量、显式 catch {}、ANSI regex 行内豁免

### Documentation
- docs/PERFORMANCE.md §3.2.1:标注 Web Vitals 5 指标已实现(LCP/INP/CLS/FCP/TTFB)

## [Unreleased] · 上线优化 v2

> 本次是项目 phase-4 之后的"全量上线级别优化",涵盖 PWA / 性能 / a11y / SEO / 错误兜底 / 打印支持 / 404 友好 / 数据完整性。所有改动都通过 tsc / eslint / 386+ tests / bundle 报告。

### 新增

**PWA + 离线体验**
- **Service Worker** (`public/sw.js`) — install/activate/fetch 三事件,4 套策略
  - `/assets/*` (Vite hashed) → cache-first(永久缓存,二次访问秒开)
  - `/`、`/index.html`、`/manifest.webmanifest` → network-first(每次新版立刻生效)
  - `*.svg / *.woff / *.ttf` → stale-while-revalidate(秒开 + 后台静默更新)
  - 其他 GET → network-first + SPA fallback(网络失败回 `/index.html` 让 React 接管)
  - 跨域 / 非 http scheme 全部放行(LLM API 用户自配 baseURL 必须跨域)
  - 预缓存 6 个关键资源(/ + index.html + manifest + favicon + og + mask)
- **manifest 完善** — 加 `"id": "/"`(Chrome PWA 唯一标识)+ `"start_url": "/?source=pwa"`(区分启动来源)
- **scripts/verify-sw.mjs** — SW 静态校验(vm.Script 编译 + 必备事件 + CACHE_NAME 形如 `famai-vN`)

**性能监控 + 错误上报**
- **`web-vitals@^4.2.4`** 接入 — 5 个核心指标(LCP / FCP / TTFB / INP / CLS)上线后自动上报
- **`src/lib/perf.ts`** — Web Vitals 监听 + DEV 模式 console.info / PROD 模式 fetch+keepalive
- **`src/lib/clientLog.ts`** — 统一端点通信(error 用 sendBeacon 同步避免页面卸载丢失,perf 用 fetch keepalive 异步)
- **endpoint 默认 `/api/client-log`**(相对路径,部署时用 Nginx 反代到自托管后端)
- **覆盖配置**:`localStorage.setItem("law-universe:client-log-endpoint", "https://...")` 即可
- **ErrorBoundary 上报** — `componentDidCatch` 里 PROD 守卫 `sendClientLog`(保留原 `console.error` 不变)
- **globalErrorHandler 接入** — `window.onerror` + `unhandledrejection` 触发 PROD 上报

**a11y 强化**
- **`useFocusTrap` hook** — 完整焦点陷阱(打开 → 第一个 focusable / Tab+Shift+Tab 循环 / Esc 触发 onEscape / 关闭恢复原焦点)
- **9 个 modal 集成 focus trap**:KeyboardCheatsheet / CommandPalette / BackupPanel / WorkbenchPanel / ObsidianExportPanel / SatelliteDetailPanel / Quiz / QuizSession / FavoritesPanel
- **`aria-describedby` 关联** — WorkbenchPanel 5 个 LLM 字段 + BackupPanel 文件选择 + DetailPanel 笔记状态
- **`aria-current` 增强** — HUD system 索引:concept 选中时其 system 按钮也标 current
- **CSS 全局** — `:focus-visible` 金色 outline + `prefers-reduced-motion: reduce` 关闭所有 CSS 动画 + `prefers-contrast: more` 强化 panel 边框和 focus outline

**SEO + 社交**
- **JSON-LD 结构化数据** (`<script type="application/ld+json">`) — schema.org WebApplication,Google Rich Result 可识别
- **CSP meta 兜底** (`<meta http-equiv="Content-Security-Policy">`) — file:// / 静态托管无 header 场景的兜底,生产环境用 HTTP 头覆盖

**404 友好降级**
- **index.html inline 404 脚本** — 任意非 "/" 且非静态资源路径,显示「这条路径不存在」面板 + 「回到首页」链接
- **inline 404 CSS** — 金色品牌色,响应式,`prefers-reduced-motion` 兼容
- 自动跳过:JS / CSS / SVG / PNG / fonts / manifest / 已知静态文件

**打印支持**
- **`src/law-universe-lab/css/law-universe-lab-print.css`** — 录讲义 / 导出讲义 PDF 场景
- 隐藏 3D Canvas / HUD / Toast / Modal backdrop / 按钮 / 输入框
- 显示选中节点标题(金色 22pt) + 描述(11pt) + 引用列表
- 顶部自动加 `::before` 页眉(`法脉星图 · 打印导出 · 当前节点 ID`)
- A4 / Letter 适配,`page-break-inside: avoid` 避免孤行

**Bundle 报告**
- **`scripts/report-bundle-size.mjs`** — dist/ 全文件 gzip 体积 + 12 条预算规则 + ANSI 表格 + 超预算 exit 1
- **`scripts/__tests__/report-bundle-size.test.mjs`** — 23 个 case 覆盖 gzip / 预算 / baseline diff / 渲染
- **`npm run report:bundle`** — 单独跑
- **集成 `npm run build`** — 链 `tsc -b && vite build && node scripts/report-bundle-size.mjs`

**Data Backup 增强**
- `getLLMProviderConfig` 返回 `LLMProviderConfig | null`(语义:未配置 = null,WorkbenchPanel 自动 fallback 到 default)
- `readBackupFile` 兼容 jsdom / 老浏览器:`text() → arrayBuffer+TextDecoder → FileReader` 三段式 fallback
- 修复 baseline 测试 4 处失败

### 修改
- **`useQuizReview` useEffect 依赖** — 从 `toast` 整个对象改为 `toast.push` 稳定引用,避免重渲染时重复弹 toast
- **`useUndoStack.test.ts`** — `popped` 改用 `const` + 显式 narrow(`if (popped && isMoveOp(popped))`)
- **`useSatellitePositions.test.ts`** — `mkSat` 接受 `"unclassified"` displaySystem(走 fallback 分支)
- **`legalUniverseBackup.ts`** — 移除未使用 `safeReadJson` 死代码
- **`ErrorBoundary.test.tsx`** — 移除未使用 `@ts-expect-error` 指令
- **`OnboardingHint.tsx`** — 修复缺失的 `handleDismiss` 依赖
- **`legalUniversePdf.ts`** — 移除未使用 `@ts-expect-error` 指令
- **`LawUniverseLabPage.tsx`** — 重排 `trackOnboarding` useCallback 提前,避免 hoisting 错误
- **CSS 文件** — `law-universe-lab-base.css` 新增 74 行 a11y / 焦点 / 媒体查询规则
- **`index.html` 体积** 591 字节 → ~12.5KB(全文:SEO + JSON-LD + CSP meta + 404 inline script + 内联样式)

### 修复
- **baseline test 4 处失败** — 现在 386/386 全过(原 355)
  - `useQuizReview` 抖动导致 `toast-error` 多个元素
  - `readBackupFile` jsdom File 缺 `text()` 报错
  - `getLLMProviderConfig` 返回 default 而非 null 致 `bundle.data.settings` 不是 null
  - `LabPage` trackOnboarding hoisting 错误
- **baseline tsc 6 errors** — 现在 0 errors(strict 模式)
- **baseline eslint 2 errors + 7 warnings** — 现在 0 errors + 0 warnings
- **print 友好度** — `print-color-adjust: exact` 保留深色背景

### 验证
- `npx tsc -p tsconfig.app.json --noEmit` — 0 错误
- `npx eslint src/ data/` — 0 错误 0 警告
- `npm test` — **386/386 全过**(baseline 355 → +31 tests:7 useFocusTrap + 5 CommandPalette + 3 Hud + 16 pre-existing uncommitted)
- `npm run check:legal-universe` — 610 节点 / 969 边 / 11 太阳系 ✓
- `npm run build` — 0 错误,first-load gzip **291.8 KB / 500 KB 预算** ✓
- bundle 状态:3 个 chunk 接近预算(react 47.17/50, three 197.57/200, vendor 42.44/50)— 全部 ⚠ 但 < 100%

### 风险
- 部署后**必须配 SPA fallback**(所有路径返回 `index.html`),否则刷新会 404
- API key 仍然存浏览器本地,Phase 5 接自有后端代理前是高危点
- 部署后**必须反代 `/api/client-log`** 到自托管后端,否则 Web Vitals / 错误上报静默失败
- 部署后**必须保留 `<meta http-equiv="Content-Security-Policy">`** 兜底(file:// 场景)或用 HTTP 头覆盖

## [2.0.0] · Phase 4 Obsidian 双向同步 · 2026-07-31

### 新增
- Obsidian 单向导出 (.md + zip download)
- Obsidian 双向同步 (File System Access API)
- vaultMapping store (IndexedDB v3)

## [2.0.0] · Phase 3 刷题会话 · 2026-07-31

### 新增
- 刷题会话回路 (quiz session closed loop)
- 3 种题型判分器 (choice / fill / essay)
- 题序算法 (错题加权 + dueAt 排序)
- Toast 系统
- LabPage 拆分 (从 737 行 → ~470 行, 14 个 state hook)
- PDF 解析 (pdfjs-dist, 100MB 限制, 扫描件检测)
- 历史 lab 清理 (删 `src/law-star/` + `src/law-solar-lab/`)

## [2.0.0] · Phase 2.6+3 法考学习 + 重复去重 · 2026-07-25

### 新增
- 重复概念去重 (归一化 + 合并 UI)
- 完整 Undo 栈 (5 种 op, 50 上限, localStorage 持久化)
- 关系 hover label (drei `<Html>`)
- 抽取出题 (选择 / 填空 / 简答, v1 模板版)
- 错题本 (自动 + 手动)
- 间隔重复 SM-2 算法

## [2.0.0] · Phase 2.5 打磨 · 2026-07-25

### 新增
- 关系连边 3D 渲染 (8 种 type 颜色, 强度映射, 跨系统 vs 同系统)
- 关系图例 (HUD 左下角)
- 位置稳定化 (修 Phase 1 Math.random 漂移)
- 拖拽中 motion 暂停 / 释放成功闪烁 / 其他卫星 disabled

## [2.0.0] · Phase 2 审核工作流 · 2026-07-17

### 新增
- 2A 拖拽归类 (`system: "new"` → 11 太阳系)
- 2B 关系类型编辑 (8 种中文 type + 强度 + 出处)
- 2C 置信度评分 (0-100, 影响卫星视觉)

## [2.0.0] · Phase 1 卫星节点 · 2026-07-16

### 新增
- 用户抽取的概念以"卫星"形式渲染到所属太阳系
- 卫星详情面板
- HUD `<Satellite />` 切换

## [2.0.0] · Phase 0 个人法学宇宙引擎 · 2026-07-16

### 新增
- IndexedDB 6 store 封装
- OpenAI 兼容 LLM provider (OpenAI / DeepSeek / Moonshot / Ollama / 自建)
- LLM 抽取 prompt + 容错 JSON 解析
- 上传 .txt / .md 工作台 UI
- LLM 设置面板 (baseURL / apiKey / model / temperature / maxTokens)

## [1.0.0] · 静态宇宙 · 2026-06-09

### 新增
- 3D 中国法学宇宙 (Canvas → R3F 演化)
- 11 部门法 × 610 节点 × 969 关系
- d3-force 物理布局
- 节点详情面板
- 命令面板 (⌘K)
- 收藏 / 笔记
- 6 预制学习路径
- 静态路由
- Playwright E2E (Chromium + Pixel 5)
