import { expect, test, type Locator, type Page } from "@playwright/test";

test.describe.configure({ timeout: 60_000 });

async function gotoLawUniverse(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "关闭引导" }).click();

  const pageRoot = page.getByTestId("law-universe-page");
  const canvas = page.locator('canvas[data-testid="law-universe-canvas"]');

  await expect(pageRoot).toBeVisible({ timeout: 15_000 });
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  await expect(canvas).toHaveAttribute("data-renderer", "three-webgl");
  await expect(canvas).toHaveAttribute("data-scene-ready", "true");

  return { pageRoot, canvas };
}

async function expectFocusedNode(pageRoot: Locator, id: string) {
  await expect(pageRoot).toHaveAttribute("data-selected-node", id);
  await expect(pageRoot).toHaveAttribute("data-focused-node", id, { timeout: 15_000 });
  await expect(pageRoot).toHaveAttribute("data-camera-target-id", id);
  await expect(pageRoot).toHaveAttribute("data-camera-state", "focused", { timeout: 15_000 });
}

test("root route opens the Chinese legal universe in overview", async ({ page }) => {
  const { pageRoot, canvas } = await gotoLawUniverse(page);

  await expect(pageRoot).toHaveAttribute("data-view-mode", "overview");
  await expect(pageRoot).toHaveAttribute("data-view-state", "universeOverview");
  await expect(pageRoot).toHaveAttribute("data-selected-node", "universe-core");
  await expect(pageRoot).toHaveAttribute("data-node-count", "610");
  await expect(pageRoot).toHaveAttribute("data-edge-count", "969");
  await expect(pageRoot).toHaveAttribute("data-system-count", "11");
  await expect(pageRoot).toHaveAttribute("data-focused-system", "universe");
  await expect(pageRoot).toHaveAttribute("data-active-edge-count", /\d+/);
  await expect(pageRoot).toHaveAttribute("data-focus-ignition-key", "0");
  await expect(canvas).toHaveAttribute("data-renderer", "three-webgl");
  await expect(page.getByTestId("law-universe-cinematic-copy")).toContainText("中国法学宇宙");
  await expect(page.getByRole("button", { name: "聚焦 刑法" })).toBeVisible();
  await expect(page.getByRole("button", { name: "聚焦 民法典" })).toBeVisible();
  await expect(page.getByRole("button", { name: "聚焦 宪法" })).toBeVisible();
});

test("system labels focus major legal solar systems and Escape returns overview", async ({ page }) => {
  const { pageRoot } = await gotoLawUniverse(page);

  await page.getByRole("button", { name: "聚焦 刑法" }).click();
  await expectFocusedNode(pageRoot, "system-criminal");
  await expect(pageRoot).toHaveAttribute("data-focus-ignition-key", "1");
  await expect(pageRoot).toHaveAttribute("data-view-mode", "system");
  await expect(pageRoot).toHaveAttribute("data-view-state", "systemFocus");
  await expect(pageRoot).toHaveAttribute("data-focused-system", "system-criminal");
  await expect(page.getByTestId("law-universe-detail")).toContainText("刑法");
  await expect(page.getByRole("button", { name: "聚焦 正当防卫" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expectFocusedNode(pageRoot, "universe-core");
  await expect(pageRoot).toHaveAttribute("data-focus-ignition-key", "2");
  await expect(pageRoot).toHaveAttribute("data-view-mode", "overview");
  await expect(pageRoot).toHaveAttribute("data-view-state", "universeOverview");

  await page.getByRole("button", { name: "聚焦 民法典" }).click();
  await expectFocusedNode(pageRoot, "system-civil");
  await expect(page.getByTestId("law-universe-detail")).toContainText("民法典");

  await page.getByRole("button", { name: "聚焦 宪法" }).click();
  await expectFocusedNode(pageRoot, "system-constitution");
  await expect(page.getByTestId("law-universe-detail")).toContainText("宪法");
});

test("concept focus narrows labels and relation buttons can traverse cross-domain edges", async ({ page }) => {
  const { pageRoot } = await gotoLawUniverse(page);

  await page.getByRole("button", { name: "聚焦 刑法" }).click();
  await page.getByRole("button", { name: "聚焦 正当防卫" }).click();
  await expectFocusedNode(pageRoot, "criminal-justifiable-defense");
  await expect(pageRoot).toHaveAttribute("data-view-mode", "concept");
  await expect(pageRoot).toHaveAttribute("data-view-state", "nodeFocus");
  await expect(pageRoot).toHaveAttribute("data-focused-system", "system-criminal");
  await expect(page.getByTestId("law-universe-detail")).toContainText("正当防卫");

  const labelStats = await page.locator(".law-universe-label").evaluateAll((elements) => ({
    total: elements.length,
    visible: elements.filter((element) => element.getAttribute("data-label-visible") === "true").length
  }));
  expect(labelStats.total).toBeLessThanOrEqual(72);
  expect(labelStats.visible).toBeLessThanOrEqual(14);

  const beforeActiveEdges = Number(await pageRoot.getAttribute("data-active-edge-count"));
  await page.getByRole("button", { name: /查看 诉讼法/ }).click();
  await expectFocusedNode(pageRoot, "system-procedure");
  const afterActiveEdges = Number(await pageRoot.getAttribute("data-active-edge-count"));
  expect(afterActiveEdges).not.toBe(beforeActiveEdges);
});

test("reset control returns the universe overview", async ({ page }) => {
  const { pageRoot } = await gotoLawUniverse(page);

  await page.getByRole("button", { name: "聚焦 宪法" }).click();
  await expectFocusedNode(pageRoot, "system-constitution");

  await page.getByRole("group", { name: "中国法学宇宙控制" }).getByRole("button", { name: "重置到中国法学宇宙总览" }).click();
  await expectFocusedNode(pageRoot, "universe-core");
  await expect(pageRoot).toHaveAttribute("data-view-mode", "overview");
});

test("HUD 复习按钮存在,无 quizItems 时 disabled", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "关闭引导" }).click();
  await expect(page.getByTestId("law-universe-page")).toBeVisible({ timeout: 15_000 });

  // 复习按钮存在
  const quizBtn = page.getByTestId("law-universe-hud-quiz");
  await expect(quizBtn).toBeVisible();
  // 空 IndexedDB 下 dueCount=0,按钮 disabled
  await expect(quizBtn).toBeDisabled();
  // aria-label 反映空态
  await expect(quizBtn).toHaveAttribute("aria-label", "暂无到期题");
});

test("HUD 快速抽查按钮存在,点击可打开", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "关闭引导" }).click();
  await expect(page.getByTestId("law-universe-page")).toBeVisible({ timeout: 15_000 });

  const quickBtn = page.getByTestId("law-universe-hud-quick-quiz");
  await expect(quickBtn).toBeVisible();
  await expect(quickBtn).toBeEnabled();
  await quickBtn.click();
  // 旧 LawUniverseQuiz 弹出
  await expect(page.getByTestId("law-universe-quick-quiz")).toBeVisible();
  await expect(page.getByTestId("law-universe-quick-quiz")).toContainText("法学快速抽查");
  // 关闭
  await page.getByTestId("law-universe-quick-quiz-close").click();
});

test("复习会话: 预填 quizItem → 答 1 题 → 总结", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "关闭引导" }).click();
  await expect(page.getByTestId("law-universe-page")).toBeVisible({ timeout: 15_000 });

  // 1. 预填 IndexedDB 一条到期 quizItem
  const quizItemId = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("famai-star-map-user-v1", 3);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const id = `q-test-${Date.now()}`;
    const item = {
      id,
      conceptId: "concept-test",
      conceptTitle: "测试概念",
      payload: { type: "choice", stem: "测试题", options: ["A 对", "B 错", "C 错", "D 错"], correctIndex: 0 },
      spacedRepetition: { easeFactor: 2.5, interval: 0, repetitions: 0, dueAt: Date.now() - 1000 },
      createdAt: Date.now()
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("quizItems", "readwrite");
      tx.objectStore("quizItems").put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return id;
  });
  expect(quizItemId).toBeTruthy();

  try {
    // 2. 刷新页面触发 dueCount 重算
    await page.reload();
    await expect(page.getByTestId("law-universe-page")).toBeVisible({ timeout: 15_000 });

    // 3. 复习按钮可用
    const quizBtn = page.getByTestId("law-universe-hud-quiz");
    await expect(quizBtn).toBeEnabled();
    await expect(quizBtn).toHaveAttribute("aria-label", "开始复习会话,1 题到期");
    await quizBtn.click();

    // 4. 会话对话框
    await expect(page.getByTestId("law-universe-quiz-session")).toBeVisible();
    await expect(page.getByTestId("session-counter")).toHaveText("1 / 1");

    // 5. 选正确 (index 0)
    await page.getByTestId("session-option-0").click();

    // 6. 揭示 → 下一题 → 总结
    await expect(page.getByTestId("session-next")).toBeVisible();
    await page.getByTestId("session-next").click();
    await expect(page.getByTestId("session-summary")).toBeVisible();
    await expect(page.getByTestId("session-summary")).toContainText("正确 1 / 1");

    // 7. 关闭
    await page.getByTestId("session-finish").click();
    await expect(page.getByTestId("law-universe-quiz-session")).not.toBeVisible();
  } finally {
    // 8. 清理
    await page.evaluate(async (id) => {
      const db = await new Promise<IDBDatabase>((resolve) => {
        const req = indexedDB.open("famai-star-map-user-v1", 3);
        req.onsuccess = () => resolve(req.result);
      });
      await new Promise<void>((resolve) => {
        const tx = db.transaction("quizItems", "readwrite");
        tx.objectStore("quizItems").delete(id);
        tx.oncomplete = () => resolve();
      });
      db.close();
    }, quizItemId);
  }
});

test("工作台: 预填 PDF sourceDoc → 工作台列表显示且 upload hint 含 PDF 提示", async ({ page }) => {
  // 由于 Playwright 不内置 PDF fixture,且端到端跑真 pdfjs worker 慢且不必要,
  // 这里直接往 IndexedDB sourceDocs store 写一条 mimeType=application/pdf 的 doc,
  // 验证 WorkbenchPanel 列表能正确渲染 PDF 条目 + upload hint 已更新文案。
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "关闭引导" }).click();
  await expect(page.getByTestId("law-universe-page")).toBeVisible({ timeout: 15_000 });

  const docId = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("famai-star-map-user-v1", 3);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const id = `pdf-test-${Date.now()}`;
    const doc = {
      id,
      fileName: "民法典讲义.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024 * 200,
      content: "民法典是民事基本法律。",
      uploadedAt: Date.now(),
      status: "pending" as const,
      extractionMethod: "native-text" as const
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("sourceDocs", "readwrite");
      tx.objectStore("sourceDocs").put(doc);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return id;
  });
  expect(docId).toBeTruthy();

  try {
    // 打开工作台
    await page.getByTestId("law-universe-hud-workbench").click();
    await expect(page.getByTestId("law-universe-workbench")).toBeVisible();
    // PDF 文档出现在列表里
    await expect(page.getByText("民法典讲义.pdf")).toBeVisible();
    // mimeType 元数据展示为 application/pdf
    await expect(page.getByTestId("law-universe-workbench-inbox")).toContainText("application/pdf");
    // upload hint 已更新,不再含 "PDF 留 TODO"
    await expect(page.getByText(/支持 \.txt \/ \.md \/ \.pdf/)).toBeVisible();
    expect(await page.getByText(/PDF 留 TODO/).count()).toBe(0);
  } finally {
    // 清理
    await page.evaluate(async (id) => {
      const db = await new Promise<IDBDatabase>((resolve) => {
        const req = indexedDB.open("famai-star-map-user-v1", 3);
        req.onsuccess = () => resolve(req.result);
      });
      await new Promise<void>((resolve) => {
        const tx = db.transaction("sourceDocs", "readwrite");
        tx.objectStore("sourceDocs").delete(id);
        tx.oncomplete = () => resolve();
      });
      db.close();
    }, docId);
  }
});
