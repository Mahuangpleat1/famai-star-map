import { useLayoutEffect, useRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LawUniverseFilterBar } from "./LawUniverseFilterBar";

const props = {
  filterState: { nodeTypes: null, levels: null, sourceCategories: null },
  filteredNodeCount: 610,
  totalNodeCount: 610,
  onChange: vi.fn(),
  onClear: vi.fn()
};

function viewport(compact: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: compact, addEventListener: vi.fn(), removeEventListener: vi.fn()
  }));
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("filter panel initial layout", () => {
  it("commits the mobile panel collapsed before passive effects can cause a layout shift", () => {
    viewport(true);
    let firstPaintExpanded: string | null | undefined;
    let firstPaintHasGroups: boolean | undefined;
    function FirstPaintProbe() {
      const root = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        firstPaintExpanded = root.current?.querySelector("button")?.getAttribute("aria-expanded");
        firstPaintHasGroups = !!root.current?.querySelector(".law-universe-filter-bar__groups");
      }, []);
      return <div ref={root}><LawUniverseFilterBar {...props} /></div>;
    }
    render(<FirstPaintProbe />);
    expect(firstPaintExpanded).toBe("false");
    expect(firstPaintHasGroups).toBe(false);
  });

  it("keeps mobile expand and collapse controls functional", () => {
    viewport(true);
    render(<LawUniverseFilterBar {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "展开筛选" }));
    expect(screen.getByRole("button", { name: "折叠筛选" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "按节点类型筛选" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "折叠筛选" }));
    expect(screen.queryByRole("group", { name: "按节点类型筛选" })).not.toBeInTheDocument();
  });

  it("keeps desktop filters expanded initially", () => {
    viewport(false);
    render(<LawUniverseFilterBar {...props} />);
    expect(screen.getByRole("button", { name: "折叠筛选" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "按节点类型筛选" })).toBeInTheDocument();
  });
});
