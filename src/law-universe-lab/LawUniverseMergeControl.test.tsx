import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LawUniverseMergeControl } from "./LawUniverseMergeControl";
import type { UserExtraction } from "./userDataTypes";
import type { ReviewableSatellite } from "./useUserSatellites";
const db = vi.hoisted(() => ({ listExtractions: vi.fn(), replaceExtractions: vi.fn(), putExtraction: vi.fn() }));
vi.mock("./legalUniverseUserDb", () => db);
const extraction = (id: string): UserExtraction => ({ id, sourceDocId: id, status: "succeeded", startedAt: 0, reviewed: false, concepts: [{ title: "合同", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }, { title: "责任", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }], relations: [] });
const sat = (ext: UserExtraction): ReviewableSatellite => ({ id: `${ext.id}::0`, extractionId: ext.id, sourceDocId: ext.sourceDocId, fileName: "test.txt", concept: ext.concepts[0], reviewed: false, startedAt: 0, displaySystem: "civil", confidence: 50 });
function setup() {
  const keep = extraction("keep"), other = extraction("other");
  const main = sat(keep), removed = sat(other);
  db.listExtractions.mockResolvedValue([keep, other]);
  const pushUndo = vi.fn(), onMerged = vi.fn();
  render(<LawUniverseMergeControl satellite={main} extraction={keep} group={{ normalizedTitle: "合同", displayTitle: "合同", satellites: [main, removed], primary: main }} onMerged={onMerged} pushUndo={pushUndo} />);
  fireEvent.click(screen.getByText("重复概念 · 1"));
  fireEvent.click(screen.getByTestId("law-universe-merge-btn"));
  return { keep, other, pushUndo, onMerged };
}
beforeEach(() => { vi.resetAllMocks(); db.replaceExtractions.mockResolvedValue(undefined); db.putExtraction.mockResolvedValue(undefined); });
describe("merge control persistence", () => {
  it("atomically deletes the duplicate in its source and pushes undo after commit", async () => {
    const { onMerged, pushUndo } = setup();
    await waitFor(() => expect(onMerged).toHaveBeenCalled());
    expect(db.putExtraction).not.toHaveBeenCalled();
    expect(db.replaceExtractions).toHaveBeenCalledTimes(1);
    const [before, after] = db.replaceExtractions.mock.calls[0];
    expect(before.find((e: UserExtraction) => e.id === "keep").concepts).toHaveLength(2);
    expect(after.find((e: UserExtraction) => e.id === "keep").concepts).toHaveLength(2);
    expect(after.find((e: UserExtraction) => e.id === "other").concepts).toHaveLength(1);
    expect(pushUndo).toHaveBeenCalledWith(expect.objectContaining({ type: "merge", before, after }));
  });
  it("shows transaction failure and never adds a false undo or success", async () => {
    db.replaceExtractions.mockRejectedValue(new Error("资料已变化，请重试"));
    const { onMerged, pushUndo } = setup();
    await screen.findByRole("alert");
    expect(pushUndo).not.toHaveBeenCalled();
    expect(onMerged).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("资料已变化");
  });
});
