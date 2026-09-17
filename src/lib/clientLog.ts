/** Compatibility surface for former telemetry callers. No data leaves this module. */
export type ClientLogKind = "error" | "perf" | "info";
export interface ClientLogPayload { kind: ClientLogKind; data: unknown; }
/** Remote logging is disabled, including legacy localStorage overrides. */
export function getClientLogEndpoint(): string { return ""; }
export function sendClientLog(_payload: ClientLogPayload): boolean { return false; }
export function __resetClientLogForTests(): void { /* no state */ }
