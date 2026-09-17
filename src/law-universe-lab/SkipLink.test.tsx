import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SkipLink } from "./SkipLink";

beforeEach(() => {
  // jsdom 没有真正的 scrollIntoView / focus
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SkipLink", () => {
  it("renders with default label and href", () => {
    render(<SkipLink targetId="foo" />);
    const link = screen.getByTestId("law-universe-skip-link");
    expect(link).toHaveAttribute("href", "#foo");
    expect(link).toHaveTextContent("跳到中国法学宇宙主场景");
  });

  it("renders custom label", () => {
    render(<SkipLink targetId="foo" label="跳到主场景" />);
    expect(screen.getByTestId("law-universe-skip-link")).toHaveTextContent("跳到主场景");
  });

  it("click scrolls to target and sets tabindex=-1 if missing", () => {
    const target = document.createElement("div");
    target.id = "foo";
    document.body.appendChild(target);

    const focusSpy = vi.spyOn(target, "focus");
    render(<SkipLink targetId="foo" />);

    fireEvent.click(screen.getByTestId("law-universe-skip-link"));
    expect(focusSpy).toHaveBeenCalled();
    expect(target.getAttribute("tabindex")).toBe("-1");

    document.body.removeChild(target);
  });

  it("click on missing target logs warning and does not throw", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<SkipLink targetId="nonexistent" />);
    expect(() => fireEvent.click(screen.getByTestId("law-universe-skip-link"))).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("nonexistent"));
  });

  it("does not modify tabindex if already set", () => {
    const target = document.createElement("button");
    target.id = "foo";
    target.setAttribute("tabindex", "0");
    document.body.appendChild(target);

    render(<SkipLink targetId="foo" />);
    fireEvent.click(screen.getByTestId("law-universe-skip-link"));
    expect(target.getAttribute("tabindex")).toBe("0"); // unchanged

    document.body.removeChild(target);
  });
});
