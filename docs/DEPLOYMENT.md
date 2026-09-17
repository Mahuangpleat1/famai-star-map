# 部署指南 · 法脉星河

> 最后更新: 2026-09-17
> 适用：当前源码；实际检查结果见 OPEN-SOURCE-READINESS.md。

本文档提供静态托管的配置示例、手动 Pages 发布和烟测方法。以下第三方平台配置需要部署者创建并验证，不代表已发布或已通过托管平台验收。项目不提供后端 Key 代理和自动遥测。

## 0. 部署前 8 项必备

```bash
# 进入解压源码中含 package.json 的目录

# 1. 装依赖
npm ci --no-audit --no-fund

# 2. 类型检查(0 错误)
npm run typecheck

# 3. Lint(0 错误)
npm run lint

# 4. 数据完整性(610 节点 / 969 边 / 11 太阳系)
npm run check:legal-universe

# 5. 单元测试(全部通过)
npm test

# 6. 生产构建(0 错误 + 看 chunk 体积)
npm run build
# 查看构建输出的实际文件体积和 bundle 报告，不依赖历史估算
npm run verify:sw
npm run test:scripts

# 7. 浏览器检查；首次先安装测试浏览器
npx playwright install chromium
npm run test:e2e

# 8. 本地预览；另开终端做烟测或性能检查
npm run preview -- --host 127.0.0.1
```

## 1. SPA Fallback(必做,否则刷新会 404)

法脉星河是单页应用。页面导航的 fallback 应返回应用入口，实际 HTTP 状态随托管平台而异。下列手动配置以根路径为例；子路径部署需同时调整构建 `VITE_BASE`、托管目录与重写规则，不能只修改其中一项。GitHub Pages 的路径处理见 §1.6。

### 1.1 Vercel

在项目根目录创建 `vercel.json`：

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

部署: `npx vercel --prod`

### 1.2 Netlify

在项目根目录创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache"
```

部署: `netlify deploy --prod --dir=dist`

### 1.3 Cloudflare Pages

`wrangler.toml`:

```toml
name = "famai-star-map"
pages_build_output_dir = "./dist"
```

`_redirects`(放在 `public/`):

```
/*    /index.html   200
```

### 1.4 Nginx

`/etc/nginx/conf.d/famai.conf` 示例；将 `famai.example.com` 和文件路径替换为自己的域名、证书和目录：

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name famai.example.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name famai.example.com;

  root /var/www/famai;
  index index.html;

  # SSL 配置(Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/famai.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/famai.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # SPA fallback
  location / {
    try_files $uri /index.html;
  }

  # 长缓存 hashed assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  # index.html 不缓存
  location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
  }

  # 安全 headers
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  # 静态资源 gzip
  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # 隐藏 nginx 版本
  server_tokens off;
}
```

部署: `cp -r dist/* /var/www/famai/ && nginx -s reload`

### 1.5 阿里云 OSS / 腾讯云 COS

1. 创建 bucket,开启静态网站托管
2. 默认首页和错误页可指向 `index.html`；确认错误页状态码与所用 CDN 的重写行为，不能将返回任意 404 视为应用加载成功
3. 上传 `dist/` 内全部文件
4. 绑定自定义域名 + 配 CDN

### 1.6 GitHub Pages（手动选择发布）

`.github/workflows/deploy.yml` 仅响应 `workflow_dispatch`，push 不会自动发布。先在实际仓库 Settings → Pages 中选择 GitHub Actions，再在 Actions 手动运行 Deploy。

工作流读取 Pages 配置的 `base_path`，支持根站点、项目子路径与配置好的自定义域名，运行 `verify:all` 和脚本行为测试，再构建并上传。SW 注册、预缓存与 manifest 都按部署路径解析；本地开发不注册 SW。

发布前需要认可该仓库和目标站点；本地构建成功不等于已发布或已通过真实浏览器验证。Pages 的 `404.html` 与入口相同，未知路径仍返回 HTTP 404。烟测显式使用 `SMOKE_PLATFORM=github-pages`，必须确认 fallback 内容与入口完全一致、构建 JS/图标/SW 可访问、manifest 的起点和范围正确。任一步失败都会使工作流失败。

Pages 不提供自定义响应头；烟测验证入口 meta CSP，不能把这项平台限制视为已经具备 HSTS、frame-ancestors 等自定义头能力。需要完整响应头控制时使用其他静态托管或反向代理。

手动验证子路径构建：

```bash
VITE_BASE=/your-repo/ npm run build
npm run preview -- --host 127.0.0.1
STAGING_URL=http://127.0.0.1:4173/your-repo/ SMOKE_SKIP_SECURITY_HEADERS=1 npm run smoke:deploy
```

此为本地预览检查；真实 Pages 的 HTTP 404 行为须发布后验证。

## 2. Content Security Policy

当前入口 `index.html` 含 meta CSP。部署者添加响应头时应以实际入口为依据，避免两个策略叠加后阻止模型调用。当前配置如下，保留了 HTTPS 模型出站和本机服务地址：

```text
default-src 'self';
script-src 'self' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://flk.npc.gov.cn;
font-src 'self' data:;
connect-src 'self' https: http://localhost:* http://127.0.0.1:* http://[::1]:* ws://localhost:* ws://127.0.0.1:*;
frame-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
```

- `connect-src` 只设为 `'self'` 会阻止外部模型服务；若实例仅使用特定服务，可改成明确的受信任地址并重新验证。
- 当前 `script-src` 保留 `'unsafe-eval'`，这不表示已证明每个运行环境都需要它，也不等于严格脚本隔离。收紧时须验证实际构建、PDF 和 3D 功能。
- meta CSP 不能提供 `frame-ancestors` 响应头能力。支持自定义响应头的托管环境可配置防嵌入策略，并检查实际响应。
- HTTPS 页面连接本机 HTTP 服务还受浏览器策略和 CORS 影响；CSP 允许不代表请求一定可达。

项目目前没有可供切换的后端代理，也不承诺未来代理或账号方案。

## 3. 缓存策略

| 资源类型 | Cache-Control | 理由 |
|---|---|---|
| `/index.html` | `no-cache, no-store, must-revalidate` | 每次发布新版本要立刻生效 |
| `/assets/*` (Vite hash 化) | `public, max-age=31536000, immutable` | 文件名带 hash,永久缓存 |
| `/favicon.svg` / `/og-image.svg` | `public, max-age=86400` | 可能换,但不是高频 |
| `/manifest.webmanifest` | `public, max-age=3600` | 偶尔更新 |

以上路径以根部署为例，子路径需加部署前缀。只有构建生成且文件名带 hash 的资源适合长期 immutable 缓存；`public/` 中直接复制的图标、SW、启动脚本和 manifest 不采用这项假设。更新 SW 与入口后需验证新旧资源切换。

## 4. 本地诊断与数据边界

应用不会自动发送错误日志、Web Vitals 或用户统计。旧版 `law-universe:client-log-endpoint` 配置不再开启上报。排错使用本地浏览器控制台；提交日志前删除 API Key、资料正文与个人信息。部署者若另行接入监控，须同步更新隐私说明并独立评估采集范围。

## 5. 部署后 smoke test

```bash
STAGING_URL=https://your-host.example/ npm run smoke:deploy
# GitHub Pages：支持实际根路径或子路径 URL
STAGING_URL=https://your-name.github.io/your-repo/ SMOKE_PLATFORM=github-pages npm run smoke:deploy
```

脚本要求显式目标，不访问内置示例域名。它检查入口、manifest、全部 manifest 图标、SW、early-boot、入口 JS 和匹配的 SPA fallback；标准托管额外验证 4 个安全响应头。Pages 使用其实际 HTTP 404 和 meta CSP 约束，不忽略失败。

`SMOKE_SKIP_SECURITY_HEADERS=1` 仅用于没有反向代理响应头的本地 preview，不代表生产安全头验收。还需实际浏览器检查导入、审核、学习入口和刷新行为。

## 6. 故障预案

| 症状 | 排查 |
|---|---|
| 刷新任何 URL 都 404 | SPA fallback 没配(看 1.x 章节) |
| 浏览器扩展报警告 CSP | CSP 配错(看 2 章节) |
| LLM 抽取失败:CORS / Mixed Content | 公网服务使用 HTTPS，并检查服务端 CORS、入口 CSP 与浏览器错误；本机 HTTP 服务仍需实际验证 |
| Obsidian 同步失败 | 仅 Chrome / Edge 支持 File System Access API,Safari 暂不支持 |
| 用户报"卡顿" | 卫星数量 > 500 时建议关掉卫星(HUD `<Satellite />` 按钮) |
| 用户报"我的数据没了" | 引导用户检查是否清过浏览器数据 / 换设备 → 用"数据备份"恢复 |

## 7. 升级与回滚

1. 保留上一份可用构建和对应源代码，提醒使用者备份本地学习数据。
2. 对新版本运行项目门禁，再在预览或测试实例核对导入、抽取、报告、刷新和 SW 更新行为。
3. 明确选择目标平台后手动发布。GitHub Pages 运行 Deploy 工作流；其他平台使用其配置好的发布流程。
4. 用实际发布 URL 运行烟测，复查浏览器错误和用户反馈。应用没有 Sentry 或自动错误上报，不能把无上报视为无故障。
5. 需要回滚时重新发布已保留的构建，并验证 SW 缓存及本地数据兼容性。平台的回滚能力由实际配置决定。

## 8. 域名与日志

示例中的 `*.example.com` 仅为占位符，不是项目线上站点。使用自己控制的域名和 HTTPS，核对 DNS、证书、静态资源路径及托管访问日志设置。访问日志由部署平台管理，不能据应用未发送遥测推断平台也没有记录请求。
