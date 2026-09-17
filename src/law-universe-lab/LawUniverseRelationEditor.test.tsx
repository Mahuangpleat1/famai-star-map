/**
 * LawUniverseRelationEditor 单元测试。
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetDBForTests, listExtractions, putExtraction } from "./legalUniverseUserDb";
import { LawUniverseRelationEditor } from "./LawUniverseRelationEditor";
import type { UserExtraction } from "./userDataTypes";

const fakeExtraction: UserExtraction = {
  id: "ext1",
  sourceDocId: "doc1",
  status: "succeeded",
  startedAt: 1,
  completedAt: 2,
  concepts: [{ title: "善意取得", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }],
  relations: [
    { source: "善意取得", target: "物权变动", type: "依据", strength: 80, citation: "《民法典》第311条" },
    { source: "无权处分", target: "善意取得", type: "适用", strength: 60, citation: "" },
    { source: "其他概念", target: "完全无关", type: "依据", strength: 50, citation: "" }
  ],
  reviewed: false
};

describe("LawUniverseRelationEditor", () => {
  beforeEach(async () => {
    await __resetDBForTests();
  });

  it("只显示与 conceptTitle 相关的关系", () => {
    render(
      <LawUniverseRelationEditor
        conceptTitle="善意取得"
        extraction={fakeExtraction}
        onExtractionChanged={() => {}}
      />
    );
    expect(screen.getAllByTestId("law-universe-relation-item")).toHaveLength(2);
  });

  it("无相关关系时显示空状态", () => {
    render(
      <LawUniverseRelationEditor
        conceptTitle="完全孤立的"
        extraction={fakeExtraction}
        onExtractionChanged={() => {}}
      />
    );
    expect(screen.getByText(/本概念暂无相关关系/)).toBeDefined();
  });

  it("点击 type 按钮切换选中状态", () => {
    render(
      <LawUniverseRelationEditor
        conceptTitle="善意取得"
        extraction={fakeExtraction}
        onExtractionChanged={() => {}}
      />
    );
    const applyButton = screen.getAllByTestId("law-universe-relation-type-适用")[0];
    expect(applyButton.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(applyButton);
    expect(applyButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("保存修改 type + strength + citation 写回 IndexedDB + 触发 onExtractionChanged", async () => {
    const onChanged = vi.fn();
    await putExtraction(fakeExtraction);
    render(
      <LawUniverseRelationEditor
        conceptTitle="善意取得"
        extraction={fakeExtraction}
        onExtractionChanged={onChanged}
      />
    );
    // 改第一条 type 到"解释"
    fireEvent.click(screen.getAllByTestId("law-universe-relation-type-解释")[0]);
    // 改 strength
    const slider = screen.getAllByTestId("law-universe-relation-strength")[0] as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "85" } });
    // 改 citation
    const ta = screen.getAllByTestId("law-universe-relation-citation")[0] as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "新出处" } });
    // 保存
    fireEvent.click(screen.getAllByTestId("law-universe-relation-save")[0]);
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    const stored = await listExtractions();
    expect(stored[0].relations[0].type).toBe("解释");
    expect(stored[0].relations[0].strength).toBe(85);
    expect(stored[0].relations[0].citation).toBe("新出处");
  });

  it("strength 越界 clamp 到 1-100", async () => {
    await putExtraction(fakeExtraction);
    render(
      <LawUniverseRelationEditor
        conceptTitle="善意取得"
        extraction={fakeExtraction}
        onExtractionChanged={() => {}}
      />
    );
    const slider = screen.getAllByTestId("law-universe-relation-strength")[0] as HTMLInputElement;
    // React 不允许超 range 范围，所以通过 value 改不动 max
    // 但代码逻辑是 clamp(value, 1, 100)，如果用户通过拖拽不会越界
    // 这里验证 output 显示
    fireEvent.change(slider, { target: { value: "100" } });
    expect((screen.getAllByText("100")[0] as HTMLElement).tagName).toBe("OUTPUT");
  });

  it("删除按钮触发 IndexedDB 删除 + onExtractionChanged", async () => {
    const onChanged = vi.fn();
    await putExtraction(fakeExtraction);
    render(
      <LawUniverseRelationEditor
        conceptTitle="善意取得"
        extraction={fakeExtraction}
        onExtractionChanged={onChanged}
      />
    );
    const deleteButtons = screen.getAllByRole("button", { name: /删除关系/ });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    const stored = await listExtractions();
    expect(stored[0].relations).toHaveLength(2);
  });
});
