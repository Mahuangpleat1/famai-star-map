import { useEffect, useRef } from "react";
import { CheckCircle2, X as XIcon, RefreshCcw, Brain, X } from "lucide-react";
import { useQuizSession } from "./useQuizSession";
import type { SessionState } from "./useQuizSession";
import type { UserQuizItem } from "./userDataTypes";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-quiz.css";

export interface LawUniverseQuizSessionProps {
  open: boolean;
  onClose: () => void;
}

export function LawUniverseQuizSession({ open, onClose }: LawUniverseQuizSessionProps) {
  const session = useQuizSession();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && session.state.phase === "idle") {
      void session.open();
    }
    if (!open && session.state.phase !== "idle") {
      session.close();
    }
  }, [open, session]);

  // 完整焦点陷阱(Esc 关闭由 useFocusTrap 接管,移除原独立 keydown 监听)
  useFocusTrap(panelRef, open, { onEscape: onClose });

  if (!open) return null;

  const { state, current } = session;

  return (
    <div
      className="law-universe-quiz"
      data-testid="law-universe-quiz-session"
      role="dialog"
      aria-modal="true"
      aria-label="复习会话"
    >
      <button
        type="button"
        className="law-universe-quiz__scrim"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="law-universe-quiz__panel">
        <header className="law-universe-quiz__head">
          <Brain aria-hidden="true" size={16} strokeWidth={1.8} />
          <span className="law-universe-quiz__title">复习会话</span>
          {state.phase === "asking" || state.phase === "revealing" ? (
            <span className="law-universe-quiz__counter" data-testid="session-counter">
              {state.index + 1} / {state.total}
            </span>
          ) : null}
          <button
            type="button"
            className="law-universe-quiz__close"
            onClick={onClose}
            aria-label="关闭"
            data-testid="session-close"
          >
            <X aria-hidden="true" size={13} strokeWidth={1.8} />
          </button>
        </header>

        {state.phase === "loading" ? (
          <div className="law-universe-quiz__body">载入中…</div>
        ) : null}

        {state.phase === "asking" || state.phase === "revealing" ? (
          <SessionBody
            key={current?.id ?? "empty"}
            current={current}
            state={state}
            onSubmit={session.submit}
            onNext={session.next}
          />
        ) : null}

        {state.phase === "finished" ? (
          <SessionSummary
            correct={state.correct}
            total={state.total}
            nextDueAt={state.nextDueAt}
            onClose={onClose}
            onRestart={() => {
              void session.open();
            }}
          />
        ) : null}

        {state.phase === "idle" ? (
          <div className="law-universe-quiz__body">会话已关闭。</div>
        ) : null}
      </div>
    </div>
  );
}

interface SessionBodyProps {
  current: UserQuizItem | null;
  state: Extract<SessionState, { phase: "asking" | "revealing" }>;
  onSubmit: (answer: string | number) => Promise<void>;
  onNext: () => void;
}

function SessionBody({ current, state, onSubmit, onNext }: SessionBodyProps) {
  const revealed = state.phase === "revealing";

  useEffect(() => {
    if (!revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, onNext]);

  if (!current) return <div className="law-universe-quiz__body">无题可答</div>;
  const { payload } = current;
  const lastResult = revealed ? state.lastResult : null;

  return (
    <div className="law-universe-quiz__body" data-testid="session-question">
      <div className="session-progress" data-testid="session-progress">
        <div
          className="session-progress__bar"
          style={{ width: `${((state.index + (revealed ? 1 : 0)) / state.total) * 100}%` }}
        />
      </div>
      <h3>{payload.stem}</h3>
      <p className="law-universe-quiz__context">{current.conceptTitle}</p>

      {payload.type === "choice" ? (
        <ol className="law-universe-quiz__options">
          {payload.options.map((option, i) => {
            const isCorrectChoice = revealed && i === payload.correctIndex;
            const isWrongChoice = revealed && i === state.userAnswer && !state.lastResult.isCorrect;
            return (
              <li key={`${current.id}-${i}`}>
                <button
                  type="button"
                  className={`law-universe-quiz__option ${isCorrectChoice ? "is-correct" : ""} ${isWrongChoice ? "is-wrong" : ""}`}
                  disabled={revealed}
                  data-testid={`session-option-${i}`}
                  onClick={() => {
                    void onSubmit(i);
                  }}
                >
                  <span className="law-universe-quiz__option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{option}</span>
                  {isCorrectChoice ? <CheckCircle2 aria-hidden="true" size={14} strokeWidth={2} /> : null}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      {payload.type === "fill" ? (
        <form
          className="session-fill"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const v = String(fd.get("fill") ?? "");
            void onSubmit(v);
          }}
        >
          <input
            type="text"
            name="fill"
            className="session-fill__input"
            data-testid="session-fill-input"
            disabled={revealed}
            autoFocus
          />
          {revealed ? null : (
            <button type="submit" className="session-fill__submit" data-testid="session-fill-submit">
              提交
            </button>
          )}
          {revealed ? (
            <p className="session-fill__answer">
              正确答案: <strong>{payload.correctAnswer}</strong>
              {lastResult && !lastResult.isCorrect ? <XIcon size={14} /> : null}
            </p>
          ) : null}
        </form>
      ) : null}

      {payload.type === "essay" ? (
        <form
          className="session-essay"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const v = String(fd.get("essay") ?? "");
            void onSubmit(v);
          }}
        >
          <textarea
            name="essay"
            className="session-essay__textarea"
            data-testid="session-essay-textarea"
            rows={6}
            disabled={revealed}
          />
          {revealed ? null : (
            <button type="submit" className="session-essay__submit" data-testid="session-essay-submit">
              提交
            </button>
          )}
          {revealed ? (
            <div className="session-essay__answer">
              <p>
                相似度: <strong>{Math.round((lastResult?.score ?? 0) * 100)}%</strong>
                {lastResult?.isCorrect ? " (正确)" : " (错误)"}
              </p>
              <details>
                <summary>参考答案</summary>
                <p>{payload.modelAnswer}</p>
              </details>
            </div>
          ) : null}
        </form>
      ) : null}

      {revealed ? (
        <div className="law-universe-quiz__actions">
          <button
            type="button"
            onClick={onNext}
            data-testid="session-next"
            className="law-universe-quiz__next"
          >
            {state.index + 1 >= state.total ? "查看结果" : "下一题"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface SessionSummaryProps {
  correct: number;
  total: number;
  nextDueAt: number | null;
  onClose: () => void;
  onRestart: () => void;
}

function SessionSummary({ correct, total, nextDueAt, onClose, onRestart }: SessionSummaryProps) {
  const formatRelative = (ms: number): string => {
    if (ms < 60_000) return "不到 1 分钟后";
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)} 分钟后`;
    if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)} 小时后`;
    return `${Math.round(ms / 86_400_000)} 天后`;
  };
  return (
    <div className="session-summary" data-testid="session-summary">
      <h3>本轮复习完成</h3>
      <p className="session-summary__score">
        正确 {correct} / {total} · 正确率 {total > 0 ? Math.round((correct / total) * 100) : 0}%
      </p>
      {nextDueAt ? (
        <p className="session-summary__next-due" data-testid="session-summary-next-due">
          下次最早到期: {formatRelative(nextDueAt - Date.now())}
        </p>
      ) : null}
      <div className="session-summary__actions">
        <button type="button" onClick={onRestart} data-testid="session-restart">
          <RefreshCcw aria-hidden="true" size={13} strokeWidth={1.8} /> 再来一轮
        </button>
        <button type="button" onClick={onClose} data-testid="session-finish">
          完成
        </button>
      </div>
    </div>
  );
}
