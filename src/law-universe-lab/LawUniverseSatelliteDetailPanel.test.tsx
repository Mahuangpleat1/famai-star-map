/**
 * LawUniverseSatelliteDetailPanel 单元测试。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetDBForTests } from "./legalUniverseUserDb";
import { LawUniverseSatelliteDetailPanel } from "./LawUniverseSatelliteDetailPanel";
import type { ReviewableSatellite } from "./useUserSatellites";
import type { UserExtraction } from "./userDataTypes";

const fakeSatellite: ReviewableSatellite = {
  id: "ext1::0",
  extractionId: "ext1",
  sourceDocId: "doc1",
  fileName: "民法总论.md",
  concept: {
    title: "善意取得",
    type: "principle",
    system: "civil",
    importance: 85,
    summary: "无权处分人将动产或不动产转让给善意第三人时，善意第三人在符合条件下取得所有权。",
    keyPoints: ["受让人须为善意", "以合理价格转让"]
  },
  reviewed: false,
  startedAt: 1700000000000,
  displaySystem: "civil",
  confidence: 50
};

const fakeExtraction: UserExtraction = {
  id: "ext1",
  sourceDocId: "doc1",
  status: "succeeded",
  startedAt: 1700000000000,
  completedAt: 1700000005000,
  concepts: [],
  relations: [],
  reviewed: false
};

describe("LawUniverseSatelliteDetailPanel", () => {
  beforeEach(async () => {
    await __resetDBForTests();
  });

  it("渲染 concept 字段", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.getByText("善意取得")).toBeDefined();
    expect(screen.getByText(/无权处分人/)).toBeDefined();
    expect(screen.getByText("受让人须为善意")).toBeDefined();
    expect(screen.getByText("以合理价格转让")).toBeDefined();
    expect(screen.getByText(/民法总论\.md/)).toBeDefined();
    expect(screen.getByText("重要度 85")).toBeDefined();
    expect(screen.getByText("原则")).toBeDefined();
    expect(screen.getByText("民法典")).toBeDefined();
  });

  it("未审核显示未审核 badge", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.getByText("未审核")).toBeDefined();
    expect(screen.getByText("标记已审核")).toBeDefined();
  });

  it("已审核显示已审核 badge 和取消审核按钮", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={{ ...fakeSatellite, reviewed: true }}
        extraction={{ ...fakeExtraction, reviewed: true }}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.getByText("已审核")).toBeDefined();
    expect(screen.getByText("取消审核")).toBeDefined();
  });

  it("点击 close 触发 onClose", () => {
    const onClose = vi.fn();
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={onClose}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    fireEvent.click(screen.getByLabelText("关闭卫星详情"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("点击跳转到抽取结果触发 callback", () => {
    const onJump = vi.fn();
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={onJump}
        onReviewedChange={() => {}}
      />
    );
    fireEvent.click(screen.getByTestId("law-universe-satellite-jump"));
    expect(onJump).toHaveBeenCalledWith("ext1");
  });

  it("点击标记已审核触发 toggle + writeback + onReviewedChange", async () => {
    const onReviewedChange = vi.fn();
    const dbModule = await import("./legalUniverseUserDb");
    const spy = vi.spyOn(dbModule, "putExtraction");
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={onReviewedChange}
      />
    );
    fireEvent.click(screen.getByTestId("law-universe-satellite-toggle-reviewed"));
    await new Promise((r) => setTimeout(r, 50));
    expect(spy).toHaveBeenCalledWith({ ...fakeExtraction, reviewed: true });
    expect(onReviewedChange).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("unclassified system 显示'未分类'", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={{ ...fakeSatellite, displaySystem: "unclassified" }}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.getByText("未分类")).toBeDefined();
  });

  it("无 keyPoints 时不渲染要点 section", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={{ ...fakeSatellite, concept: { ...fakeSatellite.concept, keyPoints: [] } }}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.queryByText("要点")).toBeNull();
  });

  it("无 summary 时不渲染 summary 段", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={{ ...fakeSatellite, concept: { ...fakeSatellite.concept, summary: "" } }}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.queryByText(/无权处分人/)).toBeNull();
  });

  it("onUndoMove 未传时不渲染撤销按钮", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
      />
    );
    expect(screen.queryByTestId("law-universe-satellite-undo-move")).toBeNull();
  });

  it("onUndoMove 传入时显示撤销按钮 + 显示秒数", () => {
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
        onUndoMove={() => {}}
        undoSecondsLeft={3}
      />
    );
    expect(screen.getByTestId("law-universe-satellite-undo-move")).toBeDefined();
    expect(screen.getByText(/撤销归类/)).toBeDefined();
    expect(screen.getByText(/3s/)).toBeDefined();
  });

  it("点击撤销按钮触发 onUndoMove", () => {
    const onUndo = vi.fn();
    render(
      <LawUniverseSatelliteDetailPanel
        satellite={fakeSatellite}
        extraction={fakeExtraction}
        onClose={() => {}}
        onJumpToExtraction={() => {}}
        onReviewedChange={() => {}}
        onUndoMove={onUndo}
        undoSecondsLeft={4}
      />
    );
    fireEvent.click(screen.getByTestId("law-universe-satellite-undo-move"));
    expect(onUndo).toHaveBeenCalledOnce();
  });
});
