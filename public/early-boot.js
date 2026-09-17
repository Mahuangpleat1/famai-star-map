// 早期启动脚本 —— 从 index.html 外链引入。
// 存在原因:CSP script-src 'self' 'unsafe-eval'(无 unsafe-inline)会拦截 inline <script>,
// 启动逻辑必须放在同源外部文件里才能执行。src/test/index-html-csp.test.ts 有防回归。

// DOM 就绪后隐藏 pre-shell 启动屏,避免"加载中"文案永久悬浮。
// 路径由 App 统一处理,包括子路径入口和旧链接。
(function () {
  function hide() {
    document.body.classList.add("app-mounted");
  }
  // Deferred classic scripts run at "interactive", before deferred modules
  // finish. Keep the shell until DOMContentLoaded in both pending states.
  if (document.readyState !== "complete") {
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
