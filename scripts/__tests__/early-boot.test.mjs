import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";

const code = await readFile(new URL("../../public/early-boot.js", import.meta.url), "utf8");

for (const path of ["/", "/project/index.html", "/legacy-route", "/unknown"]) {
  for (const readyState of ["loading", "interactive", "complete"]) {
    test(`startup preserves SPA content at ${path} while ${readyState}`, () => {
      const classes = new Set();
      const root = { innerHTML: "existing SPA content" };
      const listeners = {};
      const frames = [];
      const timers = [];
      vm.runInNewContext(code, {
        window: { location: { pathname: path } },
        document: {
          readyState,
          body: { classList: { add: name => classes.add(name) } },
          getElementById: id => id === "root" ? root : null,
          addEventListener: (name, callback) => { listeners[name] = callback; }
        },
        requestAnimationFrame: callback => frames.push(callback),
        setTimeout: callback => timers.push(callback)
      });
      assert.equal(root.innerHTML, "existing SPA content");
      assert.equal(classes.has("app-route-miss"), false);
      assert.equal(classes.has("app-mounted"), false);
      if (readyState !== "complete") {
        assert.equal(frames.length, 0, "wait for deferred modules before hiding the shell");
        assert.equal(timers.length, 0);
        listeners.DOMContentLoaded();
      }
      assert.equal(frames.length, 1);
      frames[0]();
      assert.equal(timers.length, 1);
      timers[0]();
      assert.equal(classes.has("app-mounted"), true);
      assert.equal(classes.has("app-route-miss"), false);
      assert.equal(root.innerHTML, "existing SPA content");
    });
  }
}
