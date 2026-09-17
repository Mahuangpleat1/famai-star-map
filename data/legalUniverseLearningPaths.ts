/**
 * 预制学习路径 —— 把节点串成有节奏的学习路线。
 *
 * 每条路径是一组 nodeId, 配合 audience + estimatedTime 描述。
 * 渲染时用 onSelectNode 跳到对应节点, 形成'看-讲-跳'节奏。
 */

import type { LegalUniverseDomain } from "../src/law-universe-lab/types";

export interface LearningPathStep {
  nodeId: string;
  why: string;
}

export interface LearningPath {
  id: string;
  title: string;
  audience: string;
  estimatedTime: string;
  description: string;
  steps: LearningPathStep[];
  primaryDomain: LegalUniverseDomain;
}

export const legalUniverseLearningPaths: LearningPath[] = [
  {
    id: "path-law-student-foundations",
    title: "法学生入门:民法典七编导览",
    audience: "法学本科一年级 / 自学者",
    estimatedTime: "约 35 分钟",
    description: "从民法典总则出发,沿物权、合同、人格权、婚姻家庭、继承、侵权六编的核心制度巡览,帮初学者建立体系感。",
    primaryDomain: "civil",
    steps: [
      { nodeId: "civil-general-book", why: "总则是民法典的'一般法',所有具体制度都从这里展开。" },
      { nodeId: "civil-subject", why: "先了解谁在民事关系里说话 — 自然人、法人、非法人组织。" },
      { nodeId: "civil-juristic-act", why: "行为规则的基础:法律行为怎么成立、怎么生效、哪些无效。" },
      { nodeId: "civil-civil-liability", why: "民事责任体系:填补损害、精神损害、连带/按份责任。" },
      { nodeId: "civil-limitation", why: "诉讼时效三年/二十年,过半中国民事案件都撞这条线。" },
      { nodeId: "civil-property-book", why: "进入物权编:静态财产归属 + 动态变动规则。" },
      { nodeId: "civil-ownership", why: "所有权是物权的核心,理解国家/集体/私人三种所有权。" },
      { nodeId: "civil-usufruct", why: "用益物权(承包/建设/宅基地/居住/地役) — 民法典新增了'居住权'。" },
      { nodeId: "civil-security-interest", why: "担保物权(抵押/质/留置) — 金融市场的底层规则。" },
      { nodeId: "civil-contract-book", why: "合同编是民法典条文最多的一编,共 526 条。" },
      { nodeId: "civil-contract-formation", why: "要约-承诺:一个合同的诞生过程。" },
      { nodeId: "civil-breach-liability", why: "违约责任:继续履行、损害赔偿、违约金、定金罚则。" },
      { nodeId: "civil-personality-book", why: "人格权独立成编是民法典亮点。" },
      { nodeId: "civil-personal-info", why: "个人信息保护:民法典+个人信息保护法的双层结构。" },
      { nodeId: "civil-tort-liability", why: "侵权责任编:一般侵权 + 七类特殊侵权。" },
      { nodeId: "civil-product-liability", why: "产品责任:无过错责任 + 惩罚性赔偿。" }
    ]
  },
  {
    id: "path-practitioner-quickref",
    title: "法律工作者速查:民刑交叉 12 个高频节点",
    audience: "律师/法务/检察官/法官助理",
    estimatedTime: "约 25 分钟",
    description: "民刑交叉的常见抓手 — 民事欺诈如何接驳刑事诈骗、侵权与故意伤害的边界、个人信息保护的多层救济。",
    primaryDomain: "civil",
    steps: [
      { nodeId: "civil-juristic-act", why: "欺诈/胁迫是民事可撤销事由,也是刑事诈骗/敲诈勒索的构成要件。" },
      { nodeId: "civil-loan-contract", why: "民间借贷利率上限 = 合同成立时一年期 LPR 的 4 倍,涉刑时按套路贷/诈骗分流。" },
      { nodeId: "civil-breach-liability", why: "违约责任与刑事诈骗的边界:欺诈/非法占有目的的有无是关键。" },
      { nodeId: "civil-product-liability", why: "产品缺陷:民事侵权 + 行政处罚(产品质量法) + 刑事责任(生产销售伪劣产品罪)。" },
      { nodeId: "criminal-fraud", why: "民事欺诈 vs 刑事诈骗:同一事实可能走不同路径,立案标准、证据标准都不同。" },
      { nodeId: "criminal-intentional-injury", why: "故意伤害罪 vs 民事侵权的人身损害赔偿:程序上刑事附带民事。" },
      { nodeId: "criminal-theft", why: "盗窃罪与职务侵占罪:主体区分(一般主体 vs 公司企业人员)。" },
      { nodeId: "criminal-bribery", why: "受贿罪:国家工作人员身份 + 利用职务便利 + 为他人谋取利益。" },
      { nodeId: "civil-personal-info", why: "个人信息侵权:民法典(基本权利)+ PIPL(行政罚款+刑事)+ 网络安全法(数据安全)。" },
      { nodeId: "procedure-04", why: "证据:刑事诉讼证据规则与民事证据规则交叉适用,需注意证明标准差异。" },
      { nodeId: "procedure-16", why: "执行:刑事退赔与民事赔偿的顺位问题,实务中常需协调。" },
      { nodeId: "procedure-23", why: "辩护:刑事律师需要同时熟悉民法典实体规则,才能在质证中得心应手。" }
    ]
  },
  {
    id: "path-citizen-selfhelp",
    title: "公民法律科普:遇到麻烦怎么办",
    audience: "普通公民 / 社区工作者",
    estimatedTime: "约 20 分钟",
    description: "日常生活常见的法律问题 — 借出去的钱要不回来、合同踩坑、网购被骗、房子被占、人被打、隐私被曝光。",
    primaryDomain: "civil",
    steps: [
      { nodeId: "civil-loan-contract", why: "借条/欠条怎么写、利率上限、诉讼时效(3 年)。" },
      { nodeId: "civil-contract-formation", why: "口头合同有效吗?微信聊天算证据吗?格式条款的'黑字'怎么防?" },
      { nodeId: "civil-breach-liability", why: "违约了怎么办:先协商 → 起诉 → 申请强制执行。" },
      { nodeId: "civil-online-tort", why: "网购被骗、直播间售假、刷单被骗 — 网络消费维权的法律工具。" },
      { nodeId: "civil-product-liability", why: "商品/服务致害:生产者+销售者连带,可主张惩罚性赔偿。" },
      { nodeId: "civil-divorce", why: "协议离婚 30 日冷静期、诉讼离婚的'感情破裂'认定。" },
      { nodeId: "civil-ownership", why: "房产归属、夫妻共同财产、买房合同注意事项。" },
      { nodeId: "civil-real-estate-registration", why: "不动产登记是关键证据,买房前查档。" },
      { nodeId: "civil-privacy", why: "隐私被偷拍、信息被泄露 — 民法典+个人信息保护法的双重救济。" },
      { nodeId: "civil-reputation-right", why: "名誉权被侵害:平台投诉 + 法院起诉,可主张精神损害赔偿。" },
      { nodeId: "social-20", why: "劳动纠纷:劳动合同解除、经济补偿金、加班工资的法律依据。" },
      { nodeId: "procedure-16", why: "申请强制执行:对方不履行判决时,法院可以冻结账户、查封财产、限制高消费、列入失信名单。" }
    ]
  }
];

export function getLearningPathById(id: string): LearningPath | undefined {
  return legalUniverseLearningPaths.find((path) => path.id === id);
}
