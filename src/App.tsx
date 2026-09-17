import { lazy, Suspense } from "react";

const LawUniverseLabPage = lazy(() =>
  import("./law-universe-lab/LawUniverseLabPage").then((module) => ({ default: module.LawUniverseLabPage }))
);

export function App() {
  return (
    <Suspense fallback={<main className="fallback-shell">载入中国法学宇宙...</main>}>
      <LawUniverseLabPage />
    </Suspense>
  );
}
