import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LawUniverseLabPage } from "./LawUniverseLabPage";
import { __resetDBForTests, getExtraction, putExtraction, putSourceDoc } from "./legalUniverseUserDb";
import type { ReviewableSatellite } from "./useUserSatellites";
vi.mock("./LawUniverseScene", () => ({ LawUniverseScene: ({ satellites, onSelectSatellite }: {satellites: ReviewableSatellite[]; onSelectSatellite: (sat: ReviewableSatellite) => void}) => <button onClick={() => onSelectSatellite(satellites[0])} disabled={!satellites.length}>打开测试卫星</button> }));
window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
beforeEach(async () => {
  await __resetDBForTests();
  await putSourceDoc({ id: "doc", fileName: "学习.md", mimeType: "text/markdown", sizeBytes: 30, content: "学习", uploadedAt: 1, status: "extracted", extractionId: "ext" });
  await putExtraction({ id: "ext", sourceDocId: "doc", status: "succeeded", startedAt: 1, reviewed: false, concepts: ["合同", "履行", "违约"].map((title, i) => ({id: `ext::${i}`, title, type: "principle", system: "civil", importance: 50, summary: title, keyPoints: []})), relations: [{source: "合同", target: "履行", sourceConceptId: "ext::0", targetConceptId: "ext::1", type: "依据", strength: 50, citation: "第一段"}, {source: "合同", target: "违约", sourceConceptId: "ext::0", targetConceptId: "ext::2", type: "依据", strength: 50, citation: "第二段"}] });
});
afterEach(async () => { cleanup(); await __resetDBForTests(); });
it("关系连续删除会刷新详情与主图，不会重新写回已删关系", async () => {
  render(<LawUniverseLabPage />);
  const open = screen.getByRole("button", {name: "打开测试卫星"});
  await waitFor(() => expect(open).toBeEnabled());
  fireEvent.click(open);
  const editor = await screen.findByTestId("law-universe-relation-editor");
  const rows = within(editor).getAllByTestId("law-universe-relation-item");
  fireEvent.click(within(rows[0]).getByRole("button", {name: /删除/}));
  await waitFor(() => expect(within(editor).getAllByTestId("law-universe-relation-item")).toHaveLength(1));
  await waitFor(() => expect(screen.getByTestId("law-universe-page")).toHaveAttribute("data-user-relation-count", "1"));
  fireEvent.click(within(editor).getByRole("button", {name: /删除/}));
  await waitFor(() => expect(within(editor).queryAllByTestId("law-universe-relation-item")).toHaveLength(0));
  expect((await getExtraction("ext"))?.relations).toHaveLength(0);
  await waitFor(() => expect(screen.getByTestId("law-universe-page")).toHaveAttribute("data-user-relation-count", "0"));
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
});
