/**
 * OnboardingHint —— 首次用户引导。
 *
 * - 检测 localStorage `law-universe:onboarding:v1` 标记
 * - 用户主动关闭 (X) 或完成任一 onboarding 步骤 → 标记已看,不再展示
 * - 不阻塞操作,fixed 浮层
 * - 4 步核心:①点击节点 ②⌘K 搜索 ③打开工作台上传 ④出题刷题
 */
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Database, Search, Sparkles, X } from "lucide-react";
import "./css/law-universe-lab-panels.css";

const STORAGE_KEY = "law-universe:onboarding:v1";

interface Step {
  icon: ReactNode;
  title: string;
  body: string;
  /** 完成探测:用户操作后应被外层调用 markComplete */
  detectKey?: "clicked-node" | "opened-search" | "opened-workbench" | "started-quiz";
}

const STEPS: Step[] = [
  {
    icon: <Sparkles size={18} strokeWidth={1.6} />,
    title: "欢迎来到法脉星河",
    body: "你看到的是中国法律体系的 3D 太阳系。预置 11 个部门法星系和 610 个节点组成学习底图。点击任何节点开始浏览。"
  },
  {
    icon: <Search size={18} strokeWidth={1.6} />,
    title: "按 ⌘K 搜索节点",
    body: "用名字 / 标签 / 描述 / 拼音首字母搜索（mfd = 民法典）。已为你准备了 6 条学习路径。"
  },
  {
    icon: <Database size={18} strokeWidth={1.6} />,
    title: "上传资料,让 AI 抽取概念",
    body: "打开工作台，配置自己的 AI 服务与密钥，再导入或粘贴资料。点击分析，AI 自动抽取概念、分入星系并连接资料。"
  },
  {
    icon: <BookOpen size={18} strokeWidth={1.6} />,
    title: "出题刷题,错题回链",
    body: "在工作台生成并下载综合学习报告；也可点开个人卫星使用模板练习、错题本和间隔复习。AI 推断需要对照原文核查。"
  }
];

export interface OnboardingHintProps {
  /** 用户完成了 onboarding(检测到对应操作) */
  completedKeys?: Set<string>;
}

export function OnboardingHint({ completedKeys }: OnboardingHintProps) {
  const [dismissed, setDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadySeen = false;
    try {
      alreadySeen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (!alreadySeen) {
      // 延迟 600ms 显示,避免和入场动画冲突
      const timer = window.setTimeout(() => setShouldShow(true), 600);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    // 当用户完成了所有 4 步中的至少 1 步,自动隐藏
    if (completedKeys && completedKeys.size > 0) {
      handleDismiss();
    }
    // 只依赖 completedKeys.size 而不是 completedKeys 本身:
    // Set 引用会随父级 useState 重渲染而变化(Set 内部元素未变也算新引用),
    // 引用进 deps 会让 effect 无意义地重跑,造成 handleDismiss 重复触发 → 反复写 localStorage。
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size 已足以表达"用户新增了完成项",引用敏感会抖
  }, [completedKeys?.size, handleDismiss]);

  function handleDismiss() {
    setDismissed(true);
    setShouldShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (dismissed || !shouldShow) return null;

  return (
    <aside
      className="law-universe-onboarding"
      role="region"
      aria-label="首次使用引导"
      data-testid="law-universe-onboarding"
    >
      <div className="law-universe-onboarding__inner">
        <button
          type="button"
          className="law-universe-onboarding__close"
          onClick={handleDismiss}
          aria-label="关闭引导"
          title="关闭"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
        <header className="law-universe-onboarding__header">
          <div className="law-universe-onboarding__badge">新手</div>
          <h2 className="law-universe-onboarding__title">4 步上手法脉星河</h2>
        </header>
        <ol className="law-universe-onboarding__steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="law-universe-onboarding__step">
              <div className="law-universe-onboarding__step-icon" aria-hidden="true">
                {step.icon}
              </div>
              <div className="law-universe-onboarding__step-body">
                <h3 className="law-universe-onboarding__step-title">
                  <span className="law-universe-onboarding__step-index">{index + 1}</span>
                  {step.title}
                </h3>
                <p className="law-universe-onboarding__step-text">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="law-universe-onboarding__footer">
          <button
            type="button"
            className="law-universe-onboarding__cta"
            onClick={handleDismiss}
          >
            开始探索
          </button>
        </footer>
      </div>
    </aside>
  );
}

export function resetOnboardingFlag(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
