// 早期启动脚本 —— 从 index.html 外链引入。
// 存在原因:CSP script-src 'self' 'unsafe-eval'(无 unsafe-inline)会拦截 inline <script>,
// 这两段逻辑必须放在同源外部文件里才能执行。src/test/index-html-csp.test.ts 有防回归。

// 1) React 挂载后隐藏 pre-shell 启动屏,避免"加载中"文案永久悬浮。
(function () {
  function hide() {
    document.body.classList.add("app-mounted");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(function () {
        setTimeout(hide, 100);
      });
    });
  } else {
    requestAnimationFrame(function () {
      setTimeout(hide, 100);
    });
  }
})();

// 2) 404 友好降级 —— SPA fallback 后任意路径都回 index.html,
//    但用户访问的可能是死链 / 拼错 URL。这里在 React 启动前拦截,给友好提示 + 回到 /。
//    已知保留路径(React 会读 URL hash 切状态):以 "/" 结尾的入口路径。
(function () {
  try {
    var path = window.location.pathname;
    // 根路径与子路径站点根(GitHub Pages 的 /<repo>/)放过:以 "/" 结尾视为站点内合法入口
    if (path.endsWith("/")) {
      return;
    }
    // 静态资源路径放过(JS / CSS / SVG / 图片 / 字体 / 清单) —— 它们真的存在,不会 404
    if (/\.(?:js|css|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|map|webmanifest|json|txt|md|pdf)$/i.test(path)) {
      return;
    }
    // 其他路径(用户手输 / 旧链接 / 拼错) → 注入降级 UI
    var root = document.getElementById("root");
    if (!root) return;
    document.body.classList.add("app-route-miss");
    root.innerHTML =
      '<main class="app-route-miss" role="alert" aria-live="polite" data-testid="app-route-miss">' +
      '  <div class="app-route-miss__panel">' +
      '    <h1 class="app-route-miss__title">这条路径不存在</h1>' +
      '    <p class="app-route-miss__hint">法脉星图是单页应用,所有功能都在首页。</p>' +
      '    <p class="app-route-miss__path">你访问的是: <code>' +
      path.replace(/[<>&"]/g, function (c) {
        return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c];
      }) +
      "</code></p>" +
      '    <a class="app-route-miss__btn" href="/">回到首页</a>' +
      "  </div>" +
      "</main>";
  } catch {
    // 任何异常都静默,让 React 正常接管
  }
})();
