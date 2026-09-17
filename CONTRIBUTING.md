# 贡献指南 · 法脉星河

> 法脉星河欢迎社区贡献。**任何"对真实上线使用"有价值的贡献都会被认真 review。**

## 0. 行为准则

- 友好、尊重、就事论事
- 法律内容必须**严格进源**(给出可核查的权威来源)
- 不上传受版权保护 / 隐私泄露的资料
- 隐私优先:**零用户追踪**,所有数据本地存储

## 1. 开发环境

### 1.1 必备工具

- **Node.js 20.19+（20.x）或 22.12+**
- **npm 10+**(随 Node 一起装)
- **Git 2.30+**
- **Chrome / Edge**(推荐,File System Access API 必需)
- 操作系统:macOS / Linux / Windows 都支持

### 1.2 初始化

```bash
git clone <repo-url>
cd famai-star-map
npm ci
npm run dev    # → http://127.0.0.1:5173
```

### 1.3 推荐 IDE 配置

**VSCode**(推荐):
- 装 ESLint 扩展
- 装 Prettier 扩展(本仓库暂未配 Prettier,先按 ESLint 自动 fix)
- 设置 `editor.formatOnSave: true`(JS/TS)

**WebStorm**:
- 自带 ESLint / TypeScript 集成,开箱即用

## 2. 项目约定

### 2.1 代码风格

- **TypeScript strict** 模式,不要用 `any` / `as any`(除非注释解释)
- **ESLint**:`npx eslint src/ data/` 0 错误
- 命名:
  - 组件:`PascalCase`(`LawUniverseScene.tsx`)
  - hook:`useXxx`(`useToast`, `useUserSatellites`)
  - 纯函数:`camelCase`(`findLegalUniversePath`)
  - 类型:`PascalCase`(`LegalUniverseNode`)
  - 文件:`kebab-case`(除了组件 .tsx 是 `PascalCase`)

### 2.2 测试约定

- **TDD**:新功能先写 failing test,再写实现
- **位置**:`*.test.ts(x)` 跟源文件**同目录**(不是 `__tests__/`)
  - 例:`src/law-universe-lab/useToast.ts` → `src/law-universe-lab/useToast.test.ts`
- **E2E**:`tests/*.spec.ts`,用 Playwright
- **框架**:Vitest 2 + jsdom + fake-indexeddb
- **覆盖目标**:核心纯函数 / hook / 组件 ≥ 80%

跑测试:

```bash
npm test            # 单元测试,1 次
npm run test:watch  # watch 模式,改代码自动跑
npm run test:e2e    # E2E(需 dev server)
```

### 2.3 提交规范(Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**:
- `feat` 新功能
- `fix` 修 bug
- `refactor` 重构(无新功能 / 修 bug)
- `test` 加测试 / 改测试
- `docs` 文档
- `chore` 杂项(依赖、配置)
- `perf` 性能优化
- `style` 格式调整(不影响代码)
- `ci` CI 配置

**scope**(可选):
- `phase-3-pdf` / `phase-4-obsidian` / `data` / `hooks` / `3d` / `llm` / `a11y` 等

**subject**:
- 中文 / 英文都可以
- 简短,不超过 50 字符
- 动词开头:`feat: 加` 或 `feat: add`

**示例**:

```
feat(phase-3): PDF 解析 + 10 单测

- pdfjs-dist 4.x 集成
- parsePdf 纯函数,带 scanned-empty 检测
- 100MB 硬限制,20MB 软警告
- 详见 docs/CHANGELOG.md
```

### 2.4 分支策略

- `main` 分支是稳定版,所有 PR 都要往 `main` 提
- 功能分支命名:`feat/<short-desc>` / `fix/<short-desc>` / `refactor/<short-desc>`
  - 例:`feat/phase-5-cloud` / `fix/satellite-drift` / `refactor/labpage-hooks`

## 3. 开发流程(给大改动)

### 3.1 写 Design Spec

写在 Issue 或 PR 描述中,无需安装任何个人 agent skill。

Spec 包含:
1. 目标(为什么做)
2. 范围(做什么 / 不做什么)
3. 风险
4. 数据模型 / API 变更
5. 测试策略
6. 验收标准

### 3.2 写 Implementation Plan

在 PR 中列出实施步骤和验证方式。

Plan 包含可勾选的 Task,每个 Task:
- 文件列表
- 具体代码片段
- 验证步骤
- commit 信息

### 3.3 TDD 实施

按 Plan 顺序,每个 Task 先写 failing test → 写实现 → 跑通 → commit。

### 3.4 写 Changelog + 总结

放在 `docs/legal-universe-2.0-phase-X.md`(延续现有命名)+ `docs/CHANGELOG.md` 顶部。

## 4. 数据约定

### 4.1 静态数据

`data/legalUniverseData.ts` 是法脉星河的核心:
- **不能伪造法律文本 URL** — 严格进源,未确认的来源标 `pending-manual-check`
- 来源只能是:`flk.npc.gov.cn` / `court.gov.cn` / `spp.gov.cn` / `moe.gov.cn` / 公开期刊

### 4.2 用户数据

`src/law-universe-lab/userDataTypes.ts` + `legalUniverseUserDb.ts`:
- IndexedDB store 加新表要 bump `DB_VERSION`
- onupgradeneeded 写迁移逻辑
- 加 helper:`putX / getX / listX / deleteX`
- 写测试:fake-indexeddb + 至少 1 个 round-trip

## 5. UI / 样式

### 5.1 组件层级

- `App` → `<ErrorBoundary><LawUniverseLabPage /></ErrorBoundary>`
- `LawUniverseLabPage` 是组合层,只做 state hooks + 组件拼装
- 业务逻辑放 `hooks/`(`src/law-universe-lab/hooks/`),纯逻辑放 `*.ts`(无 .tsx)
- 3D 相关放 `LawUniverseScene.tsx` + 子组件

### 5.2 状态拆分原则

每个 hook 只管一片 state,跨 hook 协调在 LabPage 编排。

**反模式**:把所有 state 塞进 LabPage(已修,见 Phase 3 E)
**好实践**:`useFocusState` / `useModal` / `useToast` 各自管一片

### 5.3 样式

- 全用 CSS(没用 Tailwind / styled-components)
- 命名:`law-universe-<scope>__<element>`(BEM 风格)
- 6 个 CSS 文件按职责拆分(`base` / `scene` / `hud` / `panels` / `quiz` / `satellites`)
- 新组件样式放合适文件,不要在组件里写 `<style>`
- 颜色 / 间距 / 字号用 CSS variables(主题色 `#f3c86f`、深空 `#05070a` 等)

### 5.4 A11y

- 所有交互元素要有 `aria-label` / `aria-pressed` / `aria-expanded`
- icon button 必须有 `aria-label`,icon 加 `aria-hidden="true"`
- 颜色对比度 ≥ 4.5:1(法脉深色背景 + 金色强调色 OK)
- 焦点态用 `:focus-visible`,不要用 `:focus`(避免鼠标点击时也显示)
- 键盘可达:`Tab` 遍历所有交互元素,`Enter` / `Space` 触发

## 6. 性能

- 大列表(> 100 项)用 `useMemo` / `React.memo` 避免重渲染
- 3D 场景的 mesh 数控制在 < 1000(超过考虑 LOD)
- 关系 beams 不要每条都加 `<Html>` label(性能差)
- localStorage 写操作 batch / debounce(避免每个 state 变都写盘)
- IndexedDB 写操作走事务(已在 `legalUniverseUserDb.ts` 抽象)

## 7. 国际化(暂未做)

目前 zh-CN only。如果未来做 i18n:
- 文案放 `src/law-universe-lab/i18n/<locale>.json`
- 引入 `react-intl` 或 `i18next`
- 不在代码里 hard-code 中文,都走 i18n key

## 8. 提交 PR 前的检查清单

```bash
# 1. 类型
npx tsc -p tsconfig.app.json --noEmit

# 2. Lint
npx eslint src/ data/

# 3. 单元测试
npm test

# 4. 数据完整性
npm run check:legal-universe

# 5. Build
npm run build

# 6. (改动 UI)E2E
npm run test:e2e

# 7. 更新 CHANGELOG(用户可见的变更)
# 在 docs/CHANGELOG.md 顶部加 [Unreleased] entry

# 8. 更新 README(如果是新功能 / 配置变更)
```

## 9. 沟通

- **GitHub Issues**:bug / 功能请求 / 讨论
- **GitHub Discussions**（仓库启用时）:架构 / 长期规划
- **PR**:代码改动

## 发布和隐私

提交 PR 前运行 `npm run verify:all` 与 `npm run test:scripts`。复现样例使用 `examples/` 中的合成资料，不上传真实 Key、导出的个人备份、教材全文或未经许可的第三方截图。运行代码须保留现有 AGPL 许可。

安全漏洞按 [安全基线](docs/SECURITY.md) 私下披露；普通 Issue 写出环境、复现步骤、预期/实际结果和去敏日志。新建公开仓库使用 README 描述的干净源码包，不复制尚未审计的旧 Git 历史。

## 10. 致谢

感谢所有贡献者。法脉星河是一个**"为爱发电"** 的开源项目,你的每一个 PR 都让这个产品更好。
