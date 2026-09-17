/**
 * 节点内容 builder —— 严格进源,每个字段都引真实公开材料。
 *
 * 用法:
 *   buildNode("contract-validity", "合同效力", {
 *     type: "institution",
 *     system: "system-civil",
 *     cluster: "contract",
 *     level: 2,
 *     importance: 88,
 *     shortDescription: "...",
 *     statuteRefs: [statute("中华人民共和国民法典", "第五百零二条", flkUrl) ...],
 *     practicePoints: ["...", "..."],
 *     ...
 *   })
 */

import type {
  LegalUniverseHistoricalMilestone,
  LegalUniverseJudicialInterpretation,
  LegalUniverseLandmarkCase,
  LegalUniverseNodeContent,
  LegalUniverseStatuteRef
} from "../src/law-universe-lab/types";

export function statute(lawTitle: string, article: string, opts: { url?: string; note?: string } = {}): LegalUniverseStatuteRef {
  return {
    lawTitle,
    article,
    url: opts.url,
    note: opts.note
  };
}

export function judicialInterpretation(
  title: string,
  year: number,
  issuer: string,
  summary: string,
  opts: { documentNumber?: string; url?: string } = {}
): LegalUniverseJudicialInterpretation {
  return {
    title,
    year,
    issuer,
    documentNumber: opts.documentNumber,
    summary,
    url: opts.url
  };
}

export function landmarkCase(
  caseNumber: string,
  year: number,
  court: string,
  title: string,
  summary: string,
  opts: { url?: string } = {}
): LegalUniverseLandmarkCase {
  return {
    caseNumber,
    year,
    court,
    title,
    summary,
    url: opts.url
  };
}

export function milestone(year: string, event: string): LegalUniverseHistoricalMilestone {
  return { year, event };
}

export function emptyContent(): LegalUniverseNodeContent {
  return {};
}

/**
 * Statutory URL helpers —— all 严格进源,来源只能是 flk.npc.gov.cn / npc.gov.cn / court.gov.cn / spp.gov.cn / gov.cn / moe.gov.cn。
 * 缺链接的 statute / interpretation / case 不写 url,等人工补。
 */

export const flk = {
  constitution: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf5a483004b",
  civilCode: "https://flk.npc.gov.cn/detail?id=ff808081729d1efe01729d50b5c500bf",
  criminalLaw: "https://flk.npc.gov.cn/detail?id=ff808181796a636a0179822a19640c92",
  civilProcedure: "https://flk.npc.gov.cn/detail?id=ff8081818a21dc13018b425303b7086d",
  criminalProcedure: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f1d1b81b01351",
  administrativeLitigation: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf858550a0f",
  administrativePenalty: "https://flk.npc.gov.cn/detail?id=ff8080817703add20177373df6a43e33",
  administrativeLicense: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f216bf96b1ae6",
  administrativeReconsideration: "https://flk.npc.gov.cn/detail?id=ff8081818a21e6c3018a508d491a0c98",
  companyLaw: "https://flk.npc.gov.cn/detail?id=ff8081818c9108eb018cb6922f750c07",
  securitiesLaw: "https://flk.npc.gov.cn/detail?id=ff80808171e9e18101727e32b94d7de6",
  antiMonopoly: "https://flk.npc.gov.cn/detail?id=ff8081818234ccb501829f46c6ac2a5a",
  antiUnfairCompetition: "https://flk.npc.gov.cn/detail?id=ff808181971552b40197b1016efc5437",
  laborLaw: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f20f16ee11737",
  socialInsurance: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f210989b9179a",
  pipl: "https://flk.npc.gov.cn/detail?id=ff8081817b6472a3017b656cc2040044",
  dataSecurity: "https://flk.npc.gov.cn/detail?id=ff80818179f5e0800179f885c7e70392",
  foreignRelations: "https://flk.npc.gov.cn/detail?id=ff80818188d7430b0189019c15ee0943",
  treatyProcedure: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf5c87c0145"
} as const;
