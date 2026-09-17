<!--
法脉星图 PR 模板
跑完所有 checkbox 才合并, 任何一项没勾 + 解释 = 阻塞
-->

## 描述

<!-- 1-3 句话: 这个 PR 改了什么 / 为什么 -->

- 关联 issue / SPEC: <!-- e.g. closes #42 / docs/superpowers/plans/... -->

## 必跑检查 (CI 会自动跑, 这里再自检一次)

- [ ] `npm run lint` 通过 (0 错 0 警)
- [ ] `npm run typecheck` 通过 (strict mode)
- [ ] `npm test` 全过 (基线 392, 期望 ≥ 基线)
- [ ] `npm run build` 通过 + 首屏 gzip **不增** (基线 291.8KB, 预算 < 305KB)
- [ ] `npm run check:legal-universe` 通过 (610 节点 / 969 边 / 11 太阳系)
- [ ] `node scripts/verify-sw.mjs` 21/21 PASS

## 视觉 / 行为 (影响界面时勾)

- [ ] 截图 (改 UI / 样式)
- [ ] 移动端模拟 (改 layout / 触屏手势)
- [ ] 暗色模式 (PWA 暗色主调)
- [ ] 3D 性能 (改 three.js / 卫星 / 关系光束)

## 文档

- [ ] `CHANGELOG.md` 更新 (如果是用户可见变更)
- [ ] `docs/` 更新 (如果有 spec / plan 改动)
- [ ] `docs/TECH-DEBT.md` 关闭对应条目

## 风险 / 兼容性

<!--
- 新依赖 / 移除依赖?
- 改 build 配置?
- 改 data 文件 (610 节点 / 969 边)?
- 改 service worker / manifest?
-->

<!--
- 不改: 列出哪些文件刻意没改 (e.g. "未动 src/law-universe-lab/css/")
- 后续: 留什么 follow-up
-->

---

> 提交前最后一句: **我已本地跑过 `npm run verify:all` (或上面前 6 行串行)**
