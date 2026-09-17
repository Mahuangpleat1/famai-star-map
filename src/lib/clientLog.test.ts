import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientLogEndpoint, sendClientLog } from "./clientLog";

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
describe("local-only logging", () => {
  it.each(["error", "perf", "info"] as const)("never sends %s even with a legacy endpoint override", (kind) => {
    const fetchSpy = vi.fn();
    const beaconSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("navigator", {sendBeacon: beaconSpy});
    localStorage.setItem("law-universe:client-log-endpoint", "https://logs.example.invalid/");
    sendClientLog({kind, data: {message: "synthetic document excerpt"}});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(getClientLogEndpoint()).toBe("");
  });
});
