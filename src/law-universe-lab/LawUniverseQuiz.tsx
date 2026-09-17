import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X as XIcon, RefreshCcw, Trophy, X } from "lucide-react";
import {
  getLegalUniverseNodeById,
  legalUniverseNodes,
  legalUniverseSystems
} from "../../data/legalUniverseData";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-quiz.css";

interface QuizQuestion {
  id: string;
  prompt: string;
  context: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  sourceNodeId: string;
}

type QuizSource = "all" | string;

const OPTION_DISTRACTOR_PREFIXES = ["广义", "狭义", "直接", "间接", "形式", "实质", "普通", "特别", "公法", "私法", "实体", "程序"];

function pickDistractors(correct: string, pool: string[], count: number): string[] {
  const candidates = pool.filter((candidate) => candidate !== correct && candidate.length > 0);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateQuestions(source: QuizSource, count: number): QuizQuestion[] {
  const eligible = legalUniverseNodes.filter((node) => {
    if (source !== "all" && node.systemId !== source) return false;
    if (node.type === "universe-core" || node.type === "system-sun") return false;
    if (!node.title || !node.shortDescription) return false;
    return true;
  });
  const eligibleByDomain = eligible.filter((node) => node.type === "concept" || node.type === "rule" || node.type === "institution");
  const pool = eligibleByDomain.length >= count ? eligibleByDomain : eligible;

  const allTitles = pool.map((node) => node.title);
  const systemTitles = legalUniverseSystems.map((system) => system.title);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count && i < pool.length; i += 1) {
    const node = pool[i];
    const correctAnswer = node.title;
    const distractors = pickDistractors(correctAnswer, allTitles, 3);
    if (distractors.length < 3) {
      // pad with system titles
      for (const systemTitle of systemTitles) {
        if (distractors.length >= 3) break;
        if (systemTitle === correctAnswer) continue;
        if (distractors.includes(systemTitle)) continue;
        distractors.push(systemTitle);
      }
    }
    if (distractors.length < 3) {
      // pad with prefix variants
      for (const prefix of OPTION_DISTRACTOR_PREFIXES) {
        if (distractors.length >= 3) break;
        const candidate = `${prefix}${correctAnswer}`;
        if (candidate === correctAnswer) continue;
        if (distractors.includes(candidate)) continue;
        distractors.push(candidate);
      }
    }
    if (distractors.length < 3) continue;

    const systemTitle = legalUniverseSystems.find((s) => s.id === node.systemId)?.title ?? "中国法学体系";
    const prompt = `下列哪一项属于「${systemTitle}」的核心节点?`;
    const options = [...distractors.slice(0, 3), correctAnswer].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer);

    questions.push({
      id: `q-${node.id}-${i}`,
      prompt,
      context: node.shortDescription,
      options,
      correctIndex,
      rationale: `「${correctAnswer}」位于 ${systemTitle} 太阳系,${node.shortDescription}`,
      sourceNodeId: node.id
    });
  }

  return questions;
}

interface LawUniverseQuizProps {
  open: boolean;
  onClose: () => void;
  onSelectNode: (id: string) => void;
}

const QUESTION_COUNT = 8;

export function LawUniverseQuiz({ open, onClose, onSelectNode }: LawUniverseQuizProps) {
  const [source, setSource] = useState<QuizSource>("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // 完整焦点陷阱
  useFocusTrap(panelRef, open, { onEscape: onClose });

  useEffect(() => {
    if (!open) {
      setQuestions([]);
      setActiveIndex(0);
      setSelectedIndex(null);
      setAnswers({});
      setRevealed(false);
      setScore(0);
    } else {
      const next = generateQuestions(source, QUESTION_COUNT);
      setQuestions(next);
      setActiveIndex(0);
      setSelectedIndex(null);
      setAnswers({});
      setRevealed(false);
      setScore(0);
    }
  }, [open, source]);

  if (!open) return null;

  const current = questions[activeIndex];
  const isLast = activeIndex >= questions.length - 1;
  const isFinished = activeIndex >= questions.length;
  const answeredCorrectly = score;

  return (
    <div className="law-universe-quiz" data-testid="law-universe-quick-quiz" role="dialog" aria-modal="true" aria-label="法学快速抽查">
      <button type="button" className="law-universe-quiz__scrim" onClick={onClose} aria-label="关闭快速抽查" />
      <div ref={panelRef} className="law-universe-quiz__panel">
        <header className="law-universe-quiz__head">
          <Trophy aria-hidden="true" size={16} strokeWidth={1.8} />
          <span className="law-universe-quiz__title">法学快速抽查</span>
          <span className="law-universe-quiz__counter">
            {isFinished ? `${questions.length} / ${questions.length}` : `${activeIndex + 1} / ${questions.length}`}
          </span>
          {score > 0 ? (
            <span className="law-universe-quiz__score" data-testid="law-universe-quick-score">
              正确 {score}
            </span>
          ) : null}
          <button
            type="button"
            className="law-universe-quiz__close"
            onClick={onClose}
            aria-label="关闭测验"
            data-testid="law-universe-quick-quiz-close"
          >
            <X aria-hidden="true" size={13} strokeWidth={1.8} />
          </button>
        </header>

        {!isFinished ? (
          <>
            <div className="law-universe-quiz__source">
              <label>
                范围
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  data-testid="law-universe-quick-source"
                >
                  <option value="all">全部太阳系</option>
                  {legalUniverseSystems.map((system) => (
                    <option key={system.id} value={system.id}>{system.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="law-universe-quiz__body" data-testid="law-universe-quick-question">
              <h3>{current.prompt}</h3>
              <p className="law-universe-quiz__context">{current.context}</p>
              <ol className="law-universe-quiz__options">
                {current.options.map((option, index) => {
                  const isSelected = selectedIndex === index;
                  const showCorrect = revealed && index === current.correctIndex;
                  const showWrong = revealed && isSelected && index !== current.correctIndex;
                  return (
                    <li key={`${current.id}-${index}`}>
                      <button
                        type="button"
                        className={`law-universe-quiz__option ${isSelected ? "is-selected" : ""} ${showCorrect ? "is-correct" : ""} ${showWrong ? "is-wrong" : ""}`}
                        onClick={() => {
                          if (!revealed) {
                            setSelectedIndex(index);
                            setAnswers((current2) => ({ ...current2, [current.id]: index }));
                          }
                        }}
                        disabled={revealed}
                        data-testid={`law-universe-quick-option-${index}`}
                      >
                        <span className="law-universe-quiz__option-letter">{String.fromCharCode(65 + index)}</span>
                        <span>{option}</span>
                        {showCorrect ? <CheckCircle2 aria-hidden="true" size={14} strokeWidth={2} /> : null}
                        {showWrong ? <XIcon aria-hidden="true" size={14} strokeWidth={2} /> : null}
                      </button>
                    </li>
                  );
                })}
              </ol>

              {revealed ? (
                <div className="law-universe-quiz__rationale" data-testid="law-universe-quick-rationale">
                  <p>{current.rationale}</p>
                  <button
                    type="button"
                    className="law-universe-quiz__jump"
                    onClick={() => onSelectNode(current.sourceNodeId)}
                    data-testid="law-universe-quick-jump"
                  >
                    跳到该节点详细查看
                  </button>
                </div>
              ) : null}

              <div className="law-universe-quiz__actions">
                {!revealed ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIndex === null) return;
                      setRevealed(true);
                      if (selectedIndex === current.correctIndex) {
                        setScore((current2) => current2 + 1);
                      }
                    }}
                    disabled={selectedIndex === null}
                    data-testid="law-universe-quick-submit"
                  >
                    提交
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRevealed(false);
                      setSelectedIndex(null);
                      if (isLast) {
                        setActiveIndex(questions.length);
                      } else {
                        setActiveIndex((current2) => current2 + 1);
                      }
                    }}
                    data-testid="law-universe-quick-next"
                  >
                    {isLast ? "查看结果" : "下一题"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="law-universe-quiz__result" data-testid="law-universe-quick-result">
            <h3>本轮成绩</h3>
            <p className="law-universe-quiz__result-score">
              {answeredCorrectly} / {questions.length} · 正确率 {Math.round((answeredCorrectly / Math.max(1, questions.length)) * 100)}%
            </p>
            <ul>
              {questions.map((question) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctIndex;
                const nodeTitle = getLegalUniverseNodeById(question.sourceNodeId)?.title ?? question.sourceNodeId;
                return (
                  <li key={question.id} className={isCorrect ? "is-correct" : "is-wrong"}>
                    <span>{isCorrect ? "✓" : "✗"} {nodeTitle}</span>
                    {!isCorrect ? (
                      <button type="button" onClick={() => onSelectNode(question.sourceNodeId)} className="law-universe-quiz__jump-small">
                        复习
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="law-universe-quiz__restart"
              onClick={() => {
                const next = generateQuestions(source, QUESTION_COUNT);
                setQuestions(next);
                setActiveIndex(0);
                setSelectedIndex(null);
                setAnswers({});
                setRevealed(false);
                setScore(0);
              }}
              data-testid="law-universe-quick-restart"
            >
              <RefreshCcw aria-hidden="true" size={13} strokeWidth={1.8} /> 再来一轮
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
