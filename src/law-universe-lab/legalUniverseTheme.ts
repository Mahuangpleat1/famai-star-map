import type { LegalUniverseColorKey } from "./types";

export const legalUniverseTheme = {
  space: "#020203",
  core: "#fff8df",
  coreHot: "#ffffff",
  node: "#e9e4d2",
  nodeSoft: "#d8d4c2",
  muted: "rgba(246, 241, 223, 0.52)",
  line: "#e9e4d2",
  domain: {
    universe: "#fff8df",
    jurisprudence: "#d7d3c8",
    constitution: "#f2ddb2",
    administrative: "#a8b4bd",
    civil: "#f5edcf",
    obligation: "#dfbf78",
    property: "#d7ceb4",
    personality: "#d3d0bc",
    commercial: "#d7a85f",
    criminal: "#a95745",
    procedure: "#c6bfd2",
    economic: "#c99b55",
    social: "#9daf84",
    international: "#b7c9c9",
    "legal-history": "#ad8d5a"
  } satisfies Record<LegalUniverseColorKey, string>
};

export function getLegalUniverseColor(colorKey: LegalUniverseColorKey): string {
  return legalUniverseTheme.domain[colorKey] ?? legalUniverseTheme.node;
}
