import { getConceptId } from "./legalUniverseConceptIdentity";
import { getExtraction, replaceExtractions } from "./legalUniverseUserDb";
import type { UndoOperation } from "./useUndoStack";

/** Apply before removing the undo entry; a failed transaction leaves it retryable. */
export async function applyLearningUndo(op: UndoOperation): Promise<boolean> {
  if (op.type === "merge") {
    await replaceExtractions(op.after, op.before);
    return true;
  }
  if (op.type !== "move") return false;
  const extraction = await getExtraction(op.extractionId);
  if (!extraction) throw new Error("源资料已变化，无法撤销此操作");
  const index = op.conceptId
    ? extraction.concepts.findIndex((c, i) => getConceptId(extraction.id, c, i) === op.conceptId)
    : op.conceptIndex;
  if (index < 0 || index >= extraction.concepts.length || extraction.concepts[index].system !== op.toSystem) throw new Error("概念已被其他操作修改，未覆盖当前结果");
  const concepts = extraction.concepts.map((c, i) => i === index ? { ...c, system: op.fromSystem as typeof c.system } : c);
  await replaceExtractions([extraction], [{ ...extraction, concepts }]);
  return true;
}
