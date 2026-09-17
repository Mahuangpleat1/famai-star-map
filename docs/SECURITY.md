# 安全基线 · 法脉星河

> 最后更新: 2026-09-17
> 适用：当前仓库版本；部署配置请独立验证。

本文档说明法脉星河的安全模型、风险、缓解措施和建议配置。

## 1. 安全模型

### 1.1 信任边界

```
┌──────────────────────────────────────┐
│  你的浏览器 (用户机器)               │
│  ┌────────────────────────────────┐ │
│  │  React App (法脉星河)         │ │
│  │  - 静态代码(610 节点)         │ │
│  │  - IndexedDB(用户数据)        │ │
│  │  - localStorage(偏好)         │ │
│  │  - LLM API key                │ │
│  └────────────────────────────────┘ │
│  ↕ HTTPS (出站到 LLM / 法条链接)     │
└──────────────────────────────────────┘
        ↕
   [可选] 自有后端 (Phase 5)
```

**法脉星河当前架构(2.0)**:
- 没有后端,所有逻辑在浏览器
- 所有数据本地优先
- 网络请求包括本站资源与更新、主动调用的 LLM 服务和主动打开的来源链接；托管访问日志取决于平台

**未来架构(Phase 5)**:
- 自有后端代理 LLM API(解决 API key 暴露问题)
- 可选账号系统 / 社区分享

### 1.2 威胁模型

| 威胁 | 当前状态 | 缓解 |
|---|---|---|
| **用户误传含他人隐私的资料** | ⚠️ 高风险 | 上传前 UI 提示"勿含他人隐私" |
| **浏览器扩展读取 IndexedDB** | ⚠️ 中风险 | 提示用户"用纯净浏览器" |
| **XSS 攻击**(节点内容 / 用户输入) | ✅ 低风险 | React 自动 escape + 严格 CSP |
| **CSRF 攻击** | ✅ 无风险 | 无 cookie,无 session |
| **API key 泄露** | ⚠️ 中风险 | Phase 5 后端代理 |
| **第三方追踪** | ✅ 无 | 零 SDK |
| **中间人攻击** | ✅ 低风险 | HTTPS + HSTS |
| **DDoS** | ✅ 由 CDN 处理 | Vercel / Cloudflare / Nginx rate limit |
| **依赖供应链攻击** | ⚠️ 中风险 | `npm audit` + 锁文件 + CI 检查 |
| **PDF 解析漏洞** | ⚠️ 中风险 | pdfjs-dist 官方 + 100MB 限制 + 错误捕获 |

## 2. 已知风险与缓解

### 2.1 API Key 的内存和持久存储

Key 默认只在当前页面内存中，刷新后清除。主动选择“在此浏览器记住 Key”才写入 IndexedDB；未加密。拥有相应权限的扩展或恶意同源脚本可能读取浏览器数据，内存模式也不能防御已执行的恶意脚本。

旧版无授权标记的已存 Key 在首次读取配置时清出持久记录，保留当前页面使用。JSON 导出省略 Key 和记住许可；恢复配置清空旧 Key，不能让备份带入凭证或把旧凭证发送给新端点。恢复 localStorage 只接受应用白名单键。

公开实例的访问者必须信任部署者提供的代码。使用权限和额度受限的专用凭证，核对服务地址；应用不提供后端代理，不宣称浏览器能安全保存主账号凭证。

### 2.2 ⚠️ 浏览器扩展读取数据

**问题**:用户安装的浏览器扩展(广告拦截、密码管理器、翻译等)可以**读取** IndexedDB / localStorage。

**缓解**:
- UI 提示:"不要在公司监控软件环境下使用"
- Key 默认内存；用户资料仍存本地 IndexedDB，不自动清除

### 2.3 ⚠️ PDF 解析

**问题**:`pdfjs-dist` 是大型依赖,可能含未发现的漏洞。恶意 PDF 可能利用。

**缓解**:
- 100MB 硬限制(`PdfTooLargeError`)
- 20MB 软警告(慢)
- worker 隔离(`?url` 注入)
- ErrorBoundary 兜底

### 2.4 ⚠️ 用户上传资料含他人隐私

**问题**:用户上传的 .txt / .md / .pdf 可能含他人 PII(身份证号、电话、地址)。

**缓解**:
- 上传前 UI 提示
- 用户对自己上传内容完全负责
- 本地导入不发送资料；主动模型操作会把相关文本发送给所配置的服务

### 2.5 ✅ 零 cookie / 零追踪

应用代码不写 Cookie、不引入分析 SDK、不发送自动错误或性能遥测。托管平台的日志和适用合规要求需由部署者独立评估。

## 3. 部署侧安全配置

### 3.1 必配的安全 Headers

所有平台通用:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

详见 `docs/DEPLOYMENT.md` §1 各平台具体配置。

### 3.2 Content Security Policy

**阶段 1(当前)**:宽松 CSP,允许 LLM HTTPS 出站

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' https:;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

**说明**:
- `'unsafe-eval'`:Vite dev 模式 + 某些 three.js 需要
- `'unsafe-inline'` style:CSS-in-JS 兼容
- `connect-src 'self' https:`:LLM 是用户配置的任意 HTTPS,等 Phase 5 收紧
- `frame-ancestors 'none'`:防 clickjacking

**阶段 2(Phase 5)**:严格 CSP

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://flk.npc.gov.cn data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.famai.example.com;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### 3.3 Subresource Integrity(可选)

第三方 CDN 资源加 SRI 防篡改。本项目目前**不用第三方 CDN**,未来如需要(比如字体),加 SRI:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC"
  integrity="sha384-..."
  crossorigin="anonymous" />
```

### 3.4 SSL/TLS

- **必须** HTTPS(混合内容会让 LLM API 调用失败)
- 推荐 Let's Encrypt(免费,自动续)
- TLS 1.2+,禁用 TLS 1.0 / 1.1
- 强 cipher 套件

## 4. 依赖管理

### 4.1 锁文件

- `package-lock.json` 必须 commit
- CI 跑 `npm ci`(不是 `npm install`)

### 4.2 漏洞扫描

```bash
# 每次 PR 跑
npm audit --audit-level=moderate

# 自动修复
npm audit fix
```

CI 建议加 Dependabot / Renovate 自动 PR 升级。

### 4.3 依赖最小化

| 依赖 | 体积 | 必要性 | 备注 |
|---|---|---|---|
| react / react-dom | ~45KB | 核心 | 必装 |
| three / @react-three/* | ~200KB | 核心 | 必装 |
| d3-force | ~15KB | 核心 | 必装 |
| lucide-react | ~30KB(按需 tree-shake) | 必要 | 用法严格限制在按钮 |
| pdfjs-dist | ~250KB | 按需 | **只在用户上传 PDF 时动态 import** |
| vitest / @testing-library | dev | 必要 | 测试用 |
| playwright | dev | 可选 | E2E |

⚠️ **不要新增** 未讨论过的依赖。每个 PR 都该 review 引入的库。

## 5. 报告安全漏洞

如果实际 GitHub 仓库启用了 Private vulnerability reporting，请使用 Security → Advisories → Report a vulnerability。提供受影响版本、合成复现步骤和影响，删除所有真实 Key 与资料。

若未启用该功能，可先在 Issue 仅请求一个私密披露渠道，不公开漏洞细节。项目未公布专用安全邮箱，也未承诺响应时限；不要向示例域名发送报告。

## 6. 安全检查清单(给开发者)

提交 PR 前:

- [ ] 没 hardcode API key / 密码 / 私钥
- [ ] 没新增外部 HTTP fetch(除非 review 通过)
- [ ] 没引入新依赖(或者有充分理由)
- [ ] 用了 React 的 `dangerouslySetInnerHTML` 的话,内容来自可信源
- [ ] 用户输入经过 escape(React 自动,但要小心 url / dangerouslySetInnerHTML)
- [ ] IndexedDB schema 升级有迁移逻辑
- [ ] `localStorage` key 加了前缀(避免和其他 app 冲突)
- [ ] 错误信息不包含敏感数据(apiKey / 密码)

## 7. 安全相关 FAQ

### 7.1 法脉星河会上传我的数据到你们的服务器吗?

本地导入与保存不经过项目服务器。主动模型操作会把所需文本发送给你配置的服务，托管站点也可能记录访问日志。

### 7.2 我的 LLM API key 安全吗?

默认仅页面内存；选择记住后写入未加密的 IndexedDB。使用限额专用 Key，并信任所用实例和模型端点。

### 7.3 我能把数据导出到自己的服务器吗?

可以。**工作台 → 数据备份 → 导出 JSON** → 自行保存到任何地方。

### 7.4 卸载浏览器会丢失所有数据吗?

**会**。所有数据在浏览器本地。卸载 / 清数据 = 丢失。建议定期导出备份。
