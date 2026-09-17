import type {
  LegalUniverseColorKey,
  LegalUniverseComment,
  LegalUniverseDomain,
  LegalUniverseEdge,
  LegalUniverseEdgeType,
  LegalUniverseNode,
  LegalUniverseNodeType,
  LegalUniverseSourceRef,
  LegalUniverseSystem
} from "../src/law-universe-lab/types";
import { flk } from "./legalUniverseContentBuilder";

interface ConceptSeed {
  id?: string;
  title: string;
  type?: LegalUniverseNodeType;
  cluster?: string;
  level?: 1 | 2 | 3;
  importance?: number;
  size?: number;
  relation?: string;
  description?: string;
  sourceRefs?: string[];
  tags?: string[];
  content?: import("../src/law-universe-lab/types").LegalUniverseNodeContent;
}

interface SystemSeed {
  id: string;
  title: string;
  domain: LegalUniverseDomain;
  colorKey: LegalUniverseColorKey;
  systemPosition: [number, number, number];
  systemRadius: number;
  systemInclination: number;
  shortDescription: string;
  sourceRefs: string[];
  concepts: ConceptSeed[];
}

const pendingSource = "pending-manual-check";
const textbookSource = "textbook-system";
const legalDatabaseSource = "national-laws-database";

export const legalUniverseSourceRefs: LegalUniverseSourceRef[] = [
  {
    id: legalDatabaseSource,
    title: "国家法律法规数据库",
    url: "https://flk.npc.gov.cn/",
    category: "official",
    note: "用于后续逐条补充法律文本链接；本轮只引用数据库入口，不伪造具体检索页。"
  },
  {
    id: "flk-categories",
    title: "国家法律法规数据库：分类枚举",
    url: "https://flk.npc.gov.cn/law-search/search/enumData",
    category: "official",
    note: "用于确认宪法相关法、民法商法、行政法、经济法、社会法、刑法、诉讼与非诉讼程序法等法源分类。"
  },
  {
    id: "npc-legal-system-seven",
    title: "全国人大：中国特色社会主义法律体系七部门",
    url: "http://www.npc.gov.cn/zgrdw/npc/xinwen/2008-05/30/content_1466382.htm",
    category: "official",
    note: "用于法律体系部门划分的历史性说明锚点。"
  },
  {
    id: "moe-grad-catalog-2022",
    title: "教育部/国务院学位委员会：研究生教育学科专业目录（2022）",
    url: "http://www.moe.gov.cn/srcsite/A22/moe_833/202209/t20220914_660828.html",
    category: "education",
    note: "用于法学一级学科和法学学科目录的来源锚点。"
  },
  {
    id: "flk-constitution-2018",
    title: "国家法律法规数据库：中华人民共和国宪法（2018年修正文本）",
    url: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf5a483004b&fileId=&type=&title=中华人民共和国宪法（2018年修正文本）",
    category: "official",
    note: "用于宪法太阳系的法律文本来源锚点。"
  },
  {
    id: "flk-administrative-penalty",
    title: "国家法律法规数据库：中华人民共和国行政处罚法",
    url: "https://flk.npc.gov.cn/detail?id=ff8080817703add20177373df6a43e33&fileId=&type=&title=中华人民共和国行政处罚法",
    category: "official",
    note: "用于行政处罚节点来源锚点。"
  },
  {
    id: "flk-administrative-license",
    title: "国家法律法规数据库：中华人民共和国行政许可法",
    url: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f216bf96b1ae6&fileId=&type=&title=中华人民共和国行政许可法",
    category: "official",
    note: "用于行政许可节点来源锚点。"
  },
  {
    id: "flk-administrative-reconsideration",
    title: "国家法律法规数据库：中华人民共和国行政复议法",
    url: "https://flk.npc.gov.cn/detail?id=ff8081818a21e6c3018a508d491a0c98&fileId=&type=&title=中华人民共和国行政复议法",
    category: "official",
    note: "用于行政复议节点来源锚点。"
  },
  {
    id: "flk-civil-code",
    title: "国家法律法规数据库：中华人民共和国民法典",
    url: "https://flk.npc.gov.cn/detail?id=ff808081729d1efe01729d50b5c500bf&fileId=&type=&title=中华人民共和国民法典",
    category: "official",
    note: "用于民法典及其分编、合同、物权、人格权等太阳系的法律文本来源锚点。"
  },
  {
    id: "flk-pipl",
    title: "国家法律法规数据库：中华人民共和国个人信息保护法",
    url: "https://flk.npc.gov.cn/detail?id=ff8081817b6472a3017b656cc2040044&fileId=&type=&title=中华人民共和国个人信息保护法",
    category: "official",
    note: "用于个人信息保护节点来源锚点。"
  },
  {
    id: "flk-data-security",
    title: "国家法律法规数据库：中华人民共和国数据安全法",
    url: "https://flk.npc.gov.cn/detail?id=ff80818179f5e0800179f885c7e70392&fileId=&type=&title=中华人民共和国数据安全法",
    category: "official",
    note: "用于数据安全节点来源锚点。"
  },
  {
    id: "flk-company-law",
    title: "国家法律法规数据库：中华人民共和国公司法",
    url: "https://flk.npc.gov.cn/detail?id=ff8081818c9108eb018cb6922f750c07&fileId=&type=&title=中华人民共和国公司法",
    category: "official",
    note: "用于公司法、公司治理、股东权利等商法节点来源锚点。"
  },
  {
    id: "flk-securities-law",
    title: "国家法律法规数据库：中华人民共和国证券法",
    url: "https://flk.npc.gov.cn/detail?id=ff80808171e9e18101727e32b94d7de6&fileId=&type=&title=中华人民共和国证券法",
    category: "official",
    note: "用于证券法和资本市场节点来源锚点。"
  },
  {
    id: "flk-criminal-law",
    title: "国家法律法规数据库：中华人民共和国刑法",
    url: "https://flk.npc.gov.cn/detail?id=ff808181796a636a0179822a19640c92&fileId=&type=&title=中华人民共和国刑法",
    category: "official",
    note: "用于刑法太阳系、犯罪构成、刑罚体系和罪名类节点来源锚点。"
  },
  {
    id: "flk-criminal-procedure",
    title: "国家法律法规数据库：中华人民共和国刑事诉讼法",
    url: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f1d1b81b01351&fileId=&type=&title=中华人民共和国刑事诉讼法",
    category: "official",
    note: "用于刑事诉讼、强制措施、辩护、侦查、起诉等程序节点来源锚点。"
  },
  {
    id: "flk-civil-procedure",
    title: "国家法律法规数据库：中华人民共和国民事诉讼法",
    url: "https://flk.npc.gov.cn/detail?id=ff8081818a21dc13018b425303b7086d&fileId=&type=&title=中华人民共和国民事诉讼法",
    category: "official",
    note: "用于民事诉讼、管辖、当事人、证据、执行等程序节点来源锚点。"
  },
  {
    id: "flk-administrative-litigation",
    title: "国家法律法规数据库：中华人民共和国行政诉讼法",
    url: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf858550a0f&fileId=&type=&title=中华人民共和国行政诉讼法",
    category: "official",
    note: "用于行政诉讼和行政争议救济节点来源锚点。"
  },
  {
    id: "flk-anti-monopoly",
    title: "国家法律法规数据库：中华人民共和国反垄断法",
    url: "https://flk.npc.gov.cn/detail?id=ff8081818234ccb501829f46c6ac2a5a&fileId=&type=&title=中华人民共和国反垄断法",
    category: "official",
    note: "用于反垄断节点来源锚点。"
  },
  {
    id: "flk-anti-unfair-competition",
    title: "国家法律法规数据库：中华人民共和国反不正当竞争法",
    url: "https://flk.npc.gov.cn/detail?id=ff808181971552b40197b1016efc5437&fileId=&type=&title=中华人民共和国反不正当竞争法",
    category: "official",
    note: "用于反不正当竞争节点来源锚点。"
  },
  {
    id: "flk-labor-law",
    title: "国家法律法规数据库：中华人民共和国劳动法",
    url: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f20f16ee11737&fileId=&type=&title=中华人民共和国劳动法",
    category: "official",
    note: "用于劳动法节点来源锚点。"
  },
  {
    id: "flk-social-insurance",
    title: "国家法律法规数据库：中华人民共和国社会保险法",
    url: "https://flk.npc.gov.cn/detail?id=ff8080816f135f46016f210989b9179a&fileId=&type=&title=中华人民共和国社会保险法",
    category: "official",
    note: "用于社会保险节点来源锚点。"
  },
  {
    id: "flk-foreign-relations",
    title: "国家法律法规数据库：中华人民共和国对外关系法",
    url: "https://flk.npc.gov.cn/detail?id=ff80818188d7430b0189019c15ee0943&fileId=&type=&title=中华人民共和国对外关系法",
    category: "official",
    note: "用于国际法/涉外法太阳系来源锚点。"
  },
  {
    id: "flk-treaty-procedure",
    title: "国家法律法规数据库：中华人民共和国缔结条约程序法",
    url: "https://flk.npc.gov.cn/detail?id=2c909fdd678bf17901678bf5c87c0145&fileId=&type=&title=中华人民共和国缔结条约程序法",
    category: "official",
    note: "用于条约节点来源锚点。"
  },
  {
    id: "spp-civil-code-parts",
    title: "最高人民检察院：民法典分编专题",
    url: "https://www.spp.gov.cn/spp/ssmfdyflvdtpgz/mfdfb/index.shtml",
    category: "official",
    note: "页面列明民法典总则、物权、合同、人格权、婚姻家庭、继承、侵权责任七编。"
  },
  {
    id: "chsi-law-discipline-scope",
    title: "中国研究生招生信息网：法学学科内涵及学科范围",
    url: "https://yz.chsi.com.cn/kyzx/other/201511/20151120/1510103121.html",
    category: "education",
    note: "用于法学理论、法律史、宪法行政法、民商法、诉讼法、经济法、国际法等学科分类。"
  },
  {
    id: "gov-info-disclosure-regulation",
    title: "中国政府网：政府信息公开条例",
    url: "https://app.www.gov.cn/govdata/gov/201904/15/438065/article.html",
    category: "official",
    note: "用于行政法太阳系中政府信息公开、法治政府透明度相关节点。"
  },
  {
    id: textbookSource,
    title: "法学教材常见体系归纳",
    category: "textbook",
    note: "用于法理学、部门法课程结构和概念层级的产品化归纳，待人工以指定教材目录补充。"
  },
  {
    id: pendingSource,
    title: "资料来源待人工补充",
    category: "product",
    note: "当前数据保留来源占位，不构成法律意见或正式法学教材条目。"
  },
  {
    id: "spc-guiding-cases",
    title: "最高人民法院：指导性案例",
    url: "https://www.court.gov.cn/guidance/index.html",
    category: "official",
    note: "最高人民法院发布的指导性案例官方入口，截至 2025 年累计发布多批。"
  },
  {
    id: "spc-typical-cases",
    title: "最高人民法院：典型案例",
    url: "https://www.court.gov.cn/typical/index.html",
    category: "official",
    note: "最高人民法院发布的典型案例官方入口。"
  },
  {
    id: "spc-interpretations",
    title: "最高人民法院：司法解释",
    url: "https://www.court.gov.cn/judicial-interpretation/index.html",
    category: "official",
    note: "最高人民法院发布的现行有效司法解释官方入口。"
  },
  {
    id: "spp-guiding-cases",
    title: "最高人民检察院：指导性案例",
    url: "https://www.spp.gov.cn/spp/jczd/index.shtml",
    category: "official",
    note: "最高人民检察院发布的指导性案例官方入口。"
  },
  {
    id: "npc-civil-code-broadcast",
    title: "全国人大常委会：民法典全文",
    url: "http://www.npc.gov.cn/npc/c2/c30834/202006/t20200602_3064573.html",
    category: "official",
    note: "全国人大常委会发布的民法典全文页面（2020 年 5 月 28 日通过）。"
  },
  {
    id: "npc-civil-code-articles",
    title: "全国人大常委会：民法典相关报道",
    url: "http://www.npc.gov.cn/npc/c12435/202005/914be0e5b1c247179d2a96c8d2c8a25e.shtml",
    category: "official",
    note: "全国人大官方对民法典立法过程的说明。"
  },
  {
    id: "moj-2024-work-report",
    title: "国务院：2024 年最高人民法院工作报告",
    url: "https://www.gov.cn/yaowen/liebiao/202403/content_6940093.htm",
    category: "official",
    note: "用于司法统计、案件结构等数据节点来源锚点。"
  },
  {
    id: "spc-2024-work-report",
    title: "最高人民法院：2024 年工作报告",
    url: "https://www.court.gov.cn/zixun/xiangqing/425522.html",
    category: "official",
    note: "用于审判执行收结案数据、案件类型分布等节点来源锚点。"
  },
  {
    id: "state-council-administrative-regulation",
    title: "国务院：行政法规库",
    url: "https://www.gov.cn/zhengce/xxgk/gmgb/index.htm",
    category: "official",
    note: "用于行政法规、条例的来源锚点。"
  },
  // 主流法学教材 —— 严格进源,所有学科性节点都要标到具体教材
  {
    id: "textbook-zhangwenxian-jurisprudence",
    title: "张文显《法理学》（高等教育出版社，第五版）",
    category: "textbook",
    note: "中国法理学最权威的统编教材之一,北大/吉大合编,覆盖法的一般原理、本体、起源、作用、价值、运行、法治、社会与发展。"
  },
  {
    id: "textbook-xuchongde-constitution",
    title: "许崇德《宪法学》（高等教育出版社）",
    category: "textbook",
    note: "中国宪法学经典教材,中国人民大学法学院体系,系统阐述宪法基本理论、基本权利、国家机构、宪法实施保障。"
  },
  {
    id: "textbook-wangliming-civil",
    title: "王利明《民法学》（法律出版社）/《民法总则》",
    category: "textbook",
    note: "中国人民大学民商法学领军教材,体系完整,理论与判例并重。"
  },
  {
    id: "textbook-wei-zhenying-civil",
    title: "魏振瀛《民法》（北京大学出版社/高等教育出版社）",
    category: "textbook",
    note: "北京大学民商法学教材,与王利明体系互参。"
  },
  {
    id: "textbook-gaomingxuan-criminal",
    title: "高铭暄、马克昌《刑法学》（北京大学出版社/高等教育出版社）",
    category: "textbook",
    note: "中国刑法学统编教材,高铭暄先生主持,体系严谨,覆盖刑法总则与分则各章。"
  },
  {
    id: "textbook-zhangmingkai-criminal",
    title: "张明楷《刑法学》（法律出版社，第六版）",
    category: "textbook",
    note: "清华大学法学院刑法教材,以三阶层/二阶层体系著称,论证严密。"
  },
  {
    id: "textbook-jiangmingan-administrative",
    title: "姜明安《行政法与行政诉讼法》（北京大学出版社）",
    category: "textbook",
    note: "北京大学行政法学教材,中国行政法学科奠基教材之一。"
  },
  {
    id: "textbook-wangguowei-commercial",
    title: "王卫国《商法》（中国政法大学出版社）",
    category: "textbook",
    note: "中国政法大学商法教材,系统覆盖商法总论、公司、证券、票据、保险、破产。"
  },
  {
    id: "textbook-jiangwei-civil-procedure",
    title: "江伟《民事诉讼法》（北京大学出版社/高等教育出版社）",
    category: "textbook",
    note: "中国民事诉讼法学权威教材,中国人民大学法学院体系。"
  },
  {
    id: "textbook-chenguangzhong-criminal-procedure",
    title: "陈光中《刑事诉讼法》（北京大学出版社/高等教育出版社）",
    category: "textbook",
    note: "中国刑事诉讼法学权威教材,中国政法大学体系。"
  },
  {
    id: "textbook-yangzixuan-economic",
    title: "杨紫煊《经济法》（北京大学出版社）",
    category: "textbook",
    note: "北京大学经济法学教材,系统覆盖经济法总论、市场规制、宏观调控。"
  },
  {
    id: "textbook-wangtieya-international",
    title: "王铁崖《国际法》（法律出版社）",
    category: "textbook",
    note: "北京大学国际法经典教材,系统阐述国际公法、国际私法、国际经济法基础理论。"
  },
  {
    id: "textbook-zhangjinfan-legal-history",
    title: "张晋藩《中国法制史》（高等教育出版社/中国政法大学出版社）",
    category: "textbook",
    note: "中国法制史学权威教材,按朝代线索展现中华法制传统与近代转型。"
  },
  {
    id: "textbook-majunju-civil",
    title: "马俊驹、余延满《民法原论》（法律出版社）",
    category: "textbook",
    note: "清华大学民商法教材,体系严密,注重制度史与比较法。"
  },
  {
    id: "textbook-luohaicao-administrative",
    title: "罗豪才《行政法学》（北京大学出版社/中国政法大学出版社）",
    category: "textbook",
    note: "平衡论视角下的行政法教材。"
  },
  {
    id: "textbook-shijichun-economic",
    title: "史际春《经济法》",
    category: "textbook",
    note: "中国人民大学经济法教材,强调经济法的'纵横统一'。"
  },
  {
    id: "textbook-fanjian-commercial",
    title: "范健《商法》（高等教育出版社/北京大学出版社）",
    category: "textbook",
    note: "南京大学商法教材,体系完整覆盖商事主体、商事行为、商事纠纷解决。"
  }
];

export const legalUniverseIntroCopy = {
  title: "中国法学宇宙",
  subtitle: "多个法域太阳系同时点亮",
  description: "实体法、程序法、理论与历史在远距离光桥中相互牵引"
};

const commentsByType: Record<LegalUniverseNodeType, LegalUniverseComment[]> = {
  "universe-core": [{ speaker: "法学体系", text: "总览只显示大法域，进入太阳系后再展开具体概念。" }],
  "system-sun": [{ speaker: "中国法学宇宙", text: "我是一个法域太阳系，内部概念在局部视角里展开。" }],
  code: [{ speaker: "法典结构", text: "我把分散规则收束成稳定的制度引力。" }],
  law: [{ speaker: "法律文本", text: "具体条文链接待人工补齐，当前先保留来源占位。" }],
  field: [{ speaker: "学科体系", text: "我连接教材分类、制度结构和实务入口。" }],
  concept: [{ speaker: "概念节点", text: "我不是百科词条，只标出所在制度轨道。" }],
  rule: [{ speaker: "规则节点", text: "我描述法律运行中的判断或责任结构。" }],
  institution: [{ speaker: "制度节点", text: "我体现组织、权力或程序安排。" }],
  procedure: [{ speaker: "程序节点", text: "实体权利需要通过程序抵达救济。" }],
  history: [{ speaker: "历史回声", text: "我提供制度演化的远轨背景。" }],
  theory: [{ speaker: "理论节点", text: "我给部门法概念提供解释框架。" }],
  "case-method": [{ speaker: "方法节点", text: "我帮助把规则应用到事实判断。" }]
};

function concept(
  title: string,
  overrides: Omit<ConceptSeed, "title"> = {}
): ConceptSeed {
  return { title, ...overrides };
}

const systemSeeds: SystemSeed[] = [
  {
    id: "system-jurisprudence",
    title: "法理学",
    domain: "jurisprudence",
    colorKey: "jurisprudence",
    systemPosition: [-8.8, -4.2, -7.6],
    systemRadius: 2.4,
    systemInclination: -0.22,
    shortDescription: "法理学提供法的概念、规范、权利义务和法治原则等基础解释框架。",
    sourceRefs: ["chsi-law-discipline-scope", "moe-grad-catalog-2022", "npc-legal-system-seven", "textbook-zhangwenxian-jurisprudence", textbookSource, pendingSource],
    concepts: [
      // ===== 张文显《法理学》第一编 法的一般原理 =====
      concept("法的概念", { type: "theory", importance: 94, sourceRefs: ["textbook-zhangwenxian-jurisprudence"], content: {
        practicePoints: [
          "马克思主义法学：法是统治阶级意志的体现，由国家制定或认可并由国家强制力保证实施的行为规范体系。",
          "实证主义法学（奥斯丁、凯尔森）：法是主权者的命令。",
          "自然法学（霍布斯、洛克、卢梭）：法源自自然理性或社会契约。",
          "社会法学（庞德、埃利希）：法是社会控制的工具。"
        ]
      } }),
      concept("法学", { type: "theory", importance: 80, content: {
        practicePoints: [
          "法学是研究法律现象及其规律的科学。",
          "分支：理论法学（法理学、法史学、法社会学等）+ 应用法学（各部门法）。",
          "法学与相邻学科：政治学、经济学、社会学、伦理学、哲学。"
        ]
      } }),
      concept("法理学", { type: "theory", importance: 88, content: {
        practicePoints: [
          "法理学是法学的一般理论、基础理论、方法论。",
          "研究对象：法的一般概念、本质、作用、形式、发展规律；法律运行机制；法与其他社会现象的关系。",
          "地位：法学的基础学科、是法学知识体系的'导论'和'工具'。"
        ]
      } }),
      // ===== 法的本体 =====
      concept("法的本质", { type: "theory", importance: 86, content: {
        practicePoints: [
          "马克思主义法学：法的本质是统治阶级意志的体现，根源于社会物质生活条件。",
          "法的初级本质 vs 法的二级本质。",
          "中国法理学传统:法的本质层次说（阶级性、人民性、社会性）。"
        ]
      } }),
      concept("法的要素", { type: "theory", importance: 84, content: {
        practicePoints: ["法律规则（命令/允许/禁止）、法律原则（如诚实信用、罪刑法定）、法律概念（权利、义务、责任、行为能力等）。"]
      } }),
      concept("法律规则", { type: "theory", importance: 90, content: {
        practicePoints: [
          "结构：假定条件 + 行为模式 + 法律后果。",
          "分类：授权性/义务性/确定性/委任性/准用性规则。",
          "特征：明确性、普遍性、可诉性（英美法理学传统）。"
        ]
      } }),
      concept("法律原则", { type: "theory", importance: 88, content: {
        practicePoints: [
          "公理性原则：诚实信用、平等、公平、禁止滥用权利。",
          "政策性原则：罪刑相适应、法律面前人人平等。",
          "作用：法律规则缺位时直接作为裁判依据；解释/补充规则的依据。"
        ]
      } }),
      concept("法律概念", { type: "theory", importance: 76, content: {
        practicePoints: ["具有法律意义的概念,具有独立含义和适用边界。如'权利'、'义务'、'法人'、'物权'、'善意取得'。"]
      } }),
      // ===== 法的渊源、形式、效力 =====
      concept("法的渊源", { type: "theory", importance: 88, sourceRefs: ["textbook-zhangwenxian-jurisprudence"], content: {
        practicePoints: [
          "正式渊源：宪法/法律/行政法规/地方性法规/规章/国际条约/习惯法。",
          "非正式渊源：判例（指导性案例）/法理/学说/政策。",
          "中国特色社会主义法律体系：宪法相关法/民法商法/行政法/经济法/社会法/刑法/诉讼与非诉讼程序法 7 大部门。"
        ]
      } }),
      concept("法的形式", { type: "theory", importance: 80, content: {
        practicePoints: [
          "成文法（制定法）vs 不成文法（习惯法、判例法）。",
          "中国的法的形式以成文法为主，判例不是正式渊源。",
          "普通法系 vs 民法法系：中国属民法法系传统（自清末修律后大陆法系影响深远）。"
        ]
      } }),
      concept("法的分类", { type: "theory", importance: 82, content: {
        practicePoints: [
          "成文法/不成文法；实体法/程序法；根本法/普通法；一般法/特别法；",
          "国内法/国际法；公法/私法；强行法/任意法；确定性/委任性/准用性规范。"
        ]
      } }),
      concept("法的效力", { type: "theory", importance: 86, content: {
        practicePoints: ["包括：效力等级（位阶）、效力范围（时间、空间、对人、事项）。"]
      } }),
      concept("法律关系", { type: "theory", importance: 91, content: {
        practicePoints: ["三要素：主体（享有权利/承担义务的人/组织）、内容（权利/义务）、客体（行为/物/精神财富/人身利益）。"]
      } }),
      concept("权利", { type: "theory", importance: 95, content: {
        practicePoints: [
          "权利构成：利益、主张、资格、权能、自由。",
          "权利分类：基本权利/普通权利；公权利/私权利；对世权/对人权；原权/救济权；专属权/非专属权。",
          "权利行使原则：正当行使、禁止滥用权利。"
        ]
      } }),
      concept("义务", { type: "theory", importance: 90, content: {
        practicePoints: [
          "义务分类：积极义务/消极义务；公义务/私义务；第一性义务/第二性义务。",
          "义务的相对性：义务总是对应特定权利人的权利。",
          "不真正义务（自然债务）：道德义务,法律不强制。"
        ]
      } }),
      concept("权利能力", { type: "theory", importance: 84, content: {
        practicePoints: [
          "民事权利能力：自然人享有民事权利、承担民事义务的资格。",
          "始于出生,终于死亡；人人平等,不因性别/年龄/民族/宗教/财产而区别对待。",
          "胎儿利益保护（《民法典》第十六条）：涉及遗产继承、接受赠与等胎儿利益保护时,视为具有民事权利能力。"
        ]
      } }),
      concept("行为能力", { type: "theory", importance: 82, content: {
        practicePoints: [
          "自然人民事行为能力按年龄和智力分：无/限制/完全。",
          "完全民事行为能力人：18 周岁以上；16-18 周岁以自己劳动收入为主要生活来源的,视为完全。",
          "限制民事行为能力人：8 周岁以上未成年人；不能完全辨认自己行为的成年人。",
          "无民事行为能力人：不满 8 周岁未成年人；不能辨认自己行为的成年人。"
        ]
      } }),
      concept("法律责任", { type: "theory", importance: 89, content: {
        practicePoints: [
          "民事责任：恢复原状/赔偿损失/赔礼道歉/停止侵害/消除影响/恢复名誉。",
          "行政责任：行政处罚/行政处分。",
          "刑事责任：管制/拘役/有期/无期/死刑 + 罚金/剥夺政治权利/没收财产。",
          "归责原则：过错责任/无过错责任/公平责任。"
        ]
      } }),
      concept("法律责任的归结", { type: "theory", importance: 80, content: {
        practicePoints: [
          "归结要素：行为/损害/因果关系/主观过错。",
          "免责事由：不可抗力/正当防卫/紧急避险/受害人同意/自助/法定免责事由。",
          "制裁：法律制裁（民事/行政/刑事）+ 道德制裁。"
        ]
      } }),
      concept("法律行为", { type: "theory", importance: 92, sourceRefs: ["textbook-wangliming-civil"], content: {
        practicePoints: [
          "以意思表示为核心要素,产生民事法律效果的行为。",
          "三阶层判断：成立 → 生效 → 效力瑕疵（无效/可撤销/效力待定）。",
          "行为成立要件：行为人/意思表示/行为内容。"
        ]
      } }),
      concept("代理", { type: "theory", importance: 84, content: {
        practicePoints: [
          "代理：代理人在代理权限内,以被代理人名义为民事法律行为,后果由被代理人承担。",
          "三类代理：法定代理/指定代理/委托代理。",
          "表见代理（《民法典》第一百七十二条）保护善意第三人。"
        ]
      } }),
      concept("法律事件", { type: "theory", importance: 76, content: {
        practicePoints: ["不以人的意志为转移的法律事实,如出生、死亡、自然灾害、战争等。"]
      } }),
      concept("法律事实", { type: "theory", importance: 80, content: {
        practicePoints: [
          "法律规范所规定的,能够引起法律关系产生、变更、消灭的客观情况。",
          "分类：行为（合法/违法/有效/无效）+ 事件（自然现象/社会现象）。",
          "举证责任分配：主张权利产生/变更/消灭者,对相应法律事实承担举证责任。"
        ]
      } }),
      // ===== 法的运行 =====
      concept("立法", { type: "theory", importance: 90, content: {
        practicePoints: [
          "立法权：全国人大和全国人大常委会行使国家立法权。",
          "行政法规由国务院制定；地方性法规由省级和设区的市级人大及其常委会制定。",
          "法律保留事项：只能制定法律的事项（犯罪与刑罚、剥夺基本权利、税款征收等）。"
        ]
      } }),
      concept("立法原则", { type: "theory", importance: 80, content: {
        practicePoints: ["合宪性原则/合法性原则/民主原则/科学原则/公开原则/实事求是原则。"]
      } }),
      concept("立法程序", { type: "procedure", importance: 80, content: {
        practicePoints: ["法律议案的提出 → 审议 → 表决通过 → 公布。"]
      } }),
      concept("法的实施", { type: "theory", importance: 78, content: {
        practicePoints: ["包括：法的遵守（守法）+ 法的执行（执法）+ 法的适用（司法）。"]
      } }),
      concept("守法", { type: "theory", importance: 78, content: {
        practicePoints: [
          "守法：国家机关、社会组织和个人依法享有权利、履行义务的活动。",
          "守法主体：一切组织和个人（'法律面前人人平等'）。",
          "守法内容包括：积极行使权利 + 消极履行义务。"
        ]
      } }),
      concept("执法", { type: "theory", importance: 86, content: {
        practicePoints: [
          "执法：国家行政机关及其公职人员依法行使管理职权、履行职责、实施法律的活动。",
          "原则：合法性原则/合理性原则/正当程序原则/比例原则/诚实信用原则/信赖保护原则。",
          "执法主体：行政机关；法律法规授权组织；行政委托组织。"
        ]
      } }),
      concept("司法", { type: "theory", importance: 88, content: {
        practicePoints: [
          "司法：国家司法机关依照法定职权和程序,处理具体案件的专门活动。",
          "司法原则：司法独立/司法平等/司法公正/司法民主/司法公开。",
          "中国的司法机关：人民法院（审判机关）+ 人民检察院（检察机关）。"
        ]
      } }),
      concept("法律解释", { type: "case-method", importance: 87, content: {
        practicePoints: [
          "正式解释（有权解释）：立法解释/司法解释/行政解释。",
          "非正式解释：学理解释（无法律约束力）。",
          "解释方法：文义/历史/体系/目的/社会学解释。"
        ]
      } }),
      concept("法律推理", { type: "case-method", importance: 86, content: {
        practicePoints: ["演绎推理（三段论：法律规范 → 案件事实 → 结论）+ 归纳推理（从判例归纳规则）+ 类比推理（类似案件类似处理）。"]
      } }),
      concept("法律论证", { type: "case-method", importance: 78, content: {
        practicePoints: [
          "法律论证：运用法律理由对法律判断进行正当化的活动。",
          "内部证成：法律判断从前提逻辑上推出；外部证成：前提本身正当。",
          "法律论证方法：当然论证、反论、类比、平衡、后果考察。"
        ]
      } }),
      // ===== 法治论 =====
      concept("法治", { type: "theory", importance: 95, content: {
        practicePoints: [
          "法治：依照法律治理国家的原则、制度和运行机制。",
          "与'法制'的区别：法制是法律制度的简称,法治是治理方式。",
          "法治的基本要求：良法 + 善治。"
        ]
      } }),
      concept("法治国家", { type: "theory", importance: 88, content: {
        practicePoints: [
          "法治国家：依照宪法和法律治理的国家形态。",
          "要件：法律权威/权力制约/权利保障/程序正义/司法独立。",
          "中国'法治国家'建设：1997 年党的十五大提出'依法治国,建设社会主义法治国家'。"
        ]
      } }),
      concept("法治政府", { type: "institution", importance: 84, content: {
        practicePoints: [
          "法治政府建设六大原则：职能科学、权责法定、执法严明、公开公正、廉洁高效、守法诚信。",
          "重大行政决策：公众参与/专家论证/风险评估/合法性审查/集体讨论决定。",
          "法治政府建设第三方评估机制。"
        ]
      } }),
      concept("法治社会", { type: "institution", importance: 80, content: {
        practicePoints: [
          "法治社会：全社会形成尊法学法守法用法的良好氛围。",
          "载体：普法宣传/法律服务/法律援助/人民调解/法律顾问。",
          "全面依法治国：法治国家/法治政府/法治社会一体建设。"
        ]
      } }),
      concept("全面依法治国", { type: "theory", importance: 90, content: {
        practicePoints: [
          "总目标：建设中国特色社会主义法治体系,建设社会主义法治国家。",
          "五大体系：完备的法律规范体系/高效的法治实施体系/严密的法治监督体系/有力的法治保障体系/完善的党内法规体系。",
          "十六字方针：科学立法、严格执法、公正司法、全民守法。"
        ]
      } }),
      concept("依法治国", { type: "theory", importance: 92, content: {
        practicePoints: [
          "1997 年党的十五大正式提出'依法治国,建设社会主义法治国家'。",
          "1999 年'依法治国,建设社会主义法治国家'写入宪法。",
          "党的领导是社会主义法治最根本的保证。"
        ]
      } }),
      // ===== 法的价值 =====
      concept("法的价值", { type: "theory", importance: 86, content: {
        practicePoints: [
          "法的价值：法在调整社会关系时体现出来的、满足主体需要的积极意义。",
          "主要价值：秩序/自由/正义/效率/人权。",
          "价值冲突与排序：自由 vs 秩序（紧急状态下秩序优先）/ 自由 vs 平等（实质平等让形式平等让步）。"
        ]
      } }),
      concept("法的作用", { type: "theory", importance: 84, content: {
        practicePoints: [
          "规范作用：指引/评价/预测/教育/强制。",
          "社会作用：政治（阶级统治）+ 经济（资源配置）+ 社会管理 + 公共事务。",
          "法的局限性：'法律不是万能的'——法的作用有边界。"
        ]
      } }),
      concept("法律监督", { type: "institution", importance: 82, content: {
        practicePoints: ["国家机关监督（人大监督/审判监督/检察监督）+ 社会监督（新闻舆论/公众/社会组织）。"]
      } }),
      // ===== 法与社会科学 =====
      concept("法与道德", { type: "theory", importance: 82, content: {
        practicePoints: [
          "法与道德的关系：相互渗透/相互作用/相互区别。",
          "区别：产生方式/规范内容/存在形态/调整方式/保障机制。",
          "中国特色社会主义法治强调法律与道德相辅相成、法治与德治相结合。"
        ]
      } }),
      concept("法与经济", { type: "theory", importance: 80, content: {
        practicePoints: [
          "法与经济基础：法是上层建筑的组成部分,由经济基础决定。",
          "法对经济的反作用：法律是现代市场经济的基础。",
          "社会主义市场经济本质上是法治经济。"
        ]
      } }),
      concept("法与政治", { type: "theory", importance: 78, content: {
        practicePoints: ["法与政治相互联系又相互区别:法是政治意志的规范化,又是政治运行的制度框架。"]
      } }),
      concept("法与人权", { type: "theory", importance: 84, content: {
        practicePoints: [
          "人权的层次：应有权利/法定权利/实有权利。",
          "人权的主体：个人 + 集体；人权的内容：生存权/发展权/政治权利/经济文化社会权利。",
          "中国人权保障：以宪法为根本,以法律为主体,以司法为最终防线。"
        ]
      } }),
      // ===== 法的发展 =====
      concept("法的发展", { type: "theory", importance: 76, content: {
        practicePoints: [
          "法的起源：原始习惯 → 习惯法 → 成文法。",
          "法的历史类型：奴隶制法/封建制法/资本主义法/社会主义法。",
          "法的发展规律：与生产力/经济基础/社会形态相适应。"
        ]
      } }),
      concept("法系", { type: "theory", importance: 78, content: {
        practicePoints: [
          "民法法系（大陆法系）：以法、德为代表,成文法典化/逻辑化,判例非正式法源。",
          "普通法法系（英美法系）：以英、美为代表,判例法是正式法源,遵循先例。",
          "中华法系：古代中国对东亚法系的母本,已转型为社会主义法系。"
        ]
      } }),
      concept("法律移植", { type: "theory", importance: 76, content: {
        practicePoints: [
          "法律移植：一个国家或地区将他国法律制度有选择地引入本国。",
          "成功的移植需要考虑：本土资源/社会条件/法系背景/制度配套。",
          "中国近现代的两次大规模法律移植：清末修律引进大陆法系；改革开放后市场法律体系全面引进。"
        ]
      } }),
      concept("法律全球化", { type: "theory", importance: 72, content: {
        practicePoints: [
          "法律全球化：法律规则、法律观念、法律制度在全球范围内的趋同化。",
          "表现：国际贸易规则/知识产权/环境法/互联网治理/反腐败规则。",
          "中国参与：'一带一路'、RCEP、WTO、CPTPP 等。"
        ]
      } }),
      concept("科技与法律", { type: "theory", importance: 74, content: {
        practicePoints: [
          "科技发展提出的法律问题:基因编辑/人工智能/数据/算法歧视/自动驾驶责任。",
          "法律的回应：立法/监管/伦理审查/行业自律。",
          "中国应对：网络安全法/数据安全法/个人信息保护法/科技伦理审查办法。"
        ]
      } }),
      // ===== 司法论 =====
      concept("法律职业", { type: "theory", importance: 76, content: {
        practicePoints: [
          "法律职业的核心：法官/检察官/律师/法学教师/公证员。",
          "法律职业的特征：专业化训练/行业自治/职业伦理/独立的职业评价。",
          "中国法律职业共同体：统一法律职业资格考试（2018 年改革为'法考'）。"
        ]
      } }),
      concept("法律职业伦理", { type: "theory", importance: 76, content: {
        practicePoints: [
          "律师执业行为规范、法官职业道德基本准则、检察官职业道德基本准则。",
          "核心价值：忠诚/独立/公正/诚信/勤勉。",
          "惩戒机制：律师协会/法官/检察官惩戒委员会。"
        ]
      } }),
      // ===== 法学流派(补充) =====
      concept("自然法", { type: "theory", importance: 78, content: {
        practicePoints: ["自然法学派认为存在超越实在法的普遍正义原则（自然法）；代表：阿奎那、格劳秀斯、霍布斯、洛克、卢梭、富勒、菲尼斯。"]
      } }),
      concept("法的渊源理论", { type: "theory", importance: 76, content: {
        practicePoints: ["分析法学的'承认规则'（哈特）：识别法律身份的标准；社会法学的'活法'（埃利希）：实际支配社会生活的规则。"]
      } }),
      concept("法治政府评估", { type: "institution", importance: 74, content: {
        practicePoints: ["法治政府建设第三方评估：依法行政制度体系、重大行政决策、行政执法、行政监督、社会满意度。"]
      } })
    ]
  },
  {
    id: "system-constitution",
    title: "宪法",
    domain: "constitution",
    colorKey: "constitution",
    systemPosition: [0.4, 7.2, -8.8],
    systemRadius: 2.9,
    systemInclination: 0.38,
    shortDescription: "宪法是国家根本法，组织国家权力并确认公民基本权利。",
    sourceRefs: ["flk-constitution-2018", "chsi-law-discipline-scope", "moe-grad-catalog-2022", "textbook-xuchongde-constitution", pendingSource],
    concepts: [
      // ===== 许崇德《宪法学》第一编 宪法基本理论 =====
      concept("宪法学", { type: "theory", importance: 80, sourceRefs: ["textbook-xuchongde-constitution"], content: {
        practicePoints: ["研究宪法现象、宪法规范和宪法发展规律的科学。"]
      } }),
      concept("宪法的概念", { type: "theory", importance: 92, content: {
        practicePoints: [
          "宪法：集中反映一国各种政治力量对比关系,规定国家根本制度和根本任务、公民基本权利与义务、国家权力机构组织与活动原则的根本法。",
          "宪法的特征：最高法律效力/最严格的制定和修改程序/最广泛的适用范围。",
          "宪法是国家法律体系的核心,是法治国家的基础。"
        ]
      } }),
      concept("宪法的本质", { type: "theory", importance: 86, content: {
        practicePoints: [
          "马克思主义宪法学:宪法的本质是各种政治力量（特别是阶级力量）对比关系的集中体现。",
          "宪法是统治阶级意志和利益的根本法律化。",
          "宪法的内容由一国的物质生活条件决定。"
        ]
      } }),
      concept("宪法的渊源", { type: "theory", importance: 78, content: {
        practicePoints: [
          "成文宪法典（多数现代国家）。",
          "宪法判例/宪法惯例/宪法学说。",
          "中国:成文宪法典为主,宪法判例制度不发达。"
        ]
      } }),
      concept("宪法分类", { type: "theory", importance: 80, content: {
        practicePoints: [
          "成文宪法（美/德/日/中）vs 不成文宪法（英/以色列/新西兰）。",
          "刚性宪法 vs 柔性宪法：成文宪法多为刚性,需特别程序修改。",
          "钦定宪法/民定宪法/协定宪法/条约宪法。"
        ]
      } }),
      concept("宪法的基本原则", { type: "theory", importance: 90, content: {
        practicePoints: [
          "人民主权原则（一切权力属于人民）。",
          "基本人权原则（尊重和保障人权）。",
          "法治原则（依宪治国、依宪执政）。",
          "权力制衡原则（立法/行政/司法三权分立或职能分工）。",
          "联邦制原则/单一制原则。"
        ]
      } }),
      concept("宪法规范", { type: "theory", importance: 80, content: {
        practicePoints: ["宪法规范的特殊性：原则性强/规范弹性大/政治性强/具有最高效力。"]
      } }),
      concept("宪法关系", { type: "theory", importance: 76, content: {
        practicePoints: ["由宪法调整的社会关系,包括国家与公民的关系/国家机构相互关系/中央与地方关系。"]
      } }),
      concept("宪法的效力", { type: "theory", importance: 86, content: {
        practicePoints: [
          "最高法律效力：宪法在国家法律体系中具有最高效力,一切法律/法规/规章不得与宪法相抵触。",
          "效力范围：国家主权范围内所有组织和个人。",
          "宪法修改比普通法律严格：我国宪法修改由全国人大常委会或 1/5 以上的全国人大代表提议,经全国人大全体代表 2/3 以上的多数通过。"
        ]
      } }),
      concept("宪法的作用", { type: "theory", importance: 84, content: {
        practicePoints: [
          "确认和巩固国家政权;规范和约束国家权力。",
          "调整社会关系,保护公民基本权利。",
          "确认和推动经济体制改革。",
          "建设社会主义法治国家的基础。"
        ]
      } }),
      concept("宪法发展史", { type: "history", importance: 76, content: {
        practicePoints: [
          "近代宪法:1215 年英国《大宪章》→ 1689 年《权利法案》→ 1776 年美国《独立宣言》→ 1787 年美国宪法→ 1789 年法国《人权宣言》→ 1791 年法国宪法。",
          "中国:1908 年《钦定宪法大纲》(中国第一部宪法性文件)→ 1912 年《中华民国临时约法》→ 1947 年《中华民国宪法》→ 1954 年中华人民共和国第一部宪法。"
        ]
      } }),
      // ===== 国家性质 =====
      concept("国家性质", { type: "institution", importance: 94, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一条、第二条", url: flk.constitution, note: "中华人民共和国是工人阶级领导的、以工农联盟为基础的人民民主专政的社会主义国家。社会主义制度是中华人民共和国的根本制度。" }]
      } }),
      concept("根本制度", { type: "institution", importance: 95, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一条至第四条", url: flk.constitution }],
        practicePoints: ["社会主义制度是中华人民共和国的根本制度；中国共产党领导是中国特色社会主义最本质的特征。"]
      } }),
      concept("国家政权形式", { type: "theory", importance: 80, content: {
        practicePoints: [
          "政体：国家的政权组织形式,即统治阶级采取什么样的形式去组织反对敌人、保护自己的政权机关。",
          "中国采取人民代表大会制度（人民代表大会制）。",
          "资本主义国家主要采用君主立宪制/民主共和制（总统制/议会制/半总统制）。"
        ]
      } }),
      concept("人民代表大会制度", { type: "institution", importance: 91, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第二条至第四条、第五十七条至第七十八条", url: flk.constitution }],
        practicePoints: [
          "中华人民共和国的一切权力属于人民。人民行使国家权力的机关是全国人民代表大会和地方各级人民代表大会。",
          "全国人大和全国人大常委会行使国家立法权；省、自治区、直辖市以及设区的市的人大及其常委会可制定地方性法规。"
        ]
      } }),
      concept("国家结构形式", { type: "theory", importance: 80, content: {
        practicePoints: [
          "单一制（中央集权）：中国/法国/日本/韩国。",
          "联邦制（地方分权）：美国/德国/俄罗斯/瑞士/加拿大。",
          "中国实行单一制,在单一制下设立民族区域自治制度和特别行政区制度。"
        ]
      } }),
      concept("中国共产党领导", { type: "institution", importance: 92, content: {
        practicePoints: ["中国共产党的领导是中国特色社会主义最本质的特征,是社会主义法治最根本的保证。"]
      } }),
      // ===== 基本权利与义务 =====
      concept("公民基本权利", { type: "rule", importance: 96, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十三条至第五十条", url: flk.constitution }],
        practicePoints: [
          "平等权（第三十三条）/ 选举权和被选举权（第三十四条）/ 言论出版集会结社游行示威自由（第三十五条）",
          "宗教信仰自由（第三十六条）/ 人身自由（第三十七条）/ 人格尊严（第三十八条）",
          "住宅不受侵犯（第三十九条）/ 通信自由和通信秘密（第四十条）",
          "监督权和获得赔偿权（第四十一条）",
          "劳动权（第四十二条）/ 休息权（第四十三条）/ 受教育权（第四十六条）",
          "科学研究/文学艺术创作自由（第四十七条）"
        ]
      } }),
      concept("平等权", { type: "rule", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十三条", url: flk.constitution }],
        practicePoints: [
          "法律面前人人平等:公民平等地享有权利,平等地履行义务。",
          "平等权是其他基本权利实现的基础。",
          "禁止对任何公民进行歧视性对待。"
        ]
      } }),
      concept("选举权和被选举权", { type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十四条", url: flk.constitution }],
        practicePoints: [
          "年满 18 周岁的中国公民,未被剥夺政治权利的,享有选举权和被选举权。",
          "选举制度：直接选举与间接选举并用,普遍、平等、秘密、无记名投票。",
          "选举经费由国库开支,选举机构独立于被选举人之外。"
        ]
      } }),
      concept("政治自由", { type: "rule", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十五条", url: flk.constitution }],
        practicePoints: ["公民有言论、出版、集会、结社、游行、示威的自由。"]
      } }),
      concept("宗教信仰自由", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十六条", url: flk.constitution }],
        practicePoints: ["任何国家机关、社会团体和个人不得强制公民信仰宗教或者不信仰宗教,不得歧视信仰宗教的公民和不信仰宗教的公民。"]
      } }),
      concept("人身自由", { type: "rule", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十七条", url: flk.constitution }],
        practicePoints: [
          "人身自由不受侵犯。",
          "任何公民,非经人民检察院批准或者决定或者人民法院决定,并由公安机关执行,不受逮捕。",
          "禁止非法拘禁和以其他方法非法剥夺或者限制公民的人身自由,禁止非法搜查公民的身体。"
        ]
      } }),
      concept("人格尊严", { type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三十八条", url: flk.constitution }],
        practicePoints: ["公民的人格尊严不受侵犯。禁止用任何方法对公民进行侮辱、诽谤和诬告陷害。"]
      } }),
      concept("财产权", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第十三条", url: flk.constitution }],
        practicePoints: [
          "公民的合法的私有财产不受侵犯。",
          "国家依照法律规定保护公民的私有财产权和继承权。",
          "国家为了公共利益的需要,可以依照法律规定对公民的私有财产实行征收或者征用并给予补偿。"
        ]
      } }),
      concept("公民基本义务", { type: "rule", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第五十一条至第五十六条", url: flk.constitution }],
        practicePoints: ["维护国家统一和各民族团结、遵守宪法和法律、维护国家安全荣誉利益、依法纳税、依法服兵役。"]
      } }),
      concept("监督权", { type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第四十一条", url: flk.constitution }],
        practicePoints: [
          "公民对于任何国家机关和国家工作人员,有提出批评和建议的权利。",
          "对于任何国家机关和国家工作人员的违法失职行为,有向有关国家机关提出申诉、控告或者检举的权利。",
          "由于国家机关和国家工作人员侵犯公民权利而受到损失的人,有依照法律规定取得赔偿的权利。"
        ]
      } }),
      // ===== 国家机构 =====
      concept("国家机构", { type: "institution", importance: 92, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第三章 国家机构（第五十七条至第一百四十条）", url: flk.constitution }]
      } }),
      concept("全国人大", { type: "institution", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第五十七条至第七十八条", url: flk.constitution }],
        practicePoints: ["最高国家权力机关；任期 5 年；每年举行 1 次会议；其常委会在全国人大闭会期间行使部分职权。"]
      } }),
      concept("全国人大常委会", { type: "institution", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第六十五条至第六十九条", url: flk.constitution }],
        practicePoints: [
          "全国人大常委会是全国人大的常设机关,对全国人大负责并报告工作。",
          "组成：委员长/副委员长/秘书长/委员若干人。",
          "任期：5 年,委员长连续任职不得超过两届。"
        ]
      } }),
      concept("国家主席", { type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第七十九条至第八十四条", url: flk.constitution }],
        practicePoints: ["国家主席和副主席由全国人大选举产生；任期 5 年,连续任职不得超过两届。"]
      } }),
      concept("国务院", { type: "institution", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第八十五条至第九十二条", url: flk.constitution }],
        practicePoints: ["最高国家行政机关；实行总理负责制；各部、各委员会实行部长、主任负责制。"]
      } }),
      concept("中央军委", { type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第九十三条至第九十四条", url: flk.constitution }]
      } }),
      concept("监察委员会", { type: "institution", importance: 84, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国宪法", article: "第一百二十三条至第一百二十七条", url: flk.constitution },
          { lawTitle: "中华人民共和国监察法", article: "全文（2018 年 3 月施行）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: ["监察委员会是行使国家监察职能的专责机关，对所有行使公权力的公职人员（含公务员、参公管理人员、法律授权或依法委托管理公共事务的组织中从事公务的人员、国企管理人员、公办教科文卫体单位管理人员、基层群众性自治组织从事管理人员）进行监察。"]
      } }),
      concept("人民法院", { type: "institution", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一百二十八条至第一百三十三条", url: flk.constitution }],
        practicePoints: ["最高人民法院、地方各级人民法院、专门人民法院（军事法院、海事法院、知识产权法院、金融法院等）。"]
      } }),
      concept("人民检察院", { type: "institution", importance: 85, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一百三十四条至第一百三十七条", url: flk.constitution }],
        practicePoints: ["国家法律监督机关；最高人民检察院领导地方各级人民检察院和专门人民检察院的工作。"]
      } }),
      concept("地方人大和地方政府", { type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第九十六条至第一百一十五条", url: flk.constitution }],
        practicePoints: ["地方各级人大是地方国家权力机关；地方各级人民政府是地方各级国家权力机关的执行机关,实行首长负责制。"]
      } }),
      concept("民族自治机关", { type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一百一十二条至第一百二十一条", url: flk.constitution }],
        practicePoints: ["自治区主席、自治州州长、自治县县长由实行区域自治的民族的公民担任；自治机关依法行使自治权。"]
      } }),
      concept("立法权", { type: "institution", importance: 87, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国立法法", article: "全文（2023 年 3 月修正）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "全国人大和全国人大常委会行使国家立法权。",
          "行政法规由国务院制定；地方性法规由省级和设区的市级人大及其常委会制定。",
          "法律保留事项：只能制定法律的事项（犯罪与刑罚、公民基本权利的剥夺、税款征收、诉讼和仲裁制度等）。"
        ]
      } }),
      concept("选举制度", { type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国全国人民代表大会和地方各级人民代表大会选举法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "县乡两级人大代表由选民直接选举；县级以上由下一级人大间接选举。",
          "代表名额分配:按城乡同比例原则,人口同比例。",
          "选举程序:选区划分/选民登记/代表候选人提名/投票/公布当选结果。"
        ]
      } }),
      concept("政党制度", { type: "institution", importance: 80, content: {
        practicePoints: [
          "中国共产党领导的多党合作和政治协商制度。",
          "中国共产党是执政党,各民主党派是参政党,接受中国共产党领导。",
          "中国人民政治协商会议是中国共产党领导的多党合作和政治协商的重要机构。"
        ]
      } }),
      // ===== 宪法实施 =====
      concept("宪法实施保障", { type: "theory", importance: 84, content: {
        practicePoints: [
          "宪法实施保障：保证宪法条文贯彻落实的制度和机制。",
          "中国：宪法监督（全国人大及其常委会）+ 规范性文件备案审查 + 宪法宣誓制度（2018 年）。",
          "宪法宣誓：国家工作人员就职时应当公开进行宪法宣誓。"
        ]
      } }),
      concept("宪法监督", { type: "institution", importance: 88, content: {
        practicePoints: ["全国人大和全国人大常委会监督宪法的实施；规范性文件备案审查制度。"]
      } }),
      concept("备案审查", { type: "institution", importance: 80, content: {
        practicePoints: [
          "行政法规、地方性法规、自治条例和单行条例应报全国人大常委会备案。",
          "司法解释应自公布之日起 30 日内报全国人大常委会备案。",
          "公民/组织认为法规、司法解释违宪违法,可向全国人大常委会提出审查建议。"
        ]
      } }),
      concept("宪法解释", { type: "theory", importance: 78, content: {
        practicePoints: ["中国宪法解释权属于全国人大常委会（《宪法》第六十七条）。"]
      } }),
      concept("宪法修改", { type: "theory", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第六十四条", url: flk.constitution }],
        practicePoints: [
          "宪法修改由全国人大常委会或 1/5 以上的全国人大代表提议。",
          "经全国人大代表全体代表的 2/3 以上多数通过。",
          "中国 1982 年宪法经过 5 次修正（1988/1993/1999/2004/2018）。"
        ]
      } }),
      concept("国家象征", { type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第一百四十一条至第一百四十三条", url: flk.constitution }],
        practicePoints: ["国旗是五星红旗；国歌是《义勇军进行曲》；国徽是五星照耀下的天安门；首都北京。"]
      } }),
      // ===== 特别制度 =====
      concept("民族区域自治", { type: "institution", importance: 79, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民族区域自治法", article: "全文（2001 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["在国家统一领导下，各少数民族聚居的地方实行区域自治，设立自治机关，行使自治权。"]
      } }),
      concept("特别行政区制度", { type: "institution", importance: 78, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国香港特别行政区基本法", article: "全文（1990 年通过）", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国澳门特别行政区基本法", article: "全文（1993 年通过）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: ["一国两制：港、澳特别行政区保持原有的资本主义制度和生活方式 50 年不变。"]
      } }),
      concept("基层群众自治", { type: "institution", importance: 76, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国村民委员会组织法", article: "全文", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国城市居民委员会组织法", article: "全文", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: ["基层群众性自治组织:村民委员会/居民委员会,实行基层群众自治,自我管理、自我教育、自我服务。"]
      } })
    ]
  },
  {
    id: "system-administrative",
    title: "行政法",
    domain: "administrative",
    colorKey: "administrative",
    systemPosition: [5.8, 4.6, -5.6],
    systemRadius: 2.45,
    systemInclination: 0.18,
    shortDescription: "行政法围绕行政权的取得、行使、监督与救济展开。",
    sourceRefs: [
      "flk-administrative-penalty",
      "flk-administrative-license",
      "flk-administrative-reconsideration",
      "flk-administrative-litigation",
      "gov-info-disclosure-regulation",
      "chsi-law-discipline-scope",
      pendingSource
    ],
    concepts: [
      concept("行政主体", { type: "institution", importance: 89, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第三条、第十六条至第二十条", url: flk.administrativePenalty }],
        practicePoints: [
          "行政机关：依法履行行政管理职能的国家机关。",
          "法律法规授权组织：经法律、法规授权可以实施行政处罚。",
          "委托执法：行政机关可在法定权限内委托符合条件组织实施行政处罚，并对受托组织行为后果承担法律责任。"
        ]
      } }),
      concept("行政行为", { type: "concept", importance: 93, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政许可法", article: "第二条", url: flk.administrativeLicense }],
        practicePoints: [
          "行政行为分类：抽象行政行为（制定规范性文件）与具体行政行为。",
          "具体行政行为：行政许可、行政处罚、行政强制、行政确认、行政裁决、行政征收、行政征用、行政检查等。",
          "判断可诉性：原则上只对具体行政行为提起行政诉讼。"
        ]
      } }),
      concept("行政许可", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政许可法", article: "全文（2019 年修订）", url: flk.administrativeLicense }],
        practicePoints: [
          "设定权：法律可设定行政许可；必要时行政法规可设定；地方性法规可设定省级地方事务行政许可；规章不得设定行政许可。",
          "实施程序：申请—受理—审查—决定；听证程序适用于重大公共利益事项。",
          "信赖利益保护：合法行政许可被撤销造成财产损失的，行政机关应依法补偿。"
        ]
      } }),
      concept("行政处罚", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "全文（2021 年修订）", url: flk.administrativePenalty }],
        judicialInterpretations: [
          { title: "最高人民法院关于审理行政案件适用法律规范问题的座谈会纪要", year: 2004, issuer: "最高人民法院", summary: "明确行政处罚依据的法律位阶和合法性审查标准。" }
        ],
        practicePoints: [
          "处罚种类：警告、通报批评、罚款、没收违法所得、没收非法财物、暂扣许可证件、降低资质等级、吊销许可证件、限制开展生产经营活动、责令停产停业、责令关闭、限制从业、行政拘留等。",
          "处罚设定权：法律 > 行政法规 > 地方性法规 > 部门规章 / 地方政府规章（规章只能设定警告、通报批评或一定数额罚款）。",
          "一事不再罚：同一违法行为不得给予两次以上罚款的行政处罚。"
        ]
      } }),
      concept("听证程序", { type: "procedure", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第六十三条至第六十六条", url: flk.administrativePenalty }],
        practicePoints: ["较大数额罚款、没收较大数额违法所得/非法财物、降低资质等级、吊销许可证件、责令停产停业、责令关闭、限制从业等处罚决定前应告知听证权。"]
      } }),
      concept("行政强制", { type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政强制法", article: "全文（2011 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "行政强制措施：限制公民人身自由；查封场所/设施/财物；扣押财物；冻结存款/汇款等。",
          "行政强制执行：加处罚款或者滞纳金；划拨存款/汇款；拍卖/依法处理查封/扣押的场所/设施/财物等。",
          "行政强制由法律设定；行政法规可设定查封、扣押外的其他强制措施。"
        ]
      } }),
      concept("行政复议", { type: "procedure", importance: 89, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政复议法", article: "全文（2023 年 9 月修订，2024 年 1 月施行）", url: flk.administrativeReconsideration }],
        judicialInterpretations: [
          { title: "最高人民法院关于适用《中华人民共和国行政复议法》若干问题的解释", year: 2024, issuer: "最高人民法院", summary: "明确复议机关、复议范围、复议前置等程序问题。" }
        ],
        practicePoints: [
          "复议机关：本级人民政府（垂直领导机关除外）或上一级行政机关。",
          "复议前置：自然资源权属争议、纳税争议等。",
          "一般复议期限：知道行为之日起 60 日内。"
        ]
      } }),
      concept("行政诉讼", { type: "procedure", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政诉讼法", article: "全文（2017 年修正）", url: flk.administrativeLitigation }],
        practicePoints: [
          "受案范围：对具体行政行为不服可起诉；部分抽象行政行为可附带审查。",
          "诉讼时效：知道作出行政行为之日起 6 个月，最长 5 年（不动产）/20 年（其他）。",
          "被告：作出行政行为的行政机关或法律、法规、规章授权的组织。"
        ]
      } }),
      concept("行政赔偿", { type: "rule", importance: 81, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国国家赔偿法", article: "全文（2010 年修正）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "行政赔偿：行政机关及其工作人员违法行使职权侵犯人身权/财产权的，受害人有取得赔偿的权利。",
          "赔偿义务机关：侵权的行政机关或工作人员所在行政机关。",
          "刑事赔偿：行使侦查、检察、审判职权的机关以及看守所、监狱管理机关及其工作人员违法行使职权造成损害的，受害人有取得赔偿的权利。"
        ]
      } }),
      concept("行政程序", { type: "procedure", importance: 83, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第五章 行政处罚的决定", url: flk.administrativePenalty }],
        practicePoints: [
          "一般程序：调查—告知—听证—决定。",
          "简易程序：违法事实确凿并有法定依据，对公民处 200 元以下、对法人或其他组织处 3000 元以下罚款或警告。",
          "程序违法是行政诉讼和复议中常见的撤销事由。"
        ]
      } }),
      concept("政府信息公开", { type: "law", importance: 80, sourceRefs: ["gov-info-disclosure-regulation", legalDatabaseSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国政府信息公开条例", article: "全文（2019 年修订）", url: "https://app.www.gov.cn/govdata/gov/201904/15/438065/article.html" }
        ],
        practicePoints: [
          "以公开为常态、不公开为例外。",
          "行政机关应主动公开：行政法规、规章、规划、统计、预算、决算、应急、监督检查、行政事业性收费、行政许可/处罚/强制结果等。",
          "依申请公开：公民、法人、其他组织可申请获取相关政府信息；行政机关应在 20 个工作日内答复。"
        ]
      } }),
      concept("行政裁量", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第三十二条至第三十八条", url: flk.administrativePenalty }],
        practicePoints: ["合理行政原则要求：同等情况同等对待，处罚幅度与违法情节相当。裁量明显不当可作为撤销/变更判决的理由。"]
      } }),
      concept("法治政府", { type: "theory", importance: 82, content: {
        practicePoints: ["法治政府建设六大原则：职能科学、权责法定、执法严明、公开公正、廉洁高效、守法诚信。"]
      } }),
      concept("比例原则", { id: "admin-proportionality", type: "theory", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政强制法", article: "第五条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["行政强制应当适当，采用非强制手段可以达到行政管理目的的，不得采用强制手段。"]
      } }),
      concept("行政规范性文件", { id: "admin-normative-doc", type: "concept", importance: 78, content: {
        statuteRefs: [{ lawTitle: "国务院办公厅关于加强行政规范性文件制定和监督管理工作的通知", article: "国办发〔2018〕37号", note: "对行政规范性文件的制定权限、公开征求意见、合法性审核等作出规定。", url: "https://www.gov.cn/zhengce/content/2018-12/15/content_5448106.htm" }],
        practicePoints: [
          "行政规范性文件不得设定行政许可、行政处罚、行政强制等。",
          "公民、法人、其他组织认为规范性文件违法可附带提出审查申请（行政诉讼）。"
        ]
      } }),
      // ===== 姜明安《行政法与行政诉讼法》系统扩 =====
      concept("行政法总论", { id: "admin-overview", type: "theory", importance: 90, sourceRefs: ["textbook-jiangmingan-administrative"], content: {
        practicePoints: [
          "行政法是调整行政关系的法,规范行政权的取得、行使和监督。",
          "行政法渊源：宪法/法律/行政法规/地方性法规/行政规章/行政规范性文件/行政法解释/行政惯例。",
          "行政法特点：公法性/强制性/广泛性/易变性/实体与程序合一。"
        ]
      } }),
      concept("行政法基本原则", { type: "theory", importance: 92, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国行政处罚法", article: "第四条、第五条", url: flk.administrativePenalty },
          { lawTitle: "中华人民共和国行政许可法", article: "第五条至第八条", url: flk.administrativeLicense }
        ],
        practicePoints: [
          "合法行政原则:行政机关必须依照法定权限和程序作出行政行为。",
          "合理行政原则:行政裁量应当符合比例原则(适当性/必要性/均衡性)。",
          "程序正当原则:行政公开/参与/公正。",
          "高效便民原则:提高行政效率,方便人民群众。",
          "诚实信用原则:政府对作出的行政行为负责,因变更/撤销给相对人造成损失的应予补偿。",
          "权责统一原则:违法行政应承担法律责任。"
        ]
      } }),
      concept("行政主体", { type: "institution", importance: 90, content: {
        practicePoints: [
          "行政主体:依法享有行政职权,能够独立承担法律责任的组织。",
          "行政机关/法律法规授权组织/行政委托组织。",
          "公务员:依法履行公职/纳入国家行政编制/由国家财政负担工资福利的工作人员。"
        ]
      } }),
      concept("行政相对人", { type: "concept", importance: 78, content: {
        practicePoints: [
          "行政相对人:在行政法律关系中与行政主体相对应、承受行政行为影响的公民/法人/其他组织。",
          "权利:陈述权/申辩权/申请行政复议权/提起行政诉讼权/获得国家赔偿权/听证权/信息公开申请权。",
          "义务:遵守行政管理秩序/协助行政管理/履行行政行为确定的义务。"
        ]
      } }),
      concept("行政行为概述", { type: "theory", importance: 86, content: {
        practicePoints: [
          "行政行为:行政主体行使行政职权,作出的能够产生行政法律效果的行为。",
          "行政行为分类:抽象行政行为(制定规范性文件) vs 具体行政行为;依职权的/依申请的;单方/双方/多方行为。",
          "行政行为的效力:确定力/拘束力/执行力/公定力。"
        ]
      } }),
      concept("行政许可", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政许可法", article: "全文（2019 年修订）", url: flk.administrativeLicense }],
        practicePoints: [
          "行政许可:行政机关根据公民/法人/其他组织的申请,经依法审查,准予其从事特定活动的行为。",
          "设定权:法律可设定行政许可;必要时行政法规可设定;地方性法规可设定省级地方事务行政许可;规章不得设定行政许可。",
          "实施程序:申请→受理→审查→决定;听证程序适用于重大公共利益事项。",
          "信赖利益保护:合法行政许可被撤销造成财产损失的,行政机关应依法补偿。"
        ]
      } }),
      concept("行政许可的设定权", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政许可法", article: "第十四条至第十七条", url: flk.administrativeLicense }],
        practicePoints: ["法律可设定行政许可;必要时行政法规可设定;地方性法规可设定省级地方事务行政许可;规章不得设定行政许可;地方性法规和省级政府规章不得设定应当由国家统一确定的公民/法人/其他组织的资格/资质的行政许可;不得设定企业或者其他组织的设立登记及其前置性行政许可。"]
      } }),
      concept("行政处罚", { type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "全文（2021 年修订）", url: flk.administrativePenalty }],
        practicePoints: [
          "行政处罚:行政机关对违反行政管理秩序的行为给予的法律制裁。",
          "处罚种类:警告/通报批评/罚款/没收违法所得/没收非法财物/暂扣许可证件/降低资质等级/吊销许可证件/限制开展生产经营活动/责令停产停业/责令关闭/限制从业/行政拘留等。",
          "处罚设定权:法律 > 行政法规 > 地方性法规 > 部门规章/地方政府规章(规章只能设定警告/通报批评或一定数额罚款)。",
          "一事不再罚:同一违法行为不得给予两次以上罚款的行政处罚。"
        ]
      } }),
      concept("行政处罚的管辖和适用", { type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第二十二条至第二十六条", url: flk.administrativePenalty }],
        practicePoints: [
          "地域管辖:由违法行为发生地的行政机关管辖。",
          "级别管辖:县级以上地方人民政府具有行政处罚权。",
          "移送管辖:违法行为构成犯罪的,行政机关必须将案件移送司法机关。",
          "适用规则:从旧兼从轻/不溯及既往/未成年人特殊保护/精神病人特殊保护。"
        ]
      } }),
      concept("行政处罚的裁量", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第三十二条至第三十八条", url: flk.administrativePenalty }],
        practicePoints: [
          "从轻/减轻处罚情形:主动消除/减轻违法行为危害后果/受胁迫/配合查处有立功表现等。",
          "从重处罚情形:严重危害公共安全/危及公共利益/造成严重后果/屡教不改等。",
          "不予处罚:不满 14 周岁的人有违法行为/精神病人在不能辨认/不能控制时/违法行为轻微并及时纠正没有造成危害后果的/除法律另有规定外,违法行为在 2 年内未被发现的。"
        ]
      } }),
      concept("行政强制", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政强制法", article: "全文（2011 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "行政强制措施:限制公民人身自由;查封场所/设施/财物;扣押财物;冻结存款/汇款等。",
          "行政强制执行:加处罚款或者滞纳金;划拨存款/汇款;拍卖/依法处理查封/扣押的场所/设施/财物等。",
          "行政强制由法律设定;行政法规可设定查封/扣押外的其他强制措施。",
          "原则:合法性原则/适当性原则(比例原则)/教育与强制相结合原则。"
        ]
      } }),
      concept("行政征收", { type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国宪法", article: "第十三条第三款", url: flk.constitution }],
        practicePoints: [
          "行政征收:行政主体根据公共利益的需要,依照法定程序将集体土地/单位/个人的财产收归国有的行为。",
          "征收与征用区别:征收改变所有权,征用仅改变使用权,紧急情况下使用。",
          "补偿:征收应依法给予补偿,补偿标准由法律/行政法规规定。"
        ]
      } }),
      concept("行政征用", { type: "institution", importance: 72, content: {
        practicePoints: ["行政征用:行政主体在紧急情况下,依法暂时使用公民/法人财产并给予补偿的行为;典型如防疫/抢险/救灾/救援。"]
      } }),
      concept("行政确认", { type: "institution", importance: 76, content: {
        practicePoints: [
          "行政确认:行政主体对既有的法律关系/法律事实/法律地位予以确认/认定的行为。",
          "如:交通事故责任认定/工伤认定/产权登记/婚姻登记/身份认定。"
        ]
      } }),
      concept("行政裁决", { type: "institution", importance: 76, content: {
        practicePoints: ["行政裁决:行政主体依法对民事纠纷作出裁决的行为;如自然资源权属争议/劳动争议(部分)/知识产权侵权纠纷(部分)。"]
      } }),
      concept("行政检查", { type: "institution", importance: 72, content: {
        practicePoints: ["行政检查:行政主体对相对人遵守法律/法规/规章/行政决定/命令的情况进行了解/监督的行为。"]
      } }),
      concept("行政处罚的程序", { type: "procedure", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政处罚法", article: "第五章 行政处罚的决定", url: flk.administrativePenalty }],
        practicePoints: [
          "一般程序:调查→告知→听证→决定。",
          "简易程序:违法事实确凿并有法定依据,对公民处 200 元以下、对法人或其他组织处 3000 元以下罚款或警告。",
          "听证程序:较大数额罚款/没收较大数额违法所得/非法财物/降低资质等级/吊销许可证件/责令停产停业/责令关闭/限制从业等处罚决定前应告知听证权。"
        ]
      } }),
      concept("行政复议", { type: "procedure", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政复议法", article: "全文（2023 年 9 月修订，2024 年 1 月施行）", url: flk.administrativeReconsideration }],
        practicePoints: [
          "复议机关:本级人民政府(垂直领导机关除外)或上一级行政机关。",
          "复议前置:自然资源权属争议/纳税争议等。",
          "一般复议期限:知道行为之日起 60 日内;60 日内未告知的,自知道或应当知道行政行为内容之日起最长 1 年。",
          "复议决定:维持/撤销/变更/确认违法/责令履行/确认无效。"
        ]
      } }),
      concept("行政诉讼", { type: "procedure", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政诉讼法", article: "全文（2017 年修正）", url: flk.administrativeLitigation }],
        practicePoints: [
          "受案范围:对具体行政行为不服的,可提起行政诉讼。",
          "复议后诉讼:除复议前置案件外,对具体行政行为不服的可以先复议再诉讼,也可以直接诉讼。",
          "起诉期限:知道作出行政行为之日起 6 个月,最长 5 年(不动产)/20 年(其他)。",
          "被告:作出行政行为的行政机关或法律、法规、规章授权的组织。"
        ]
      } }),
      concept("行政诉讼的原告", { type: "concept", importance: 78, content: {
        practicePoints: [
          "行政诉讼原告:认为行政行为侵犯其合法权益的公民/法人/其他组织。",
          "原告资格:与行政行为有法律上利害关系的组织/个人。",
          "特殊原告:受害人(治安管理处罚案);相邻权人;公平竞争权人;投资人(外商投资企业);股份公司股东(代表诉讼)。"
        ]
      } }),
      concept("行政诉讼的受案范围", { type: "concept", importance: 80, content: {
        practicePoints: [
          "可诉:行政处罚/行政强制/行政许可/行政确认/行政裁决/行政征收/行政征用/行政检查等具体行政行为;某些抽象行政行为可附带审查。",
          "不可诉:国家行为/抽象行政行为/内部行政行为/法律规定由行政机关最终裁决的行政行为/刑事司法行为/行政调解/行政仲裁/行政指导/重复处理行为/对公民权利义务不产生实际影响的行为。"
        ]
      } }),
      concept("行政赔偿", { type: "rule", importance: 82, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国国家赔偿法", article: "全文（2010 年修正）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "行政赔偿:行政机关及其工作人员违法行使职权侵犯人身权/财产权的,受害人有取得赔偿的权利。",
          "赔偿义务机关:侵权的行政机关或工作人员所在行政机关;两个以上行政机关共同侵权/先后作出具体行政行为/复议机关加重损害的,共同/分别承担赔偿义务。",
          "刑事赔偿:行使侦查/检察/审判职权的机关以及看守所/监狱管理机关及其工作人员违法行使职权造成损害的,受害人有取得赔偿的权利。"
        ]
      } }),
      concept("国家赔偿的范围", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国国家赔偿法", article: "第三条、第四条、第十七条、第十八条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "行政赔偿范围:违法拘留/违法限制人身自由/非法拘禁/殴打/虐待/违法使用武器/刑讯逼供/违法征收/违法摊派/违法吊销许可证/责令停产停业/其他违法行为造成财产损害的。",
          "刑事赔偿范围:错误拘留/错误逮捕/错误判决/刑讯逼供/殴打虐待/违法使用武器/违法对财产查封/扣押/冻结/追缴。"
        ]
      } }),
      concept("国家赔偿的计算", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国国家赔偿法", article: "第三十三条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "人身自由赔偿:每日按国家上年度职工日平均工资计算。",
          "生命健康权赔偿:造成身体伤害的,医疗费/护理费/误工费;造成死亡的,死亡赔偿金/丧葬费(总额为国家上年度职工年平均工资的 20 倍)+ 抚养人生活费。",
          "精神损害抚慰金:造成严重后果的,应当支付相应的精神损害抚慰金。"
        ]
      } }),
      concept("行政程序法", { type: "procedure", importance: 80, content: {
        practicePoints: [
          "行政程序:行政机关作出行政行为的方式/步骤/时限/顺序。",
          "中国目前没有统一的行政程序法典,程序规则散见于各单行法。",
          "正当程序要求:告知/说明理由/听取陈述和申辩/公开/参与/比例原则。"
        ]
      } }),
      concept("重大行政决策", { type: "procedure", importance: 76, content: {
        practicePoints: [
          "重大行政决策范围:制定有关公共服务/市场监管/社会管理/环境保护等方面的重大公共政策和措施;制定经济和社会发展等方面的重要规划;制定开发利用/保护重要自然资源和文化资源的重大公共政策和措施;决定在本行政区域实施的重大公共建设项目;决定对经济社会发展有重大影响/涉及重大公共利益或者社会公众切身利益的其他重大事项。",
          "程序:公众参与/专家论证/风险评估/合法性审查/集体讨论决定(五步走)。"
        ]
      } }),
      concept("政府信息公开", { type: "law", importance: 80, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国政府信息公开条例", article: "全文（2019 年修订）", url: "https://app.www.gov.cn/govdata/gov/201904/15/438065/article.html" }
        ],
        practicePoints: [
          "以公开为常态、不公开为例外。",
          "行政机关应主动公开:行政法规/规章/规划/统计/预算/决算/应急/监督检查/行政事业性收费/行政许可/处罚/强制结果等。",
          "依申请公开:公民/法人/其他组织可申请获取相关政府信息;行政机关应在 20 个工作日内答复。"
        ]
      } }),
      concept("比例原则", { id: "admin-proportionality", type: "theory", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政强制法", article: "第五条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "比例原则 (Verhältnismäßigkeitsgrundsatz):适当性/必要性/均衡性三阶审查。",
          "行政强制应当适当,采用非强制手段可以达到行政管理目的的,不得采用强制手段。"
        ]
      } }),
      concept("行政诉讼的证据", { type: "rule", importance: 78, content: {
        practicePoints: [
          "证据种类:书证/物证/视听资料/电子数据/证人证言/当事人陈述/鉴定意见/勘验笔录/现场笔录。",
          "举证责任:被告(行政机关)对作出的具体行政行为的合法性承担举证责任。",
          "原告对下列事项承担举证责任:证明起诉符合法定条件/在起诉被告不作为的案件中证明其提出申请的事实/在一并提起的行政赔偿诉讼中证明因受被诉行为侵害而造成损失的事实。"
        ]
      } }),
      concept("行政诉讼的判决", { type: "rule", importance: 82, content: {
        practicePoints: [
          "驳回诉讼请求判决:行政行为证据确凿/适用法律/法规正确/符合法定程序。",
          "撤销判决:主要证据不足/适用法律/法规错误/违反法定程序/超越职权/滥用职权/明显不当。",
          "确认违法/确认无效判决:行政行为依法应当撤销但撤销会给国家利益/社会公共利益造成重大损害。",
          "变更判决:行政处罚显失公正/其他行政行为涉及对款额的确定/认定确有错误。",
          "履行判决:被告不履行/拖延履行法定职责。",
          "给付判决:行政赔偿/行政机关依法应当支付抚恤金/最低生活保障待遇/社会保险待遇等。"
        ]
      } })
    ]
  },
  {
    id: "system-civil",
    title: "民法典",
    domain: "civil",
    colorKey: "civil",
    systemPosition: [5.4, 0.7, 3.8],
    systemRadius: 3.35,
    systemInclination: -0.04,
    shortDescription: "民法典调整平等主体之间的人身关系和财产关系，是民事生活的中心星核。",
    sourceRefs: ["flk-civil-code", "spp-civil-code-parts", "flk-pipl", "flk-data-security", pendingSource],
    concepts: [
      concept("总则编", { id: "civil-general-book", type: "code", importance: 95, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一编 总则（第一至一百三十七条）", url: flk.civilCode, note: "总则编对民事活动的一般原则作出规定。" }
        ],
        practicePoints: [
          "总则编是民法典其他六编的'一般法'，其他编有特别规定的优先适用。",
          "法源位阶：法律 > 行政法规 > 地方性法规 > 规章；习惯法仅在法律未规定时适用。",
          "处理民事案件，先看请求权基础（请求权基础分析法），再对应到具体条文。"
        ]
      } }),
      concept("民事主体", { id: "civil-subject", type: "concept", importance: 88, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第二条、第十三条至第七十五条", url: flk.civilCode, note: "规定自然人、法人、非法人组织的民事权利能力和行为能力。" }
        ],
        practicePoints: [
          "民事主体涵盖自然人、法人和非法人组织三类。",
          "判断行为效力时，先看主体是否具备相应民事行为能力。",
          "法人独立承担民事责任，股东以出资为限。"
        ]
      } }),
      concept("民事法律行为", { id: "civil-juristic-act", type: "concept", importance: 89, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一百三十三条至第一百五十七条", url: flk.civilCode, note: "规定法律行为的成立要件、效力类型和无效/可撤销情形。" }
        ],
        practicePoints: [
          "三阶层判断：成立 → 生效 → 效力瑕疵（无效/可撤销/效力待定）。",
          "意思表示真实是生效的核心要件，受欺诈/胁迫/重大误解可主张撤销。",
          "违反法律、行政法规强制性规定的民事法律行为无效，但该强制性规定不导致无效的除外。"
        ]
      } }),
      concept("代理", { id: "civil-agency", type: "rule", importance: 82, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一百六十一条至第一百七十四条", url: flk.civilCode, note: "规定法定代理、委托代理、表见代理。" }
        ],
        practicePoints: [
          "表见代理（民法典第一百七十二条）保护善意第三人，是商事交易常见争议焦点。",
          "超越代理权签订的合同，对被代理人不发生效力，但相对人可催告追认。",
          "职务代理：工作人员在职务范围内的行为由用人单位承担。"
        ]
      } }),
      concept("民事责任", { id: "civil-civil-liability", type: "rule", importance: 88, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一百一十六条至第一百三十条", url: flk.civilCode, note: "规定民事责任的承担方式、归责原则和免责事由。" }
        ],
        practicePoints: [
          "民事责任以填补损害为原则，损害赔偿以实际损失 + 可得利益为限。",
          "精神损害赔偿限于人格权侵害等法定情形。",
          "连带责任和按份责任：法律规定或当事人约定。"
        ]
      } }),
      concept("诉讼时效", { id: "civil-limitation", type: "rule", importance: 83, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一百八十八条至第一百九十九条", url: flk.civilCode, note: "普通诉讼时效三年，最长权利保护期间二十年。" }
        ],
        judicialInterpretations: [
          { title: "最高人民法院关于审理民事案件适用诉讼时效制度若干问题的规定", year: 2020, issuer: "最高人民法院", summary: "明确了诉讼时效起算点、中断、中止的具体认定标准。", url: "https://www.court.gov.cn/judicial-interpretation/index.html" }
        ],
        practicePoints: [
          "普通诉讼时效为三年，自权利人知道或应当知道权利受到损害及义务人之日起算。",
          "诉讼时效中断事由：起诉/主张/对方同意履行；中断后时效重新计算。",
          "超过诉讼时效并不丧失起诉权，但对方提出时效抗辩则可能败诉。"
        ]
      } }),
      concept("物权编", { id: "civil-property-book", type: "code", importance: 92, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第二编 物权（第二百零四条至第四百六十二条）", url: flk.civilCode, note: "规定物权的设立、变更、转让、消灭和各类物权制度。" }
        ],
        practicePoints: [
          "物权法定：物权的种类和内容由法律规定，不得约定。",
          "公示公信：动产以交付、不动产以登记为公示方式。",
          "物权效力优先于债权，但法律另有规定除外（如买卖不破租赁）。"
        ]
      } }),
      concept("所有权", { id: "civil-ownership", type: "concept", importance: 91, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第二百四十一条至第二百六十二条", url: flk.civilCode, note: "规定所有权的内容、行使和取得方式。" }
        ],
        practicePoints: [
          "所有权包括占有、使用、收益、处分四项权能。",
          "国家所有、集体所有、私人所有是所有权的三种类型。",
          "业主对建筑物区分所有：业主对专有部分享有所有权，对共有部分享有共有和共同管理的权利。"
        ]
      } }),
      concept("不动产登记", { id: "civil-real-estate-registration", type: "institution", importance: 87, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第二百零九条至第二百二十二条", url: flk.civilCode, note: "规定不动产登记的效力、机构和申请程序。" },
          { lawTitle: "不动产登记暂行条例", article: "全文", note: "规范不动产登记的申请、受理、审核、登簿等程序。" }
        ],
        practicePoints: [
          "不动产物权变动原则上以登记为生效要件（登记要件主义）。",
          "预告登记保全债权请求权；异议登记阻止错误登记。",
          "查询不动产登记簿是不动产交易前的基本动作。"
        ]
      } }),
      concept("用益物权", { id: "civil-usufruct", type: "field", importance: 84, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第三百二十三条至第三百九十一条", url: flk.civilCode, note: "规定土地承包经营权、建设用地使用权、宅基地使用权、居住权、地役权。" }
        ],
        practicePoints: [
          "居住权是民法典新增的用益物权类型，满足特定群体（如老年人、婚姻关系中弱势方）的居住需求。",
          "地役权（如通行、取水）通过合同设立，自登记时设立。",
          "建设用地使用权到期后依《城市房地产管理法》续期。"
        ]
      } }),
      concept("担保物权", { id: "civil-security-interest", type: "field", importance: 86, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第三百九十四条至第四百五十六条", url: flk.civilCode, note: "规定抵押权、质权、留置权三种担保物权。" }
        ],
        judicialInterpretations: [
          { title: "最高人民法院关于适用《中华人民共和国民法典》有关担保制度的解释", year: 2020, issuer: "最高人民法院", documentNumber: "法释〔2020〕28号", summary: "对担保物权、保证合同、非典型担保等作出系统解释。" }
        ],
        practicePoints: [
          "抵押权设立：不动产办登记、动产办登记或合同生效（看是否登记对抗主义）。",
          "动产质权：交付生效；权利质权：办出质登记或交付。",
          "留置权限于企业之间留置，且留置物与债权属于同一法律关系。"
        ]
      } }),
      concept("合同编", { id: "civil-contract-book", type: "code", importance: 94, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第三编 合同（第四百六十三条至第五百九十一条）", url: flk.civilCode, note: "合同编共 526 条，是民法典条文最多的编。" }
        ],
        practicePoints: [
          "合同编通则（一般规定、订立、效力、履行、保全、变更转让、解除、违约责任）适用于所有合同。",
          "合同自由与合同正义并重：格式条款、显失公平受规制。",
          "实务处理思路：先看合同效力（无效/可撤销/待定），再看是否成立/生效，最后判断履行和违约。"
        ]
      } }),
      concept("合同订立", { id: "civil-contract-formation", type: "rule", importance: 90, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第四百七十一条至第四百八十八条", url: flk.civilCode, note: "要约、承诺、合同成立时间地点。" }
        ],
        practicePoints: [
          "要约 vs 要约邀请：商品标价陈列属要约邀请（除非明确表示愿受约束）。",
          "承诺生效时合同成立；当事人约定书面形式的，书面形式完成时成立。",
          "电子商务：电子合同成立时间依《电子商务法》和平台规则。"
        ]
      } }),
      concept("合同效力", { id: "civil-contract-validity", type: "rule", importance: 89, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第四百九十七条至第五百零六条", url: flk.civilCode, note: "无效合同、可撤销合同、效力待定合同。" }
        ],
        practicePoints: [
          "五类无效情形：虚假意思表示；违反强制性规定；违背公序良俗；恶意串通；违反法律形式。",
          "可撤销合同：欺诈、胁迫、重大误解、显失公平，撤销权为形成权。",
          "撤销权的行使：自知道或应当知道起 1 年；最长期限 5 年。"
        ]
      } }),
      concept("合同履行", { id: "civil-contract-performance", type: "rule", importance: 88, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第五百零九条至第五百三十四条", url: flk.civilCode, note: "全面履行原则、协作履行、情势变更。" }
        ],
        practicePoints: [
          "全面履行原则：按约定的主体、标的、数量、质量、价款、方式、地点、期限履行。",
          "不安抗辩权（民法典第五百二十七条）：先履行方有证据证明对方丧失履行能力时，可中止履行。",
          "情势变更：合同成立后客观情况发生重大变化，继续履行明显不公平，可请求法院变更或解除。"
        ]
      } }),
      concept("合同解除", { id: "civil-contract-termination", type: "rule", importance: 84, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第五百六十二条至第五百七十六条", url: flk.civilCode, note: "约定解除和法定解除。" }
        ],
        practicePoints: [
          "法定解除的五种情形（民法典第五百六十三条）：不可抗力、预期违约、迟延催告、根本违约、其他法定情形。",
          "解除权行使：通知对方即生效；对方有异议可请求法院/仲裁确认。",
          "合同解除后，尚未履行的终止履行；已履行的可请求恢复原状或采取其他补救措施。"
        ]
      } }),
      concept("违约责任", { id: "civil-breach-liability", type: "rule", importance: 92, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第五百七十七条至第五百九十五条", url: flk.civilCode, note: "违约责任的承担方式和归责原则。" }
        ],
        practicePoints: [
          "违约责任归责原则：原则上无过错责任（违约即担责），除非不可抗力或约定免责。",
          "继续履行（强制履行）适用于非金钱债务，但有除外情形（法律上或事实上不能履行等）。",
          "违约金：约定过高/过低可请求法院/仲裁调整（民法典第五百八十五条）。",
          "定金罚则：给付定金方违约，无权要求返还；收受定金方违约，双倍返还。"
        ]
      } }),
      concept("典型合同-买卖", { id: "civil-sale-contract", type: "institution", importance: 88, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第五百九十五条至第六百三十四条", url: flk.civilCode, note: "买卖合同的定义、效力、风险负担、孳息归属。" }
        ],
        practicePoints: [
          "标的物风险转移：原则上以交付为分界点（交付前卖方承担，交付后买方承担）。",
          "买受人检验义务：收到标的物后应在约定或合理期间内检验。",
          "买受人逾期支付价款，需支付逾期利息（按 LPR 计算或按约定）。"
        ]
      } }),
      concept("典型合同-借款", { id: "civil-loan-contract", type: "institution", importance: 86, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第六百六十七条至第六百八十条", url: flk.civilCode, note: "借款合同的订立、利息约定、借款人义务。" }
        ],
        judicialInterpretations: [
          { title: "最高人民法院关于审理民间借贷案件适用法律若干问题的规定", year: 2020, issuer: "最高人民法院", documentNumber: "法释〔2020〕17号", summary: "民间借贷利率司法保护上限为合同成立时一年期 LPR 的 4 倍。" }
        ],
        practicePoints: [
          "自然人之间借款合同：自实际交付时生效（实践合同）。",
          "民间借贷利率司法保护上限为合同成立时一年期 LPR 的 4 倍，超过部分不予支持。",
          "预先在本金中扣除利息的，按实际出借金额计本金（'砍头息'禁止）。"
        ]
      } }),
      concept("典型合同-保证", { id: "civil-guarantee-contract", type: "institution", importance: 85, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第六百八十一条至第七百零二条", url: flk.civilCode, note: "保证合同的订立、保证方式、保证期间。" }
        ],
        practicePoints: [
          "保证方式：未约定或约定不明时按一般保证处理（民法典修订变化）。",
          "保证期间：未约定时为主债务履行期届满之日起 6 个月。",
          "一般保证 vs 连带责任保证：先诉抗辩权的有无是核心区别。"
        ]
      } }),
      concept("人格权编", { id: "civil-personality-book", type: "code", importance: 91, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第四编 人格权（第九百八十九条至第一千零三十九条）", url: flk.civilCode, note: "人格权独立成编是民法典重大创新。" }
        ],
        practicePoints: [
          "人格权请求权：人格权受侵害时，可请求停止侵害、排除妨碍、消除影响、恢复名誉、赔偿损失。",
          "人格权许可使用：可许可他人使用（肖像是典型），但不得违反公序良俗。",
          "死者人格利益保护：近亲属可请求保护已故者的姓名、肖像、名誉等。"
        ]
      } }),
      concept("生命权", { id: "civil-life-right", type: "concept", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零二条", url: flk.civilCode, note: "自然人享有生命权。" }],
        practicePoints: ["生命权是最高位阶的人格权；侵害生命权需承担死亡赔偿金、丧葬费等。"]
      } }),
      concept("隐私权", { id: "civil-privacy", type: "concept", importance: 88, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一千零三十二条、第一千零三十三条", url: flk.civilCode, note: "隐私权定义和侵害行为。" },
          { lawTitle: "中华人民共和国个人信息保护法", article: "第四条", url: flk.pipl, note: "个人信息与隐私的区分。" }
        ],
        practicePoints: [
          "隐私 = 私人生活安宁 + 不愿为他人知晓的私密空间、私密活动、私密信息。",
          "隐私权 vs 个人信息：私密信息同时构成隐私和个人信息，适用隐私权保护。",
          "进入他人住宅、偷拍偷录、安装窃听设备等行为构成隐私权侵害。"
        ]
      } }),
      concept("个人信息保护", { id: "civil-personal-info", type: "law", importance: 91, sourceRefs: ["flk-pipl", "flk-civil-code", pendingSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国个人信息保护法", article: "全文（七十四个条文）", url: flk.pipl, note: "我国第一部专门规定个人信息保护的法律，2021 年 11 月 1 日施行。" },
          { lawTitle: "中华人民共和国民法典", article: "第一千零三十四条至第一千零三十九条", url: flk.civilCode, note: "民法典对个人信息保护的原则性规定。" }
        ],
        judicialInterpretations: [
          { title: "最高人民法院关于审理使用人脸识别技术处理个人信息相关民事案件适用法律若干问题的规定", year: 2021, issuer: "最高人民法院", documentNumber: "法释〔2021〕15号", summary: "对经营者采用人脸识别技术处理人脸信息的侵权认定作出规定。" }
        ],
        practicePoints: [
          "处理个人信息应遵循合法、正当、必要、诚信原则，并取得同意。",
          "敏感个人信息（生物识别、宗教信仰、医疗健康、金融账户、行踪轨迹等）需取得'单独同意'。",
          "个人信息权益可主张：停止侵害、消除影响、赔偿损失；情节严重的可主张精神损害赔偿。"
        ]
      } }),
      concept("肖像权", { id: "civil-portrait-right", type: "concept", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零一十八条、第一千零一十九条", url: flk.civilCode }],
        practicePoints: ["肖像权包括制作、使用、公开、许可使用四项权能；'AI 换脸'和'深度伪造'是当前热点。"]
      } }),
      concept("名誉权", { id: "civil-reputation-right", type: "concept", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零二十四条、第一千零二十五条", url: flk.civilCode }],
        practicePoints: ["名誉权保护社会评价；新闻报道、舆论监督可援引'合理核实义务'作为抗辩。"]
      } }),
      concept("婚姻家庭编", { id: "civil-marriage-family", type: "code", importance: 83, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五编 婚姻家庭（第一千零四十条至第一千零一百一十条）", url: flk.civilCode }],
        practicePoints: [
          "结婚：双方自愿 + 达到法定婚龄（男 22，女 20）；登记生效。",
          "离婚冷静期：协议离婚设置 30 日冷静期，期满后 30 日内双方应共同申请发给离婚证。",
          "夫妻共同财产：除约定外，婚后所得原则上为共同财产。"
        ]
      } }),
      concept("结婚", { id: "civil-marriage-formation", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零四十九条", url: flk.civilCode }],
        practicePoints: ["结婚登记需双方亲自到场；无效婚姻情形：重婚、禁止结婚的近亲属、未达到法定婚龄。"]
      } }),
      concept("离婚", { id: "civil-divorce", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零七十六条、第一千零七十七条、第一千零七十九条", url: flk.civilCode }],
        practicePoints: [
          "协议离婚：双方自愿 + 对财产、子女问题达成一致 + 30 日冷静期满。",
          "诉讼离婚：调解无效且确认感情破裂的，应准予离婚（《民法典》列举的 5 种情形）。",
          "离婚损害赔偿：重婚/与他人同居/家暴/虐待遗弃/其他重大过错 5 种法定情形。"
        ]
      } }),
      concept("继承编", { id: "civil-inheritance", type: "code", importance: 78, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第六编 继承（第一千一百一十九条至第一千一百六十三条）", url: flk.civilCode }],
        practicePoints: [
          "法定继承第一顺序：配偶、子女、父母；第二顺序：兄弟姐妹、祖父母、外祖父母。",
          "遗嘱继承优先于法定继承；公证遗嘱不再具有优先效力（民法典取消公证遗嘱优先）。",
          "遗赠扶养协议：受扶养人将遗产赠与扶养人，效力优先于遗嘱和法定继承。"
        ]
      } }),
      concept("法定继承", { id: "civil-intestate-succession", type: "institution", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百二十六条至第一千一百三十二条", url: flk.civilCode }],
        practicePoints: ["同一顺序继承人一般平均分配；对生活有特殊困难又缺乏劳动能力的予以照顾。"]
      } }),
      concept("遗嘱继承", { id: "civil-testamentary-succession", type: "institution", importance: 73, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百三十三条至第一千一百四十四条", url: flk.civilCode }],
        practicePoints: ["遗嘱形式：自书、代书、打印、录音录像、口头、公证 6 种；打印遗嘱需 2 个以上见证人。"]
      } }),
      concept("侵权责任编", { id: "civil-tort-liability", type: "code", importance: 90, sourceRefs: ["spp-civil-code-parts", legalDatabaseSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第七编 侵权责任（第一千一百六十四条至第一千二百五十八条）", url: flk.civilCode }],
        practicePoints: [
          "一般侵权构成：违法行为 + 主观过错 + 损害事实 + 因果关系。",
          "特殊侵权：产品责任、医疗损害、环境污染、高度危险、动物致害等实行无过错或过错推定。",
          "见义勇为受害可向侵权人或受益人主张补偿。"
        ]
      } }),
      concept("产品责任", { id: "civil-product-liability", type: "institution", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百零二条至第一千二百零七条", url: flk.civilCode }],
        practicePoints: [
          "因产品缺陷造成他人损害，生产者承担无过错责任；销售者承担过错责任。",
          "受害人可以向生产者或销售者请求赔偿。",
          "生产销售假药、缺陷汽车、家电等适用惩罚性赔偿。"
        ]
      } }),
      concept("医疗损害责任", { id: "civil-medical-liability", type: "institution", importance: 80, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一千二百一十八条至第一千二百二十八条", url: flk.civilCode },
          { lawTitle: "医疗事故处理条例", article: "全文", note: "医疗事故的认定和赔偿。" }
        ],
        practicePoints: [
          "医疗机构过错推定情形：违反诊疗规范、隐匿/拒绝提供病历资料、伪造篡改病历。",
          "患者一方不配合医疗机构符合诊疗规范的诊疗活动，医疗机构不承担赔偿责任。",
          "紧急救助义务：因抢救生命垂危患者等紧急情况所造成的不良后果，不属于医疗损害。"
        ]
      } }),
      concept("环境污染责任", { id: "civil-environmental-liability", type: "institution", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百二十九条至第一千二百三十五条", url: flk.civilCode }],
        practicePoints: ["环境污染和生态破坏实行无过错责任 + 因果关系举证责任倒置。"]
      } }),
      concept("高度危险责任", { id: "civil-high-risk-liability", type: "institution", importance: 73, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百三十六条至第一千二百四十四条", url: flk.civilCode }],
        practicePoints: ["民用核设施、民用航空器、危险化学品、高空高压等致害适用无过错责任。"]
      } }),
      concept("动物致害责任", { id: "civil-animal-liability", type: "institution", importance: 70, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百四十五条至第一千二百五十一条", url: flk.civilCode }],
        practicePoints: [
          "饲养动物致害适用无过错责任（饲养人或管理人承担）。",
          "违反管理规定未对动物采取安全措施致害的，加重责任。",
          "禁止饲养的烈性犬等危险动物致害的，饲养人或管理人承担侵权责任。"
        ]
      } }),
      concept("建筑物倒塌责任", { id: "civil-building-collapse", type: "institution", importance: 68, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百五十二条", url: flk.civilCode }],
        practicePoints: ["建筑物倒塌致害：建设单位 + 施工单位连带责任；其他责任人可追偿。"]
      } }),
      concept("网络侵权", { id: "civil-online-tort", type: "institution", importance: 79, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国民法典", article: "第一千一百九十四条至第一千一百九十七条", url: flk.civilCode },
          { lawTitle: "中华人民共和国个人信息保护法", article: "相关条款", url: flk.pipl }
        ],
        judicialInterpretations: [
          { title: "最高人民法院关于审理利用信息网络侵害人身权益民事纠纷案件适用法律若干问题的规定", year: 2020, issuer: "最高人民法院", documentNumber: "法释〔2020〕17号", summary: "网络服务提供者的连带责任和'通知-删除'规则。" }
        ],
        practicePoints: [
          "网络用户利用网络侵害他人民事权益的，承担侵权责任。",
          "网络服务提供者知道或应当知道侵权未采取措施的，与网络用户承担连带责任。",
          "'通知-删除'规则：权利人通知后，平台应及时采取必要措施。"
        ]
      } }),
      concept("好意施惠", { id: "civil-good-samaritan", type: "concept", importance: 65, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千二百四十七条", url: flk.civilCode, note: "因自愿实施紧急救助行为造成受助人损害的，救助人不承担民事责任。" }],
        practicePoints: ["好意施惠（情谊行为）一般不产生法律关系；紧急救助豁免适用《民法典》第一百二十四条好人条款。"]
      } }),
      concept("安全保障义务", { id: "civil-safety-obligation", type: "rule", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百九十八条", url: flk.civilCode }],
        practicePoints: ["宾馆、商场、银行、车站、机场等经营场所、公共场所的经营者未尽安全保障义务致害的，承担侵权责任。"]
      } }),
      // ===== 王利明《民法学》系统扩:总则编深化 =====
      concept("民法典的编纂", { type: "history", importance: 80, sourceRefs: ["textbook-wangliming-civil", "spp-civil-code-parts"], content: {
        practicePoints: [
          "2014 年党的十八届四中全会决定'编纂民法典'。",
          "2017 年通过民法总则；2018-2020 年分编审议；2020 年 5 月 28 日十三届全国人大三次会议通过《中华人民共和国民法典》，2021 年 1 月 1 日施行。",
          "民法典共 7 编 1260 条,系统整合新中国民事立法成果。"
        ]
      } }),
      concept("民法的调整对象", { type: "theory", importance: 80, sourceRefs: ["textbook-wangliming-civil"], content: {
        practicePoints: [
          "民法调整平等主体的自然人、法人和非法人组织之间的人身关系和财产关系。",
          "民法不调整：行政管理关系（行政法调整）/刑事关系（刑法调整）/劳动关系中行政管理部分（劳动法调整）。",
          "平等性 + 财产性 + 人身性 = 民法调整对象的三要素。"
        ]
      } }),
      concept("民法的基本原则", { type: "theory", importance: 92, sourceRefs: ["textbook-wangliming-civil"], content: {
        practicePoints: [
          "《民法典》第四条至第十一条规定的基本原则：平等/自愿/公平/诚信/合法/公序良俗/绿色。",
          "平等原则：民事主体法律地位一律平等。",
          "诚信原则：民事主体从事民事活动应当秉持诚实,恪守承诺。",
          "公序良俗原则：民事活动不得违反公共秩序和善良风俗。",
          "绿色原则：民事活动应当有利于节约资源、保护生态环境。"
        ]
      } }),
      concept("自然人", { id: "civil-natural-person", type: "concept", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第十三条至第二十六条", url: flk.civilCode }],
        practicePoints: [
          "自然人：从出生时起,具有民事权利能力,死亡时消灭。",
          "自然人享有生命权/身体权/健康权/姓名权/肖像权/名誉权/荣誉权/隐私权/婚姻自主权等人身权利。",
          "自然人享有所有权/用益物权/担保物权/债权/知识产权等财产权利。"
        ]
      } }),
      concept("法人", { id: "civil-legal-person", type: "concept", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五十七条至第六十九条", url: flk.civilCode }],
        practicePoints: [
          "法人：具有民事权利能力和民事行为能力,依法独立享有民事权利和承担民事义务的组织。",
          "法人成立条件：依法成立/有必要的财产或经费/有自己的名称/组织机构和场所/能独立承担民事责任。",
          "法人分类：营利法人/非营利法人/特别法人。"
        ]
      } }),
      concept("非法人组织", { id: "civil-unincorporated-org", type: "concept", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一百零二条至第一百零四条", url: flk.civilCode }],
        practicePoints: [
          "非法人组织：个人独资企业/合伙企业/不具有法人资格的专业服务机构等。",
          "非法人组织的财产不足以清偿债务的,其出资人或者设立人承担无限责任。",
          "民法典对非法人组织作了明确规定,弥补了原《民法通则》的空白。"
        ]
      } }),
      concept("监护", { id: "civil-guardianship", type: "institution", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二十六条至第三十九条", url: flk.civilCode }],
        practicePoints: [
          "监护：监护人对被监护人的人身、财产及其他合法权益依法进行监督和保护。",
          "法定监护人：父母/祖父母外祖父母/成年兄姐（顺序在前者优先）。",
          "意定监护（《民法典》第三十三条）：具有完全民事行为能力的成年人可以书面确定监护人。"
        ]
      } }),
      concept("宣告失踪", { id: "civil-missing-person", type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四十条至第四十五条", url: flk.civilCode }],
        practicePoints: ["自然人下落不明满 2 年,利害关系人可向法院申请宣告失踪；财产由代管人代管,代管人应当妥善管理失踪人的财产。"]
      } }),
      concept("宣告死亡", { id: "civil-presumed-death", type: "institution", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四十六条至第五十三条", url: flk.civilCode }],
        practicePoints: [
          "下落不明满 4 年,或因意外事件下落不明满 2 年,利害关系人可向法院申请宣告死亡。",
          "宣告死亡与实际死亡的法律效果不同,被宣告死亡人重新出现,经本人或利害关系人申请,可撤销死亡宣告。",
          "宣告死亡后,婚姻关系自死亡宣告之日起消灭。"
        ]
      } }),
      concept("意思表示", { id: "civil-declaration-of-intent", type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一百三十七条至第一百四十二条", url: flk.civilCode }],
        practicePoints: [
          "意思表示：行为人将欲发生民事法律效果的内心意思以一定方式表达于外部的行为。",
          "意思表示方式：明示（口头/书面/其他）/默示（通过行为推定）。",
          "意思表示生效：对话方式：相对人了解时生效；非对话方式：到达相对人时生效。"
        ]
      } }),
      concept("意思表示瑕疵", { id: "civil-vitiated-intent", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一百四十七条至第一百五十二条", url: flk.civilCode }],
        practicePoints: [
          "欺诈：一方以欺诈手段使对方在违背真实意思的情况下实施的民事法律行为,受欺诈方有权请求撤销。",
          "胁迫：一方或者第三人以胁迫手段,使对方在违背真实意思的情况下实施的民事法律行为,受胁迫方有权请求撤销。",
          "重大误解：基于重大误解实施的民事法律行为,行为人有权请求撤销。",
          "撤销权消灭：自知道或者应当知道撤销事由之日起 1 年内/重大误解的 90 日内没有行使；受胁迫的 1 年内没有行使；当事人自民事法律行为发生之日起 5 年内没有行使。"
        ]
      } }),
      concept("无效民事法律行为", { id: "civil-void-act", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一百四十三条至第一百五十七条", url: flk.civilCode }],
        practicePoints: [
          "无效情形：虚假意思表示/违反法律行政法规强制性规定/违背公序良俗/恶意串通损害他人合法权益。",
          "民事法律行为部分无效,不影响其他部分效力的,其他部分仍然有效。",
          "无效或被撤销的民事法律行为,自始没有法律约束力。"
        ]
      } }),
      concept("附条件附期限法律行为", { id: "civil-conditional-act", type: "rule", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一百五十八条至第一百六十条", url: flk.civilCode }],
        practicePoints: ["附生效条件的法律行为,自条件成就时生效;附解除条件的法律行为,自条件成就时失效;附期限的法律行为,自期限届至时生效/消灭。"]
      } }),
      // ===== 物权编深化 =====
      concept("物权法总论", { id: "civil-property-overview", type: "theory", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二百零四条至第二百二十二条", url: flk.civilCode }],
        practicePoints: [
          "物权：权利人依法对特定的物享有直接支配和排他的权利,包括所有权、用益物权和担保物权。",
          "物权基本原则：平等保护原则/物权法定原则/公示公信原则。",
          "物权的效力：排他效力/优先效力/追及效力。"
        ]
      } }),
      concept("所有权的内容", { id: "civil-ownership-content", type: "concept", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二百四十一条", url: flk.civilCode }],
        practicePoints: [
          "所有权人对自己的不动产或者动产,依法享有占有/使用/收益/处分的权利。",
          "占有：所有人对物的事实上的管领力。",
          "使用：依物的性能和用途加以利用。",
          "收益：收取物所产生的孳息。",
          "处分：决定物的命运（事实处分/法律处分）。"
        ]
      } }),
      concept("建筑物区分所有权", { id: "civil-condo-ownership", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二百七十一条至第二百七十八条", url: flk.civilCode }],
        practicePoints: [
          "业主对建筑物内的住宅/经营性用房等专有部分享有所有权。",
          "对专有部分以外的共有部分享有共有和共同管理的权利。",
          "业主大会和业主委员会：业主共同决定事项,需经参与表决专有部分面积过半且人数过半的业主同意。"
        ]
      } }),
      concept("相邻关系", { id: "civil-neighbor-rights", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二百八十八条至第二百九十六条", url: flk.civilCode }],
        practicePoints: [
          "相邻权利人应当按照有利生产/方便生活/团结互助/公平合理的原则,正确处理相邻关系。",
          "典型情形：用水排水相邻/通行相邻/通风采光日照相邻/相邻土地/建筑物利用。",
          "造成损害的,应当停止侵害、排除妨碍、赔偿损失。"
        ]
      } }),
      concept("共有", { id: "civil-co-ownership", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第二百九十七条至第三百一十条", url: flk.civilCode }],
        practicePoints: [
          "按份共有：两个以上自然人/法人按份享有同一不动产/动产的所有权。",
          "共同共有：基于共同关系（夫妻/家庭/继承）而发生的不分份额的共有。",
          "处分共有物:按份共有人可处分自己的份额;处分共有物或作重大修缮的,需占份额 2/3 以上的按份共有人同意（共同共有人全体同意）。"
        ]
      } }),
      concept("居住权", { id: "civil-residence-right", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第三百六十六条至第三百七十一条", url: flk.civilCode }],
        practicePoints: [
          "居住权是民法典新增的用益物权。",
          "居住权合同一般包括：当事人的姓名/住所;住宅的位置;居住的条件和要求;居住期限。",
          "居住权无偿设立,不得转让/继承,居住权人死亡时居住权消灭。"
        ]
      } }),
      concept("地役权", { id: "civil-easement", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第三百七十二条至第三百八十条", url: flk.civilCode }],
        practicePoints: [
          "地役权：按照合同约定,利用他人的不动产,以提高自己的不动产的效益。",
          "典型情形:通行地役权/取水地役权/排水地役权/采光地役权。",
          "地役权自地役权合同生效时设立;未经登记,不得对抗善意第三人。"
        ]
      } }),
      concept("抵押权", { id: "civil-mortgage", type: "institution", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第三百九十四条至第四百一十六条", url: flk.civilCode }],
        practicePoints: [
          "抵押权：债权人对债务人或者第三人不转移占有的财产,在债务人不履行到期债务时,就该财产优先受偿的权利。",
          "不动产抵押：办抵押登记,抵押权自登记时设立。",
          "动产抵押：办抵押登记的,抵押权对抗善意第三人；未登记的,只能对抗善意第三人。",
          "抵押权实现方式：折价/拍卖/变卖抵押财产,以所得价款优先受偿。"
        ]
      } }),
      concept("质权", { id: "civil-pledge", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百二十五条至第四百四十六条", url: flk.civilCode }],
        practicePoints: ["动产质权：质权自出质人交付质押财产时设立；权利质权：以汇票/支票/债券/存单/仓单/提单/基金份额/股权/知识产权中的财产权等出质的,自有关部门办理出质登记时设立。"]
      } }),
      concept("留置权", { id: "civil-lien", type: "institution", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百四十七条至第四百五十七条", url: flk.civilCode }],
        practicePoints: [
          "留置权：债权人合法占有债务人的动产,债务人不履行到期债务的,债权人可以留置该动产。",
          "留置权限制：企业之间留置,留置的动产应当与债权属于同一法律关系。",
          "留置权人负有妥善保管义务;因保管不善致留置物毁损灭失的,承担赔偿责任。"
        ]
      } }),
      concept("占有", { id: "civil-possession", type: "concept", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百五十八条至第四百六十二条", url: flk.civilCode }],
        practicePoints: [
          "占有：占有人对物事实上的管领/控制。",
          "占有分类：自主占有/他主占有;善意占有/恶意占有;直接占有/间接占有;有权占有/无权占有。",
          "占有保护:占有恢复之诉(占有物返还请求权)——占有物被侵占的,占有人可请求返还。"
        ]
      } }),
      // ===== 合同编深化 =====
      concept("合同的概念", { id: "civil-contract-concept", type: "theory", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百六十三条", url: flk.civilCode }],
        practicePoints: ["合同是民事主体之间设立/变更/终止民事法律关系的协议。"]
      } }),
      concept("要约", { id: "civil-offer", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百七十二条", url: flk.civilCode }],
        practicePoints: [
          "要约：希望和他人订立合同的意思表示。",
          "要约生效：对话方式:相对人了解时生效;非对话方式:到达相对人时生效。",
          "要约撤回:在要约生效之前;要约撤销:在要约生效之后,受要约人承诺之前。"
        ]
      } }),
      concept("承诺", { id: "civil-acceptance", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百七十九条", url: flk.civilCode }],
        practicePoints: [
          "承诺：受要约人同意要约的意思表示。",
          "承诺应当以通知的方式作出;根据交易习惯或者要约表明可以通过行为作出承诺的除外。",
          "承诺生效时合同成立;承诺的撤回需在承诺生效前。"
        ]
      } }),
      concept("格式条款", { id: "civil-form-contract-terms", type: "rule", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百九十六条至第四百九十八条", url: flk.civilCode }],
        practicePoints: [
          "格式条款：当事人为了重复使用而预先拟定,并在订立合同时未与对方协商的条款。",
          "提供方对免责/限责条款有提示和说明义务。",
          "格式条款无效情形：具有合同无效情形/不合理免除一方责任/加重对方责任/排除对方主要权利。",
          "格式条款有两种以上解释的,应当作出不利于提供格式条款一方的解释。"
        ]
      } }),
      concept("合同的解释", { id: "civil-contract-interpretation", type: "case-method", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第四百六十六条", url: flk.civilCode }],
        practicePoints: [
          "合同解释原则：文义解释/体系解释/目的解释/习惯解释/诚信解释。",
          "合同生效后,当事人就质量/价款/报酬/履行地点等内容没有约定或者约定不明确的,可以协议补充;不能达成补充协议的,按合同有关条款或者交易习惯确定。",
          "漏洞填补：质量/价款/履行地点/履行期限/履行方式/履行费用等。"
        ]
      } }),
      concept("同时履行抗辩权", { id: "civil-simultaneous-performance", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百二十五条", url: flk.civilCode }],
        practicePoints: ["双务合同当事人互负债务,有先后履行顺序的,先履行方未履行或债务未届履行期,后履行方有权拒绝其履行请求;当事人互负债务,没有先后履行顺序的,应当同时履行;一方在对方履行之前有权拒绝其履行请求。"]
      } }),
      concept("不安抗辩权", { id: "civil-unsecured-defense", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百二十七条", url: flk.civilCode }],
        practicePoints: [
          "应当先履行债务的当事人,有确切证据证明对方有下列情形之一的,可以中止履行：经营状况严重恶化;转移财产/抽逃资金以逃避债务;丧失商业信誉;有丧失或者可能丧失履行债务能力的其他情形。",
          "当事人没有确切证据中止履行的,应当承担违约责任。"
        ]
      } }),
      concept("债权转让", { id: "civil-assignment", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百四十五条至第五百五十条", url: flk.civilCode }],
        practicePoints: [
          "债权人可以将债权的全部或者部分转让给第三人。",
          "三类不得转让的债权：根据债权性质不得转让/按照当事人约定不得转让/依照法律规定不得转让。",
          "通知义务：债权人转让债权,未通知债务人的,该转让对债务人不发生效力。"
        ]
      } }),
      concept("债务承担", { id: "civil-debt-assumption", type: "rule", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百五十一条至第五百五十六条", url: flk.civilCode }],
        practicePoints: ["债务人将债务的全部或者部分转移给第三人的,应当经债权人同意;未经债权人同意的,债务人仍应承担债务。"]
      } }),
      concept("合同解除", { id: "civil-contract-termination-full", type: "rule", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百六十二条至第五百七十六条", url: flk.civilCode }],
        practicePoints: [
          "约定解除：当事人协商一致,可以解除合同;当事人可以约定一方解除合同的事由,事由发生时,解除权人可以解除合同。",
          "法定解除情形：因不可抗力致使不能实现合同目的;在履行期限届满前,当事人一方明确表示或者以自己的行为表明不履行主要债务;当事人一方迟延履行主要债务,经催告后在合理期限内仍未履行;当事人一方迟延履行债务或者有其他违约行为致使不能实现合同目的;法律规定的其他情形。",
          "合同解除后,尚未履行的,终止履行;已经履行的,根据履行情况和合同性质,当事人可以请求恢复原状或者采取其他补救措施,并有权请求赔偿损失。"
        ]
      } }),
      concept("继续履行", { id: "civil-specific-performance", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百七十七条", url: flk.civilCode }],
        practicePoints: [
          "继续履行：当事人一方未支付价款/报酬/租金/利息,或者不履行其他金钱债务的,对方可以请求其支付。",
          "当事人一方不履行非金钱债务或者履行非金钱债务不符合约定的,对方可以请求履行,但有下列情形之一的除外：法律上或者事实上不能履行;债务的标的不适于强制履行或者履行费用过高;债权人在合理期限内未请求履行。"
        ]
      } }),
      concept("违约金", { id: "civil-liquidated-damages", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百八十五条", url: flk.civilCode }],
        practicePoints: [
          "违约金：当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金,也可以约定因违约产生的损失赔偿额的计算方法。",
          "约定的违约金低于造成的损失的,人民法院或者仲裁机构可以根据当事人的请求予以增加;约定的违约金过分高于造成的损失的,人民法院或者仲裁机构可以根据当事人的请求予以适当减少。",
          "当事人就迟延履行约定违约金的,违约方支付违约金后,还应当履行债务。"
        ]
      } }),
      concept("定金", { id: "civil-deposit", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第五百八十六条至第五百八十八条", url: flk.civilCode }],
        practicePoints: [
          "定金：当事人可以约定一方向对方给付定金作为债权的担保。",
          "定金合同自实际交付定金时成立;定金的数额不得超过主合同标的额的 20%,超过部分不产生定金的效力。",
          "定金罚则：给付定金的一方不履行债务的,无权要求返还定金;收受定金的一方不履行债务的,应当双倍返还定金。"
        ]
      } }),
      // ===== 婚姻家庭编深化 =====
      concept("夫妻共同财产", { id: "civil-marital-property", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零六十二条", url: flk.civilCode }],
        practicePoints: [
          "夫妻在婚姻关系存续期间所得的下列财产,为夫妻的共同财产,归夫妻共同所有：工资/奖金/劳务报酬;生产/经营/投资的收益;知识产权的收益;继承或者受赠的财产(明确只归一方的除外);其他应当归共同所有的财产。",
          "夫妻对共同财产,有平等的处理权。"
        ]
      } }),
      concept("夫妻共同债务", { id: "civil-marital-debt", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千零六十四条", url: flk.civilCode }],
        practicePoints: [
          "夫妻双方共同签名或者夫妻一方事后追认等共同意思表示所负的债务,以及夫妻一方在婚姻关系存续期间以个人名义为家庭日常生活需要所负的债务,属于夫妻共同债务。",
          "夫妻一方在婚姻关系存续期间以个人名义超出家庭日常生活需要所负的债务,不属于夫妻共同债务;但是,债权人能够证明该债务用于夫妻共同生活、共同生产经营或者基于夫妻双方共同意思表示的除外。"
        ]
      } }),
      // ===== 侵权责任编深化 =====
      concept("侵权责任一般条款", { id: "civil-tort-general", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百六十四条、第一千一百六十五条", url: flk.civilCode }],
        practicePoints: [
          "侵权责任的一般条款：行为人因过错侵害他人民事权益造成损害的,应当承担侵权责任。",
          "过错推定/无过错责任需要法律明确规定。",
          "侵权责任的承担方式：停止侵害/排除妨碍/消除危险/返还财产/恢复原状/赔偿损失/赔礼道歉/消除影响/恢复名誉。"
        ]
      } }),
      concept("共同侵权", { id: "civil-joint-tort", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百六十八条", url: flk.civilCode }],
        practicePoints: ["二人以上共同实施侵权行为,造成他人损害的,应当承担连带责任。"]
      } }),
      concept("工伤事故", { id: "civil-work-injury", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民法典", article: "第一千一百九十一条", url: flk.civilCode }],
        practicePoints: [
          "用人单位的工作人员因执行工作任务造成他人损害的,由用人单位承担侵权责任。",
          "用人单位承担侵权责任后,可以向有故意或者重大过失的工作人员追偿。",
          "劳务派遣期间,被派遣的工作人员因执行工作任务造成他人损害的,由接受劳务派遣的用工单位承担侵权责任;劳务派遣单位有过错的,承担相应的责任。"
        ]
      } })
    ]
  },
  {
    id: "system-commercial",
    title: "商法",
    domain: "commercial",
    colorKey: "commercial",
    systemPosition: [12.2, 1.5, 1.2],
    systemRadius: 2.45,
    systemInclination: 0.11,
    shortDescription: "商法太阳系围绕企业组织、资本市场、商事交易和风险出清运行。",
    sourceRefs: ["flk-company-law", "flk-securities-law", "chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("公司法", { type: "law", importance: 94, sourceRefs: ["flk-company-law", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "全文（266 个条文，2023 年 12 月修订）", url: flk.companyLaw, note: "2024 年 7 月 1 日起施行。" }],
        judicialInterpretations: [
          { title: "最高人民法院关于适用《中华人民共和国公司法》若干问题的规定", year: 2019, issuer: "最高人民法院", documentNumber: "法释〔2019〕7号", summary: "对股东出资、股东资格确认、股东会决议瑕疵等作出解释。" }
        ],
        practicePoints: [
          "公司法人人格独立：股东以认缴出资为限对公司承担责任。",
          "新公司法认缴期限：股东应在公司成立之日起 5 年内缴足认缴出资。",
          "关联交易、对外担保、董事高管忠实义务等是商事争议高发区。"
        ]
      } }),
      concept("有限责任公司", { id: "commercial-ltd", type: "institution", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第二章 有限责任公司的设立和组织机构", url: flk.companyLaw }],
        practicePoints: ["1-50 个股东；股东会不是必设机构；可以设立董事会（≥3 人）或执行董事。"]
      } }),
      concept("股份有限公司", { id: "commercial-jsc", type: "institution", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第三章 股份有限公司的设立和组织机构", url: flk.companyLaw }],
        practicePoints: ["注册资本由股份构成；上市公司需符合证券法及交易所规则。"]
      } }),
      concept("公司治理", { type: "institution", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第六章 公司董事、监事、高级管理人员的资格和义务", url: flk.companyLaw }],
        practicePoints: [
          "三会一层：股东（大）会、董事会/执行董事、监事会/监事、高级管理人员。",
          "新公司法允许规模较小的有限责任公司不设监事会，设 1-2 名监事或设审计委员会替代。",
          "董事会决议效力：可撤销（召集程序/表决方式违反法律/章程/决议内容违反章程）；无效（违反法律）。"
        ]
      } }),
      concept("股东权利", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第四章 有限责任公司的股权转让", url: flk.companyLaw }],
        practicePoints: [
          "自益权：分红权、剩余财产分配权、股份转让权、新股优先认购权。",
          "共益权：表决权、提案权、质询权、股东（大）会召集请求权、诉讼权（股东代表诉讼、直接诉讼）。",
          "异议股东回购请求权：连续 5 年盈利不分红、合并/分立/转让主要财产、营业期限届满等情形下，对股东会决议投反对票的股东可请求公司回购。"
        ]
      } }),
      concept("董事义务", { type: "rule", importance: 83, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百八十条至第一百八十四条", url: flk.companyLaw }],
        practicePoints: [
          "忠实义务：不得利用职务便利为自己或他人谋取属于公司的商业机会、自我交易禁止。",
          "勤勉义务：执行职务应当为公司的最大利益尽到管理者通常应有的合理注意。",
          "违反义务的，所得收入归公司所有；给公司造成损失的，应承担赔偿责任。"
        ]
      } }),
      concept("股东代表诉讼", { id: "commercial-derivative-suit", type: "procedure", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百八十九条", url: flk.companyLaw }],
        practicePoints: [
          "前置程序：股东书面请求监事会/监事向人民法院提起诉讼，监事会拒绝或 30 日内未起诉的，股东可以自己的名义起诉。",
          "董事责任情形：董事会决议违反法律/行政法规/公司章程给公司造成损失，参与决议的董事对公司负赔偿责任。"
        ]
      } }),
      concept("公司清算", { id: "commercial-liquidation", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第十章 公司解散和清算", url: flk.companyLaw }],
        practicePoints: ["清算组由股东或法院指定的人员组成；清算组未及时履行通知和公告义务导致债权人未受偿的，应承担赔偿责任。"]
      } }),
      concept("证券法", { type: "law", importance: 88, sourceRefs: ["flk-securities-law", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "全文（2019 年 12 月修订）", url: flk.securitiesLaw }],
        practicePoints: [
          "公开发行：向不特定对象发行或向特定对象发行累计超过 200 人。",
          "信息披露：发行人、上市公司依法披露的信息必须真实、准确、完整，不得有虚假记载、误导性陈述或重大遗漏。",
          "内幕交易、操纵市场、老鼠仓均构成证券违法行为。"
        ]
      } }),
      concept("证券发行注册制", { id: "commercial-ipo-registration", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "第九条至第二十五条", url: flk.securitiesLaw }],
        practicePoints: ["2019 年证券法修订后确立注册制；证监会注册、交易所审核；强化信息披露为核心。"]
      } }),
      concept("上市公司收购", { id: "commercial-ma", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "第六十五条至第八十条", url: flk.securitiesLaw }],
        practicePoints: ["持股 5% 后每增减 1% 需报告和公告；持股 30% 继续增持应发出全面要约。"]
      } }),
      concept("破产法", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国企业破产法", article: "全文（2007 年施行）", url: "https://flk.npc.gov.cn/", note: "企业破产法的官方文本可通过国家法律法规数据库检索。" }],
        practicePoints: [
          "三类程序：清算、重整、和解。",
          "破产受理后，债务人对个别债权人的清偿无效；管理人接管财产。",
          "债权人会议是意思机关；债权人委员会为常设监督机构。"
        ]
      } }),
      concept("票据法", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国票据法", article: "全文（1995 年施行，2004 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["票据种类：汇票、本票、支票；票据行为独立原则；票据抗辩切断。"]
      } }),
      concept("保险法", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国保险法", article: "全文（2009 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "最大诚信原则：投保人如实告知义务。",
          "损失补偿原则（财产险）：保险人赔偿不超过实际损失，禁止被保险人通过保险获利。",
          "人身保险：受益人由被保险人或投保人指定。"
        ]
      } }),
      concept("信托法", { type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国信托法", article: "全文（2001 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["信托财产独立性：受托人破产时，信托财产不作为其遗产或清算财产。"]
      } }),
      concept("商事登记", { type: "institution", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国市场主体登记管理条例", article: "全文（2022 年 3 月施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["登记事项：名称、类型、经营范围、住所、法定代表人等；登记对抗主义/生效主义区分。"]
      } }),
      concept("资本市场", { type: "field", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "总则", url: flk.securitiesLaw }],
        practicePoints: ["资本市场体系：主板/科创板/创业板/北交所/新三板 + 银行间债券市场 + 期货期权。"]
      } }),
      // ===== 王卫国《商法》+ 范健《商法》系统扩 =====
      concept("商法总论", { id: "commercial-overview", type: "theory", importance: 90, sourceRefs: ["textbook-wangguowei-commercial", "textbook-fanjian-commercial"], content: {
        practicePoints: [
          "商法是调整商事关系的法律规范的总称。",
          "商法的调整对象：商主体之间的商事关系;商主体与消费者之间的部分关系;商主体内部的组织关系。",
          "商法原则：营利性/经营性/技术性/复合性/国际性。",
          "中国商法体系：商法总论(商事主体法/商事行为法/商事纠纷解决法) + 公司法/证券法/票据法/保险法/海商法/破产法等具体部门。"
        ]
      } }),
      concept("商主体", { id: "commercial-entity", type: "concept", importance: 88, content: {
        practicePoints: [
          "商主体：以营利为目的,持续地从事营业活动的自然人/法人/其他组织。",
          "商主体类型:公司(有限责任/股份有限/一人公司/国有独资)/合伙企业(普通/有限)/个人独资企业/个体工商户/农民专业合作社。",
          "商主体特征:营利性/营业性/持续性/独立性/法定性。"
        ]
      } }),
      concept("商行为", { id: "commercial-act", type: "concept", importance: 86, content: {
        practicePoints: [
          "商行为:商主体为设立/变更/消灭商事法律关系而实施的以营利为目的的营业行为。",
          "绝对商行为:任何主体从事均构成商行为(如票据行为/证券交易/保险/海商);相对商行为:商主体从事才构成商行为(如仓储/承揽/居间)。",
          "商行为规则:短期时效(合同争议 4 年 vs 一般 3 年)/严格形式/商事账簿/商号保护。"
        ]
      } }),
      concept("公司章程", { id: "commercial-articles", type: "rule", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第二十五条、第八十一条", url: flk.companyLaw }],
        practicePoints: [
          "公司章程:规定公司名称/宗旨/资本/组织机构/重大事项决策等重大事项的公司根本性文件。",
          "对公司/股东/董事/监事/高级管理人员均具有约束力。",
          "修改章程需经代表 2/3 以上表决权的股东通过(股份有限公司股东大会)。"
        ]
      } }),
      concept("股东出资", { id: "commercial-shareholder-contribution", type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第四十七条至第五十四条", url: flk.companyLaw }],
        practicePoints: [
          "出资方式:货币/实物/知识产权/土地使用权/股权/债权等可以用货币估价并可以依法转让的非货币财产。",
          "新公司法 5 年认缴期限:股东应在公司成立之日起 5 年内缴足认缴出资。",
          "瑕疵出资责任:未足额/虚假出资的股东应向公司足额缴纳,其他发起人承担连带责任。"
        ]
      } }),
      concept("法人人格否认", { id: "commercial-piercing-corporate-veil", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第二十三条", url: flk.companyLaw }],
        practicePoints: [
          "公司股东滥用公司法人独立地位和股东有限责任,逃避债务,严重损害公司债权人利益的,应当对公司债务承担连带责任。",
          "适用情形:人格混同/过度支配与控制/资本显著不足。",
          "2023 年新公司法:首次明文规定'纵向法人人格否认'——股东对其实缴出资的子公司债务承担连带责任(特定情形)。"
        ]
      } }),
      concept("董事会", { id: "commercial-board", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第六十八条至第七十六条", url: flk.companyLaw }],
        practicePoints: ["董事会是公司的经营决策机构,成员 3 人以上;设董事长 1 人,可以设副董事长;规模较小或者股东人数较少的有限责任公司,可以设 1 名执行董事,不设董事会。"]
      } }),
      concept("股东会", { id: "commercial-shareholders-meeting", type: "institution", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第五十九条至第六十七条", url: flk.companyLaw }],
        practicePoints: [
          "股东会:公司的权力机构,由全体股东组成。",
          "表决:股东按出资比例行使表决权,但公司章程另有规定的除外。",
          "特别决议事项(2/3 以上表决权通过):修改章程/增减注册资本/公司合并/分立/解散/变更公司形式。"
        ]
      } }),
      concept("关联交易", { id: "commercial-related-party-transaction", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百八十二条至第一百八十四条", url: flk.companyLaw }],
        practicePoints: [
          "关联交易:公司与其控股股东/实际控制人/董事/监事/高级管理人员等关联方之间的交易。",
          "回避表决:董事/股东与董事会决议事项所涉及的企业有关联关系的,不得对该项决议行使表决权,也不得代理其他董事/股东行使表决权。",
          "披露义务:上市公司应当及时披露关联交易信息。"
        ]
      } }),
      concept("对外担保", { id: "commercial-corporate-guarantee", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第十五条", url: flk.companyLaw }],
        practicePoints: [
          "公司对外提供担保:依照公司章程的规定,由董事会或者股东会决议。",
          "对外担保限额:公司章程对担保总额/单项担保的数额有限额规定的,不得超过规定的限额。",
          "对内担保:公司为公司股东或者实际控制人提供担保的,必须经股东会决议,接受担保的股东不得参加表决。"
        ]
      } }),
      concept("公司增资", { id: "commercial-capital-increase", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百六十四条至第一百七十一条", url: flk.companyLaw }],
        practicePoints: ["公司增资方式:股东增加出资/新股东增资/公积金转增股本/未分配利润转增股本等。"]
      } }),
      concept("公司减资", { id: "commercial-capital-decrease", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百七十二条至第一百七十七条", url: flk.companyLaw }],
        practicePoints: [
          "公司减资:减少注册资本,需编制资产负债表及财产清单。",
          "通知债权人:应当自作出减少注册资本决议之日起 10 日内通知债权人,并于 30 日内在报纸上公告。",
          "债权人自接到通知书之日起 30 日内/未接到通知书的自公告之日起 45 日内,有权要求公司清偿债务/提供相应的担保。"
        ]
      } }),
      concept("公司分立合并", { id: "commercial-merger-division", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第九章 公司合并/分立/增资/减资", url: flk.companyLaw }],
        practicePoints: [
          "合并形式:吸收合并(A 吸收 B)/新设合并(A+B 合并为 C)。",
          "合并后:合并各方的债权债务由存续公司/新设公司承继。",
          "分立:派生分立(A 分为 A1 + A2)/新设分立。"
        ]
      } }),
      concept("公司债券", { id: "corporate-bond", type: "institution", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国公司法", article: "第一百九十三条至第二百零二条", url: flk.companyLaw }],
        practicePoints: [
          "公司债券:公司依照法定程序发行/约定在一定期限内还本付息的有价证券。",
          "公开发行公司债券:累计债券余额不超过公司净资产的 40%。",
          "非公开发行公司债券:只能向合格投资者发行,每次发行对象不超过 200 人。"
        ]
      } }),
      concept("上市公司", { id: "listed-company", type: "institution", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "第二章 证券发行", url: flk.securitiesLaw }],
        practicePoints: [
          "上市公司:其股票在证券交易所上市交易的股份有限公司。",
          "上市条件:组织机构健全/持续经营 3 年以上/最近 3 个会计年度净利润均为正数且累计超过人民币 3000 万元等。",
          "强制信息披露:招股说明书/上市公告书/定期报告(年报/半年报/季报)/临时报告。"
        ]
      } }),
      concept("证券公司", { id: "securities-firm", type: "institution", importance: 76, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国证券法", article: "第六章 证券公司", url: flk.securitiesLaw },
          { lawTitle: "证券公司监督管理条例", article: "全文", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "证券公司:依照《公司法》和《证券法》设立的经营证券业务的有限责任公司/股份有限公司。",
          "分类:经纪类/承销与保荐类/自营类/受托资产管理类/综合类;当前为'牌照管理'(如投资银行业务/资产管理/经纪等)。",
          "注册资本:证券公司经营证券经纪/投资咨询业务,注册资本最低限额为人民币 5000 万元;经营证券承销与保荐/证券自营/证券资产管理及其他证券业务之一的,最低限额为人民币 1 亿元;经营两项以上的,最低限额为人民币 5 亿元。"
        ]
      } }),
      concept("上市公司收购", { id: "commercial-ma-full", type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国证券法", article: "第六十五条至第八十条", url: flk.securitiesLaw }],
        practicePoints: [
          "持股 5% 后每增减 1% 需报告和公告;持股 30% 继续增持应发出全面要约。",
          "要约收购:收购人向被收购公司所有股东发出收购其所持股份的要约。",
          "协议收购:收购人通过协议方式收购上市公司股份。"
        ]
      } }),
      concept("破产法", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国企业破产法", article: "全文（2007 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "三类程序:清算/重整/和解。",
          "破产受理后,债务人对个别债权人的清偿无效;管理人接管财产。",
          "债权人会议是意思机关;债权人委员会为常设监督机构。"
        ]
      } }),
      concept("重整程序", { id: "restructuring-procedure", type: "procedure", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国企业破产法", article: "第二章 申请与受理/第八章 重整", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "重整申请:债务人/债权人/出资人可以在破产申请时/破产宣告前申请重整。",
          "重整期间:自法院裁定重整之日起至重整程序终止,最长不超过 6 个月;经申请可延长 3 个月。",
          "重整计划:由债务人/管理人/出资人提出,经债权人会议分组表决(每组过半数且代表债权额 2/3 以上),法院裁定批准。"
        ]
      } }),
      concept("破产清算", { id: "bankruptcy-liquidation", type: "procedure", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国企业破产法", article: "第十章 破产清算", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "破产宣告:法院认为债务人不能清偿到期债务,且与债权人未能达成和解协议/重整计划未获通过的,宣告债务人破产。",
          "变价:管理人依照法律规定的程序和方式,对债务人财产进行拍卖/变卖/折价处理。",
          "清偿顺序:破产费用/共益债务 → 职工工资和社保/补偿金 → 税款 → 普通债权 → 股东。"
        ]
      } }),
      concept("票据法", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国票据法", article: "全文（1995 年施行，2004 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "票据种类:汇票/本票/支票;票据行为独立原则;票据抗辩切断。",
          "汇票分类:银行汇票/商业汇票(商业承兑汇票/银行承兑汇票)。",
          "票据权利:付款请求权/追索权;追索对象:出票人/背书人/承兑人/保证人。"
        ]
      } }),
      concept("保险法", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国保险法", article: "全文（2009 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "最大诚信原则:投保人如实告知义务。",
          "损失补偿原则(财产险):保险人赔偿不超过实际损失,禁止被保险人通过保险获利。",
          "人身保险:受益人由被保险人或投保人指定。",
          "近因原则:保险事故与损失之间必须存在直接的因果关系,保险人才承担赔偿责任。"
        ]
      } }),
      concept("保险合同", { id: "insurance-contract", type: "institution", importance: 80, content: {
        practicePoints: [
          "保险合同:投保人与保险人约定保险权利义务的协议。",
          "保险利益:投保人对保险标的具有的法律上承认的利益,否则保险合同无效。",
          "代位求偿权:财产保险中,保险人赔偿被保险人后,取得在赔偿金额范围内代位行使被保险人对第三者请求赔偿的权利。"
        ]
      } }),
      concept("保险利益原则", { id: "insurance-interest", type: "rule", importance: 76, content: {
        practicePoints: [
          "保险利益:投保人/被保险人对保险标的具有的法律上承认的利益。",
          "财产保险:投保时具有保险利益即可;人身保险:投保时具有保险利益即可,但保险事故发生时,被保险人/受益人不要求具有保险利益(英美法系要求事故时仍有保险利益)。",
          "保险利益原则的目的:防止赌博/防范道德风险/限定保险赔偿范围。"
        ]
      } }),
      concept("信托法", { type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国信托法", article: "全文（2001 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "信托:委托人基于对受托人的信任,将其财产权委托给受托人,由受托人按委托人的意愿,以自己的名义,为受益人的利益或者特定目的,进行管理或者处分的行为。",
          "信托财产独立性:受托人破产时,信托财产不作为其遗产或清算财产。",
          "受托人义务:忠实义务/注意义务/分别管理义务/亲自管理义务/保存记录义务/保密义务。"
        ]
      } }),
      concept("商事登记", { type: "institution", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国市场主体登记管理条例", article: "全文（2022 年 3 月施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "登记事项:名称/类型/经营范围/住所/法定代表人等。",
          "登记对抗主义:未经登记不得对抗善意第三人。",
          "登记生效主义:未经登记不发生法律效力(有限合伙/股权/动产抵押等)。"
        ]
      } }),
      concept("商号权", { id: "commercial-name-right", type: "concept", importance: 70, content: {
        practicePoints: [
          "商号:经营者(企业)在经营活动中所使用的用以区别于其他经营者的特定名称。",
          "商号权:商号经依法登记后,商主体在法定范围内享有排他性使用权。",
          "保护:擅自使用与他人相同/近似的商号,引人误认的,属于不正当竞争行为。"
        ]
      } }),
      concept("商事账簿", { id: "commercial-ledger", type: "institution", importance: 72, content: {
        practicePoints: [
          "商事账簿:商主体依法设置的,记载其营业状况和财务状况的簿册。",
          "种类:日记账/分类账/总账/明细账等;在法定会计账簿之外,商主体不得另设账簿。",
          "保存期限:会计凭证/会计账簿/财务会计报告等会计资料最低保管期限为 10 年。"
        ]
      } })
    ]
  },
  {
    id: "system-criminal",
    title: "刑法",
    domain: "criminal",
    colorKey: "criminal",
    systemPosition: [-10.6, 2.2, 2.4],
    systemRadius: 2.85,
    systemInclination: -0.28,
    shortDescription: "刑法是规定犯罪、刑事责任和刑罚的部门法，是国家最严厉的法律责任体系。",
    sourceRefs: ["flk-criminal-law", "chsi-law-discipline-scope", pendingSource],
    concepts: [
      concept("刑法总则", { type: "code", importance: 96, sourceRefs: ["flk-criminal-law", pendingSource], content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国刑法", article: "第一编 总则（第一条至第二十二条）", url: flk.criminalLaw, note: "刑法的任务、基本原则和适用范围。" }
        ],
        practicePoints: [
          "罪刑法定原则：法律明文规定不为罪、不处罚。",
          "平等适用刑法原则和罪刑相适应原则。",
          "空间效力：领域管辖、属人管辖、保护管辖、普遍管辖；我国采以属地原则为主，兼采属人、保护、普遍管辖。"
        ]
      } }),
      concept("犯罪构成", { type: "theory", importance: 95, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第十三条至第二十一条", url: flk.criminalLaw, note: "犯罪概念、故意/过失、刑事责任年龄、正当防卫/紧急避险。" }],
        judicialInterpretations: [
          { title: "最高人民法院、最高人民检察院、公安部关于依法惩治袭警违法犯罪行为的指导意见", year: 2020, issuer: "最高法/最高检/公安部", summary: "对袭警罪的犯罪构成和量刑作出指导。" }
        ],
        practicePoints: [
          "四要件说：犯罪主体、犯罪主观方面、犯罪客体、犯罪客观方面（通说）。",
          "三阶层说：构成要件该当性、违法性、有责性（德日体系影响）。",
          "实务中常混用，但分析路径一致：先判断客观行为→再判断主观罪过→再判断违法阻却事由→再判断责任能力。"
        ]
      } }),
      concept("犯罪主体", { type: "concept", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第十六条至第十九条、第三十条", url: flk.criminalLaw }],
        practicePoints: [
          "自然人：完全刑事责任年龄 16 周岁；14-16 周岁对 8 类重罪承担刑事责任。",
          "单位犯罪：以单位名义、为单位利益、由单位决策机构实施。",
          "对单位判处罚金，对直接负责的主管人员和其他直接责任人员判处刑罚（双罚制）。"
        ]
      } }),
      concept("主观方面", { type: "concept", importance: 87, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第十四条、第十五条", url: flk.criminalLaw }],
        practicePoints: [
          "故意：明知自己的行为会发生危害结果，希望或放任结果发生（直接/间接故意）。",
          "过失：应当预见而未预见（疏忽大意），或已经预见而轻信能避免（过于自信）。",
          "无罪过事件：意外事件、不可抗力。"
        ]
      } }),
      concept("客观方面", { type: "concept", importance: 87, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "分则各章具体条文", url: flk.criminalLaw }],
        practicePoints: ["危害行为、危害结果、行为对象、行为时间地点方法、因果关系。"]
      } }),
      concept("正当防卫", { id: "criminal-justifiable-defense", type: "rule", importance: 96, relation: "阻却违法事由", content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二十条", url: flk.criminalLaw }],
        landmarkCases: [
          { caseNumber: "最高人民法院、最高人民检察院、公安部指导性案例", year: 2018, court: "最高人民法院", title: "于欢故意伤害案", summary: "对正当防卫限度条件进行阐释；明显超过必要限度造成重大损害的，应当负刑事责任。", url: "https://www.court.gov.cn/guidance/index.html" }
        ],
        practicePoints: [
          "正当防卫 5 要件：起因条件（不法侵害）、时间条件（正在进行）、主观条件（防卫意图）、对象条件（针对侵害人）、限度条件（必要限度）。",
          "对正在进行行凶、杀人、抢劫、强奸、绑架等严重危及人身安全的暴力犯罪，采取防卫行为造成不法侵害人伤亡的，不属于防卫过当。",
          "防卫过当：明显超过必要限度造成重大损害的，应当负刑事责任，但应当减轻或免除处罚。"
        ]
      } }),
      concept("紧急避险", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二十一条", url: flk.criminalLaw }],
        practicePoints: ["为避免本人危险不得已采取的紧急避险行为，不负刑事责任；超过必要限度造成不应有损害的，应当负刑事责任。"]
      } }),
      concept("故意犯罪", { type: "rule", importance: 84 }),
      concept("过失犯罪", { type: "rule", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第十五条", url: flk.criminalLaw }],
        practicePoints: ["过失犯罪以法律有规定者为限；常见：交通肇事、医疗事故、重大责任事故、环境污染失职。"]
      } }),
      concept("犯罪未完成形态", { id: "criminal-inchoate", type: "rule", importance: 85, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二十二条至第二十四条", url: flk.criminalLaw }],
        practicePoints: [
          "犯罪预备：准备工具、制造条件；可以比照既遂犯从轻、减轻或者免除处罚。",
          "犯罪未遂：已经着手实行犯罪，由于意志以外的原因未得逞；可以比照既遂犯从轻或者减轻处罚。",
          "犯罪中止：自动放弃犯罪或自动有效防止犯罪结果发生；未造成损害的应当免除处罚，造成损害的应当减轻处罚。"
        ]
      } }),
      concept("共同犯罪", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二十五条至第二十九条", url: flk.criminalLaw }],
        practicePoints: [
          "共同犯罪：二人以上共同故意犯罪。",
          "主犯 vs 从犯 vs 胁从犯：主犯按所参与的全部犯罪处罚；从犯应当从轻、减轻或者免除处罚。",
          "教唆犯：教唆他人犯罪的，按所教唆罪处罚；教唆未成年人应当从重处罚。"
        ]
      } }),
      concept("单位犯罪", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三十条、第三十一条", url: flk.criminalLaw }],
        practicePoints: ["双罚制为原则，单罚为例外（刑法分则具体规定）。"]
      } }),
      concept("刑罚体系", { type: "institution", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三十二条至第六十条", url: flk.criminalLaw }],
        practicePoints: [
          "主刑：管制、拘役、有期徒刑、无期徒刑、死刑。",
          "附加刑：罚金、剥夺政治权利、没收财产；附加刑可附加适用也可独立适用。",
          "死刑限制：死刑只适用于罪行极其严重的犯罪分子；审判时怀孕的妇女和犯罪时未成年的人不适用死刑。"
        ]
      } }),
      concept("管制", { id: "criminal-public-surveillance", type: "rule", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三十八条至第四十条", url: flk.criminalLaw }],
        practicePoints: ["对不予关押的犯罪分子，3 个月到 2 年；数罪并罚不超过 3 年。"]
      } }),
      concept("拘役", { id: "criminal-detention", type: "rule", importance: 75, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第四十二条至第四十四条", url: flk.criminalLaw }],
        practicePoints: ["短期剥夺自由，1 个月到 6 个月；就近执行。"]
      } }),
      concept("有期徒刑", { id: "criminal-fixed-term", type: "rule", importance: 82 }),
      concept("无期徒刑", { id: "criminal-life", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第四十六条、第四十七条", url: flk.criminalLaw }],
        practicePoints: ["剥夺终身自由；符合条件可减刑、假释。"]
      } }),
      concept("死刑", { id: "criminal-death-penalty", type: "rule", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第四十八条至第五十一条", url: flk.criminalLaw }],
        practicePoints: [
          "死刑只适用于罪行极其严重的犯罪分子。",
          "死刑核准：除最高人民法院判决的以外，都应报请最高人民法院核准。",
          "不适用死刑：犯罪时不满 18 周岁的人和审判时怀孕的妇女；审判时已满 75 周岁的人不适用死刑缓期执行。"
        ]
      } }),
      concept("量刑", { type: "case-method", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第六十一条至第六十四条", url: flk.criminalLaw }],
        practicePoints: ["量刑情节：法定情节 vs 酌定情节；从轻/减轻/免除/从重。"]
      } }),
      concept("自首", { type: "rule", importance: 79, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第六十七条第一款", url: flk.criminalLaw }],
        practicePoints: [
          "一般自首：自动投案 + 如实供述自己的罪行；可以从轻或减轻处罚；犯罪较轻的可免除处罚。",
          "准自首（特别自首）：被采取强制措施的犯罪嫌疑人/被告人/正在服刑的罪犯，如实供述司法机关还未掌握的本人其他罪行；以自首论。"
        ]
      } }),
      concept("立功", { type: "rule", importance: 77, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第六十八条", url: flk.criminalLaw }],
        practicePoints: ["揭发他人犯罪行为查证属实、提供重要线索、协助抓捕、阻止他人犯罪活动等；重大立功可减轻或免除处罚。"]
      } }),
      concept("数罪并罚", { type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第六十九条、第七十一条", url: flk.criminalLaw }],
        practicePoints: [
          "判决宣告前一人犯数罪：除判处死刑、无期徒刑外，总和刑期以下、数刑中最高刑期以上决定执行刑期；管制最高 3 年、拘役最高 1 年、有期徒刑总和 20 年以下总和不满 25 年。",
          "刑罚执行期间又犯新罪：先减后并（已减刑期计入已执行刑期）。",
          "刑罚执行期间发现漏罪：先并后减。"
        ]
      } }),
      concept("缓刑", { type: "rule", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第七十二条至第七十六条", url: flk.criminalLaw }],
        practicePoints: ["对判处 3 年以下有期徒刑/拘役的犯罪分子，符合条件的可以宣告缓刑；缓刑考验期满不犯新罪则原刑罚不再执行。"]
      } }),
      concept("假释", { type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第八十条至第八十六条", url: flk.criminalLaw }],
        practicePoints: [
          "有期徒刑执行原判刑期 1/2 以上、无期徒刑 13 年以上，且认真遵守监规、确有悔改表现。",
          "累犯和因故意杀人、强奸、抢劫、绑架、放火、爆炸、投放危险物质或有组织的暴力性犯罪被判处 10 年以上有期徒刑、无期徒刑的，不得假释。"
        ]
      } }),
      concept("累犯", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第六十五条、第六十六条", url: flk.criminalLaw }],
        practicePoints: ["一般累犯 + 特别累犯（危害国家安全、恐怖活动、黑社会性质组织）；应当从重处罚，且不适用缓刑和假释。"]
      } }),
      concept("罪名-盗窃罪", { id: "criminal-theft", type: "law", importance: 92, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十四条", url: flk.criminalLaw }],
        landmarkCases: [
          { caseNumber: "刑事审判参考案例", year: 2019, court: "最高人民法院", title: "盗窃网络虚拟财产案", summary: "对盗窃网络虚拟财产可构成盗窃罪作出认定。", url: "https://www.court.gov.cn/typical/index.html" }
        ],
        practicePoints: [
          "盗窃公私财物数额较大（1000-3000 元起点）或多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，构成盗窃罪。",
          "数额巨大/特别巨大、情节严重时升档量刑（3 年/10 年以上）。",
          "盗窃罪与职务侵占罪（公司、企业人员）区别：主体不同。"
        ]
      } }),
      concept("罪名-诈骗罪", { id: "criminal-fraud", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十六条", url: flk.criminalLaw }],
        judicialInterpretations: [
          { title: "最高人民法院、最高人民检察院、公安部关于办理电信网络诈骗等刑事案件适用法律若干问题的意见", year: 2016, issuer: "最高人民法院、最高人民检察院、公安部", summary: "明确电信网络诈骗的数额标准和从重处罚情节。" }
        ],
        practicePoints: ["虚构事实/隐瞒真相 → 受害人基于错误认识处分财产 → 行为人取得财物；数额较大构成诈骗罪。"]
      } }),
      concept("罪名-抢劫罪", { id: "criminal-robbery", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十三条", url: flk.criminalLaw }],
        practicePoints: ["以暴力、胁迫或者其他方法强行劫取公私财物；起刑 3 年；情节严重的 10 年以上、无期或死刑。"]
      } }),
      concept("罪名-故意伤害罪", { id: "criminal-intentional-injury", type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百三十四条", url: flk.criminalLaw }],
        practicePoints: [
          "轻伤：3 年以下；重伤：3-10 年；致人死亡或以特别残忍手段致人重伤造成严重残疾：10 年以上、无期或死刑。",
          "与正当防卫区分：防卫行为造成损害的，不负刑事责任。"
        ]
      } }),
      concept("罪名-故意杀人罪", { id: "criminal-murder", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百三十二条", url: flk.criminalLaw }],
        practicePoints: ["非法剥夺他人生命；起刑 10 年，最高死刑；对情节较轻的（义愤、防卫过当等）3-10 年。"]
      } }),
      concept("罪名-强奸罪", { id: "criminal-rape", type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百三十六条", url: flk.criminalLaw }],
        practicePoints: [
          "以暴力、胁迫或者其他手段强奸妇女的，3-10 年；情节恶劣的（当众、多人、轮奸、致人重伤/死亡等），10 年以上、无期或死刑。",
          "奸淫不满 14 周岁幼女的，从重处罚。"
        ]
      } }),
      concept("罪名-受贿罪", { id: "criminal-bribery", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百八十五条", url: flk.criminalLaw }],
        practicePoints: [
          "国家工作人员利用职务上的便利，索取他人财物或者非法收受他人财物，为他人谋取利益。",
          "数额较大 3 年以下；数额巨大 3-10 年；数额特别巨大 10 年以上、无期或死刑。",
          "与贪污罪区别：受贿是利用职务便利收受他人财物；贪污是侵占本单位财物。"
        ]
      } }),
      concept("罪名-贪污罪", { id: "criminal-embezzlement", type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百八十二条", url: flk.criminalLaw }],
        practicePoints: ["国家工作人员利用职务上的便利，侵占公共财物；数额较大起刑 3 年。"]
      } }),
      concept("罪名-交通肇事罪", { id: "criminal-traffic-fatal", type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百三十三条", url: flk.criminalLaw }],
        judicialInterpretations: [
          { title: "最高人民法院关于审理交通肇事刑事案件具体应用法律若干问题的解释", year: 2000, issuer: "最高人民法院", documentNumber: "法释〔2000〕33号", summary: "明确交通肇事罪构成要件和'逃逸致人死亡'加重情节。" }
        ],
        practicePoints: ["违反交通管理法规 → 重大事故 → 致 1 人死亡或 3 人重伤 + 全责/主责；构成交通肇事罪，3 年以下。"]
      } }),
      concept("罪名-危险驾驶罪", { id: "criminal-dangerous-driving", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百三十三条之一", url: flk.criminalLaw }],
        practicePoints: ["醉酒驾驶机动车（血液酒精 ≥ 80mg/100ml）构成危险驾驶罪，1-6 个月拘役并处罚金。"]
      } }),
      concept("罪名-非法吸收公众存款罪", { id: "criminal-illegal-deposit", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百七十六条", url: flk.criminalLaw }],
        practicePoints: ["未经有关部门批准，向社会不特定对象吸收资金；扰乱金融秩序，3 年以下；数额巨大 3-10 年。"]
      } }),
      concept("罪名-寻衅滋事罪", { id: "criminal-picketing", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百九十三条", url: flk.criminalLaw }],
        practicePoints: ["随意殴打他人、追逐/拦截/辱骂/恐吓他人、强拿硬要/任意损毁占用公私财物、在公共场所起哄闹事；5 年以下；情节严重 5-10 年。"]
      } }),
      concept("罪名-帮信罪", { id: "criminal-help-info", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百八十七条之二", url: flk.criminalLaw, note: "2020 年刑法修正案（十一）新增。" }],
        practicePoints: [
          "明知他人利用信息网络实施犯罪，为其犯罪提供互联网接入、服务器托管、网络存储、通讯传输等技术支持，或者提供广告推广、支付结算等帮助，情节严重的。",
          "近三年帮信罪案件量持续上升，是信息网络犯罪的重要前置犯罪。"
        ]
      } }),
      // ===== 高铭暄《刑法学》系统扩:分则各章具体罪名 =====
      concept("罪名-抢劫罪", { id: "criminal-robbery", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十三条", url: flk.criminalLaw }],
        practicePoints: ["以暴力、胁迫或者其他方法强行劫取公私财物；起刑 3 年；情节严重的 10 年以上、无期或死刑。"]
      } }),
      // 高铭暄《刑法学》分则体系扩
      concept("刑法分则体系", { type: "theory", importance: 90, sourceRefs: ["textbook-gaomingxuan-criminal"], content: {
        practicePoints: [
          "刑法分则按犯罪侵犯同类客体分类,共 10 章。",
          "第 1 章 危害国家安全罪；第 2 章 危害公共安全罪；第 3 章 破坏社会主义市场经济秩序罪；第 4 章 侵犯公民人身权利/民主权利罪；第 5 章 侵犯财产罪；第 6 章 妨害社会管理秩序罪；第 7 章 危害国防利益罪；第 8 章 贪污贿赂罪；第 9 章 渎职罪；第 10 章 军人违反职责罪。",
          "同类客体：某一类犯罪行为所共同侵犯的某种社会关系（如国家安全、公共安全、人身权利等）。"
        ]
      } }),
      // === 危害国家安全罪 ===
      concept("罪名-颠覆国家政权罪", { id: "criminal-overthrow", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百零五条", url: flk.criminalLaw }],
        practicePoints: ["组织/策划/实施颠覆国家政权、推翻社会主义制度的行为;首要分子或罪行重大的,处无期徒刑或 10 年以上有期徒刑。"]
      } }),
      concept("罪名-分裂国家罪", { id: "criminal-split-country", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百零三条", url: flk.criminalLaw }],
        practicePoints: ["组织/策划/实施分裂国家、破坏国家统一的行为。"]
      } }),
      concept("罪名-间谍罪", { id: "criminal-espionage", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百一十条", url: flk.criminalLaw }],
        practicePoints: ["为敌人刺探/窃取/收买/非法提供国家秘密/情报;情节特别严重的,处 10 年以上有期徒刑或者无期徒刑。"]
      } }),
      // === 危害公共安全罪 ===
      concept("罪名-放火罪", { id: "criminal-arson", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百一十四条", url: flk.criminalLaw }],
        practicePoints: ["故意放火焚烧公私财物,危害公共安全;尚未造成严重后果的,3-10 年;致人重伤/死亡或使公私财产遭受重大损失的,10 年以上/无期/死刑。"]
      } }),
      concept("罪名-爆炸罪", { id: "criminal-explosion", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百一十四条", url: flk.criminalLaw }],
        practicePoints: ["故意制造爆炸,危害公共安全。"]
      } }),
      concept("罪名-以危险方法危害公共安全罪", { id: "criminal-dangerous-method", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百一十五条", url: flk.criminalLaw }],
        practicePoints: ["以放火/决水/爆炸/投放危险物质/私设电网/高空抛物等危险方法危害公共安全。"]
      } }),
      // === 破坏社会主义市场经济秩序罪 ===
      concept("罪名-生产销售伪劣产品罪", { id: "criminal-defective-product", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百四十条", url: flk.criminalLaw }],
        practicePoints: ["生产者/销售者在产品中掺杂/掺假/以假充真/以次充好/以不合格产品冒充合格产品;销售金额 5 万元以上的,处 2 年以下有期徒刑/拘役。"]
      } }),
      concept("罪名-走私罪", { id: "criminal-smuggling", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百五十一条至第一百五十七条", url: flk.criminalLaw }],
        practicePoints: ["走私武器/弹药/核材料/假币/文物/贵重金属/动物/植物/制品等。"]
      } }),
      concept("罪名-逃税罪", { id: "criminal-tax-evasion", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百零一条", url: flk.criminalLaw, note: "2018 年刑法修正案（七）修订。逃税罪原为'偷税罪'。" }],
        practicePoints: [
          "纳税人采取欺骗/隐瞒手段进行虚假纳税申报或者不申报,逃避缴纳税款数额较大并占应纳税额 10% 以上的。",
          "经税务机关下达追缴通知后,补缴应纳税款/滞纳金/接受行政处罚的,不予追究刑事责任;5 年内因逃税受过刑事处罚或被税务机关给予 2 次以上行政处罚的除外。"
        ]
      } }),
      concept("罪名-虚开增值税专用发票罪", { id: "criminal-vat-fraud", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百零五条", url: flk.criminalLaw }],
        practicePoints: ["虚开增值税专用发票或者虚开用于骗取出口退税/抵扣税款的其他发票。"]
      } }),
      concept("罪名-内幕交易罪", { id: "criminal-insider-trading", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百八十条", url: flk.criminalLaw }],
        practicePoints: ["证券/期货交易内幕信息的知情人员或者非法获取人员,在内幕信息公开前,买卖相关证券/期货/明示/暗示他人从事相关交易。"]
      } }),
      concept("罪名-操纵证券市场罪", { id: "criminal-market-manipulation", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百八十二条", url: flk.criminalLaw }],
        practicePoints: [
          "操纵证券/期货市场,影响证券/期货交易价格或者证券/期货交易量。",
          "2020 年刑法修正案（十一）扩大了适用范围,包括'幌骗'等新型操纵手段。"
        ]
      } }),
      concept("罪名-集资诈骗罪", { id: "criminal-fundraising-fraud", type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百九十二条", url: flk.criminalLaw }],
        practicePoints: ["以非法占有为目的,使用诈骗方法非法集资;数额较大处 3-7 年,数额巨大处 7 年以上或无期。"]
      } }),
      concept("罪名-信用卡诈骗罪", { id: "criminal-credit-card-fraud", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第一百九十六条", url: flk.criminalLaw }],
        practicePoints: ["使用伪造的信用卡/使用以虚假的身份证明骗领的信用卡/使用作废的信用卡/冒用他人信用卡/恶意透支。"]
      } }),
      // === 侵犯公民人身权利/民主权利罪 ===
      concept("罪名-绑架罪", { id: "criminal-kidnapping", type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百三十九条", url: flk.criminalLaw }],
        practicePoints: ["以勒索财物为目的绑架他人的,或者绑架他人作为人质的;10 年以上有期徒刑或者无期徒刑,并处罚金或者没收财产。"]
      } }),
      concept("罪名-拐卖妇女儿童罪", { id: "criminal-trafficking", type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百四十条", url: flk.criminalLaw }],
        practicePoints: ["拐骗/绑架/收买/贩卖/接送/中转妇女/儿童;5-10 年;情节特别严重的,处死刑。"]
      } }),
      concept("罪名-诬告陷害罪", { id: "criminal-frameup", type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百四十三条", url: flk.criminalLaw }],
        practicePoints: ["捏造事实诬告陷害他人,意图使他人受刑事追究,情节严重的;参照所诬陷的罪行的法定刑从重处罚。"]
      } }),
      concept("罪名-侮辱罪", { id: "criminal-insult", type: "law", importance: 70, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百四十六条", url: flk.criminalLaw }],
        practicePoints: ["以暴力或者其他方法当众侮辱他人,情节严重的,3 年以下有期徒刑/拘役/管制/剥夺政治权利。"]
      } }),
      concept("罪名-诽谤罪", { id: "criminal-defamation", type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百四十六条", url: flk.criminalLaw }],
        practicePoints: ["捏造事实诽谤他人,情节严重的,3 年以下有期徒刑/拘役/管制/剥夺政治权利;告诉才处理(亲告罪)。"]
      } }),
      concept("罪名-虐待罪", { id: "criminal-mistreatment", type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十条", url: flk.criminalLaw }],
        practicePoints: ["虐待家庭成员,情节恶劣的,2 年以下有期徒刑/拘役/管制;致使被害人重伤/死亡的,2-7 年。"]
      } }),
      concept("罪名-遗弃罪", { id: "criminal-abandonment", type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十一条", url: flk.criminalLaw }],
        practicePoints: ["对于年老/幼/患病或者其他没有独立生活能力的人,负有扶养义务而拒绝扶养,情节恶劣的,5 年以下有期徒刑/拘役。"]
      } }),
      // === 侵犯财产罪 ===
      concept("罪名-抢夺罪", { id: "criminal-snatch", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百六十七条", url: flk.criminalLaw }],
        practicePoints: ["乘人不备,公然夺取公私财物的行为;数额较大,3 年以下;数额巨大/有其他严重情节,3-10 年;数额特别巨大/有其他特别严重情节,10 年以上/无期。"]
      } }),
      concept("罪名-侵占罪", { id: "criminal-embezzlement-property", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百七十条", url: flk.criminalLaw }],
        practicePoints: ["将代为保管的他人财物非法占为己有,数额较大,拒不退还;数额较大/有其他严重情节的,2 年以下有期徒刑/拘役/罚金。告诉才处理。"]
      } }),
      concept("罪名-敲诈勒索罪", { id: "criminal-blackmail", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百七十四条", url: flk.criminalLaw }],
        practicePoints: ["敲诈勒索公私财物,数额较大,3 年以下有期徒刑/拘役/管制/罚金。"]
      } }),
      concept("罪名-职务侵占罪", { id: "criminal-duty-embezzlement", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百七十一条", url: flk.criminalLaw }],
        practicePoints: ["公司/企业/或者其他单位的人员,利用职务上的便利,将本单位财物非法占为己有;数额较大,5 年以下有期徒刑/拘役。"]
      } }),
      // === 妨害社会管理秩序罪 ===
      concept("罪名-妨害公务罪", { id: "criminal-obstructing-official", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百七十七条", url: flk.criminalLaw }],
        practicePoints: ["以暴力/威胁方法阻碍国家机关工作人员依法执行职务;3 年以下有期徒刑/拘役/管制/罚金。"]
      } }),
      concept("罪名-伪造变造国家机关公文证件印章罪", { id: "criminal-forging-official", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百八十条", url: flk.criminalLaw }],
        practicePoints: ["伪造/变造/买卖国家机关的公文/证件/印章的,3 年以下有期徒刑/拘役/管制/剥夺政治权利/罚金;情节严重的,3-10 年。"]
      } }),
      concept("罪名-聚众斗殴罪", { id: "criminal-gang-fight", type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百九十二条", url: flk.criminalLaw }],
        practicePoints: ["聚众斗殴的,对首要分子和其他积极参加的,3 年以下有期徒刑/拘役/管制/罚金。"]
      } }),
      concept("罪名-组织强迫卖淫罪", { id: "criminal-prostitution", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百五十八条", url: flk.criminalLaw, note: "2015 年刑法修正案（九）修订。" }],
        practicePoints: ["组织/强迫他人卖淫的,5-10 年有期徒刑,并处罚金;情节严重的,10 年以上有期徒刑/无期徒刑/死刑。"]
      } }),
      concept("罪名-毒品犯罪", { id: "criminal-drug-offense", type: "field", importance: 82, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国刑法", article: "第三百四十七条至第三百六十四条", url: flk.criminalLaw },
          { lawTitle: "中华人民共和国禁毒法", article: "全文（2007 年施行）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "走私/贩卖/运输/制造毒品（无论数量多少,均追究刑事责任）;非法持有毒品;引诱/教唆/欺骗他人吸食/注射毒品。",
          "毒品分类:鸦片/海洛因/冰毒/吗啡/大麻/可卡因等;新型毒品(合成毒品):甲基苯丙胺/氯胺酮/合成大麻素等。"
        ]
      } }),
      // === 贪污贿赂罪 ===
      concept("罪名-挪用公款罪", { id: "criminal-misappropriation-public", type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百八十四条", url: flk.criminalLaw }],
        practicePoints: ["国家工作人员利用职务上的便利,挪用公款归个人使用,进行非法活动/营利活动/超过 3 个月未还。"]
      } }),
      concept("罪名-巨额财产来源不明罪", { id: "criminal-unexplained-assets", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百九十五条", url: flk.criminalLaw }],
        practicePoints: ["国家工作人员的财产/支出明显超过合法收入,差额巨大,不能说明来源的,处 5 年以下有期徒刑/拘役;差额特别巨大/情节严重的,5 年以上 10 年以下有期徒刑。"]
      } }),
      // === 渎职罪 ===
      concept("罪名-滥用职权罪", { id: "criminal-abuse-of-power", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百九十七条", url: flk.criminalLaw }],
        practicePoints: ["国家机关工作人员滥用职权或者不作为,致使公共财产/国家和人民利益遭受重大损失的,3 年以下有期徒刑/拘役;情节特别严重的,3-7 年。"]
      } }),
      concept("罪名-玩忽职守罪", { id: "criminal-dereliction-of-duty", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第三百九十七条", url: flk.criminalLaw }],
        practicePoints: ["国家机关工作人员严重不负责任,不履行或者不认真履行职责,致使公共财产/国家和人民利益遭受重大损失的,3 年以下有期徒刑/拘役;情节特别严重的,3-7 年。"]
      } }),
      // === 其他重要 ===
      concept("罪名-组织考试作弊罪", { id: "criminal-exam-cheat", type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑法", article: "第二百八十四条之一", url: flk.criminalLaw, note: "2015 年刑法修正案（九）新增。" }],
        practicePoints: ["在法律规定的国家考试中,组织作弊的,处 3 年以下有期徒刑/拘役,并处或者单处罚金;情节严重的,3-7 年。"]
      } })
    ]
  },
  {
    id: "system-procedure",
    title: "诉讼法",
    domain: "procedure",
    colorKey: "procedure",
    systemPosition: [-1.9, 0.4, 0.4],
    systemRadius: 2.75,
    systemInclination: 0.18,
    shortDescription: "诉讼法像程序桥梁，把实体权利、国家追诉和司法救济连接起来。",
    sourceRefs: ["flk-criminal-procedure", "flk-civil-procedure", "flk-administrative-litigation", "chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("民事诉讼", { type: "procedure", importance: 92, sourceRefs: ["flk-civil-procedure", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "全文（2023 年 9 月修正，2024 年 1 月施行）", url: flk.civilProcedure }],
        practicePoints: [
          "民事诉讼基本结构：当事人—法院—审级；起诉、受理、审理、判决、执行。",
          "民诉三大原则：当事人诉讼地位平等、辩论、处分。",
          "新民诉法对在线诉讼、繁简分流、小额诉讼等作了系统规定。"
        ]
      } }),
      concept("管辖", { type: "procedure", importance: 85, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第二十二条至第三十九条", url: flk.civilProcedure }],
        practicePoints: [
          "级别管辖：基层法院管辖第一审一般民事案件；中级法院管辖重大涉外案件等。",
          "地域管辖：一般原则'原告就被告'；合同纠纷可协议管辖；不动产纠纷专属不动产所在地。",
          "裁定管辖：移送管辖、指定管辖、管辖权转移。"
        ]
      } }),
      concept("当事人", { type: "procedure", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第四十八条至第六十一条", url: flk.civilProcedure }],
        practicePoints: ["原告、被告、共同诉讼人、第三人、诉讼代理人。"]
      } }),
      concept("证据", { type: "procedure", importance: 91, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第六十六条至第七十四条", url: flk.civilProcedure }],
        judicialInterpretations: [
          { title: "最高人民法院关于民事诉讼证据的若干规定", year: 2019, issuer: "最高人民法院", documentNumber: "法释〔2019〕19号", summary: "系统规定民事诉讼证据规则。", url: "https://www.court.gov.cn/judicial-interpretation/index.html" }
        ],
        practicePoints: [
          "证据八类：当事人陈述、书证、物证、视听资料、电子数据、证人证言、鉴定意见、勘验笔录。",
          "举证责任分配：'谁主张谁举证'为原则；特殊侵权、合同纠纷等举证倒置或举证缓和。",
          "电子数据：网页、博客、微博、即时通信、电子邮件、用户注册信息、电子交易记录等。"
        ]
      } }),
      concept("证明责任", { type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第六十七条", url: flk.civilProcedure }],
        practicePoints: [
          "当事人对自己提出的主张，有责任提供证据。",
          "法律没有规定或当事人无法举证时，由法院根据公平和诚信原则分配。",
          "高度盖然性标准：法院确信待证事实的存在具有高度可能性的，应当认定该事实存在。"
        ]
      } }),
      concept("普通程序", { type: "procedure", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第一百三十六条至第一百五十六条", url: flk.civilProcedure }],
        practicePoints: ["6 个月内审结，可延长；开庭前准备、调解、开庭审理、判决。"]
      } }),
      concept("简易程序", { type: "procedure", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第一百六十条至第一百六十五条", url: flk.civilProcedure }],
        practicePoints: ["基层法院和它派出的法庭审理事实清楚、权利义务关系明确、争议不大的简单民事案件，3 个月内审结。"]
      } }),
      concept("小额诉讼", { type: "procedure", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第一百六十五条", url: flk.civilProcedure }],
        practicePoints: ["标的额为各省上年度就业人员年平均工资 30% 以下的简单金钱给付案件，一审终审。"]
      } }),
      concept("保全", { type: "procedure", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第一百零三条至第一百一十一条", url: flk.civilProcedure }],
        practicePoints: [
          "诉前财产保全：情况紧急，利害关系人可在起诉前向法院申请。",
          "行为保全：申请法院责令被申请人作出一定行为或禁止作出一定行为（知识产权、环境污染等）。",
          "证据保全：证据可能灭失或难以取得的，可以申请法院保全。"
        ]
      } }),
      concept("先予执行", { type: "procedure", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第一百零九条", url: flk.civilProcedure }],
        practicePoints: ["追索赡养费/抚养费/抚育费/抚恤金/劳动报酬等紧急案件，可裁定先予执行。"]
      } }),
      concept("执行", { type: "procedure", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第三编 执行程序（第二百三十八条至第二百七十六条）", url: flk.civilProcedure }],
        practicePoints: [
          "执行申请期限：2 年（从法律文书规定履行期间最后一日起算）。",
          "执行措施：查询/冻结/划拨存款；查封/扣押/拍卖财产；搜查/拘留/罚款/限制出境。",
          "终结本次执行：无财产可供执行或财产无法处置；发现财产可随时恢复。"
        ]
      } }),
      concept("再审", { type: "procedure", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第二百零七条至第二百二十三条", url: flk.civilProcedure }],
        practicePoints: [
          "再审申请期限：6 个月，从判决/裁定/调解书发生法律效力之日起算。",
          "再审事由：新证据、原证据有问题、认定事实错误、适用法律错误、程序严重违法。",
          "再审法院：原审法院/上一级法院/最高人民法院。"
        ]
      } }),
      concept("调解", { type: "procedure", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国民事诉讼法", article: "第九十三条至第一百零一条", url: flk.civilProcedure }],
        practicePoints: ["法院调解贯穿审判全过程；调解书经双方当事人签收后即具有法律效力。"]
      } }),
      concept("刑事诉讼", { type: "procedure", importance: 92, sourceRefs: ["flk-criminal-procedure", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "全文（2018 年修正）", url: flk.criminalProcedure }],
        practicePoints: [
          "公检法三机关分工负责、互相配合、互相制约。",
          "无罪推定原则：未经法院依法判决，对任何人都不得确定有罪。",
          "犯罪嫌疑人在侦查阶段第一次讯问或采取强制措施之日起，有权委托律师作为辩护人。"
        ]
      } }),
      concept("侦查", { type: "procedure", importance: 83, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第二编 侦查（第一百一十五条至第一百六十五条）", url: flk.criminalProcedure }],
        practicePoints: [
          "侦查权：公安机关、检察机关、国家安全机关、监狱、军队保卫部门、海关走私犯罪侦查机构。",
          "讯问犯罪嫌疑人：侦查人员不得少于 2 人；讯问笔录应当交犯罪嫌疑人核对。",
          "重大案件讯问过程可全程录音录像。"
        ]
      } }),
      concept("强制措施", { type: "procedure", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第六十六条至第一百一十二条", url: flk.criminalProcedure }],
        practicePoints: [
          "5 种强制措施：拘传、取保候审、监视居住、拘留、逮捕。",
          "适用强度依次递增。",
          "逮捕条件：证据 + 罪责条件（可能判处徒刑以上刑罚）+ 社会危险性条件（具有法定的 5 种社会危险性情形之一）。"
        ]
      } }),
      concept("取保候审", { type: "procedure", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第六十七条至第七十三条", url: flk.criminalProcedure }],
        practicePoints: [
          "保证方式：保证人担保或保证金担保（1000 元起）。",
          "被取保候审人应遵守的规定：未经执行机关批准不得离开所居住的市/县；住址、工作单位和联系方式发生变动的在 24 小时内向执行机关报告；在传讯的时候及时到案等。",
          "违反规定情节严重的，变更强制措施为监视居住或逮捕。"
        ]
      } }),
      concept("逮捕", { type: "procedure", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第八十一条至第一百条", url: flk.criminalProcedure }],
        practicePoints: [
          "一般逮捕：可能判处徒刑以上刑罚 + 有社会危险性。",
          "检察院审查批准逮捕：7 日内作出决定；重大复杂案件可延长至 17 日。",
          "法院决定逮捕：对被告人直接作出逮捕决定。"
        ]
      } }),
      concept("辩护", { type: "procedure", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第三十三条至第四十八条", url: flk.criminalProcedure }],
        practicePoints: [
          "辩护权贯穿侦查、起诉、审判各阶段。",
          "指定辩护（法律援助）：可能被判处无期/死刑或未成年人案件等法定情形。",
          "值班律师：看守所为没有辩护人的犯罪嫌疑人/被告人提供法律帮助。"
        ]
      } }),
      concept("起诉", { type: "procedure", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第三编 提起公诉（第一百六十六条至第一百八十条）", url: flk.criminalProcedure }],
        practicePoints: [
          "公诉：检察院代表国家向法院提起。",
          "不起诉：法定不起诉（绝对不起诉）、酌定不起诉、证据不足不起诉。",
          "自诉案件：被害人或其法定代理人就特定轻罪（侮辱/诽谤/虐待/侵占等）直接向法院起诉。"
        ]
      } }),
      concept("审判程序", { type: "procedure", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第三编 审判（第一百八十一条至第二百四十七条）", url: flk.criminalProcedure }],
        practicePoints: [
          "一审：公诉/自诉案件分别按普通程序或简易程序审理。",
          "二审：上诉不加刑（不得加重被告人的刑罚）。",
          "死刑复核：除最高人民法院判决的以外都应报请最高人民法院核准。"
        ]
      } }),
      concept("上诉不加刑", { type: "procedure", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第二百三十七条", url: flk.criminalProcedure }],
        practicePoints: ["二审法院审理被告人/法定代理人/辩护人/近亲属上诉的案件，不得加重被告人的刑罚。"]
      } }),
      concept("行政诉讼", { type: "procedure", importance: 90, sourceRefs: ["flk-administrative-litigation", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政诉讼法", article: "全文（2017 年修正）", url: flk.administrativeLitigation }],
        practicePoints: [
          "受案范围：对具体行政行为不服的，可提起行政诉讼。",
          "复议后诉讼：除复议前置案件外，对具体行政行为不服的可以先复议再诉讼，也可以直接诉讼。",
          "起诉期限：知道作出行政行为之日起 6 个月。"
        ]
      } }),
      concept("证据-行政诉讼", { type: "procedure", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国行政诉讼法", article: "第三十三条至第四十三条", url: flk.administrativeLitigation }],
        practicePoints: ["被告（行政机关）对作出的具体行政行为的合法性承担举证责任。"]
      } }),
      concept("仲裁", { type: "procedure", importance: 74, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国仲裁法", article: "全文（2021 年修订）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "仲裁协议独立原则：主合同无效不影响仲裁协议效力。",
          "一裁终局：裁决作出即生效，不得上诉；只能申请撤销（证据：超裁、伪造证据、对方隐瞒证据）。",
          "不适用于婚姻、收养、监护、扶养、继承纠纷和依法应由行政机关处理的行政争议。"
        ]
      } }),
      concept("人民调解", { type: "procedure", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国人民调解法", article: "全文（2010 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["调解协议具有法律约束力；30 日内可向法院申请司法确认，经确认后有强制执行效力。"]
      } }),
      // ===== 江伟《民事诉讼法》+ 陈光中《刑事诉讼法》系统扩 =====
      concept("民事诉讼总论", { id: "civil-procedure-overview", type: "theory", importance: 90, sourceRefs: ["textbook-jiangwei-civil-procedure"], content: {
        practicePoints: [
          "民事诉讼:法院在当事人和其他诉讼参与人参加下,审理和解决民事案件的活动。",
          "目的:解决民事纠纷,保护当事人合法权益,维护社会秩序和经济秩序。",
          "基本原则:当事人诉讼地位平等/辩论/处分/调解/诚实信用/检察监督/支持起诉。"
        ]
      } }),
      concept("诉", { id: "civil-litigation-concept", type: "theory", importance: 86, content: {
        practicePoints: [
          "诉:当事人向法院提出的,请求法院对民事争议进行裁判的请求。",
          "诉的要素:当事人/诉的标的(请求法院裁判的对象)/诉的理由。",
          "诉的分类:确认之诉/给付之诉/变更之诉。"
        ]
      } }),
      concept("诉讼标的", { id: "litigation-subject", type: "theory", importance: 80, content: {
        practicePoints: [
          "诉讼标的:当事人之间发生争议,请求法院裁判的实体法律关系。",
          "诉讼标的额:用以确定级别管辖/简易程序/计算诉讼费/财产保全额等。",
          "诉讼标的与诉讼请求:诉讼标的是实体法律关系,诉讼请求是当事人具体的权利主张。"
        ]
      } }),
      concept("诉讼时效的中断", { id: "interruption-of-limitation", type: "rule", importance: 78, content: {
        practicePoints: [
          "中断事由:权利人向义务人提出履行请求/义务人同意履行/权利人提起诉讼或申请仲裁/与提起诉讼或申请仲裁具有同等效力的其他情形。",
          "中断效果:从中断/有关程序终结时起,诉讼时效期间重新计算。",
          "中断与中止的区别:中断是已过时效重新计算,中止是在时效进行中因法定事由暂停计算。"
        ]
      } }),
      concept("管辖权异议", { id: "jurisdiction-objection", type: "rule", importance: 76, content: {
        practicePoints: ["当事人对管辖权有异议的,应当在提交答辩状期间(15 日)提出;法院对异议应当作出裁定;对裁定不服的,可以上诉。"]
      } }),
      concept("反诉", { id: "counterclaim", type: "rule", importance: 78, content: {
        practicePoints: [
          "反诉:在本诉进行中,本诉被告向本诉原告提出的,旨在抵消/吞并/排斥本诉请求的独立的反请求。",
          "提起条件:本诉正在进行/反诉的被告是本诉的原告/反诉与本诉基于相同事实/反诉与本诉的诉讼请求存在因果关系/反诉属于受案法院管辖。",
          "二审中提起反诉的,法院可以调解,调解不成的,告知另行起诉。"
        ]
      } }),
      concept("第三人", { id: "third-party", type: "concept", importance: 80, content: {
        practicePoints: [
          "第三人:对他人之间的诉讼标的有独立请求权,或者虽无独立请求权,但案件处理结果与其有法律上的利害关系,而参加到他人正在进行的诉讼中去的人。",
          "有独立请求权第三人:对本诉原被告争议的诉讼标的主张全部权利。",
          "无独立请求权第三人:虽非原被告,但案件处理结果与其有法律上的利害关系。"
        ]
      } }),
      concept("诉讼代理人", { id: "litigation-agent", type: "concept", importance: 78, content: {
        practicePoints: [
          "法定代理人:基于法律规定取得代理权(父母/监护人)。",
          "委托代理人:基于当事人/法定代理人/法定代表人的授权委托(律师/近亲属/基层法律服务工作者/当事人所在单位/经法院许可的其他公民)。",
          "诉讼代理权限:一般授权/特别授权(代为承认/放弃/变更诉讼请求/进行和解/提起反诉/上诉)。"
        ]
      } }),
      concept("财产保全", { id: "civil-property-preservation", type: "procedure", importance: 80, content: {
        practicePoints: [
          "诉前财产保全:情况紧急,利害关系人可在起诉前向法院申请,法院必须在 48 小时内裁定。",
          "诉中财产保全:案件受理后/判决生效前,法院应当根据申请/必要时依职权裁定。",
          "担保:诉前保全必须提供担保;诉中保全法院可以要求申请人提供担保。",
          "保全范围:限于请求的范围,或者与本案有关的财物。"
        ]
      } }),
      concept("先予执行", { id: "advance-execution", type: "procedure", importance: 74, content: {
        practicePoints: [
          "先予执行:法院在终审判决作出前,根据当事人申请,裁定由被告预先履行一定数额的金钱或其他财产给付义务的制度。",
          "适用案件:追索赡养费/抚养费/抚育费/抚恤金/劳动报酬;因情况紧急需要先予执行的案件。",
          "条件:当事人之间权利义务关系明确/不先予执行将严重影响申请人的生活/被申请人有履行能力。"
        ]
      } }),
      concept("法庭调查", { id: "court-investigation", type: "procedure", importance: 78, content: {
        practicePoints: [
          "法庭调查阶段:当事人陈述/举证质证/法庭调查证据。",
          "举证期限:法院根据案情可以指定举证期限,不得少于 30 日,自当事人收到案件受理通知之日起计算。",
          "证据交换:开庭审理前,法院可以组织当事人交换证据。"
        ]
      } }),
      concept("法庭辩论", { id: "court-argument", type: "procedure", importance: 78, content: {
        practicePoints: ["法庭辩论:原告发言/被告答辩/第三人发言/互相辩论;法庭辩论终结,法院依法作出判决。"]
      } }),
      concept("民事调解", { id: "civil-mediation-procedure", type: "procedure", importance: 78, content: {
        practicePoints: [
          "调解原则:自愿合法/查明事实/分清是非。",
          "调解书:经双方当事人签收后即具有法律效力(生效判决/裁定同等效力)。",
          "不公开调解协议的内容,但应当公开调解的结果。",
          "调解书经双方签收后,一方反悔的,只能申请再审,不能上诉。"
        ]
      } }),
      concept("民事执行", { id: "civil-execution-procedure", type: "procedure", importance: 84, content: {
        practicePoints: [
          "执行根据:生效法律文书(判决/裁定/调解书/仲裁裁决/公证债权文书等)。",
          "执行申请期限:从法律文书规定履行期间的最后一日起 2 年。",
          "执行管辖:由第一审法院或者与第一审法院同级的被执行的财产所在地法院执行。",
          "执行措施:查询/冻结/划拨存款;查封/扣押/拍卖/变卖财产;搜查/拘留/罚款/限制出境;纳入失信被执行人名单。"
        ]
      } }),
      concept("执行救济", { id: "execution-remedy", type: "procedure", importance: 76, content: {
        practicePoints: [
          "执行异议:当事人/利害关系人认为执行行为违反法律规定的,可以向负责执行的法院提出书面异议。",
          "案外人异议:对执行标的主张权利的,可以向执行法院提出异议。",
          "执行复议:对执行异议裁定不服的,可以自裁定送达之日起 10 日内向上一级法院申请复议。",
          "执行监督:对执行案件,当事人可以向上一级法院申请执行监督。"
        ]
      } }),
      concept("审判监督程序", { id: "trial-supervision", type: "procedure", importance: 80, content: {
        practicePoints: [
          "再审:已经发生法律效力的判决/裁定/调解书,发现确有错误,可以重新进行审理。",
          "当事人申请再审:6 个月/从判决/裁定/调解书发生法律效力之日起计算。",
          "法院决定再审:本院/上一级法院/最高人民法院。",
          "检察院抗诉:同级检察院向同级法院/上级检察院向下级法院抗诉。"
        ]
      } }),
      concept("特别程序", { id: "special-procedure", type: "procedure", importance: 78, content: {
        practicePoints: [
          "特别程序:选民资格案件/宣告失踪/宣告死亡/认定公民无/限制民事行为能力/认定财产无主/确认调解协议效力/实现担保物权等。",
          "特点:实行一审终审/独任审理/审结期限短。",
          "选民资格案件:起诉人应当先向选举委员会提出申诉,对其处理决定不服的,才可在选举日的 5 日前起诉。"
        ]
      } }),
      concept("督促程序", { id: "payment-procedure", type: "procedure", importance: 74, content: {
        practicePoints: [
          "督促程序:法院根据债权人申请,不经审判,直接向债务人发出支付令,督促其履行给付金钱/有价证券义务的程序。",
          "适用条件:请求给付金钱/汇票/本票/支票/股票/债券/可转让的存单/仓单/提单;请求给付的金钱或有价证券已到期且数额确定;债权人与债务人没有其他债务纠纷;支付令能够送达债务人。",
          "债务人收到支付令 15 日内不提出书面异议又不履行支付令的,债权人可以申请法院强制执行。"
        ]
      } }),
      concept("公示催告程序", { id: "public-notice-procedure", type: "procedure", importance: 70, content: {
        practicePoints: ["可以背书转让的票据(汇票/本票/支票)被盗/遗失/灭失时,票据持有人可以向法院申请公示催告。"]
      } }),
      concept("执行异议之诉", { id: "execution-objection-suit", type: "procedure", importance: 76, content: {
        practicePoints: [
          "案外人执行异议之诉:案外人对执行标的主张权利的,可以在裁定送达之日起 15 日内向执行法院提起诉讼。",
          "申请执行人执行异议之诉:申请执行人对法院中止/终结执行异议裁定不服的,可以在裁定送达之日起 15 日内向执行法院提起诉讼。",
          "审理:由执行法院的审判庭审理;一审普通程序。"
        ]
      } }),
      // ===== 刑事诉讼法深化 =====
      concept("刑事诉讼总论", { id: "criminal-procedure-overview", type: "theory", importance: 90, sourceRefs: ["textbook-chenguangzhong-criminal-procedure"], content: {
        practicePoints: [
          "刑事诉讼:公安机关/检察机关/审判机关在当事人和其他诉讼参与人参加下,依照法定程序,揭露/证实/惩罚犯罪,保护无辜者,保障刑事诉讼顺利进行。",
          "目的:保证刑法的正确实施,惩罚犯罪,保护人民,保障国家安全和社会公共安全,维护社会主义社会秩序。",
          "基本原则:公检法分工负责/互相配合/互相制约/侦查权/检察权/审判权由专门机关行使/无罪推定/辩护/非法证据排除/疑罪从无。"
        ]
      } }),
      concept("公检法三机关关系", { id: "three-organs-relationship", type: "institution", importance: 84, content: {
        practicePoints: [
          "公检法三机关分工负责、互相配合、互相制约。",
          "公安机关:负责侦查,行使侦查权。",
          "检察机关:负责批准逮捕/提起公诉/法律监督。",
          "审判机关:负责审判,行使审判权。",
          "三机关各自独立行使职权,同时相互制约:公安机关的侦查受检察机关法律监督;检察机关的公诉受审判机关审判;审判机关的判决受检察机关抗诉监督。"
        ]
      } }),
      concept("辩护权", { id: "right-to-counsel", type: "rule", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第三十二条", url: flk.criminalProcedure }],
        practicePoints: [
          "犯罪嫌疑人/被告人在刑事诉讼各个阶段都享有辩护权;他人不得剥夺。",
          "辩护的种类:自行辩护/委托辩护(律师/人民团体/犯罪嫌疑人被告人所在单位推荐的人/监护人/亲友)/指定辩护(法律援助/法院指定)。",
          "阅卷权:受委托律师自案件审查起诉之日起,有权查阅/摘抄/复制全部案卷材料。"
        ]
      } }),
      concept("非法证据排除规则", { id: "illegal-evidence-exclusion", type: "rule", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第五十六条", url: flk.criminalProcedure }],
        practicePoints: [
          "采用刑讯逼供等非法方法收集的犯罪嫌疑人/被告人供述/采用暴力/威胁等非法方法收集的证人证言/被害人陈述,应当予以排除。",
          "收集物证/书证不符合法定程序,可能严重影响司法公正的,应当予以补正/作出合理解释,不能补正/作出合理解释的,对该证据应当予以排除。",
          "检察院应当对证据收集的合法性进行调查;法院认为可能存在以非法方法收集证据情形的,应当对证据收集的合法性进行调查。"
        ]
      } }),
      concept("认罪认罚从宽", { id: "leniency-for-plea", type: "institution", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国刑事诉讼法", article: "第十五条", url: flk.criminalProcedure, note: "2018 年刑诉法修改新增。" }],
        practicePoints: [
          "认罪认罚从宽:犯罪嫌疑人/被告人自愿如实供述自己的罪行,承认指控的犯罪事实,愿意接受处罚的,可以依法从宽处理。",
          "程序:侦查阶段告知认罪认罚从宽/审查起诉阶段听取意见/签署认罪认罚具结书/法院审理时对认罪认罚自愿性/真实性/合法性进行审查。",
          "从宽幅度:实体上从轻/减轻/免除处罚;程序上适用速裁程序/简易程序。"
        ]
      } }),
      concept("速裁程序", { id: "speedy-procedure", type: "procedure", importance: 80, content: {
        practicePoints: [
          "刑事速裁程序:基层法院管辖的可能判处 3 年以下有期徒刑/拘役/管制/单处罚金的案件,案件事实清楚/证据充分/被告人认罪认罚/同意适用速裁程序的。",
          "审理期限:受理后 10 日内审结;对可能判处的有期徒刑超过 1 年的,可以延长至 15 日。",
          "不适用速裁程序:盲/聋/哑人/未成年人/重大社会影响/被告人不同意/被告人不认罪等。"
        ]
      } }),
      concept("刑事附带民事诉讼", { id: "criminal-civil-annex", type: "procedure", importance: 80, content: {
        practicePoints: [
          "刑事附带民事诉讼:在刑事诉讼过程中,被害人/法定代理人/近亲属因被告人的犯罪行为遭受物质损失的,可以提起附带民事诉讼。",
          "审理:刑事案件和附带民事案件合并审理;先刑后民;刑事部分上诉不影响附带民事部分生效(除非附带民事部分亦上诉)。",
          "调解:附带民事诉讼可以调解,调解书经双方签收后即生效。"
        ]
      } })
    ]
  },
  {
    id: "system-economic",
    title: "经济法",
    domain: "economic",
    colorKey: "economic",
    systemPosition: [9.8, 4.1, -2.8],
    systemRadius: 2.45,
    systemInclination: 0.28,
    shortDescription: "经济法太阳系处理市场秩序、宏观调控、监管与公共利益之间的张力。",
    sourceRefs: ["flk-anti-monopoly", "flk-anti-unfair-competition", "chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("反垄断", { type: "law", importance: 91, sourceRefs: ["flk-anti-monopoly", pendingSource] }),
      concept("反不正当竞争", { type: "law", importance: 88, sourceRefs: ["flk-anti-unfair-competition", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "全文（2019 年修正）", url: flk.antiUnfairCompetition }],
        practicePoints: [
          "仿冒混淆、商业贿赂、虚假宣传、侵犯商业秘密、不正当有奖销售、商业诋毁、互联网专条等 7 类典型行为。",
          "经营者的合法权益受到不正当竞争行为损害的，可请求停止侵害、赔偿损失。",
          "赔偿额：实际损失；难以计算的，按侵权人获利；情节严重的，可主张惩罚性赔偿。"
        ]
      } }),
      concept("反垄断", { type: "law", importance: 91, sourceRefs: ["flk-anti-monopoly", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "全文（2022 年修正）", url: flk.antiMonopoly }],
        practicePoints: [
          "三大支柱：垄断协议、滥用市场支配地位、违法经营者集中。",
          "国务院设立反垄断委员会，国家市场监管总局反垄断局负责具体执法。",
          "经营者集中申报门槛：参与集中的所有经营者上一会计年度在全球范围内的营业额合计超过 100 亿元人民币，并且其中至少两个经营者上一会计年度在中国境内的营业额均超过 4 亿元人民币。"
        ]
      } }),
      concept("消费者权益保护", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国消费者权益保护法", article: "全文（2013 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "9 项权利：安全/知情/自主选择/公平交易/依法获得赔偿/依法成立维权组织/获得消费知识/人格尊严/个人信息保护。",
          "七日无理由退货：网络购物等特定情形。",
          "商品或服务造成人身损害的：生产者 + 销售者承担连带责任。"
        ]
      } }),
      concept("产品质量", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国产品质量法", article: "全文（2018 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["国家对产品质量实行以抽查为主要方式的监督检查制度。"]
      } }),
      concept("税法", { type: "field", importance: 86, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国个人所得税法", article: "全文", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国企业所得税法", article: "全文", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国增值税暂行条例", article: "全文", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "税收法定原则：税种的开征/停征、税收基本制度只能由法律规定。",
          "三大流转税：增值税、消费税、关税。",
          "三大所得税：企业所得税、个人所得税、土地增值税。"
        ]
      } }),
      concept("金融监管", { type: "institution", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国银行业监督管理法", article: "全文（2006 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["一行三会→一行两会（央行+银保监会+证监会）→国家金融监督管理总局+证监会（2023 年改革）。"]
      } }),
      concept("市场监管", { type: "institution", importance: 85, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国市场主体登记管理条例", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["市场监管部门负责反垄断、反不正当竞争、价格、广告、商标、食药、特种设备等综合监管。"]
      } }),
      concept("宏观调控", { type: "theory", importance: 82 }),
      concept("价格规制", { type: "rule", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国价格法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["政府定价、政府指导价、市场调节价 3 类；重要公用事业/公益服务/政府定价商品适用政府定价。"]
      } }),
      concept("电子商务监管", { type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国电子商务法", article: "全文（2019 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["电子商务经营者应办理市场主体登记，但个人销售自产农副产品、家庭手工业产品，个人利用自己的技能从事依法无须取得许可的便民劳务活动和零星小额交易活动，以及依照法律、行政法规不需要进行登记的除外。"]
      } }),
      concept("食品安全", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国食品安全法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "最严标准：4 个最严（最严谨的标准、最严格的监管、最严厉的处罚、最严肃的问责）。",
          "民事赔偿首负责任制：消费者因食品安全受到损害的，可向经营者或生产者要求赔偿；接到消费者赔偿请求的生产者/经营者应当先行赔付，不得推诿。"
        ]
      } }),
      concept("生态环境保护", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国环境保护法", article: "全文（2014 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["按日连续处罚：企业事业单位和其他生产经营者违法排放污染物，受到罚款处罚，被责令改正后，依法作出处罚决定的行政机关应当在 30 日内组织复查，发现其继续违法排放污染物或者拒绝、阻挠复查的，可以自责令改正之日的次日起，按照原处罚数额按日连续处罚。"]
      } }),
      concept("审计监督", { type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国审计法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["审计署在国务院总理领导下主管全国审计工作；地方审计机关在本级政府行政首长和上一级审计机关领导下负责本行政区域内的审计工作。"]
      } }),
      // ===== 杨紫煊《经济法》+ 史际春《经济法》系统扩 =====
      concept("经济法总论", { id: "economic-overview", type: "theory", importance: 88, sourceRefs: ["textbook-yangzixuan-economic", "textbook-shijichun-economic"], content: {
        practicePoints: [
          "经济法是调整在国家协调本国经济运行过程中发生的经济关系的法律规范的总称。",
          "经济法调整对象:市场主体调控关系/市场秩序调控关系/宏观经济调控关系/社会分配调控关系。",
          "经济法特征:经济性/政策性/综合性/行政主导性。",
          "经济法体系:市场规制法(反垄断/反不正当竞争/消法/质法/食安/药监)+ 宏观调控法(财税/金融/计划/产业政策)+ 监管法(银行/证券/保险)。"
        ]
      } }),
      concept("经济法基本原则", { type: "theory", importance: 84, content: {
        practicePoints: [
          "经济法基本原则:平衡协调原则/维护公平竞争原则/责权利相统一原则/有效调制原则。",
          "平衡协调原则:经济法既要保护市场主体的合法权益,又要保证国家对经济的有效调控。",
          "维护公平竞争原则:反对垄断和不正当竞争,维护市场秩序。"
        ]
      } }),
      concept("反垄断法", { id: "anti-monopoly-law", type: "law", importance: 90, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "全文（2022 年修正）", url: flk.antiMonopoly }],
        practicePoints: [
          "反垄断法 2022 年 8 月 1 日起施行修正,新增'反垄断委员会'职责;加强数字经济反垄断;引入'安全港'原则。",
          "三大支柱:垄断协议/滥用市场支配地位/违法经营者集中;新增'轴辐协议'规制。",
          "国务院设立反垄断委员会,国家市场监管总局反垄断局负责具体执法。",
          "经营者集中申报门槛:全球营业额 100 亿元 + 中国境内至少两个经营者各 4 亿元。"
        ]
      } }),
      concept("垄断协议", { id: "monopoly-agreement", type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "第二章 垄断协议", url: flk.antiMonopoly }],
        practicePoints: [
          "横向垄断协议:具有竞争关系的经营者达成的排除/限制竞争的协议/决定/协同行为(固定价格/分割市场/限制产量/联合抵制)。",
          "纵向垄断协议:经营者与交易相对人达成的转售价格维持协议等。",
          "垄断协议豁免(2022 新法):改进技术/提高质量/效率/降低成本/中小经营者统一行动/节约能源/环境保护/应对经济不景气/对外经贸合作/其他。",
          "举证责任倒置:经营者主张豁免的,应当证明所达成的协议符合豁免条件。"
        ]
      } }),
      concept("滥用市场支配地位", { id: "abuse-of-dominance", type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "第三章 滥用市场支配地位", url: flk.antiMonopoly }],
        practicePoints: [
          "市场支配地位:经营者在相关市场具有控制商品价格/数量/其他交易条件/阻碍其他经营者进入相关市场的能力。",
          "认定因素:市场份额/竞争状况/控制销售市场或采购市场的能力/财力和技术条件/其他经营者进入相关市场的难易程度。",
          "滥用行为:不公平高价/低于成本销售/拒绝交易/限定交易/搭售/差别待遇。",
          "互联网平台经济新规:平台'二选一'/'大数据杀熟'/'自我优待'可能构成滥用市场支配地位。"
        ]
      } }),
      concept("经营者集中", { id: "concentration-of-undertakings", type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "第四章 经营者集中", url: flk.antiMonopoly }],
        practicePoints: [
          "经营者集中:经营者合并/通过取得股权/资产/合同/其他方式取得对其他经营者的控制权/通过合同等方式取得对其他经营者的控制权或者能够对其他经营者施加决定性影响。",
          "申报标准:参与集中的所有经营者上一会计年度在全球范围内的营业额合计超过 100 亿元人民币,并且其中至少两个经营者上一会计年度在中国境内的营业额均超过 4 亿元人民币;中国境内营业额超过 20 亿元 + 至少两家各 4 亿元。",
          "审查结果:禁止/不予禁止/附条件批准。"
        ]
      } }),
      concept("反垄断执法", { id: "anti-monopoly-enforcement", type: "institution", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反垄断法", article: "第五章 对涉嫌垄断行为的调查", url: flk.antiMonopoly }],
        practicePoints: [
          "反垄断调查机构:反垄断委员会(国务院)+ 反垄断执法机构(国家市场监管总局/省/自治区/直辖市市场监管部门)。",
          "调查措施:进入被调查的经营者的营业场所或者其他有关场所进行检查/询问被调查的经营者/利害关系人或者其他有关单位或者个人/查阅/复制有关单证/协议/会计账簿/业务函电/电子数据等文件/查封/扣押相关证据/查询经营者的银行账户。",
          "法律责任:达成并实施垄断协议的,处上一年度销售额 1%-10% 的罚款;尚未达成所达成的垄断协议的,可以处 300 万元以下的罚款。"
        ]
      } }),
      concept("反不正当竞争", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "全文（2019 年修正）", url: flk.antiUnfairCompetition }],
        practicePoints: [
          "仿冒混淆/商业贿赂/虚假宣传/侵犯商业秘密/不正当有奖销售/商业诋毁/互联网专条等 7 类典型行为。",
          "经营者的合法权益受到不正当竞争行为损害的,可请求停止侵害/赔偿损失。",
          "赔偿额:实际损失;难以计算的,按侵权人获利;情节严重的,可主张惩罚性赔偿。"
        ]
      } }),
      concept("仿冒混淆", { id: "imitation-confusion", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "第六条", url: flk.antiUnfairCompetition }],
        practicePoints: ["擅自使用与他人有一定影响的商品名称/包装/装潢/店铺名称/应用程序图标/域名/网页/其他标识,引人误认为是他人商品或者与他人存在特定联系,属于混淆行为。"]
      } }),
      concept("商业贿赂", { id: "commercial-bribery", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "第七条", url: flk.antiUnfairCompetition }],
        practicePoints: [
          "商业贿赂:经营者以财物或者其他手段贿赂交易相对方的工作人员/受交易相对方委托办理相关事务的单位或者个人/利用职权或者影响力影响交易的单位或者个人,以谋取交易机会/竞争优势。",
          "与刑法中贿赂罪的区别:商业贿赂发生在商业领域,贿赂罪发生在公权力领域。",
          "反不正当竞争法第 7 条 vs 刑法第 164/389/390 条:前者是经济法规范,后者是刑事规范。"
        ]
      } }),
      concept("虚假宣传", { id: "false-advertising", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "第八条", url: flk.antiUnfairCompetition }],
        practicePoints: ["经营者不得对商品的性能/功能/质量/销售状况/用户评价/曾获荣誉等作虚假或者引人误解的商业宣传,欺骗/误导消费者;通过组织虚假交易等方式帮助其他经营者进行虚假或者引人误解的商业宣传。"]
      } }),
      concept("侵犯商业秘密", { id: "trade-secret-misappropriation", type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国反不正当竞争法", article: "第九条", url: flk.antiUnfairCompetition }],
        practicePoints: [
          "商业秘密:不为公众所知悉/能为权利人带来经济利益/具有实用性并经权利人采取保密措施的技术信息和经营信息。",
          "侵权方式:以盗窃/贿赂/欺诈/胁迫/电子侵入等不正当手段获取权利人的商业秘密/披露/使用或者允许他人使用以前述手段获取的权利人的商业秘密/违反保密义务或者违反权利人有关保守商业秘密的要求,披露/使用/允许他人使用其所掌握的商业秘密。",
          "员工跳槽:员工离职后,利用原单位商业秘密从事竞争业务,可能构成侵犯商业秘密。"
        ]
      } }),
      concept("消费者权益保护", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国消费者权益保护法", article: "全文（2013 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "9 项权利:安全/知情/自主选择/公平交易/依法获得赔偿/依法成立维权组织/获得消费知识/人格尊严/个人信息保护。",
          "七日无理由退货:网络购物等特定情形。",
          "商品或服务造成人身损害的:生产者 + 销售者承担连带责任。",
          "消费者协会:对损害消费者合法权益的行为,通过大众传播媒介予以揭露、批评。"
        ]
      } }),
      concept("消费者组织", { id: "consumer-organization", type: "institution", importance: 76, content: {
        practicePoints: [
          "中国消费者协会/地方各级消费者协会。",
          "公益诉讼:对侵害众多消费者合法权益的行为,中国消费者协会以及在省/自治区/直辖市设立的消费者协会,可以向人民法院提起诉讼。",
          "消费者协会有权对商品和服务的质量/价格/售后服务等进行社会监督。"
        ]
      } }),
      concept("产品质量法", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国产品质量法", article: "全文（2018 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["国家对产品质量实行以抽查为主要方式的监督检查制度;抽查的产品质量不合格的,责令生产者/销售者限期改正;情节严重的,吊销营业执照。"]
      } }),
      concept("食品安全", { type: "law", importance: 84, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国食品安全法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "最严标准:4 个最严(最严谨的标准/最严格的监管/最严厉的处罚/最严肃的问责)。",
          "民事赔偿首负责任制:消费者因食品安全受到损害的,可向经营者或生产者要求赔偿;接到消费者赔偿请求的生产者/经营者应当先行赔付,不得推诿。",
          "刑事责任:生产销售不符合食品安全标准的食品,足以造成严重食物中毒事故或者其他严重食源性疾病的,处 3 年以下有期徒刑/拘役;后果特别严重的,处 7 年以上有期徒刑/无期徒刑。"
        ]
      } }),
      concept("药品管理", { id: "drug-regulation", type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国药品管理法", article: "全文（2019 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "国家药品监督管理局负责全国药品监督管理工作。",
          "药品分类管理:处方药/非处方药(甲类/乙类)。",
          "假药/劣药的认定与处罚。"
        ]
      } }),
      concept("个人所得税法", { id: "individual-income-tax", type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国个人所得税法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "居民个人取得综合所得,按年合并计算税款,办理年度汇算清缴。",
          "经营所得/利息股息红利所得/财产转让所得/偶然所得等分类计税。",
          "专项附加扣除:子女教育/继续教育/大病医疗/住房贷款利息/住房租金/赡养老人/婴幼儿照护/个人养老金。"
        ]
      } }),
      concept("企业所得税法", { id: "corporate-income-tax", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国企业所得税法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "企业每一纳税年度的收入总额,减除不征税收入/免税收入/各项扣除以及允许弥补的以前年度亏损后的余额,为应纳税所得额。",
          "居民企业:25% 法定税率;符合条件的小型微利企业:20%/10%/5% 阶梯税率。",
          "税收优惠:高新技术企业 15%/技术先进型服务企业 15%/西部大开发 15% 等。"
        ]
      } }),
      concept("增值税", { id: "vat", type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国增值税暂行条例", article: "全文（2017 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "增值税:对销售货物/提供应税劳务/进口货物/提供应税服务的单位和个人,按其增值额征收的税。",
          "税率:13%/9%/6% 三档(2019 年深化增值税改革后);零税率适用出口货物。",
          "小规模纳税人:年应征增值税销售额 ≤ 500 万元,适用 3% 征收率。"
        ]
      } }),
      concept("金融监管", { type: "institution", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国银行业监督管理法", article: "全文（2006 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "中国金融监管框架:人民银行(货币政策/宏观审慎)+ 国家金融监督管理总局(银行/保险)+ 中国证监会(证券/基金/期货)。",
          "银保监会 2023 年改组为'国家金融监督管理总局',统一监管银行/保险/金融控股/消费金融等。",
          "功能监管与行为监管:按业务功能划分监管职责,加强行为监管。"
        ]
      } }),
      concept("消费者金融保护", { id: "consumer-finance-protection", type: "institution", importance: 76, content: {
        practicePoints: ["金融消费者享有财产安全权/知情权/自主选择权/公平交易权/受教育权/受尊重权/信息安全权/依法求偿权等八项权利。"]
      } }),
      concept("金融稳定", { id: "financial-stability", type: "theory", importance: 78, content: {
        practicePoints: [
          "系统性金融风险防范:防范化解重大金融风险是金融工作的根本任务。",
          "存款保险制度:2015 年《存款保险条例》施行,50 万元最高偿付限额。",
          "宏观审慎管理:对系统性风险进行识别/评估/监测/预警/处置。",
          "系统性重要银行 (D-SIBs):额外资本要求/恢复与处置计划。"
        ]
      } }),
      concept("宏观调控", { type: "theory", importance: 82, content: {
        practicePoints: [
          "宏观调控:国家综合运用经济/法律和必要的行政手段,对国民经济总体活动进行调节和控制的行为。",
          "调控目标:促进经济增长/增加就业/稳定物价/保持国际收支平衡。",
          "调控手段:国家计划/产业政策/财政政策/货币政策/价格政策/对外贸易政策等。",
          "调控主体:国务院/国家发改委/财政部/中国人民银行/国家市场监管总局等。"
        ]
      } }),
      concept("产业政策", { id: "industrial-policy", type: "rule", importance: 76, content: {
        practicePoints: [
          "产业政策:国家针对特定产业/企业/技术/地区实施的,以促进产业结构优化/提升产业竞争力为目标的政策体系。",
          "类型:鼓励性产业政策(税收优惠/财政补贴/金融支持)/限制性产业政策(准入限制/淘汰落后产能)/保护性产业政策(贸易救济/产业安全)。",
          "《十四五规划纲要》确立的产业政策方向:战略性新兴产业(新一代信息技术/生物技术/新能源/新材料/高端装备/新能源汽车/绿色环保/航空航天/海洋装备等)。"
        ]
      } }),
      concept("价格法", { id: "price-law", type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国价格法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "价格形式:政府定价/政府指导价/市场调节价 3 类。",
          "重要公用事业/公益服务/政府定价商品适用政府定价。",
          "经营者不执行政府定价/政府指导价的,责令改正/没收违法所得/罚款。"
        ]
      } }),
      concept("电子商务法", { type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国电子商务法", article: "全文（2019 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "电子商务:通过互联网等信息网络销售商品/提供服务的经营活动。",
          "电子商务经营者应办理市场主体登记,但个人销售自产农副产品/家庭手工业产品/个人利用自己的技能从事依法无须取得许可的便民劳务活动和零星小额交易活动,以及依照法律、行政法规不需要进行登记的除外。",
          "电子商务平台经营者:对平台内经营者的资质资格未尽到审核义务,或者对消费者未尽到安全保障义务的,依法承担相应的责任。"
        ]
      } }),
      concept("生态环境保护法", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国环境保护法", article: "全文（2014 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "按日连续处罚:企业事业单位和其他生产经营者违法排放污染物,受到罚款处罚,被责令改正后,依法作出处罚决定的行政机关应当在 30 日内组织复查,发现其继续违法排放污染物或者拒绝/阻挠复查的,可以自责令改正之日的次日起,按照原处罚数额按日连续处罚。",
          "环境公益诉讼:符合条件的社会组织可以向人民法院提起环境公益诉讼。",
          "生态损害赔偿:违反国家规定造成生态环境损害的,国家规定的机关或者法律规定的组织有权请求侵权人承担修复责任/赔偿损失/修复费用/调查/鉴定评估等合理费用/惩罚性赔偿等。"
        ]
      } }),
      concept("审计监督", { type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国审计法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["审计署在国务院总理领导下主管全国审计工作;地方审计机关在本级政府行政首长和上一级审计机关领导下负责本行政区域内的审计工作。"]
      } })
    ]
  },
  {
    id: "system-social",
    title: "社会法",
    domain: "social",
    colorKey: "social",
    systemPosition: [3.2, 6.4, -1.2],
    systemRadius: 2.2,
    systemInclination: -0.12,
    shortDescription: "社会法太阳系关注劳动、社会保障、弱势群体保护和安全生产。",
    sourceRefs: ["flk-labor-law", "flk-social-insurance", "chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("劳动法", { type: "law", importance: 91, sourceRefs: ["flk-labor-law", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动法", article: "全文（2018 年修正）", url: flk.laborLaw }],
        practicePoints: [
          "适用范围：企业、个体经济组织、民办非企业单位等与之形成劳动关系的劳动者；国家机关、事业单位、社会团体与之建立劳动合同关系的劳动者。",
          "工时制度：标准工时每周不超过 40 小时；加班 1.5/2/3 倍工资。",
          "劳动争议处理：调解-仲裁-诉讼。"
        ]
      } }),
      concept("劳动合同", { type: "institution", importance: 92, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动合同法", article: "全文（2012 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "三类合同：固定期限、无固定期限、以完成一定工作任务为期限。",
          "连续工作满 10 年或连续 2 次固定期限后续签，应签无固定期限。",
          "试用期：3 个月以上不满 1 年的，试用期不得超过 1 个月；1 年以上不满 3 年的，不得超过 2 个月；3 年以上固定期限或无固定期限的，不得超过 6 个月。"
        ]
      } }),
      concept("劳动争议仲裁", { type: "procedure", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动争议调解仲裁法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "仲裁前置：劳动争议仲裁是诉讼的前置程序。",
          "仲裁时效：1 年，从当事人知道或应当知道权利被侵害之日起算。",
          "一裁终局：追索劳动报酬/工伤医疗费/经济补偿或赔偿金不超过当地月最低工资标准 12 个月的争议，裁决为终局裁决。"
        ]
      } }),
      concept("社会保险", { type: "law", importance: 86, sourceRefs: ["flk-social-insurance", pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国社会保险法", article: "全文（2018 年修正）", url: flk.socialInsurance }],
        practicePoints: ["五险：养老/医疗/失业/工伤/生育；2024 年起逐步推行个人养老金制度。"]
      } }),
      concept("住房公积金", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "住房公积金管理条例", article: "全文（2019 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["缴存基数：职工本人上一年度月平均工资；缴存比例 5%-12%。"]
      } }),
      concept("劳动安全", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国安全生产法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["生产经营单位的主要负责人是本单位安全生产第一责任人。"]
      } }),
      concept("职业病防治", { type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国职业病防治法", article: "全文（2018 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["用人单位应当为劳动者建立职业健康监护档案。"]
      } }),
      concept("社会救助", { type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "社会救助暂行办法", article: "全文（2014 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["最低生活保障、特困人员供养、受灾人员救助、医疗救助、教育救助、住房救助、就业救助、临时救助 8 类。"]
      } }),
      concept("未成年人保护", { type: "law", importance: 84, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国未成年人保护法", article: "全文（2020 年修订）", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国预防未成年人犯罪法", article: "全文（2020 年修订）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: ["家庭保护、学校保护、社会保护、网络保护、政府保护、司法保护 6 大保护体系。"]
      } }),
      concept("妇女权益保障", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国妇女权益保障法", article: "全文（2022 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["明确禁止性骚扰；用人单位应采取措施预防和制止性骚扰。"]
      } }),
      concept("残疾人保障", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国残疾人保障法", article: "全文（2018 修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["残疾分类：视力、听力、言语、肢体、智力、精神、多重残疾；按残疾等级核发残疾证。"]
      } }),
      concept("老年人权益保障", { type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国老年人权益保障法", article: "全文（2018 修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["家庭成员应当关心老年人的精神需求；与老年人分开居住的家庭成员，应当经常看望或问候老年人（'常回家看看'条款）。"]
      } }),
      concept("工会", { type: "institution", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国工会法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["基层工会、地方各级总工会、全国总工会；用人单位有劳动者 25 人以上的应建立基层工会委员会。"]
      } }),
      concept("社区矫正", { type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国社区矫正法", article: "全文（2020 年 7 月施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["被判处管制、宣告缓刑、假释或暂予监外执行的罪犯，依法在社会上对其实施的非监禁刑罚执行活动。"]
      } }),
      // ===== 社会法深化 =====
      concept("劳动法总论", { id: "labor-law-overview", type: "theory", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动法", article: "全文（2018 年修正）", url: flk.laborLaw }],
        practicePoints: [
          "劳动法调整劳动关系以及与劳动关系密切联系的社会关系。",
          "适用范围:企业/个体经济组织/民办非企业单位等与之形成劳动关系的劳动者;国家机关/事业单位/社会团体与之建立劳动合同关系的劳动者。",
          "劳动法的立法目的:保护劳动者的合法权益,调整劳动关系,建立和维护适应社会主义市场经济的劳动制度,促进经济发展和社会进步。"
        ]
      } }),
      concept("劳动关系", { id: "labor-relationship", type: "concept", importance: 84, content: {
        practicePoints: [
          "劳动关系:劳动者与用人单位在实现劳动过程中建立的社会关系。",
          "认定劳动关系三要素:主体适格(劳动者+用人单位)/劳动者受用人单位劳动管理/从事用人单位安排的有报酬的劳动。",
          "事实劳动关系:用人单位与劳动者未签订书面劳动合同,但实际履行了劳动权利义务而形成的关系。"
        ]
      } }),
      concept("劳动争议处理", { id: "labor-dispute", type: "procedure", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动争议调解仲裁法", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "劳动争议范围:因确认劳动关系/订立/履行/变更/解除和终止劳动合同/除名/辞退/辞职/离职/工作时间/休息休假/劳动报酬/工伤医疗费/经济补偿/赔偿金/劳动保护/社会保险/培训/劳动纪律/劳动规章制度/法律规定的其他事项发生的争议。",
          "处理程序:调解(企业劳动争议调解委员会/基层人民调解组织/乡镇街道劳动争议调解组织)→ 仲裁(劳动争议仲裁委员会)→ 诉讼(人民法院)。",
          "仲裁时效:1 年,从当事人知道或应当知道权利被侵害之日起算。"
        ]
      } }),
      concept("劳动合同订立", { id: "labor-contract-formation", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动合同法", article: "第二章 劳动合同的订立", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "劳动合同期限:固定期限/无固定期限/以完成一定工作任务为期限。",
          "必备条款:用人单位的名称/住所/法定代表人/劳动者姓名/身份证号/合同期限/工作内容/工作地点/工作时间和休息休假/劳动报酬/社会保险/劳动保护/劳动条件/违反合同的责任。",
          "试用期:3 个月以上不满 1 年的,不得超过 1 个月;1 年以上不满 3 年的,不得超过 2 个月;3 年以上固定期限或无固定期限的,不得超过 6 个月。"
        ]
      } }),
      concept("无固定期限劳动合同", { id: "open-term-contract", type: "rule", importance: 80, content: {
        practicePoints: [
          "无固定期限劳动合同:用人单位与劳动者约定无确定终止时间的劳动合同。",
          "应当订立情形:连续工作满 10 年/连续 2 次固定期限后续签(2014 年修正前;修正后 2013 年起已变更为需 1 次即可,具体看修正时间)/用人单位初次实行劳动合同制度/国有企业改制重新签订劳动合同等情况。",
          "劳动者提出/同意续签/签订无固定期限劳动合同的,用人单位应当签订。"
        ]
      } }),
      concept("工作时间休息休假", { id: "working-hours", type: "rule", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动法", article: "第三十六条至第四十五条", url: flk.laborLaw }],
        practicePoints: [
          "标准工时:每日 8 小时,每周 40 小时。",
          "加班工资:平时 150%/周末不能补休 200%/法定节假日 300%。",
          "带薪年休假:连续工作 1 年以上不满 10 年的,年休假 5 天;10 年以上不满 20 年的,10 天;20 年以上的,15 天。"
        ]
      } }),
      concept("工资", { id: "wages", type: "concept", importance: 78, content: {
        practicePoints: [
          "工资:用人单位依据劳动合同的规定,以各种形式支付给劳动者的工资报酬。",
          "工资支付周期:至少每月支付一次。",
          "工资应以法定货币支付,不得以实物或有价证券代替货币支付。",
          "试用期工资:不得低于本单位相同岗位最低档工资/劳动合同约定工资的 80%,并不得低于用人单位所在地的最低工资标准。"
        ]
      } }),
      concept("劳动合同解除", { id: "labor-contract-termination", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动合同法", article: "第三十六条至第四十条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "协商解除:用人单位提出,需支付经济补偿。",
          "劳动者单方解除:提前 30 日书面通知(试用期内提前 3 日通知),无需经济补偿。",
          "用人单位单方解除(过错性):劳动者严重违反规章制度/严重失职/营私舞弊/给单位造成重大损害/同时与其他单位建立劳动关系/经提出拒不改正/被依法追究刑事责任/试用期内不符合录用条件。",
          "用人单位单方解除(非过错性):客观情况发生重大变化/经济性裁员/劳动合同期满(用人单位不续签)/企业转产/技术革新/经营方式调整等。"
        ]
      } }),
      concept("经济补偿", { id: "severance", type: "rule", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国劳动合同法", article: "第四十六条至第四十七条", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "经济补偿:用人单位依法解除或终止劳动合同时,按照法定标准支付劳动者的经济补偿。",
          "计算标准:按劳动者在本单位工作的年限,每满 1 年支付 1 个月工资;6 个月以上不满 1 年的,按 1 年计算;不满 6 个月的,向劳动者支付半个月工资。",
          "月工资:劳动合同解除或者终止前 12 个月的平均工资;低于当地最低工资标准的,按最低工资标准计算;高于本地区上年度职工月平均工资 3 倍的,按 3 倍封顶,年限不超过 12 年。"
        ]
      } }),
      concept("工伤认定", { id: "work-injury-determination", type: "procedure", importance: 78, content: {
        practicePoints: [
          "工伤认定:职工因工作原因受到事故伤害/患职业病/因工外出期间由于工作原因受到伤害/上下班途中受到非本人主要责任的交通事故/因履行工作职责受到暴力伤害等。",
          "申请时限:用人单位 30 日内/工伤职工或近亲属/工会 1 年内申请工伤认定。",
          "工伤待遇:医疗费/停工留薪期工资/一次性伤残补助金/伤残津贴/一次性工伤医疗补助金/一次性伤残就业补助金等。"
        ]
      } }),
      concept("社会保险法", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国社会保险法", article: "全文（2018 年修正）", url: flk.socialInsurance }],
        practicePoints: [
          "五险:养老/医疗/失业/工伤/生育。",
          "缴费主体:用人单位和劳动者共同缴纳;灵活就业人员/个体工商户/未在用人单位参保的劳动者可参加养老/医疗。",
          "待遇:养老金按月支付/医疗保险报销医疗费用/失业保险金/工伤保险待遇/生育保险待遇。",
          "2024 年起逐步推行个人养老金制度。"
        ]
      } }),
      concept("养老金", { id: "pension", type: "concept", importance: 78, content: {
        practicePoints: [
          "基本养老金由基础养老金和个人账户养老金组成。",
          "领取条件:达到法定退休年龄/累计缴费满 15 年。",
          "计算:基础养老金 = (退休时上年度在岗职工月平均工资 + 本人指数化月平均缴费工资) / 2 × 缴费年限 × 1%。",
          "个人账户养老金 = 个人账户储存额 / 计发月数。"
        ]
      } }),
      concept("医疗保险", { id: "medical-insurance", type: "concept", importance: 76, content: {
        practicePoints: [
          "职工医保/居民医保(城乡居民基本医疗保险)。",
          "统筹账户 + 个人账户。",
          "门诊/住院/大病保险/异地就医结算。"
        ]
      } }),
      concept("失业保险", { id: "unemployment-insurance", type: "concept", importance: 72, content: {
        practicePoints: [
          "失业人员:失业前用人单位和本人累计缴纳失业保险费满 1 年/非因本人意愿中断就业/已办理失业登记并有求职要求。",
          "失业保险金:按月发放,期限根据缴费年限确定(最长 24 个月)。",
          "待遇:失业保险金/医疗保险/职业培训/职业介绍/丧葬补助/抚恤金。"
        ]
      } }),
      concept("工伤保险", { id: "work-injury-insurance", type: "concept", importance: 74, content: {
        practicePoints: [
          "工伤保险实行雇主单方缴费制度(用人单位缴费,劳动者不缴费)。",
          "工伤认定:由统筹地区社会保险行政部门作出。",
          "劳动能力鉴定:由设区的市级劳动能力鉴定委员会作出。"
        ]
      } }),
      concept("生育保险", { id: "maternity-insurance", type: "concept", importance: 70, content: {
        practicePoints: [
          "生育保险:用人单位缴费,劳动者不缴费。",
          "2019 年起,生育保险与职工医保合并征收,生育保险待遇并入职工医保。",
          "待遇:产假/生育津贴/生育医疗费用/计划生育手术费用。"
        ]
      } }),
      concept("住房公积金", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "住房公积金管理条例", article: "全文（2019 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "缴存范围:国家机关/国有企业/城镇集体企业/外商投资企业/城镇私营企业及其他城镇企业/事业单位/民办非企业单位/社会团体(以上单位在职职工)。",
          "缴存基数:职工本人上一年度月平均工资;缴存比例 5%-12%(单位和个人相同)。",
          "提取条件:购买/建造/翻建/大修自住住房/离休/退休/完全丧失劳动能力并与单位终止劳动关系/出境定居/偿还购房贷款本息/房租超出家庭工资收入规定比例等。"
        ]
      } }),
      concept("劳动安全卫生", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国安全生产法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "生产经营单位的主要负责人是本单位安全生产第一责任人。",
          "安全生产保障:安全生产条件/安全生产责任制/安全生产规章制度/安全生产教育培训/安全生产资金投入/安全设施/安全检查/应急救援预案/事故报告和调查处理。",
          "安全生产监督管理:县级以上各级人民政府有关主管部门(应急管理部门/公安/住建/交通/市场监管等)在各自职责范围内对安全生产工作实施监督管理。"
        ]
      } }),
      concept("职业病防治", { type: "law", importance: 76, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国职业病防治法", article: "全文（2018 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["用人单位应当为劳动者建立职业健康监护档案;对从事接触职业病危害作业的劳动者,应当组织上岗前/在岗期间/离岗时的职业健康检查。"] } }),
      concept("社会救助", { type: "institution", importance: 80, content: {
        statuteRefs: [{ lawTitle: "社会救助暂行办法", article: "全文（2014 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "8 类救助:最低生活保障/特困人员供养/受灾人员救助/医疗救助/教育救助/住房救助/就业救助/临时救助。",
          "最低生活保障:对共同生活的家庭成员人均收入低于当地最低生活保障标准,且符合当地最低生活保障家庭财产状况规定的家庭,给予差额救助。",
          "特困人员供养:无劳动能力/无生活来源/无法定赡养抚养扶养义务人或者其法定义务人无履行义务能力的老年/残疾/未满 16 周岁的未成年人。"
        ]
      } }),
      concept("未成年人保护", { type: "law", importance: 84, content: {
        statuteRefs: [
          { lawTitle: "中华人民共和国未成年人保护法", article: "全文（2020 年修订）", url: "https://flk.npc.gov.cn/" },
          { lawTitle: "中华人民共和国预防未成年人犯罪法", article: "全文（2020 年修订）", url: "https://flk.npc.gov.cn/" }
        ],
        practicePoints: [
          "未成年人:未满 18 周岁的公民。",
          "6 大保护:家庭保护/学校保护/社会保护/网络保护/政府保护/司法保护。",
          "网络保护:网络游戏服务提供者应当要求未成年人以真实身份信息注册并采取技术措施识别;网络产品和服务提供者不得向未成年人提供诱导其沉迷的产品和服务。"
        ]
      } }),
      concept("妇女权益保障", { type: "law", importance: 82, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国妇女权益保障法", article: "全文（2022 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "明确禁止性骚扰;用人单位应当采取措施预防和制止对妇女的性骚扰。",
          "消除就业性别歧视:除国家规定的不适合妇女的工种或者岗位外,不得以性别为由拒绝录用妇女或者提高对妇女的录用标准。",
          "特殊保护:经期/孕期/产期/哺乳期。"
        ]
      } }),
      concept("残疾人保障", { type: "law", importance: 78, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国残疾人保障法", article: "全文（2018 修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["残疾分类:视力/听力/言语/肢体/智力/精神/多重残疾;按残疾等级核发残疾证。"] } }),
      concept("老年人权益保障", { type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国老年人权益保障法", article: "全文（2018 修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["家庭成员应当关心老年人的精神需求;与老年人分开居住的家庭成员,应当经常看望或问候老年人(常回家看看条款)。"] } }),
      concept("工会", { type: "institution", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国工会法", article: "全文（2021 年修正）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["基层工会/地方各级总工会/全国总工会;用人单位有劳动者 25 人以上的应建立基层工会委员会。"] } }),
      concept("社区矫正", { type: "institution", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国社区矫正法", article: "全文（2020 年 7 月施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["被判处管制/宣告缓刑/假释或暂予监外执行的罪犯,依法在社会上对其实施的非监禁刑罚执行活动。"] } }),
    ]
  },
  {
    id: "system-international",
    title: "国际法",
    domain: "international",
    colorKey: "international",
    systemPosition: [-13.4, 0.2, -9.7],
    systemRadius: 2.7,
    systemInclination: 0.34,
    shortDescription: "国际法位于远外轨，连接国家、条约、涉外民商事关系和跨境争端解决。",
    sourceRefs: ["flk-foreign-relations", "flk-treaty-procedure", "chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("国际公法", { type: "field", importance: 90, content: {
        practicePoints: ["国际公法调整国家之间、国际组织间的关系；主要渊源：条约、习惯、一般法律原则。"]
      } }),
      concept("国际私法", { type: "field", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国涉外民事关系法律适用法", article: "全文（2011 年 4 月施行）", url: flk.foreignRelations }],
        practicePoints: [
          "国际私法 = 冲突法 + 统一实体法。",
          "最密切联系原则：涉外民事关系适用的法律，由法院根据最密切联系原则确定。",
          "当事人意思自治：合同可协议选择适用法律（意思自治原则）。"
        ]
      } }),
      concept("国际经济法", { type: "field", importance: 88 }),
      concept("条约", { type: "rule", importance: 86, sourceRefs: ["flk-treaty-procedure", textbookSource, pendingSource], content: {
        statuteRefs: [{ lawTitle: "中华人民共和国缔结条约程序法", article: "全文（1990 年施行）", url: flk.treatyProcedure }],
        practicePoints: [
          "条约名称：公约、条约、协定、议定书、宪章、盟约、规约等。",
          "缔结程序：谈判—签署—批准/核准/接受/加入（双边条约常需互换批准书）。",
          "条约在国内的适用：直接适用/转化适用/并用。"
        ]
      } }),
      concept("国家责任", { type: "rule", importance: 84, content: {
        practicePoints: ["国家对其国际不法行为承担国际责任；要素：可归因于国家的行为 + 违背国际义务。"]
      } }),
      concept("外交关系", { type: "law", importance: 80, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国外交特权与豁免条例", article: "全文", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["外交代表的人身不可侵犯、住所不可侵犯、通讯自由、管辖豁免等。"]
      } }),
      concept("涉外民事关系法律适用", { type: "law", importance: 86, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国涉外民事关系法律适用法", article: "全文", url: flk.foreignRelations }],
        practicePoints: [
          "合同：当事人可协议选择；无选择时适用履行义务最能体现该合同特征的一方当事人经常居所地法律或者其他与该合同有最密切联系的法律。",
          "婚姻：结婚条件依共同经常居所地法律；没有的，适用共同国籍国法律。",
          "继承：法定继承适用被继承人死亡时经常居所地法律；遗嘱方式符合遗嘱人立遗嘱时或者死亡时经常居所地法律、国籍国法律或者遗嘱行为地法律的，遗嘱均为成立。"
        ]
      } }),
      concept("国际贸易", { type: "field", importance: 82, content: {
        practicePoints: ["WTO 多边贸易体制；CPTPP、RCEP 等区域贸易协定；2021 年中国正式申请加入 CPTPP、DEPA。"]
      } }),
      concept("国际投资", { type: "field", importance: 80, content: {
        practicePoints: ["投资争端解决：ICSID（国际投资争端解决中心）+ UNCITRAL 仲裁规则；BIT（双边投资协定）通常提供投资者-国家仲裁机制。"]
      } }),
      concept("海事海商", { type: "field", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国海商法", article: "全文（1993 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["船舶物权、海上货物运输、海难救助、共同海损、船舶碰撞、海事赔偿责任限制等。"]
      } }),
      concept("争端解决", { type: "procedure", importance: 82, content: {
        practicePoints: [
          "政治性争端：协商/斡旋/调停/调查/和解。",
          "法律性争端：国际法院（ICJ）+ 国际海洋法庭（ITLOS）+ WTO 争端解决机制（DSB）+ 投资仲裁（ICSID）。"
        ]
      } }),
      concept("国际组织", { type: "institution", importance: 78, content: {
        practicePoints: ["UN（联合国）、WTO、WHO、ILO、UNESCO、IMF、世界银行、ASEAN、上海合作组织、BRICS 等。"]
      } }),
      concept("引渡", { type: "procedure", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国引渡法", article: "全文（2000 年施行）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: ["双重犯罪原则、政治犯不引渡原则、本国国民不引渡原则（可拒绝引渡）。"]
      } }),
      // ===== 国际法深化（按王铁崖《国际法》分章） =====
      concept("国家主权", { type: "theory", importance: 92, content: {
        practicePoints: [
          "国家主权是国家最重要的属性：独立权、平等权、自卫权、管辖权。",
          "主权平等原则：《联合国宪章》第 2 条第 1 款；主权平等包括法律上平等与政治上平等。",
          "主权限制：自愿限制（条约/国际组织）和非自愿限制（国际不法行为责任）。",
          "不干涉内政原则：禁止任何国家以任何方式干涉他国内政（《联合国宪章》第 2 条第 7 款）。"
        ]
      } }),
      concept("国际法主体", { type: "theory", importance: 88, content: {
        practicePoints: [
          "传统主体：国家（基本主体）、国际组织（派生主体）、正在争取独立的民族（被承认的解放运动）。",
          "个人：是否为主体有争议；通常认为个人在特定领域（人权/国际刑法）是部分主体。",
          "国际法主体的要件：具有国际法律人格、能直接承担国际法权利义务、能直接提起国际诉讼。"
        ]
      } }),
      concept("国际法渊源", { type: "theory", importance: 86, content: {
        practicePoints: [
          "《国际法院规约》第 38 条：国际法渊源为条约/习惯/一般法律原则/司法判例/公法学说。",
          "条约：国家间明示协议（'条约必须遵守' pacta sunt servanda）。",
          "国际习惯：作为通例之证明而接受为法律者（两个要素：客观'通例'+主观'法律确信'）。",
          "一般法律原则：各法律体系共有原则（如'善意'、'禁止滥用权利'）。"
        ]
      } }),
      concept("海洋法", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国海洋环境保护法", article: "全文（2023 年修订）", url: "https://flk.npc.gov.cn/" }],
        practicePoints: [
          "1982 年《联合国海洋法公约》(UNCLOS) — 海洋法宪章。",
          "海域划分：内海/领海（12 海里）/毗连区（24 海里）/专属经济区（200 海里）/大陆架/公海。",
          "过境通行制度：外国船舶在领海享有'过境通行'权。",
          "中国 1996 年批准 UNCLOS；2021 年实施《海警法》。"
        ]
      } }),
      concept("领土法", { type: "law", importance: 84, content: {
        practicePoints: [
          "领土取得方式：先占/时效/添附/割让/征服/全民投票。",
          "现代国际法禁止以武力获取领土（'不使用武力'原则）。",
          "边界争端：谈判/仲裁/国际法院裁判。",
          "南极条约体系（1959）：冻结领土主权要求；外空条约（1967）：外空不得据为己有。"
        ]
      } }),
      concept("外交与领事法", { type: "law", importance: 82, content: {
        practicePoints: [
          "1961 年《维也纳外交关系公约》：外交代表的人身不可侵犯/住所不可侵犯/管辖豁免/通讯自由。",
          "1963 年《维也纳领事关系公约》：领事职务/领事特权/豁免（比外交豁免窄）。",
          "中国 1986 年加入维也纳外交关系公约；1990 年加入维也纳领事关系公约。"
        ]
      } }),
      concept("国际人权法", { type: "law", importance: 84, content: {
        practicePoints: [
          "1948 年《世界人权宣言》— 国际人权法基础；1966 年《公民权利和政治权利国际公约》(ICCPR) + 《经济、社会及文化权利国际公约》(ICESCR)。",
          "区域人权公约：欧洲人权公约/美洲人权公约/非洲人权和民族权利公约。",
          "国际人权两公约：'所有人权是普遍、不可分割、相互依存和相互联系的'（维也纳宣言 1993）。",
          "中国 1998 年签署 ICCPR，尚未批准。"
        ]
      } }),
      concept("国际刑法", { type: "law", importance: 84, content: {
        practicePoints: [
          "国际罪行：侵略罪/灭绝种族罪/危害人类罪/战争罪/海盗罪/恐怖主义犯罪/贩毒/贩运人口。",
          "国际刑事法院（ICC, 2002）：常设国际刑事司法机构；管辖 4 大核心罪行。",
          "前南斯拉夫国际刑事法庭（ICTY, 1993-2017）+ 卢旺达国际刑事法庭（ICTR, 1994-2015）。",
          "普遍管辖：海盗罪/灭绝种族罪/酷刑罪等可由任何国家管辖。"
        ]
      } }),
      concept("国际争端解决", { type: "procedure", importance: 86, content: {
        practicePoints: [
          "政治性方法：谈判/协商/斡旋/调停/调查/和解（皆不具法律拘束力）。",
          "法律性方法：仲裁/国际法院（ICJ）。",
          "国际法院（ICJ）规约第 36 条：任择性强制管辖；中国 2006 年声明接受（保留'可保留事项'）。",
          "司法判决具终局性（ICJ 判决仅对当事国及本案有拘束力）。"
        ]
      } }),
      concept("国际责任法", { type: "rule", importance: 84, content: {
        practicePoints: [
          "2001 年《国家责任条款草案》— 国际法委员会 53 年编纂成果。",
          "国家责任构成要件：可归因于国家的行为（国家机关/经授权的实体/失控的私人）+ 违背国际义务。",
          "国家责任形式：终止不法行为/恢复原状/补偿/道歉/保证不重复/限制主权。",
          "国际罪行：严重违反'对国际社会整体承担'的义务（如侵略/灭绝种族）；所有国家可援引责任。"
        ]
      } }),
      concept("条约法", { type: "law", importance: 88, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国缔结条约程序法", article: "全文（1990 年施行）", url: flk.treatyProcedure }],
        practicePoints: [
          "1969 年《维也纳条约法公约》— 条约法宪章。",
          "条约生效：依条约规定；无规定的，依谈判国意思。",
          "保留：单方声明，'于己' 排除/修改条约的某些规定；1969 年公约第 19-20 条。",
          "条约解释：依条约用语之通常意义 + 条约之目的及宗旨（《维也纳条约法公约》第 31-33 条）。"
        ]
      } }),
      concept("国际航空法", { type: "law", importance: 76, content: {
        practicePoints: [
          "1944 年《芝加哥公约》— 国际民用航空基础；确立领空主权 + 公海自由 + 航空器国籍。",
          "1944 年《国际航空运输协定》（'五大自由'）+ 1944 年《国际航班过境协定》（'两大自由'）。",
          "1963 年《东京公约》、1970 年《海牙公约》、1971 年《蒙特利尔公约》— 航空刑法（劫机/恐怖主义）。",
          "中国 1971 年加入《国际民用航空公约》(ICAO)。"
        ]
      } }),
      concept("外层空间法", { type: "law", importance: 72, content: {
        practicePoints: [
          "1967 年《关于各国探索和利用包括月球和其他天体在内外层空间活动的原则条约》('外空条约')。",
          "5 大原则：探索和利用自由/不得据为己有/非军事化(月球)/国际合作/国家责任。",
          "1968 年《营救协定》、1972 年《空间物体造成损害的国际责任公约》、1975 年《登记公约》、1979 年《月球协定》。"
        ]
      } }),
      concept("环境保护国际法", { type: "law", importance: 80, content: {
        practicePoints: [
          "1992 年《里约宣言》— 21 世纪议程；'可持续发展'与'共同但有区别的责任'。",
          "1997 年《京都议定书》— 发达国家量化减排；2015 年《巴黎协定》— 自下而上'国家自主贡献'(NDC)。",
          "1992 年《气候变化框架公约》(UNFCCC) — 国际气候法基础。",
          "中国 2016 年正式加入《巴黎协定》。"
        ]
      } }),
      concept("国际武装冲突法", { type: "law", importance: 80, content: {
        practicePoints: [
          "1949 年 4 个《日内瓦公约》+ 1977 年两个《附加议定书》— 国际人道法核心。",
          "基本原则：区分原则(平民与战斗员区分)/比例原则/禁止不分皂白攻击/禁止使用引起过分伤害的武器。",
          "战俘地位(《日内瓦第三公约》)/伤病员保护(《日内瓦第一公约》)/占领地平民保护(《日内瓦第四公约》)。",
          "国际刑事法院可起诉严重违反国际人道法的行为(战争罪)。"
        ]
      } }),
      concept("国际经济法总论", { type: "field", importance: 82, content: {
        practicePoints: [
          "国际经济法调整国家/国际组织/私人之间的跨国经济关系。",
          "主要分支：国际贸易法/国际投资法/国际金融法/国际税法/国际知识产权法。",
          "主体多元：国家(主权者)/国际组织(协调者)/跨国公司(私主体)。",
          "与国内经济法的关系：'国际经济法是国内经济法的国际化'。"
        ]
      } }),
      concept("WTO 多边贸易体制", { type: "law", importance: 86, content: {
        practicePoints: [
          "1995 年 WTO 成立；'乌拉圭回合'成果（《马拉喀什协定》）。",
          "核心原则：最惠国待遇(MFN)/国民待遇/关税减让/一般禁止数量限制/透明度。",
          "争端解决机制(DSB)：磋商→专家组→上诉机构→执行(反向协商一致/反向一致性原则)。",
          "2019 年起上诉机构停摆（美国阻挠任命）；多方临时上诉仲裁安排(MPIA)。"
        ]
      } }),
      concept("GATT 1994", { type: "law", importance: 78, content: {
        practicePoints: [
          "1947 年《关税与贸易总协定》(GATT 1947) — WTO 前身；1994 年'GATT 1994'为 WTO 框架下'货物贸易总协定'。",
          "核心义务：最惠国待遇(第 I 条)/国民待遇(第 III 条)/关税减让(第 II 条)/一般禁止数量限制(第 XI 条)。",
          "GATT 例外：一般例外(第 XX 条)/安全例外(第 XXI 条)/国际收支例外(第 XII 条)/幼稚工业保护(第 XVIII 条)。",
          "中国 2001 年加入 WTO。"
        ]
      } }),
      concept("国际投资法", { type: "law", importance: 82, content: {
        practicePoints: [
          "双边投资条约(BIT)：东道国与母国签订，相互保护投资者。",
          "投资者-国家争端解决(ISDS)：ICSID 仲裁/UNCITRAL 仲裁；仲裁裁决具终局性。",
          "2012 年美国 South American Silver 案：确立'公司国籍'标准（依注册地或有效联系地）。",
          "中国签订 130+ BIT；2013 年中国-欧盟 BIT 谈判（2020 年原则上完成）。"
        ]
      } }),
      concept("国际货物买卖法", { type: "law", importance: 80, content: {
        practicePoints: [
          "1980 年《联合国国际货物销售合同公约》(CISG) — 国际货物买卖统一法。",
          "中国 1986 年加入 CISG（保留第 1 条第 1 款 b 项及第 11 条等）。",
          "FOB/CIF/CFR 三种主要贸易术语 — 2020 年《国际贸易术语解释通则》(Incoterms 2020)。",
          "信用证：UCP 600 (2007) — 跟单信用证统一惯例。"
        ]
      } }),
      concept("国际知识产权法", { type: "law", importance: 78, content: {
        practicePoints: [
          "1883 年《巴黎公约》— 工业产权；1967 年《成立世界知识产权组织公约》— WIPO 成立。",
          "1994 年 TRIPS 协定：WTO 框架下知识产权最低保护标准。",
          "PCT 体系（专利）/马德里体系（商标）/海牙体系（外观设计）— WIPO 国际注册体系。",
          "中国 1980 年加入 WIPO；1985 年加入《巴黎公约》；加入《马德里协定》(1989)/PCT(1994)。"
        ]
      } }),
      concept("国际税法", { type: "law", importance: 72, content: {
        practicePoints: [
          "国家税收管辖权：居民税收管辖权 + 来源地税收管辖权。",
          "国际重复征税：通过'抵免法'或'免税法'消除。",
          "国际税收协定：双边税收协定 (DTA) 调整所得税，避免双重征税，防止偷漏税。",
          "BEPS(税基侵蚀与利润转移)行动计划：G20/OECD 主导；防止跨国企业将利润转移至低税地。"
        ]
      } }),
      concept("国际金融法", { type: "law", importance: 74, content: {
        practicePoints: [
          "国际货币基金组织(IMF)：1945 年成立；'特别提款权'(SDR)篮子货币。",
          "世界银行集团：国际复兴开发银行(IBRD)+ 国际开发协会(IDA)+ 国际金融公司(IFC)+ 多边投资担保机构(MIGA)+ 国际投资争端解决中心(ICSID)。",
          "巴塞尔协议：I(1988)/II(2004)/III(2010-2017)；'三大支柱'：资本充足率/监管审查/市场约束。",
          "2015 年人民币加入 SDR 篮子货币。"
        ]
      } }),
      concept("国际私法渊源", { type: "theory", importance: 80, content: {
        practicePoints: [
          "国际私法 = 冲突法 + 统一实体法 + 国际民事诉讼法 + 国际商事仲裁法。",
          "冲突规范：'法律适用规范'/'抵触规则'/'间接调整方法'。",
          "系属公式（公式化准据法表述）：属人法/物之所在地法/行为地法/法院地法/当事人合意选择。",
          "识别（定性）/反致/转致/外国法的查明/公共秩序保留—国际私法基本制度。"
        ]
      } }),
      concept("冲突规范与准据法", { type: "rule", importance: 78, content: {
        practicePoints: [
          "冲突规范结构：'范围' + '系属' + '关联词'（如'依'/'适用'/'按'）。",
          "准据法：经冲突规范指定用于解决涉外民商事争议的特定国家的法律。",
          "系属公式：'不动产依物之所在地法'/'合同依当事人合意'/'侵权依损害发生地'。",
          "'分割方法'与'整体方法'：同一法律关系的不同方面分别适用不同准据法 vs 整个法律关系适用同一准据法。"
        ]
      } }),
      concept("意思自治原则", { type: "rule", importance: 80, content: {
        practicePoints: [
          "意思自治：当事人合意选择合同准据法的自由（《涉外民事关系法律适用法》第 3 条）。",
          "适用范围：合同（典型）/ 侵权（有限）/ 婚姻财产（允许）/ 遗嘱（部分）。",
          "限制：'弱者保护'原则（消费者/劳动者合同只能在特定法律中选择）。",
          "未选择时：'最密切联系原则'（《涉外民事关系法律适用法》第 2 条第 2 款）。"
        ]
      } }),
      concept("最密切联系原则", { type: "rule", importance: 78, content: {
        practicePoints: [
          "最密切联系：法院在确定涉外民商事关系准据法时，综合考虑各种连结因素，适用与案件有最密切联系的法律。",
          "'特征履行说'：以合同特征性履行方的住所地/营业地法为最密切联系地。",
          "中国法体现：《涉外民事关系法律适用法》多处使用最密切联系原则。",
          "灵活性强，但需'特征履行'/'利益分析'等具体方法支撑。"
        ]
      } }),
      concept("国际民商事管辖权", { type: "procedure", importance: 78, content: {
        practicePoints: [
          "国际民商事管辖权：解决哪国法院对涉外案件有管辖权的问题。",
          "一般管辖：依'原告就被告'（被告住所地）。",
          "特别管辖：合同(履行地)/侵权(侵权行为地)/不动产(不动产所在地)。",
          "中国《民事诉讼法》第 265-276 条：'协议管辖'/'应诉管辖'/'专属管辖'。",
          "2017 年海牙《承认与执行外国法院判决公约》(待生效)。"
        ]
      } }),
      concept("国际商事仲裁", { type: "procedure", importance: 84, content: {
        practicePoints: [
          "国际商事仲裁：解决跨国商事争议的'非诉讼'方式。",
          "1958 年《承认与执行外国仲裁裁决公约》(《纽约公约》)— 仲裁裁决跨境执行的国际法基础。",
          "国际商事仲裁机构：ICC 国际商会仲裁院/SIAC 新加坡国际仲裁中心/HKIAC 香港国际仲裁中心/CIETAC 中国国际经济贸易仲裁委员会。",
          "中国 1986 年加入《纽约公约》。"
        ]
      } }),
      concept("国际私法主体", { type: "rule", importance: 72, content: {
        practicePoints: [
          "自然人国籍：'血统主义'/'出生地主义'/'混合主义'。",
          "中国《国籍法》(1980)：'血统主义为主、出生地主义为辅'。",
          "法人国籍：'成立地说'（中国采此说）/ '住所地说' / '实际控制说' / '复合标准说'。",
          "住所：'久住'/'居所'/'户籍'；中国民法以户籍所在地或经常居住地为住所。"
        ]
      } }),
      concept("国际货物运输", { type: "law", importance: 76, content: {
        practicePoints: [
          "海运：1924 年《海牙规则》/1968 年《维斯比规则》/1978 年《汉堡规则》。",
          "空运：1929 年《华沙公约》/1999 年《蒙特利尔公约》。",
          "铁路：1951 年《国际铁路货物联运协定》(CIM)。",
          "中国《海商法》(1993) — 海运/船舶/海难救助/共同海损/船舶碰撞/海事赔偿责任限制。"
        ]
      } }),
      concept("国际民事诉讼法", { type: "procedure", importance: 74, content: {
        practicePoints: [
          "外国人的诉讼地位：国民待遇原则（《民事诉讼法》第 5 条）。",
          "国际司法协助：送达/调查取证/承认与执行外国法院判决/仲裁裁决。",
          "中国与他国双边司法协助条约 (60+)；海牙送达公约/取证公约（中国未加入）。",
          "公共秩序保留：承认与执行外国判决不得违反中国法律基本原则/国家主权/安全/公共利益。"
        ]
      } }),
      concept("涉外婚姻家庭", { type: "law", importance: 72, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国涉外民事关系法律适用法", article: "第三章 婚姻家庭", url: flk.foreignRelations }],
        practicePoints: [
          "结婚条件：依共同经常居所地法律；没有的，适用共同国籍国法律；再没有的，适用办理结婚登记地法律。",
          "结婚手续：依中国法 + 当地国法律均可（《婚姻登记条例》）。",
          "夫妻人身关系：共同经常居所地法律；没有的，适用共同国籍国法律。",
          "夫妻财产关系：协议选择 → 共同经常居所地法律 → 共同国籍国法律。"
        ]
      } }),
      concept("涉外继承", { type: "law", importance: 74, content: {
        statuteRefs: [{ lawTitle: "中华人民共和国涉外民事关系法律适用法", article: "第四章 继承", url: flk.foreignRelations }],
        practicePoints: [
          "法定继承：动产依被继承人死亡时经常居所地法律；不动产依不动产所在地法律（《适用法》第 31 条）。",
          "遗嘱方式：符合立遗嘱时/死亡时常居所地/国籍国/遗嘱行为地 4 种法律之一即为有效（《适用法》第 32 条）。",
          "无人继承财产：依被继承人死亡时遗产所在地法律（《适用法》第 35 条）。"
        ]
      } }),
      concept("国际人道法", { type: "law", importance: 78, content: {
        practicePoints: [
          "1949 年四个《日内瓦公约》及 1977 年两个《附加议定书》。",
          "区分原则：战斗员 vs 平民、军事目标 vs 民用目标；禁止不分皂白攻击。",
          "比例原则：平民伤亡不应超过预期的具体直接军事利益。",
          "禁止使用引起过分伤害或不必要痛苦的武器/作战方法（如：化学武器、生物武器、达姆弹、燃烧弹对平民）。"
        ]
      } }),
      concept("国际难民法", { type: "law", importance: 74, content: {
        practicePoints: [
          "1951 年《关于难民地位的公约》+ 1967 年《议定书》— 难民定义 + 待遇标准。",
          "难民定义：'有正当理由畏惧由于种族、宗教、国籍、特定社会团体成员资格或政治见解的原因受到迫害'且在本国之外的人。",
          "UNHCR（联合国难民署）— 1950 年成立；'非政治性'/'人道主义'使命。",
          "中国 1982 年加入《难民地位公约》。"
        ]
      } }),
      concept("反恐怖主义国际法", { type: "law", importance: 76, content: {
        practicePoints: [
          "13 项联合国反恐怖主义公约/议定书（如：1970 年《海牙公约》、1979 年《纽约公约》、1997 年《制止恐怖主义爆炸公约》)。",
          "1999 年 UN 安理会第 1267 号决议：制裁塔利班/基地组织；2001 年第 1373 号决议：'一切手段'打击恐怖主义。",
          "上海合作组织地区反恐怖机构 (RATS, 2004)。",
          "中国 2015 年《反恐怖主义法》— 国内法 + 国际合作。"
        ]
      } }),
      concept("国际组织法", { type: "institution", importance: 82, content: {
        practicePoints: [
          "国际组织分类：政府间国际组织(IGOs)/非政府组织(INGOs)；普遍性/区域性；专门性。",
          "联合国(UN, 1945)：大会/安理会/经社理事会/托管理事会/国际法院/秘书处。",
          "安理会：5 常任理事国 + 10 非常任理事国；'大国一致原则'(P5 否决权)。",
          "中国是联合国创始会员国；安理会 5 常任理事国之一。"
        ]
      } }),
      concept("区域国际法", { type: "law", importance: 78, content: {
        practicePoints: [
          "区域国际法：调整区域范围内国家间关系，具有区域特性的国际法原则/规则。",
          "欧洲：欧盟(EU)/欧洲委员会(Council of Europe)/欧洲安全与合作组织(OSCE)。",
          "美洲：美洲国家组织(OAS)。",
          "亚洲：ASEAN 东盟/上海合作组织(SCO)/亚洲基础设施投资银行(AIIB)。"
        ]
      } }),
      concept("国际卫生法", { type: "law", importance: 70, content: {
        practicePoints: [
          "世界卫生组织(WHO, 1948)：联合国专门机构；'国际卫生条例'(IHR, 2005)。",
          "WHO 章程第 1 条：'使全世界人民获得最高可能水平的健康'。",
          "新冠疫情推动《国际卫生条例》修订与'大流行条约'(Pandemic Treaty)谈判。",
          "中国 1972 年恢复 WHO 席位；积极参与 IHR 改革。"
        ]
      } }),
      concept("国际劳动法", { type: "law", importance: 72, content: {
        practicePoints: [
          "国际劳工组织(ILO, 1919) — 联合国唯一'三方'成员(政府/雇主/工人)的专门机构。",
          "ILO 公约与建议书：'三方性'与'双层性'原则。",
          "核心劳工标准：结社自由/集体谈判/消除强迫劳动/消除就业歧视/废除童工(8 项基本公约)。",
          "中国批准 28 项 ILO 公约；尚未批准的包括 87 号(结社自由)与 98 号(集体谈判)等。"
        ]
      } }),
      concept("国际私法基本制度", { type: "theory", importance: 78, content: {
        practicePoints: [
          "识别（定性/归类）：法院依本国法对事实/法律概念进行分类，决定适用哪条冲突规范。",
          "反致：甲国依本国冲突规范指定乙国法，乙国冲突规范反过来指定甲国法适用。",
          "公共秩序保留：依外国法会导致违反本国公共秩序时，排除该外国法的适用。",
          "外国法的查明：举证责任/查明方法/无法查明时的补救（适用中国法）。"
        ]
      } }),
      concept("国家承认", { type: "rule", importance: 80, content: {
        practicePoints: [
          "国家承认：既存国家确认新国家已具备国际法主体资格的行为。",
          "承认方式：明示承认(声明)/默示承认(建立外交关系/签订条约)；法律承认 vs 事实承认。",
          "承认的效果：承认被承认国具有国际法主体资格；建立外交关系；互派外交代表。",
          "承认的学说：构成说(承认是国家的构成要件)/宣告说(承认仅宣告既有事实)。"
        ]
      } }),
      concept("政府承认", { type: "rule", importance: 76, content: {
        practicePoints: [
          "政府承认：既存国家对一个新政府在本国领土行使有效控制的事实予以承认。",
          "托雷利翁原则/艾斯特拉达原则(1930)：不需正式承认，默示通过是否维持外交关系确认。",
          "中国实践：1971 年中华人民共和国恢复联合国合法席位 — 国际社会对中国政府的承认。",
          "对'流亡政府'的承认：理论上有争议，实践中罕见。"
        ]
      } }),
      concept("国际法上的继承", { type: "rule", importance: 74, content: {
        practicePoints: [
          "国家继承：领土变更导致国际法权利义务的转移。",
          "1978 年《国家在条约方面的继承的维也纳公约》+ 1983 年《关于国家对国家财产、档案和债务的继承的维也纳公约》。",
          "条约继承：依'领土协定'/'随领土转移'原则。",
          "政府继承：与国家继承不同；中国实践：1949 年中华人民共和国政府对前'中华民国'政府的国际权利义务的'继承+区别处理'。"
        ]
      } }),
      concept("国际商事调解", { type: "procedure", importance: 70, content: {
        practicePoints: [
          "2018 年《联合国关于调解所产生的国际和解协议公约》(《新加坡调解公约》)— 国际商事和解协议跨境执行。",
          "中国 2019 年签署《新加坡调解公约》。",
          "商事调解与诉讼/仲裁的关系：'调解+仲裁'/'调解+诉讼'双轨机制。",
          "中国 2021 年《人民法院在线调解规则》/ 2022 年《国际商事调解规则》(贸法会示范法)。"
        ]
      } }),
    ]
  },
  {
    id: "system-legal-history",
    title: "中国法律史",
    domain: "legal-history",
    colorKey: "legal-history",
    systemPosition: [-7.4, -5.8, 6.8],
    systemRadius: 2.6,
    systemInclination: -0.36,
    shortDescription: "中国法律史太阳系提供制度演化、法典传统和近代转型的远轨背景。",
    sourceRefs: ["chsi-law-discipline-scope", textbookSource, pendingSource],
    concepts: [
      concept("商鞅变法", { type: "history", importance: 86, content: {
        practicePoints: ["公元前 356 年秦孝公任用商鞅变法：以法治国、奖励耕战、废井田开阡陌、户籍什伍连坐、军功爵制；为秦统一六国奠定制度基础。"],
        historicalEvolution: [
          { year: "前 356", event: "秦孝公任命商鞅进行第一次变法" },
          { year: "前 350", event: "第二次变法：废井田、实行县制、统一度量衡" }
        ]
      } }),
      concept("秦律", { type: "history", importance: 82, content: {
        practicePoints: ["1975 年湖北云梦睡虎地秦墓竹简是研究秦律的关键史料；秦律以法家思想为指导，刑罚严酷（'秦法繁于秋荼，而网密于凝脂'）。"]
      } }),
      concept("汉律", { type: "history", importance: 78, content: {
        practicePoints: ["汉承秦制，萧何制《九章律》；'春秋决狱'引儒家经典入律，开启礼法结合先河。"]
      } }),
      concept("唐律疏议", { type: "history", importance: 91, content: {
        practicePoints: [
          "《永徽律疏》=《唐律》+ 长孙无忌等《律疏》；为东亚法系母本，影响日本、朝鲜、越南。",
          "12 篇，502 条；五刑：笞/杖/徒/流/死。",
          "'德礼为政教之本，刑罚为政教之用' — 出自《唐律疏议》名例律。"
        ],
        historicalEvolution: [
          { year: "624", event: "《武德律》— 唐高祖" },
          { year: "637", event: "《贞观律》— 唐太宗长孙无忌" },
          { year: "651", event: "《永徽律》颁行" },
          { year: "653", event: "长孙无忌等奉敕撰《律疏》" }
        ]
      } }),
      concept("宋刑统", { type: "history", importance: 76, content: {
        practicePoints: ["宋太祖建隆四年（963 年）颁行，全称《宋建隆重详定刑统》；中国历史上第一部雕版印行的法典。"]
      } }),
      concept("大明律", { type: "history", importance: 82, content: {
        practicePoints: [
          "洪武三十年（1397 年）颁行；30 卷，460 条。",
          "篇章结构：以六部分目（吏/户/礼/兵/刑/工），明清沿用，影响东亚法系。",
          "律后附《大明律集解附例》。"
        ]
      } }),
      concept("大清律例", { type: "history", importance: 84, content: {
        practicePoints: ["乾隆五年（1740 年）颁行；以《大明律》为蓝本，律 436 条 + 附例 1409 条；中国最后一部传统法典。"]
      } }),
      concept("清末修律", { type: "history", importance: 88, content: {
        practicePoints: [
          "1902 年清廷下诏修律；沈家本、伍廷芳主持修订法律馆。",
          "1910 年《大清新刑律》— 中国第一部近代意义上的刑法典；1911 年《大清民律草案》— 中国第一部民法典草案（未颁行）。"
        ],
        historicalEvolution: [
          { year: "1902", event: "清廷下诏修律" },
          { year: "1905", event: "废除科举、设立大理院" },
          { year: "1910", event: "《大清新刑律》颁行" },
          { year: "1911", event: "《大清民律草案》编成" }
        ]
      } }),
      concept("近代法制转型", { type: "history", importance: 86, content: {
        practicePoints: ["从大陆法系继受：清末修律引入德日民法、刑法；民国六法全书：宪法/民法/刑法/商法/民事诉讼法/刑事诉讼法。"]
      } }),
      concept("法典化传统", { type: "history", importance: 90, content: {
        practicePoints: ["从《法经》（前 6 世纪）→《唐律疏议》→《大明律》→《大清律例》→《中华民国民法》→ 1986《民法通则》→ 2020《民法典》，形成持续的成文法典传统。"]
      } }),
      concept("礼法结合", { type: "theory", importance: 80, content: {
        practicePoints: ["中国传统法核心特征：'礼'是伦理规范，'法'是强制规范；二者关系从'礼法之争'到'礼法结合'（汉代春秋决狱 → 唐代'德主刑辅' → 宋代'礼法合一'）。"]
      } }),
      concept("春秋决狱", { type: "history", importance: 72, content: {
        practicePoints: ["汉代董仲舒倡导以《春秋》经义决狱；'论心定罪'原则：'志善而违于法者，免；志恶而合于法者，诛'。"]
      } }),
      concept("中华法系", { type: "theory", importance: 86, content: {
        practicePoints: ["中华法系是中华传统法律文化的体系化表达，对日本（明治前）、朝鲜（李朝）、越南（阮朝）有深远影响。"]
      } }),
      concept("中华民国六法全书", { type: "history", importance: 80, content: {
        practicePoints: ["南京国民政府 1927-1949 年逐步编纂完成；以大陆法系（德、日）为蓝本。1949 年后中国大陆废除，旧法统在台湾延续。"]
      } }),
      // ===== 中国法制史深化（按张晋藩《中国法制史》分章） =====
      concept("夏商法制", { type: "history", importance: 70, content: {
        practicePoints: [
          "夏：'禹刑'传说为中国最早刑典；'夏刑三千条'。",
          "商：'汤刑'；《竹书纪年》《尚书·盘庚》记载商代刑法。",
          "神权法：商代'天讨'、'天罚'思想，司法审判具浓厚宗教色彩。"
        ]
      } }),
      concept("西周法制", { type: "history", importance: 78, content: {
        practicePoints: [
          "'以德配天'、'明德慎罚'思想（周公制礼作乐）。",
          "宗法制度：嫡长子继承制；分封制与宗法制结合。",
          "礼刑关系：'礼'是积极规范，'刑'是消极规范；'出礼入刑'。",
          "吕刑：'五刑之属三千'；'上下比罪'；'刑罚世轻世重'。"
        ]
      } }),
      concept("春秋战国法家", { type: "theory", importance: 80, content: {
        practicePoints: [
          "管仲：'以法治国'最早实践者。",
          "李悝《法经》6 篇：盗/贼/网/捕/杂/具 — 中国第一部比较系统的成文法典（前 5 世纪）。",
          "商鞅、韩非：'法、术、势'结合的法治思想。",
          "秦国：'商鞅变法'→'秦律'— 以法家思想为指导。"
        ],
        historicalEvolution: [
          { year: "前 536", event: "郑子产铸刑书 — 中国第一次公布成文法" },
          { year: "前 513", event: "晋铸刑鼎 — 公布成文法" },
          { year: "前 5 世纪", event: "李悝集诸国刑典作《法经》" }
        ]
      } }),
      concept("秦代法制", { type: "history", importance: 80, content: {
        practicePoints: [
          "1975 年湖北云梦睡虎地秦简：包括《秦律十八种》《法律答问》《封诊式》。",
          "刑罚体系：笞/杖/徒/流/死/肉刑/劳役刑/财产刑；'连坐法'、'什伍编户'。",
          "司法机构：廷尉（中央）、郡守/县令（地方）；'谳狱'、'乞鞫'制度。"
        ]
      } }),
      concept("汉律六十篇", { type: "history", importance: 76, content: {
        practicePoints: [
          "萧何《九章律》（前 196 年）— 在《法经》六篇上加'户/厩/兴'三篇。",
          "叔孙通《傍章律》18 篇（朝贺之礼）。",
          "张汤《越宫律》27 篇（宫廷警卫）。",
          "赵禹《朝律》6 篇（朝见制度）— 合 60 篇。"
        ]
      } }),
      concept("汉代春秋决狱", { type: "history", importance: 76, content: {
        practicePoints: [
          "董仲舒引《春秋》经义决狱；'春秋之听狱也，必本其事而原其志'。",
          "'论心定罪'：原心定罪，志善免、志恶诛。",
          "影响：儒家伦理入律的开端；为'礼法结合'奠基。"
        ]
      } }),
      concept("魏律与晋律", { type: "history", importance: 72, content: {
        practicePoints: [
          "魏律（曹魏《魏律》/《新律》18 篇，前 234 年颁）：'具律'改'刑名'置律首。",
          "晋律（《泰始律》）20 篇，620 条；张斐、杜预为之注。",
          "'准五服以制罪' — 首次以服制为定罪量刑原则。"
        ]
      } }),
      concept("北齐律", { type: "history", importance: 70, content: {
        practicePoints: [
          "北齐《北齐律》12 篇，949 条；首创'重罪十条'（反逆/大逆/叛/降/恶逆/不道/不敬/不孝/不义/内乱）。",
          "'重罪十条'为后世'十恶'所本。",
          "《北齐律》上承魏晋、下启隋唐，是隋唐律的直接母本。"
        ]
      } }),
      concept("开皇律", { type: "history", importance: 74, content: {
        practicePoints: [
          "隋文帝《开皇律》（583 年）12 篇，500 条。",
          "'十恶'正式入律（源于北齐'重罪十条'）。",
          "确立'封建制五刑'：笞/杖/徒/流/死，废除'宫刑'、'枭首'、'轘裂'等酷刑。",
          "影响唐律及东亚法系。"
        ]
      } }),
      concept("唐六典", { type: "history", importance: 76, content: {
        practicePoints: [
          "《唐六典》30 卷，玄宗开元年间（738 年）撰成。",
          "以'官制'为纲，分述中央与地方官职；是中国第一部**行政法典**性质文献。",
          "后世《大明会典》《大清会典》皆承其体例。"
        ]
      } }),
      concept("宋刑统", { type: "history", importance: 76, content: {
        practicePoints: [
          "宋太祖建隆四年（963 年）颁行《宋建隆重详定刑统》。",
          "中国历史上第一部**雕版印行**的法典。",
          "体例：律 + 敕/令/格/式 合编；律后附'敕'以补律之不足。",
          "宋代'编敕'盛行：皇帝敕令成为法律重要渊源。"
        ]
      } }),
      concept("元代法制", { type: "history", importance: 68, content: {
        practicePoints: [
          "《大元通制》（1323 年）— 元英宗颁行；'断例'入律。",
          "《元典章》（《大元圣政国朝典章》）— 地方官府编纂的法规汇编。",
          "民族分治：蒙古人/色目人/汉人/南人刑狱不同；维护蒙古贵族特权。"
        ]
      } }),
      concept("大明会典", { type: "history", importance: 72, content: {
        practicePoints: [
          "明孝宗弘治年间（1503 年）编成；后世多次续修。",
          "以六部为纲：吏/户/礼/兵/刑/工，记载明代职官/制度/事例。",
          "中国行政法典传统的延续（自《唐六典》）。"
        ]
      } }),
      concept("大清会典", { type: "history", importance: 72, content: {
        practicePoints: [
          "康熙/雍正/乾隆/嘉庆/光绪五朝会典合编（1899 年成书）。",
          "事例 922 卷 + 会典 100 卷 = 制度沿革总集。",
          "体例以六部司署为纲，事例为目。"
        ]
      } }),
      concept("秋审制度", { type: "history", importance: 70, content: {
        practicePoints: [
          "清代'秋审'：每年秋八月由九卿、詹事、科道等审核死刑案件。",
          "分为'情实'（执行）/ '缓决'（缓）/ '可矜'（减等）/ '留养承祀'（留养）。",
          "明代'朝审'、清代'秋审'、'热审'构成传统死刑复核制度。"
        ]
      } }),
      concept("领事裁判权", { type: "history", importance: 78, content: {
        practicePoints: [
          "1843 年《中英五口通商章程》— 最早确立英人在华领事裁判权。",
          "1844 年《中美望厦条约》— 美方获得同等权利。",
          "凡在中国享有领事裁判权的国家，其在华侨民涉诉由该国领事按其本国法律审判。",
          "1943 年英美等国相继放弃在华领事裁判权（与重庆国民政府签订新约）。"
        ]
      } }),
      concept("礼法之争", { type: "history", importance: 80, content: {
        practicePoints: [
          "清末修律核心争议：'礼教派'（张之洞、劳乃宣）vs '法理派'（沈家本）。",
          "焦点：无夫奸/子孙违反教令/卑幼对尊长行使正当防卫等。",
          "结果：1910 年《大清新刑律》附'暂行章程'5 条，保留部分礼教条款；'礼法合一'最终退让于'法理'。"
        ]
      } }),
      concept("大理院", { type: "history", importance: 72, content: {
        practicePoints: [
          "1906 年清廷改大理寺为大理院，确立'三级三审'审判制度。",
          "大理院掌理'解释法律'职能 — 中国近代判例制度开端。",
          "民国时期大理院判例（1912-1928）— '大理院解释例'与'判例要旨'汇编。"
        ]
      } }),
      concept("革命根据地法制", { type: "history", importance: 84, content: {
        practicePoints: [
          "1931 年《中华苏维埃共和国宪法大纲》— 第一次由中国共产党领导的工农民主政权宪法性文件。",
          "1934 年《中华苏维埃共和国婚姻法》— 婚姻自由、一夫一妻、男女平等。",
          "1942 年《陕甘宁边区施政纲领》；1946 年《陕甘宁边区宪法原则》。",
          "'马锡五审判方式'— 陕甘宁边区流行的群众路线审判方式。"
        ]
      } }),
      concept("共同纲领", { type: "history", importance: 86, content: {
        practicePoints: [
          "1949 年《中国人民政治协商会议共同纲领》— 临时宪法。",
          "1954 年《中华人民共和国宪法》— 新中国第一部社会主义宪法。",
          "宪法发展：1975 宪法/1978 宪法/1982 宪法（四次全面修订，1982 宪法经 5 次修正）。"
        ]
      } }),
      concept("废除六法全书", { type: "history", importance: 80, content: {
        practicePoints: [
          "1949 年《中国人民政治协商会议共同纲领》第 17 条：'废除国民党反动政府一切压迫人民的法律、法令和司法制度，制定保护人民的法律、法令，建立人民司法制度。'",
          "'六法全书'（宪法/民法/刑法/商法/民诉/刑诉）自 1949 年起在大陆地区停止适用。",
          "旧法人员改造：1949-1952 年司法改革运动。"
        ]
      } }),
      concept("法律儒家化", { type: "theory", importance: 80, content: {
        practicePoints: [
          "瞿同祖《中国法律之儒家化》提出：汉代'春秋决狱'开始，'儒家化'贯穿魏晋隋唐，至宋完成。",
          "核心：'礼'入'法'，'三纲'（君为臣纲/父为子纲/夫为妻纲）成为法律最高原则。",
          "体现：'十恶'重罪、'不孝'、'不睦'等罪名；'亲属相隐'；'七品以上官吏犯罪不'。"
        ]
      } }),
      concept("出礼入刑", { type: "theory", importance: 76, content: {
        practicePoints: [
          "《论语》：'导之以政，齐之以刑，民免而无耻；导之以德，齐之以礼，有耻且格。'",
          "传统中国'礼'与'法'关系：'礼'是积极规范（应当做的），'法'是消极规范（不可做的）。",
          "'出礼'即'入刑'：违反礼的严重行为，按律追究刑事责任。"
        ]
      } }),
      concept("中华法系特点", { type: "theory", importance: 82, content: {
        practicePoints: [
          "法典体系：以刑为主、民刑不分、诸法合体（《唐律疏议》为典型）。",
          "司法行政合一：地方行政长官兼理司法；中央司法由刑部/大理寺/御史台分工。",
          "判例与律并行：律是主体，例/敕/令/格/式是补充。",
          "伦理法：家族主义、等级特权、男女不平等（与西方法系最大差异）。"
        ]
      } }),
      concept("张裴律注", { type: "history", importance: 68, content: {
        practicePoints: [
          "西晋律学家张斐、杜预为《晋律》作注；合称'张杜律'。",
          "张斐《律注表》提出律学'二十二篇'体系；'故'/'失'/'过失'等罪名精细区分。",
          "律学兴盛：'律学'成为独立学问，为唐律'疏议'传统奠基。"
        ]
      } }),
      concept("《法经》", { type: "history", importance: 80, content: {
        practicePoints: [
          "战国初期魏国李悝（前 5 世纪）集诸国刑典编纂。",
          "6 篇：盗法/贼法/网法/捕法/杂法/具法。",
          "'具法'是关于加减刑的规定，相当于近代'总则'。",
          "《法经》→《秦律》→《汉九章律》→《唐律》→《宋刑统》→《大明律》→《大清律例》— 中国成文法典之源。"
        ]
      } }),
      concept("九章律", { type: "history", importance: 72, content: {
        practicePoints: [
          "汉高祖刘邦元年（前 206 年）命丞相萧何制定。",
          "在《法经》六篇基础上加'户'（户籍/赋税）、'兴'（徭役）、'厩'（畜牧）三篇。",
          "汉律之始，影响汉代法制 400 年。"
        ]
      } }),
      concept("魏晋律学", { type: "theory", importance: 68, content: {
        practicePoints: [
          "魏晋时期律学兴盛：以《晋律》注疏为代表。",
          "马融、郑玄等经学家参与律学研究。",
          "'五服'制度入律（'准五服以制罪'），丧服制度法律化。",
          "律学为隋唐律学的直接渊源。"
        ]
      } }),
      concept("明清律学", { type: "theory", importance: 68, content: {
        practicePoints: [
          "明律学家：雷梦麟《读律琐言》、王肯堂《律例笺释》。",
          "清律学家：吴坛《大清律例通考》、沈之奇《大清律辑注》。",
          "律学传统延续至清末修律。"
        ]
      } }),
      concept("沈家本", { type: "history", importance: 84, content: {
        practicePoints: [
          "沈家本（1840-1913），清末修订法律大臣，与伍廷芳共同主持修律。",
          "主持制定《大清新刑律》《大清民律草案》《大清商律草案》《刑事诉讼律草案》《民事诉讼律草案》等。",
          "提出'参考古今、博稽中外'的修律方针；'法者天下之公器'。",
          "著有《沈寄簃先生遗书》（含《历代刑法考》《律令九卷》《汉律摭遗》22 卷等）。"
        ]
      } }),
      concept("中华民国宪法", { type: "history", importance: 78, content: {
        practicePoints: [
          "1912 年《中华民国临时约法》— 中国第一部资产阶级民主共和国性质的宪法性文件。",
          "1923 年《中华民国宪法》（'曹锟宪法'/'贿选宪法'）。",
          "1931 年《中华民国训政时期约法》。",
          "1947 年《中华民国宪法》— 1947 年 12 月 25 日施行；现行台湾地区'宪法'。"
        ]
      } }),
      concept("土地改革法", { type: "history", importance: 76, content: {
        practicePoints: [
          "1950 年《中华人民共和国土地改革法》— 彻底废除封建土地所有制。",
          "原则：依靠贫农雇农、团结中农、中立富农、有步骤有分别地消灭封建剥削制度。",
          "1952 年底基本完成；3 亿多无地少地农民分到约 7 亿亩土地。"
        ]
      } }),
      concept("婚姻法运动", { type: "history", importance: 74, content: {
        practicePoints: [
          "1950 年《中华人民共和国婚姻法》— 新中国第一部法律（早于 1954 宪法）。",
          "原则：婚姻自由/一夫一妻/男女平等/保护妇女和儿童合法权益。",
          "1953 年开展贯彻婚姻法运动月；彻底摧毁封建婚姻制度。",
          "1980 年/2001 年两次修订。"
        ]
      } }),
      concept("镇压反革命运动", { type: "history", importance: 68, content: {
        practicePoints: [
          "1950-1953 年'镇反运动'— 依据《惩治反革命条例》（1951 年）。",
          "打击对象：土匪/特务/恶霸/会道门头子/反动党团骨干。",
          "通过群众运动方式；'镇压与宽大相结合'政策。"
        ]
      } }),
    ]
  }
];

const universeSystem: LegalUniverseSystem = {
  id: "universe",
  title: "中国法学体系",
  domain: "universe",
  colorKey: "universe",
  systemPosition: [0, 0, 0],
  systemRadius: 5.2,
  systemInclination: 0,
  shortDescription: "多个法学大领域太阳系共同构成的中国法学体系宇宙。",
  sourceRefs: ["flk-categories", "npc-legal-system-seven", "chsi-law-discipline-scope", "moe-grad-catalog-2022", textbookSource, pendingSource]
};

export const legalUniverseSystems: LegalUniverseSystem[] = [
  universeSystem,
  ...systemSeeds.map(({ concepts: _concepts, ...system }) => system)
];

const universeCore: LegalUniverseNode = {
  id: "universe-core",
  title: "中国法学体系",
  type: "universe-core",
  domain: "universe",
  systemId: "universe",
  cluster: "overview",
  level: 0,
  importance: 100,
  size: 1.05,
  colorKey: "universe",
  shortDescription: "中国法学体系宇宙的总览核心，负责把部门法、理论法学和法律史组织成多中心星系。",
  relationToSystem: "宇宙总览 / 学科入口",
  momentCopy: "从这里拉远看，是法学体系；推近看，每个法域都有自己的制度引力。",
  comments: commentsByType["universe-core"],
  sourceRefs: ["flk-categories", "npc-legal-system-seven", "chsi-law-discipline-scope", "moe-grad-catalog-2022", textbookSource, pendingSource],
  tags: ["宇宙核心", "总览"]
};

function getNodeTypeFallback(system: SystemSeed): LegalUniverseNodeType {
  if (system.domain === "civil") {
    return "code";
  }
  if (system.domain === "legal-history") {
    return "history";
  }
  if (system.domain === "procedure") {
    return "procedure";
  }
  if (system.domain === "jurisprudence") {
    return "theory";
  }
  return "concept";
}

function getLevel(index: number): 1 | 2 | 3 {
  if (index < 5) {
    return 1;
  }
  if (index < 11) {
    return 2;
  }
  return 3;
}

function getSize(importance: number, type: LegalUniverseNodeType): number {
  const base = type === "code" || type === "law" || type === "institution" ? 0.18 : 0.14;
  return Number((base + Math.max(0, importance - 70) * 0.004).toFixed(3));
}

function makeSystemSun(system: SystemSeed): LegalUniverseNode {
  return {
    id: system.id,
    title: system.title,
    type: "system-sun",
    domain: system.domain,
    systemId: system.id,
    cluster: system.domain,
    level: 0,
    importance: 96,
    size: 0.48,
    colorKey: system.colorKey,
    shortDescription: system.shortDescription,
    relationToSystem: "大法域太阳 / 多中心星系节点",
    momentCopy: `${system.title}太阳系亮起时，只显示关键概念和跨域光桥。`,
    comments: commentsByType["system-sun"],
    sourceRefs: system.sourceRefs,
    tags: ["太阳系", system.title]
  };
}

function makeConceptNode(system: SystemSeed, seed: ConceptSeed, index: number): LegalUniverseNode {
  const type = seed.type ?? getNodeTypeFallback(system);
  const importance = seed.importance ?? Math.max(68, 90 - index * 2);
  const sourceRefs = seed.sourceRefs ?? system.sourceRefs;

  return {
    id: seed.id ?? `${system.id.replace("system-", "")}-${String(index + 1).padStart(2, "0")}`,
    title: seed.title,
    type,
    domain: system.domain,
    systemId: system.id,
    parentId: system.id,
    cluster: seed.cluster ?? system.domain,
    level: seed.level ?? getLevel(index),
    importance,
    size: seed.size ?? getSize(importance, type),
    colorKey: system.colorKey,
    shortDescription:
      seed.description ?? `${seed.title}是${system.title}太阳系中的核心${type === "procedure" ? "程序" : "概念"}节点，用于呈现制度位置而非展开百科说明。`,
    relationToSystem: seed.relation ?? `属于${system.title}太阳系的核心结构。`,
    momentCopy: `${seed.title}沿着${system.title}的轨道亮起，提示它在体系中的位置。`,
    comments: commentsByType[type],
    sourceRefs,
    tags: seed.tags ?? [system.title, type],
    content: seed.content
  };
}

export const legalUniverseNodes: LegalUniverseNode[] = [
  universeCore,
  ...systemSeeds.flatMap((system) => [
    makeSystemSun(system),
    ...system.concepts.map((seed, index) => makeConceptNode(system, seed, index))
  ])
];

// The bundled graph is static; shared lookups avoid scanning every node per edge.
const legalUniverseNodeIndex = new Map(legalUniverseNodes.map((node) => [node.id, node]));
const nodeTitleCollator = new Intl.Collator("zh-Hans-CN");
const rankedSystemNodes = legalUniverseNodes
  .filter((node) => node.type === "system-sun")
  .sort((a, b) => b.importance - a.importance || nodeTitleCollator.compare(a.title, b.title));

function edge(
  source: string,
  target: string,
  type: LegalUniverseEdgeType,
  label: string,
  description: string,
  options: Partial<Pick<LegalUniverseEdge, "weight" | "domain" | "colorKey" | "evidenceLevel" | "sourceRefs">> = {}
): LegalUniverseEdge {
  const sourceNode = legalUniverseNodes.find((node) => node.id === source);
  const targetNode = legalUniverseNodes.find((node) => node.id === target);
  const domain = options.domain ?? sourceNode?.domain ?? "universe";
  const colorKey = options.colorKey ?? sourceNode?.colorKey ?? "universe";
  const sourceRefs = options.sourceRefs ?? Array.from(new Set([...(sourceNode?.sourceRefs ?? []), ...(targetNode?.sourceRefs ?? []), pendingSource]));

  return {
    source,
    target,
    type,
    weight: options.weight ?? 72,
    domain,
    colorKey,
    label,
    description,
    evidenceLevel: options.evidenceLevel ?? "体系归纳，待人工校对",
    sourceRefs
  };
}

const systemEdges: LegalUniverseEdge[] = systemSeeds.map((system) =>
  edge("universe-core", system.id, "belongs-to", "大法域", `${system.title}是中国法学体系宇宙中的一个大领域太阳系。`, {
    weight: 86,
    domain: system.domain,
    colorKey: system.colorKey,
    evidenceLevel: "学科体系归纳，待人工校对"
  })
);

const conceptEdges: LegalUniverseEdge[] = legalUniverseNodes
  .filter((node) => node.parentId)
  .map((node) =>
    edge(node.parentId!, node.id, node.type === "procedure" ? "procedural-remedy" : "concept-of", "内部轨道", `${node.title}围绕${getLegalUniverseNodeById(node.parentId!)?.title}运行。`, {
      weight: node.importance,
      domain: node.domain,
      colorKey: node.colorKey,
      evidenceLevel: node.sourceRefs.includes(textbookSource) ? "教材体系归纳，待人工校对" : "法律文本结构归纳，待人工校对"
    })
  );

const crossEdges: LegalUniverseEdge[] = [
  edge("system-constitution", "system-administrative", "cross-domain", "权力控制", "宪法确认国家权力结构，行政法细化行政权运行与监督。", { weight: 92, colorKey: "constitution" }),
  edge("system-constitution", "system-social", "cross-domain", "基本权利", "社会法回应劳动、保障和弱势群体保护等基本权利议题。", { weight: 78, colorKey: "constitution" }),
  edge("system-constitution", "system-criminal", "limits", "权利边界", "刑罚权运行需要受到宪法原则和基本权利约束。", { weight: 75, colorKey: "constitution" }),
  edge("system-criminal", "system-civil", "cross-domain", "人身与财产保护", "刑法和民法都保护人身、财产与人格利益，只是责任方式和程序路径不同。", { weight: 79, colorKey: "criminal" }),
  edge("system-civil", "system-commercial", "cross-domain", "交易组织", "商事组织和交易规则与民法典合同、物权、责任结构相互连接。", { weight: 90, colorKey: "civil" }),
  edge("system-civil", "system-procedure", "procedural-remedy", "民事救济", "民事权利需要通过诉讼、执行、仲裁等程序实现。", { weight: 86, colorKey: "procedure" }),
  edge("system-criminal", "system-procedure", "procedural-remedy", "犯罪追诉", "刑法定义犯罪和刑罚，刑事诉讼法提供追诉与程序保障。", { weight: 94, colorKey: "criminal" }),
  edge("criminal-justifiable-defense", "system-procedure", "procedural-remedy", "事实认定", "正当防卫进入案件后，需要通过证据、侦查、起诉和审判程序被判断。", { weight: 88, colorKey: "criminal" }),
  edge("criminal-justifiable-defense", "civil-tort-liability", "cross-domain", "责任边界", "正当防卫同时影响刑事责任与民事责任边界。", { weight: 75, colorKey: "criminal" }),
  edge("system-economic", "system-commercial", "cross-domain", "市场秩序", "经济法监管市场秩序，商法组织市场主体和资本流转。", { weight: 88, colorKey: "economic" }),
  edge("system-economic", "system-administrative", "supports", "监管执行", "市场监管、行政处罚和行政许可依赖行政法执行结构。", { weight: 80, colorKey: "economic" }),
  edge("system-economic", "system-social", "cross-domain", "公共利益", "消费者、劳动者、弱势群体和安全生产共同体现公共利益保护。", { weight: 76, colorKey: "social" }),
  edge("system-international", "system-civil", "cross-domain", "涉外民事", "涉外民事关系法律适用把民法规则带入跨境场景。", { weight: 82, colorKey: "international" }),
  edge("system-international", "system-commercial", "cross-domain", "跨境交易", "国际贸易、投资与商事交易规则相互连接。", { weight: 82, colorKey: "international" }),
  edge("system-legal-history", "system-civil", "historical-influence", "法典传统", "中国法律史为法典化传统提供远轨背景。", { weight: 72, colorKey: "legal-history" }),
  edge("system-legal-history", "system-criminal", "historical-influence", "刑制演化", "刑法制度可以放回传统刑制与近代转型中观察。", { weight: 68, colorKey: "legal-history" }),
  edge("system-legal-history", "system-constitution", "historical-influence", "国家制度演化", "宪法制度可以放回近代法制转型和国家建构历史中观察。", { weight: 70, colorKey: "legal-history" }),
  edge("system-jurisprudence", "system-constitution", "theoretical-foundation", "法治原则", "法理学提供宪法秩序和部门法解释的共同语言。", { weight: 80, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-administrative", "theoretical-foundation", "依法行政", "法律规范、法律解释和权力约束理论支撑行政法结构。", { weight: 78, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-civil", "theoretical-foundation", "权利义务", "权利、义务、法律关系和责任理论支撑民法典的基本结构。", { weight: 82, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-commercial", "theoretical-foundation", "交易秩序", "法律行为、责任和法律体系方法为商法组织与交易规则提供解释框架。", { weight: 72, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-criminal", "theoretical-foundation", "责任理论", "法律责任、规范结构和解释方法支撑刑法判断。", { weight: 76, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-procedure", "theoretical-foundation", "程序正义", "程序法依赖正当程序、证明和司法权运行的理论框架。", { weight: 76, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-economic", "theoretical-foundation", "公共利益", "法律体系与法治原则为市场规制和宏观调控划定基本方法。", { weight: 71, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-social", "theoretical-foundation", "权利保障", "权利义务和法律责任框架支撑劳动、保障和弱势群体保护。", { weight: 70, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-international", "theoretical-foundation", "法源结构", "法律渊源和法律体系理论帮助理解条约、涉外法和国际规则。", { weight: 69, colorKey: "jurisprudence" }),
  edge("system-jurisprudence", "system-legal-history", "theoretical-foundation", "制度解释", "法律史为法理概念提供制度演化和语境背景。", { weight: 68, colorKey: "jurisprudence" }),
  edge("administrative-06", "procedure-03", "procedural-remedy", "行政争议", "行政复议和行政诉讼共同构成行政争议解决路径。", { weight: 82, colorKey: "administrative" }),
  edge("civil-contract-book", "civil-contract-formation", "concept-of", "合同订立", "民法典合同编内部展开合同订立规则。", { weight: 86, colorKey: "civil", evidenceLevel: "法律文本结构归纳，待人工校对" }),
  edge("civil-property-book", "civil-ownership", "concept-of", "所有权", "民法典物权编内部展开财产归属制度。", { weight: 84, colorKey: "property", evidenceLevel: "法律文本结构归纳，待人工校对" }),
  edge("civil-personality-book", "civil-personal-info", "concept-of", "个人信息", "人格权编与个人信息保护、数据安全议题相连。", { weight: 84, colorKey: "personality" }),
  edge("commercial-01", "civil-breach-liability", "cross-domain", "违约与治理", "公司交易和治理风险常以合同责任、忠实勤勉义务等方式呈现。", { weight: 74, colorKey: "commercial" }),
  edge("economic-03", "civil-breach-liability", "cross-domain", "消费交易", "消费者权益保护与合同责任、违约责任形成交叉。", { weight: 78, colorKey: "economic" }),
  edge("social-02", "civil-contract-formation", "cross-domain", "劳动合同", "劳动合同具有合同结构，但受到社会法保护逻辑约束。", { weight: 80, colorKey: "social" }),
  edge("international-07", "system-civil", "cross-domain", "法律适用", "涉外民事关系法律适用连接国际私法与民事规则。", { weight: 80, colorKey: "international" }),
  edge("legal-history-10", "system-civil", "historical-influence", "法典化", "法典化传统是理解民法典呈现方式的历史背景。", { weight: 70, colorKey: "legal-history" })
];

// Intra-system edges: connect concepts inside the same legal system.
// Built dynamically from node IDs that are actually present in the data.
function buildIntraSystemEdges(): LegalUniverseEdge[] {
  const edges: LegalUniverseEdge[] = [];

  const pairs: Array<[string, string, string, string, number]> = [
    // civil
    ["civil-general-book", "civil-subject", "民法典总则", "总则编展开民事主体制度", 92],
    ["civil-general-book", "civil-juristic-act", "民法典总则", "总则编展开法律行为制度", 92],
    ["civil-general-book", "civil-agency", "民法典总则", "总则编规定代理制度", 86],
    ["civil-general-book", "civil-civil-liability", "民法典总则", "总则编规定民事责任", 90],
    ["civil-general-book", "civil-limitation", "民法典总则", "总则编规定诉讼时效", 86],
    ["civil-property-book", "civil-ownership", "民法典物权", "物权编展开所有权", 92],
    ["civil-property-book", "civil-usufruct", "民法典物权", "物权编展开用益物权", 88],
    ["civil-property-book", "civil-security-interest", "民法典物权", "物权编展开担保物权", 90],
    ["civil-property-book", "civil-real-estate-registration", "民法典物权", "物权编规范登记制度", 86],
    ["civil-contract-book", "civil-contract-formation", "民法典合同", "合同编展开合同订立", 90],
    ["civil-contract-book", "civil-contract-validity", "民法典合同", "合同编展开合同效力", 90],
    ["civil-contract-book", "civil-contract-performance", "民法典合同", "合同编展开合同履行", 88],
    ["civil-contract-book", "civil-contract-termination", "民法典合同", "合同编展开合同解除", 84],
    ["civil-contract-book", "civil-breach-liability", "民法典合同", "合同编展开违约责任", 92],
    ["civil-contract-book", "civil-sale-contract", "民法典合同", "合同编典型合同分则", 90],
    ["civil-contract-book", "civil-loan-contract", "民法典合同", "合同编典型合同分则", 88],
    ["civil-contract-book", "civil-guarantee-contract", "民法典合同", "合同编典型合同分则", 86],
    ["civil-personality-book", "civil-life-right", "民法典人格权", "人格权编展开", 86],
    ["civil-personality-book", "civil-privacy", "民法典人格权", "人格权编展开", 90],
    ["civil-personality-book", "civil-personal-info", "民法典人格权", "人格权编展开", 92],
    ["civil-personality-book", "civil-portrait-right", "民法典人格权", "人格权编展开", 80],
    ["civil-personality-book", "civil-reputation-right", "民法典人格权", "人格权编展开", 82],
    ["civil-marriage-family", "civil-marriage-formation", "民法典婚姻家庭", "婚姻家庭编展开", 78],
    ["civil-marriage-family", "civil-divorce", "民法典婚姻家庭", "婚姻家庭编展开", 80],
    ["civil-inheritance", "civil-intestate-succession", "民法典继承", "继承编展开", 76],
    ["civil-inheritance", "civil-testamentary-succession", "民法典继承", "继承编展开", 75],
    ["civil-tort-liability", "civil-product-liability", "民法典侵权", "侵权责任编展开", 86],
    ["civil-tort-liability", "civil-medical-liability", "民法典侵权", "侵权责任编展开", 82],
    ["civil-tort-liability", "civil-environmental-liability", "民法典侵权", "侵权责任编展开", 78],
    ["civil-tort-liability", "civil-high-risk-liability", "民法典侵权", "侵权责任编展开", 76],
    ["civil-tort-liability", "civil-animal-liability", "民法典侵权", "侵权责任编展开", 72],
    ["civil-tort-liability", "civil-online-tort", "民法典侵权", "侵权责任编展开", 80],
    ["civil-tort-liability", "civil-building-collapse", "民法典侵权", "侵权责任编展开", 70],
    ["civil-tort-liability", "civil-good-samaritan", "民法典侵权", "侵权责任编展开", 68],
    ["civil-tort-liability", "civil-safety-obligation", "民法典侵权", "侵权责任编展开", 78],
    // criminal
    ["criminal-bribery", "criminal-embezzlement", "贪污贿赂罪", "受贿罪与贪污罪同属贪污贿赂罪章节", 86],
    ["criminal-murder", "criminal-intentional-injury", "侵犯人身罪", "同属侵犯公民人身权利罪", 84],
    ["criminal-theft", "criminal-fraud", "侵犯财产罪", "同属侵犯财产罪章节", 86],
    ["criminal-theft", "criminal-robbery", "侵犯财产罪", "同属侵犯财产罪章节", 80],
    ["criminal-traffic-fatal", "criminal-dangerous-driving", "危害公共安全罪", "同属危害公共安全罪章节", 78],
    // civil internal
    ["civil-ownership", "civil-usufruct", "物权内部", "用益物权是所有权能的展开", 84],
    ["civil-ownership", "civil-security-interest", "物权内部", "担保物权是所有权能的展开", 86],
    ["civil-portrait-right", "civil-privacy", "人格权内部", "肖像权与隐私权同属个人信息与人格权", 78],
    ["civil-privacy", "civil-personal-info", "人格权内部", "隐私与个人信息构成交叉保护", 86],
    ["civil-life-right", "civil-portrait-right", "人格权内部", "生命权与肖像权同属具体人格权", 74],
    ["civil-reputation-right", "civil-portrait-right", "人格权内部", "名誉权与肖像权同属具体人格权", 76],
    ["civil-marriage-formation", "civil-divorce", "婚姻家庭", "结婚与离婚同属婚姻家庭制度", 82],
    ["civil-intestate-succession", "civil-testamentary-succession", "继承方式", "法定继承与遗嘱继承同属继承制度", 82],
    // criminal -> civil
    ["criminal-18", "civil-life-right", "刑民交叉", "故意伤害罪侵害生命权、身体权、健康权", 86],
    ["criminal-murder", "civil-life-right", "刑民交叉", "故意杀人罪侵害生命权", 90],
    // social law internal
    ["labor-law-overview", "labor-relationship", "劳动法总论", "展开劳动关系的认定要素", 88],
    ["labor-law-overview", "labor-dispute", "劳动法总论", "展开劳动争议的处理程序", 86],
    ["labor-law-overview", "labor-contract-formation", "劳动法总论", "展开劳动合同的订立规则", 86],
    ["labor-law-overview", "open-term-contract", "劳动法总论", "展开无固定期限合同的订立", 84],
    ["labor-law-overview", "working-hours", "劳动法总论", "展开工时制度与休息休假", 84],
    ["labor-law-overview", "wages", "劳动法总论", "展开工资支付制度", 82],
    ["labor-law-overview", "labor-contract-termination", "劳动法总论", "展开劳动合同的解除", 86],
    ["labor-law-overview", "severance", "劳动法总论", "展开经济补偿的法定标准", 84],
    ["labor-relationship", "labor-contract-formation", "劳动关系", "劳动关系建立需签订劳动合同", 88],
    ["labor-relationship", "wages", "劳动关系", "劳动关系中工资是核心权利义务", 84],
    ["labor-relationship", "labor-dispute", "劳动关系", "劳动关系争议是劳动争议主要类型", 86],
    ["labor-contract-formation", "open-term-contract", "劳动合同订立", "无固定期限是合同期限类型之一", 88],
    ["labor-contract-formation", "working-hours", "劳动合同订立", "合同应约定工时与休息休假", 82],
    ["labor-contract-formation", "wages", "劳动合同订立", "合同应约定劳动报酬条款", 84],
    ["labor-contract-formation", "labor-contract-termination", "劳动合同订立", "合同订立与解除/终止相对应", 84],
    ["labor-contract-termination", "severance", "劳动合同解除", "合法解除需支付经济补偿", 90],
    ["labor-contract-termination", "work-injury-determination", "劳动合同解除", "工伤情形影响合同解除合法性", 78],
    ["severance", "wages", "经济补偿", "经济补偿按月工资标准计算", 86],
    ["working-hours", "wages", "工时工资", "加班工时决定加班工资", 88],
    ["working-hours", "labor-contract-termination", "工时", "严重违反工时制度可解除合同", 80],
    ["work-injury-determination", "work-injury-insurance", "工伤", "认定结果决定工伤保险待遇", 90],
    ["work-injury-insurance", "severance", "工伤保险", "1-4 级伤残解除合同按伤残津贴", 78],
    ["social-insurance-law", "pension", "社会保险法", "展开基本养老保险制度", 88],
    ["social-insurance-law", "medical-insurance", "社会保险法", "展开基本医疗保险制度", 86],
    ["social-insurance-law", "unemployment-insurance", "社会保险法", "展开失业保险制度", 84],
    ["social-insurance-law", "work-injury-insurance", "社会保险法", "展开工伤保险制度", 86],
    ["social-insurance-law", "maternity-insurance", "社会保险法", "展开生育保险制度", 80],
    ["pension", "medical-insurance", "社会保险待遇", "养老与医疗同属社保核心险种", 82],
    ["medical-insurance", "work-injury-insurance", "社保待遇", "医疗与工伤保险待遇有交叉", 80],
    ["unemployment-insurance", "wages", "失业保险", "失业保险金以工资为基础", 80],
    ["maternity-insurance", "wages", "生育保险", "生育津贴以工资为计算基础", 80],
    ["labor-safety", "work-injury-determination", "劳动安全", "工伤认定源于劳动安全事故", 84],
    ["occupational-disease", "work-injury-determination", "职业病", "职业病属工伤情形之一", 84],
    ["social-assistance", "labor-relationship", "社会救助", "失业可同时申请社会救助", 74],
    ["minor-protection", "labor-relationship", "未成年人保护", "禁止使用童工(劳动法第 15 条)", 80],
    ["women-rights", "labor-relationship", "妇女权益", "消除就业性别歧视(劳动法第 12 条)", 82],
    ["disabled-rights", "labor-relationship", "残疾人保障", "残疾人按比例就业制度", 80],
    ["elder-rights", "labor-relationship", "老年人权益", "禁止老年人就业歧视", 76],
    ["labor-union", "labor-relationship", "工会", "工会代表劳动者参与劳动法律关系", 80],
    ["community-correction", "criminal-procedure", "社区矫正", "社区矫正由刑事诉讼法规范", 80],
    // international law internal
    ["international-public-law", "state-responsibility", "国际公法", "国家责任是国际公法核心制度", 90],
    ["international-public-law", "diplomacy", "国际公法", "外交关系法属国际公法", 88],
    ["international-public-law", "law-of-the-sea", "国际公法", "海洋法是国际公法分支", 88],
    ["international-public-law", "territorial-law", "国际公法", "领土法是国际公法分支", 86],
    ["international-public-law", "treaty-law", "国际公法", "条约法是国际公法核心", 90],
    ["international-public-law", "international-dispute-settlement", "国际公法", "争端解决是国际公法机制", 88],
    ["international-public-law", "international-human-rights", "国际公法", "国际人权法是国际公法新分支", 86],
    ["international-public-law", "international-criminal-law", "国际公法", "国际刑法是国际公法新分支", 86],
    ["international-public-law", "state-sovereignty", "国际公法", "国家主权是国际公法基础", 92],
    ["international-public-law", "international-organization-law", "国际公法", "国际组织法是国际公法新分支", 86],
    ["international-private-law", "conflict-of-laws", "国际私法", "冲突法是国际私法核心", 90],
    ["international-private-law", "proper-law", "国际私法", "准据法是国际私法核心概念", 88],
    ["international-private-law", "party-autonomy", "国际私法", "意思自治是国际私法基本原则", 88],
    ["international-private-law", "closest-connection", "国际私法", "最密切联系是国际私法补充原则", 86],
    ["international-private-law", "foreign-marriage-family", "国际私法", "涉外婚姻家庭适用国际私法", 82],
    ["international-private-law", "foreign-inheritance", "国际私法", "涉外继承适用国际私法", 82],
    ["international-private-law", "international-civil-procedure", "国际私法", "国际民诉是国际私法分支", 84],
    ["international-private-law", "international-arbitration", "国际私法", "国际仲裁是国际私法分支", 84],
    ["international-economic-law", "wto-system", "国际经济法", "WTO 是国际经济法核心", 90],
    ["international-economic-law", "gatt-1994", "国际经济法", "GATT 1994 是国际经济法基础", 88],
    ["international-economic-law", "international-investment-law", "国际经济法", "国际投资法是国际经济法分支", 88],
    ["international-economic-law", "international-sale-of-goods", "国际经济法", "国际货物买卖是国际经济法分支", 86],
    ["international-economic-law", "international-ip", "国际经济法", "国际知识产权是国际经济法分支", 84],
    ["international-economic-law", "international-tax", "国际经济法", "国际税法是国际经济法分支", 80],
    ["international-economic-law", "international-finance", "国际经济法", "国际金融法是国际经济法分支", 82],
    ["state-sovereignty", "territorial-law", "国家主权", "领土主权是国家主权的重要方面", 88],
    ["state-sovereignty", "law-of-the-sea", "国家主权", "海域划界涉及国家主权", 84],
    ["state-sovereignty", "diplomacy", "国家主权", "外交豁免源于主权平等", 86],
    ["state-sovereignty", "state-recognition", "国家主权", "承认新国家即承认其主权", 86],
    ["treaty-law", "state-responsibility", "条约法", "违反条约义务触发国家责任", 86],
    ["treaty-law", "diplomacy", "条约法", "外交谈判是缔结条约的程序", 84],
    ["international-dispute-settlement", "state-responsibility", "争端解决", "违反义务导致争端,需通过争端解决机制救济", 84],
    ["international-dispute-settlement", "diplomacy", "争端解决", "协商/斡旋是政治性争端解决方法", 82],
    ["international-human-rights", "state-responsibility", "国际人权法", "国家侵害人权触发国际责任", 84],
    ["international-criminal-law", "international-human-rights", "国际刑法", "严重侵犯人权是国际罪行", 86],
    ["international-criminal-law", "state-responsibility", "国际刑法", "国家可承担国际刑事责任", 80],
    ["law-of-the-sea", "territorial-law", "海洋法", "领海是国家领土组成部分", 86],
    ["law-of-the-sea", "state-sovereignty", "海洋法", "专属经济区是国家主权权利", 84],
    ["diplomacy", "state-recognition", "外交关系", "建立外交关系是承认的体现", 86],
    ["government-recognition", "state-recognition", "承认", "政府承认与国家承认相互联系", 80],
    ["succession-international-law", "state-recognition", "国家继承", "国家继承发生在国家承认后", 80],
    ["international-organization-law", "diplomacy", "国际组织", "国际组织是外交多边化产物", 84],
    ["international-organization-law", "regional-international-law", "国际组织", "区域性组织是国际组织类型", 84],
    ["international-humanitarian-law", "international-criminal-law", "国际人道法", "严重违反人道法构成战争罪", 86],
    ["international-humanitarian-law", "international-human-rights", "国际人道法", "武装冲突中保护平民与人权法交叉", 84],
    ["anti-terrorism-law", "international-human-rights", "反恐怖主义", "反恐应尊重人权", 80],
    ["anti-terrorism-law", "international-criminal-law", "反恐怖主义", "恐怖主义是国际罪行类型", 82],
    ["extradition", "international-criminal-law", "引渡", "引渡是国际刑事司法合作", 86],
    ["extradition", "diplomacy", "引渡", "引渡条约属外交/司法合作", 82],
    ["party-autonomy", "closest-connection", "意思自治", "未选择时适用最密切联系", 90],
    ["proper-law", "closest-connection", "准据法", "最密切联系是确定准据法的方法", 88],
    ["conflict-of-laws", "party-autonomy", "冲突法", "意思自治是冲突法原则", 86],
    ["conflict-of-laws", "proper-law", "冲突法", "准据法是冲突法选择结果", 88],
    ["foreign-civil-procedure", "international-arbitration", "国际民诉", "仲裁裁决需经法院承认与执行", 84],
    ["foreign-civil-procedure", "international-dispute-settlement", "国际民诉", "国际民诉是国际私法争端解决方式", 80],
    ["international-arbitration", "international-dispute-settlement", "国际仲裁", "国际仲裁是国际争端解决方法", 84],
    ["international-mediation", "international-arbitration", "国际调解", "调解与仲裁是争议解决双轨", 80],
    ["wto-system", "gatt-1994", "WTO", "GATT 1994 是 WTO 货物贸易框架", 90],
    ["wto-system", "international-investment-law", "WTO", "TRIMS 协议规范投资", 84],
    ["wto-system", "international-ip", "WTO", "TRIPS 是 WTO 一揽子协定", 86],
    ["international-sale-of-goods", "gatt-1994", "国际货物买卖", "GATT 不规范具体买卖合同", 78],
    ["international-sale-of-goods", "international-transport", "国际货物买卖", "货物运输是买卖合同履行方式", 80],
    ["international-ip", "wto-system", "国际知识产权", "TRIPS 属 WTO 框架", 86],
    ["international-ip", "international-sale-of-goods", "国际知识产权", "技术转让是国际货物买卖特殊类型", 76],
    ["international-tax", "international-investment-law", "国际税法", "税收协定影响投资决策", 80],
    ["international-finance", "international-economic-law-overview", "国际金融", "国际金融是国际经济法核心分支", 80],
    // legal history internal
    ["xia-shang-law", "tang-law-interpretation", "夏商", "中华法系源远流长", 76],
    ["xia-shang-law", "western-zhou-law", "夏商", "西周承接夏商礼法", 80],
    ["western-zhou-law", "ritual-law-relation", "西周", "西周奠定礼法结合基础", 86],
    ["western-zhou-law", "spring-autumn-warring-states-legalists", "西周", "春秋战国百家争鸣", 78],
    ["spring-autumn-warring-states-legalists", "fa-jing", "法家", "《法经》是法家集大成作", 88],
    ["spring-autumn-warring-states-legalists", "qin-law", "法家", "秦律是法家实践成果", 86],
    ["fa-jing", "han-jiu-zhang", "《法经》", "《法经》→《九章律》一脉相承", 90],
    ["qin-law", "han-jiu-zhang", "秦律", "汉承秦制,萧何作《九章律》", 88],
    ["han-jiu-zhang", "chun-qiu-trial", "汉律", "春秋决狱开启礼法结合", 84],
    ["chun-qiu-trial", "tang-law-interpretation", "春秋决狱", "唐律'德主刑辅'延续此传统", 80],
    ["wei-jin-law", "northern-qi-law", "魏晋", "北齐律上承魏晋,下启隋唐", 80],
    ["northern-qi-law", "sui-kaihuang-law", "北齐律", "'重罪十条'为开皇律'十恶'所本", 88],
    ["sui-kaihuang-law", "tang-law-interpretation", "开皇律", "唐律直接承袭开皇律", 90],
    ["tang-liushu", "tang-law-interpretation", "唐六典", "《唐律》+'唐六典'=唐代法制", 84],
    ["tang-law-interpretation", "song-xingtong", "唐律", "宋刑统承袭唐律", 88],
    ["song-xingtong", "yuan-law", "宋刑统", "元代法典受宋影响", 80],
    ["yuan-law", "ming-huidian", "元代", "明代会典承元制", 76],
    ["ming-huidian", "qing-huidian", "明会典", "清会典承明会典体例", 88],
    ["qing-huidian", "qing-autumn-review", "清会典", "秋审制度在清会典规范下", 78],
    ["da-ming-lu", "da-qing-lu", "大明律", "大清律以大明律为蓝本", 90],
    ["da-qing-lu", "late-qing-revision", "大清律", "清末修律对大清律全面改造", 88],
    ["late-qing-revision", "extraterritoriality", "清末修律", "领事裁判权是清末修律背景", 84],
    ["late-qing-revision", "ritual-law-debate", "清末修律", "清末修律核心争议是礼法之争", 88],
    ["late-qing-revision", "da-li-yuan", "清末修律", "大理院设立是清末修律成果", 82],
    ["late-qing-revision", "shen-jiaben", "清末修律", "沈家本是清末修律主持者", 90],
    ["shen-jiaben", "modern-legal-transition", "沈家本", "沈家本推动近代法制转型", 88],
    ["modern-legal-transition", "roc-six-codes", "近代法制转型", "六法全书是近代转型成果", 88],
    ["modern-legal-transition", "roc-constitution", "近代法制转型", "民国宪法是转型重要部分", 84],
    ["roc-six-codes", "roc-constitution", "六法全书", "六法包括宪法、民法、刑法等", 86],
    ["roc-six-codes", "abolish-six-codes", "六法全书", "1949 年废除六法全书", 84],
    ["abolish-six-codes", "common-program", "废除六法", "共同纲领第 17 条宣布废除六法全书", 88],
    ["abolish-six-codes", "revolutionary-base-law", "废除六法", "革命根据地法制取代六法全书", 84],
    ["revolutionary-base-law", "common-program", "根据地", "共同纲领延续根据地传统", 86],
    ["common-program", "land-reform-law", "共同纲领", "《土地改革法》是共同纲领原则的实践", 84],
    ["common-program", "marriage-law-history", "共同纲领", "1950《婚姻法》是共同纲领原则的实践", 84],
    ["common-program", "anti-counter-revolutionary", "共同纲领", "镇压反革命运动依《惩治反革命条例》", 80],
    ["legal-confucianization", "ritual-law-relation", "法律儒家化", "礼法结合是儒家化核心", 88],
    ["legal-confucianization", "chun-qiu-trial", "法律儒家化", "春秋决狱是儒家化开端", 88],
    ["legal-confucianization", "chinese-law-tradition-characteristics", "法律儒家化", "中华法系特点含儒家化", 86],
    ["ritual-outside-criminal", "chinese-law-tradition-characteristics", "出礼入刑", "出礼入刑是中华法系特点", 86],
    ["fa-jing", "legal-codification-tradition", "《法经》", "《法经》是法典化传统开端", 86],
    ["han-jiu-zhang", "legal-codification-tradition", "九章律", "法典化传统沿至《九章律》", 84],
    ["tang-law-interpretation", "legal-codification-tradition", "唐律", "唐律是法典化传统巅峰", 92],
    ["da-ming-lu", "legal-codification-tradition", "大明律", "大明律延续法典化传统", 88],
    ["da-qing-lu", "legal-codification-tradition", "大清律", "大清律是中国传统法典终结", 90],
    ["chinese-law-tradition-characteristics", "chinese-law-system", "中华法系特点", "特点集中体现于中华法系", 90],
    ["chinese-law-tradition-characteristics", "ritual-law-relation", "中华法系特点", "礼法结合是核心特点", 88],
    ["chinese-law-system", "chinese-law-tradition-characteristics", "中华法系", "中华法系特点定义其内涵", 88],
    ["wei-jin-legal-studies", "tang-law-interpretation", "魏晋律学", "唐律疏议承魏晋律学", 80],
    ["ming-qing-legal-studies", "late-qing-revision", "明清律学", "清末修律承袭明清律学", 78],
    ["shen-jiaben", "roc-six-codes", "沈家本", "沈家本主持制定六法体系", 86],

    // social law internal (using actual auto-generated IDs)
    ["labor-law-overview", "social-02", "劳动法总论", "展开劳动合同法总论", 88],
    ["labor-law-overview", "social-04", "劳动法总论", "展开社会保险法总论", 86],
    ["labor-law-overview", "social-06", "劳动法总论", "展开劳动安全卫生总论", 84],
    ["labor-law-overview", "social-13", "劳动法总论", "展开工会制度", 80],
    ["labor-law-overview", "social-08", "劳动法总论", "展开社会救助制度", 78],
    ["labor-relationship", "social-02", "劳动关系", "劳动合同是劳动关系的表现形式", 88],
    ["labor-relationship", "labor-contract-formation", "劳动关系", "劳动关系的建立需订立合同", 88],
    ["labor-relationship", "labor-dispute", "劳动关系", "劳动关系争议是劳动争议主要类型", 86],
    ["labor-relationship", "wages", "劳动关系", "工资是劳动关系核心权利义务", 84],
    ["labor-relationship", "working-hours", "劳动关系", "工时是劳动关系重要内容", 82],
    ["labor-relationship", "social-13", "劳动关系", "工会代表劳动者维护劳动关系", 80],
    ["labor-contract-formation", "open-term-contract", "合同订立", "无固定期限是合同期限类型", 88],
    ["labor-contract-formation", "working-hours", "合同订立", "合同应约定工时与休息休假", 84],
    ["labor-contract-formation", "wages", "合同订立", "合同应约定劳动报酬条款", 84],
    ["labor-contract-formation", "labor-contract-termination", "合同订立", "合同订立与解除/终止相对应", 84],
    ["labor-contract-formation", "social-02", "合同订立", "《劳动合同法》第二章规范合同订立", 88],
    ["open-term-contract", "labor-contract-termination", "无固定期限", "无固定期限合同解除同样适用《劳动合同法》", 84],
    ["open-term-contract", "social-02", "无固定期限", "《劳动合同法》第 14 条规定订立无固定期限", 86],
    ["working-hours", "wages", "工时工资", "加班工时决定加班工资", 88],
    ["working-hours", "labor-contract-termination", "工时", "严重违反工时制度可解除合同", 80],
    ["working-hours", "social-06", "工时", "劳动安全含工时与劳动保护", 80],
    ["wages", "severance", "工资", "经济补偿按月工资标准计算", 86],
    ["wages", "labor-contract-termination", "工资", "拖欠工资可作为解除合同理由", 84],
    ["wages", "social-04", "工资", "工资与社保缴费基数挂钩", 82],
    ["labor-contract-termination", "severance", "合同解除", "合法解除需支付经济补偿", 90],
    ["labor-contract-termination", "work-injury-determination", "合同解除", "工伤情形影响合同解除合法性", 78],
    ["labor-contract-termination", "labor-dispute", "合同解除", "合同解除争议是劳动争议主要类型", 84],
    ["severance", "labor-contract-formation", "经济补偿", "合同订立时考虑经济补偿预期", 80],
    ["severance", "working-hours", "经济补偿", "月工资含加班工资作为补偿基础", 80],
    ["work-injury-determination", "work-injury-insurance", "工伤认定", "认定结果决定工伤保险待遇", 90],
    ["work-injury-determination", "social-07", "工伤认定", "职业病属工伤情形之一", 84],
    ["work-injury-determination", "social-06", "工伤认定", "工伤源于劳动安全事故", 84],
    ["social-25", "pension", "社会保险法", "展开基本养老保险", 88],
    ["social-25", "medical-insurance", "社会保险法", "展开基本医疗保险", 86],
    ["social-25", "unemployment-insurance", "社会保险法", "展开失业保险", 84],
    ["social-25", "work-injury-insurance", "社会保险法", "展开工伤保险", 86],
    ["social-25", "maternity-insurance", "社会保险法", "展开生育保险", 80],
    ["pension", "medical-insurance", "社保待遇", "养老与医疗同属社保核心险种", 82],
    ["medical-insurance", "work-injury-insurance", "社保待遇", "医疗与工伤保险待遇交叉", 80],
    ["unemployment-insurance", "wages", "失业保险", "失业保险金以工资为基础", 80],
    ["maternity-insurance", "wages", "生育保险", "生育津贴以工资为计算基础", 80],
    ["social-31", "wages", "住房公积金", "缴存基数以工资为准", 84],
    ["social-31", "social-04", "住房公积金", "公积金与社保同属'五险一金'", 82],
    ["social-32", "social-06", "劳动安全卫生", "劳动安全与卫生同属安全生产", 86],
    ["social-32", "work-injury-determination", "劳动安全", "工伤认定源于安全事故", 84],
    ["social-33", "work-injury-insurance", "职业病", "职业病属工伤保险范围", 84],
    ["social-34", "social-08", "社会救助", "社会救助是社会保障最后防线", 80],
    ["social-34", "unemployment-insurance", "社会救助", "失业可同时申请社会救助", 74],
    ["social-35", "labor-relationship", "未成年人保护", "禁止使用童工(劳动法第 15 条)", 80],
    ["social-36", "labor-relationship", "妇女权益", "消除就业性别歧视(劳动法第 12 条)", 82],
    ["social-36", "maternity-insurance", "妇女权益", "生育保险保护女职工权益", 80],
    ["social-37", "labor-relationship", "残疾人保障", "残疾人按比例就业制度", 80],
    ["social-38", "labor-relationship", "老年人权益", "禁止老年人就业歧视", 76],
    ["social-39", "labor-relationship", "工会", "工会代表劳动者参与劳动关系", 80],
    ["social-39", "labor-dispute", "工会", "工会参与劳动争议调解", 80],
    ["social-40", "social-14", "社区矫正", "社区矫正由刑事诉讼法规范", 80],
    // international law internal (using actual auto-generated IDs)
    ["international-14", "international-04", "国家主权", "国家主权平等原则贯穿条约实践", 86],
    ["international-14", "international-05", "国家主权", "国家责任源于国家主权", 88],
    ["international-14", "international-06", "国家主权", "外交豁免源于主权平等", 86],
    ["international-14", "international-17", "国家主权", "海域划界涉及国家主权", 84],
    ["international-14", "international-18", "国家主权", "领土主权是国家主权的重要方面", 88],
    ["international-15", "international-14", "国际法主体", "国家是国际法基本主体", 88],
    ["international-15", "international-16", "国际法主体", "国际法渊源确定主体范围", 82],
    ["international-15", "international-56", "国际法主体", "国家承认是主体资格取得", 86],
    ["international-16", "international-04", "国际法渊源", "条约是国际法首要渊源", 90],
    ["international-16", "international-24", "国际法渊源", "条约法是国际法分支", 88],
    ["international-17", "international-18", "海洋法", "领海是国家领土组成部分", 86],
    ["international-17", "international-14", "海洋法", "专属经济区是国家主权权利", 84],
    ["international-18", "international-14", "领土法", "领土主权是国家主权", 90],
    ["international-19", "international-14", "外交法", "外交豁免源于国家主权平等", 86],
    ["international-19", "international-06", "外交法", "外交关系法是外交法核心", 90],
    ["international-20", "international-14", "国际人权", "国家承担人权保护义务", 86],
    ["international-20", "international-05", "国际人权", "国家侵害人权触发国际责任", 84],
    ["international-21", "international-05", "国际刑法", "国际罪行触发国家责任", 84],
    ["international-21", "international-20", "国际刑法", "严重侵犯人权是国际罪行", 86],
    ["international-22", "international-05", "争端解决", "争端解决救济国家责任", 84],
    ["international-22", "international-06", "争端解决", "政治性争端解决方法含外交", 82],
    ["international-22", "international-13", "争端解决", "引渡是国际刑事司法合作", 80],
    ["international-23", "international-04", "国家责任", "违反条约义务触发国家责任", 86],
    ["international-23", "international-22", "国家责任", "争端解决机制救济国家责任", 86],
    ["international-24", "international-04", "条约法", "条约是国际法主要渊源", 90],
    ["international-24", "international-22", "条约法", "条约解释可由国际法院裁判", 82],
    ["international-25", "international-14", "航空法", "国家领空主权原则", 84],
    ["international-26", "international-18", "外空法", "外空与领土主权的关系", 80],
    ["international-27", "international-14", "环境法", "国家承担环境保护义务", 84],
    ["international-28", "international-21", "武装冲突", "战争罪是国际刑法核心", 86],
    ["international-28", "international-20", "武装冲突", "武装冲突中保护平民", 84],
    ["international-29", "international-03", "国际经济法", "国际经济法是法学分支", 90],
    ["international-29", "international-30", "国际经济法", "WTO 是国际经济法核心", 86],
    ["international-30", "international-31", "WTO", "GATT 1994 是 WTO 货物贸易框架", 90],
    ["international-30", "international-32", "WTO", "TRIMS 协议规范投资", 84],
    ["international-30", "international-34", "WTO", "TRIPS 是 WTO 一揽子协定", 86],
    ["international-31", "international-30", "GATT", "GATT 1994 是 WTO 框架下货物贸易总协定", 92],
    ["international-32", "international-09", "国际投资", "国际投资法是国际经济法分支", 88],
    ["international-32", "international-22", "国际投资", "投资仲裁是争端解决方法", 86],
    ["international-33", "international-31", "货物买卖", "GATT 不规范具体买卖合同", 78],
    ["international-33", "international-44", "货物买卖", "货物运输是买卖合同履行方式", 80],
    ["international-34", "international-30", "国际知识产权", "TRIPS 属 WTO 框架", 86],
    ["international-35", "international-32", "国际税法", "税收协定影响投资决策", 80],
    ["international-36", "international-29", "国际金融", "国际金融是国际经济法分支", 82],
    ["international-37", "international-02", "国际私法渊源", "国际私法包含冲突法", 88],
    ["international-37", "international-38", "国际私法渊源", "冲突规范是国际私法核心", 90],
    ["international-37", "international-43", "国际私法渊源", "国际私法主体确定", 84],
    ["international-38", "international-39", "准据法", "意思自治确定准据法", 90],
    ["international-38", "international-40", "准据法", "最密切联系确定准据法", 90],
    ["international-38", "international-55", "准据法", "识别/反致是准据法基本制度", 86],
    ["international-39", "international-40", "意思自治", "未选择时适用最密切联系", 90],
    ["international-39", "international-38", "意思自治", "当事人选择是准据法确定方法", 88],
    ["international-40", "international-38", "最密切联系", "最密切联系是准据法补充确定方法", 88],
    ["international-41", "international-45", "管辖权", "国际民诉管辖权规则", 86],
    ["international-41", "international-42", "管辖权", "仲裁管辖是商事管辖", 80],
    ["international-42", "international-22", "国际仲裁", "国际仲裁是国际争端解决方法", 84],
    ["international-42", "international-45", "国际仲裁", "仲裁裁决需经法院承认与执行", 84],
    ["international-43", "international-38", "国际私法主体", "主体国籍/住所影响准据法", 84],
    ["international-43", "international-15", "国际私法主体", "国际私法主体与公法主体有差异", 80],
    ["international-44", "international-33", "国际运输", "运输是国际货物买卖履行方式", 80],
    ["international-44", "international-17", "国际运输", "海洋运输是国际海事法核心", 84],
    ["international-45", "international-42", "国际民诉", "仲裁与诉讼是争议解决双轨", 82],
    ["international-45", "international-22", "国际民诉", "国际民诉是国际私法争端解决方式", 80],
    ["international-46", "international-38", "涉外婚姻", "涉外婚姻适用国际私法", 84],
    ["international-46", "international-43", "涉外婚姻", "婚姻能力依当事人属人法", 80],
    ["international-47", "international-38", "涉外继承", "涉外继承适用国际私法", 84],
    ["international-47", "international-18", "涉外继承", "不动产继承依物之所在地法", 84],
    ["international-48", "international-28", "人道法", "国际人道法规范武装冲突", 90],
    ["international-48", "international-20", "人道法", "保护平民与人权法交叉", 84],
    ["international-49", "international-20", "难民", "难民保护是人权法分支", 84],
    ["international-49", "international-06", "难民", "难民保护通过外交合作", 78],
    ["international-50", "international-21", "反恐", "恐怖主义是国际罪行", 82],
    ["international-50", "international-20", "反恐", "反恐应尊重人权", 80],
    ["international-51", "international-12", "国际组织", "国际组织法是国际法分支", 86],
    ["international-51", "international-14", "国际组织", "国际组织基于国家主权让渡", 82],
    ["international-52", "international-51", "区域法", "区域国际法是国际组织法的子集", 86],
    ["international-52", "international-12", "区域法", "区域性国际组织如 ASEAN", 84],
    ["international-53", "international-20", "国际卫生", "健康权是人权重要组成", 80],
    ["international-54", "international-20", "国际劳动", "国际劳工标准与人权交叉", 84],
    ["international-55", "international-38", "国际私法基本制度", "识别/反致是准据法制度", 86],
    ["international-55", "international-02", "国际私法基本制度", "国际私法基本制度", 88],
    ["international-56", "international-14", "国家承认", "承认新国家即承认其主权", 86],
    ["international-56", "international-06", "国家承认", "建交是承认的体现", 84],
    ["international-57", "international-56", "政府承认", "政府承认与国家承认相互联系", 80],
    ["international-57", "international-14", "政府承认", "政府承认是有效统治的承认", 80],
    ["international-58", "international-56", "国家继承", "国家继承发生在国家承认后", 80],
    ["international-58", "international-04", "国家继承", "国家继承涉及条约继承", 80],
    ["international-59", "international-42", "国际调解", "调解与仲裁是争议解决双轨", 80],
    ["international-59", "international-45", "国际调解", "和解协议跨境执行", 80],
    // legal history internal (using actual auto-generated IDs)
    ["legal-history-15", "legal-history-16", "夏商", "西周承接夏商礼法", 80],
    ["legal-history-15", "legal-history-04", "夏商", "中华法系源远流长", 76],
    ["legal-history-16", "legal-history-11", "西周", "西周奠定礼法结合基础", 86],
    ["legal-history-16", "legal-history-37", "西周", "出礼入刑始于西周", 84],
    ["legal-history-16", "legal-history-17", "西周", "春秋战国承接西周礼乐崩坏", 80],
    ["legal-history-17", "legal-history-40", "法家", "《法经》是法家集大成作", 88],
    ["legal-history-17", "legal-history-18", "法家", "秦律是法家实践成果", 86],
    ["legal-history-17", "legal-history-36", "法家", "儒家化是对法家极端的反动", 80],
    ["legal-history-40", "legal-history-41", "《法经》", "《法经》→《九章律》一脉相承", 90],
    ["legal-history-40", "legal-history-10", "《法经》", "《法经》是法典化传统开端", 86],
    ["legal-history-18", "legal-history-02", "秦代", "云梦秦简展示秦律面貌", 88],
    ["legal-history-18", "legal-history-41", "秦律", "汉承秦制,萧何作《九章律》", 88],
    ["legal-history-18", "legal-history-17", "秦律", "秦律是法家集大成", 84],
    ["legal-history-41", "legal-history-19", "九章律", "汉承秦制,《九章律》+《傍章律》+《越宫律》+《朝律》", 88],
    ["legal-history-41", "legal-history-20", "九章律", "汉代春秋决狱开启儒家化", 84],
    ["legal-history-41", "legal-history-10", "九章律", "法典化传统沿至《九章律》", 84],
    ["legal-history-19", "legal-history-03", "汉律", "汉律 60 篇构成汉代法制主体", 88],
    ["legal-history-19", "legal-history-20", "汉律", "汉代春秋决狱与汉律并行", 84],
    ["legal-history-20", "legal-history-36", "春秋决狱", "春秋决狱是法律儒家化开端", 88],
    ["legal-history-20", "legal-history-04", "春秋决狱", "唐律'德主刑辅'延续此传统", 80],
    ["legal-history-20", "legal-history-12", "春秋决狱", "汉代春秋决狱与董仲舒相关", 88],
    ["legal-history-21", "legal-history-22", "魏晋", "北齐律上承魏晋,下启隋唐", 80],
    ["legal-history-21", "legal-history-42", "魏晋", "魏晋律学兴盛", 84],
    ["legal-history-22", "legal-history-23", "北齐", "北齐'重罪十条'→隋'十恶'", 88],
    ["legal-history-22", "legal-history-04", "北齐", "北齐律为唐律直接母本", 88],
    ["legal-history-23", "legal-history-04", "开皇", "唐律直接承袭开皇律", 90],
    ["legal-history-23", "legal-history-10", "开皇", "开皇律是法典化里程碑", 88],
    ["legal-history-24", "legal-history-04", "唐六典", "《唐律》+'唐六典'=唐代法制", 84],
    ["legal-history-24", "legal-history-27", "唐六典", "《唐六典》开创会典体例", 86],
    ["legal-history-24", "legal-history-10", "唐六典", "唐六典是法典化传统", 84],
    ["legal-history-04", "legal-history-05", "唐律", "宋刑统承袭唐律", 88],
    ["legal-history-04", "legal-history-10", "唐律", "唐律是法典化传统巅峰", 92],
    ["legal-history-04", "legal-history-13", "唐律", "唐律是中华法系代表", 90],
    ["legal-history-04", "legal-history-11", "唐律", "唐律'德主刑辅'是礼法结合典范", 88],
    ["legal-history-05", "legal-history-25", "宋刑统", "宋刑统是中国首部印行法典", 88],
    ["legal-history-05", "legal-history-04", "宋刑统", "宋刑统以唐律为蓝本", 86],
    ["legal-history-25", "legal-history-26", "宋刑统", "元代法典受宋影响", 80],
    ["legal-history-25", "legal-history-10", "宋刑统", "宋刑统是法典化传统", 84],
    ["legal-history-26", "legal-history-27", "元代", "明代会典承元制", 76],
    ["legal-history-26", "legal-history-10", "元代", "元代法制是法典化传统", 76],
    ["legal-history-27", "legal-history-28", "明会典", "清会典承明会典体例", 88],
    ["legal-history-27", "legal-history-06", "明会典", "《大明律》+《大明会典》", 86],
    ["legal-history-28", "legal-history-07", "清会典", "《大清律例》+《大清会典》", 86],
    ["legal-history-28", "legal-history-29", "清会典", "秋审制度在清会典规范下", 78],
    ["legal-history-06", "legal-history-07", "大明律", "大清律以大明律为蓝本", 90],
    ["legal-history-06", "legal-history-10", "大明律", "大明律延续法典化传统", 88],
    ["legal-history-06", "legal-history-11", "大明律", "大明律体现礼法结合", 84],
    ["legal-history-07", "legal-history-10", "大清律", "大清律是中国传统法典终结", 90],
    ["legal-history-07", "legal-history-13", "大清律", "大清律是中华法系代表", 86],
    ["legal-history-07", "legal-history-08", "大清律", "清末修律对大清律全面改造", 88],
    ["legal-history-08", "legal-history-30", "清末修律", "领事裁判权是清末修律背景", 84],
    ["legal-history-08", "legal-history-31", "清末修律", "清末修律核心争议是礼法之争", 88],
    ["legal-history-08", "legal-history-32", "清末修律", "大理院设立是清末修律成果", 82],
    ["legal-history-08", "legal-history-44", "清末修律", "沈家本是清末修律主持者", 90],
    ["legal-history-08", "legal-history-09", "清末修律", "清末修律开启近代转型", 88],
    ["legal-history-08", "legal-history-43", "清末修律", "清末修律承袭明清律学", 78],
    ["legal-history-44", "legal-history-09", "沈家本", "沈家本推动近代法制转型", 88],
    ["legal-history-44", "legal-history-14", "沈家本", "沈家本主持制定六法体系", 86],
    ["legal-history-44", "legal-history-43", "沈家本", "沈家本是清代律学大家", 82],
    ["legal-history-44", "legal-history-31", "沈家本", "沈家本是'法理派'代表", 84],
    ["legal-history-09", "legal-history-14", "近代转型", "六法全书是近代转型成果", 88],
    ["legal-history-09", "legal-history-45", "近代转型", "民国宪法是转型重要部分", 84],
    ["legal-history-09", "legal-history-10", "近代转型", "法典化传统延续至近代", 84],
    ["legal-history-14", "legal-history-45", "六法全书", "六法包括宪法、民法、刑法等", 86],
    ["legal-history-14", "legal-history-35", "六法全书", "1949 年废除六法全书", 84],
    ["legal-history-14", "legal-history-13", "六法全书", "六法体系是中华法系近代延续", 84],
    ["legal-history-14", "legal-history-09", "六法全书", "六法是近代法制转型成果", 86],
    ["legal-history-35", "legal-history-34", "废除六法", "共同纲领第 17 条宣布废除六法全书", 88],
    ["legal-history-35", "legal-history-33", "废除六法", "革命根据地法制取代六法全书", 84],
    ["legal-history-33", "legal-history-34", "根据地", "共同纲领延续根据地传统", 86],
    ["legal-history-33", "legal-history-46", "根据地", "土地改革法是革命实践", 80],
    ["legal-history-33", "legal-history-47", "根据地", "婚姻法是革命实践", 80],
    ["legal-history-34", "legal-history-46", "共同纲领", "《土地改革法》是共同纲领原则的实践", 84],
    ["legal-history-34", "legal-history-47", "共同纲领", "1950《婚姻法》是共同纲领原则的实践", 84],
    ["legal-history-34", "legal-history-48", "共同纲领", "镇压反革命运动依《惩治反革命条例》", 80],
    ["legal-history-36", "legal-history-11", "法律儒家化", "礼法结合是儒家化核心", 88],
    ["legal-history-36", "legal-history-20", "法律儒家化", "春秋决狱是儒家化开端", 88],
    ["legal-history-36", "legal-history-38", "法律儒家化", "中华法系特点含儒家化", 86],
    ["legal-history-36", "legal-history-12", "法律儒家化", "春秋决狱与儒家化直接相关", 86],
    ["legal-history-37", "legal-history-38", "出礼入刑", "出礼入刑是中华法系特点", 86],
    ["legal-history-37", "legal-history-11", "出礼入刑", "出礼入刑是礼法结合体现", 86],
    ["legal-history-38", "legal-history-13", "中华法系特点", "特点集中体现于中华法系", 90],
    ["legal-history-38", "legal-history-11", "中华法系特点", "礼法结合是核心特点", 88],
    ["legal-history-13", "legal-history-04", "中华法系", "唐律是中华法系核心", 90],
    ["legal-history-13", "legal-history-38", "中华法系", "中华法系特点定义其内涵", 88],
    ["legal-history-13", "legal-history-11", "中华法系", "礼法结合是中华法系核心特征", 88],
    ["legal-history-42", "legal-history-04", "魏晋律学", "唐律疏议承魏晋律学", 80],
    ["legal-history-42", "legal-history-21", "魏晋律学", "魏晋律学是律学传统", 88],
    ["legal-history-42", "legal-history-39", "魏晋律学", "张斐杜预是魏晋律学代表", 86],
    ["legal-history-43", "legal-history-08", "明清律学", "清末修律承袭明清律学", 78],
    ["legal-history-43", "legal-history-44", "明清律学", "沈家本是明清律学代表", 84],
    ["legal-history-39", "legal-history-21", "张裴律注", "张裴律注是魏晋律学成果", 86],
    ["legal-history-39", "legal-history-04", "张裴律注", "张裴律注为唐律疏议奠基", 84],
    ["legal-history-45", "legal-history-14", "民国宪法", "民国宪法属六法体系", 86],
    ["legal-history-45", "legal-history-09", "民国宪法", "民国宪法是近代法制转型", 84],
    ["legal-history-46", "legal-history-34", "土地改革", "土地改革法依共同纲领", 86],
    ["legal-history-46", "legal-history-33", "土地改革", "土地改革是革命实践", 80],
    ["legal-history-47", "legal-history-34", "婚姻法", "1950 婚姻法依共同纲领", 86],
    ["legal-history-47", "legal-history-33", "婚姻法", "婚姻法是革命实践", 80],
    ["legal-history-48", "legal-history-34", "镇反", "镇反运动依共同纲领", 80],
    ["legal-history-48", "legal-history-33", "镇反", "镇反是革命实践", 78],

    // administrative -> civil
    ["civil-product-liability", "civil-tort-liability", "产品责任", "产品责任是侵权责任编的具体制度", 86],
    ["civil-medical-liability", "civil-tort-liability", "医疗损害", "医疗损害是侵权责任编的具体制度", 82],
    ["civil-online-tort", "civil-tort-liability", "网络侵权", "网络侵权是侵权责任编的具体制度", 80]
  ];

  for (const [source, target, label, desc, weight] of pairs) {
    if (KNOWN_NODE_IDS.has(source) && KNOWN_NODE_IDS.has(target)) {
      edges.push(edge(source, target, "concept-of", label, desc, {
        weight,
        domain: "civil",
        colorKey: "civil",
        evidenceLevel: "民法典编章结构"
      }));
    }
  }

  return edges;
}

const KNOWN_NODE_IDS = new Set(legalUniverseNodes.map((node) => node.id));
const intraSystemEdges = buildIntraSystemEdges();

export const legalUniverseEdges: LegalUniverseEdge[] = [...systemEdges, ...conceptEdges, ...crossEdges, ...intraSystemEdges];

export function getLegalUniverseNodeById(id: string, nodes = legalUniverseNodes): LegalUniverseNode | undefined {
  return nodes === legalUniverseNodes ? legalUniverseNodeIndex.get(id) : nodes.find((node) => node.id === id);
}

export function getLegalUniverseSystemById(id: string, systems = legalUniverseSystems): LegalUniverseSystem | undefined {
  return systems.find((system) => system.id === id);
}

export function getLegalUniverseRelationsForNode(
  id: string,
  nodes = legalUniverseNodes,
  edges = legalUniverseEdges
): Array<{ node: LegalUniverseNode; relation: LegalUniverseEdge }> {
  return edges
    .filter((edgeItem) => edgeItem.source === id || edgeItem.target === id)
    .map((relation) => ({
      relation,
      node: getLegalUniverseNodeById(relation.source === id ? relation.target : relation.source, nodes)
    }))
    .filter((item): item is { node: LegalUniverseNode; relation: LegalUniverseEdge } => Boolean(item.node))
    .sort((a, b) => b.relation.weight - a.relation.weight);
}

export function getTopLegalUniverseSystems(limit = 14): LegalUniverseNode[] {
  return rankedSystemNodes.slice(0, limit);
}

export interface LegalUniversePathStep {
  from: string;
  to: string;
  edge: LegalUniverseEdge;
}

export interface LegalUniversePath {
  nodeIds: string[];
  steps: LegalUniversePathStep[];
  totalWeight: number;
  hopCount: number;
}

function buildAdjacency(edges: LegalUniverseEdge[]): Map<string, Array<{ neighbor: string; edge: LegalUniverseEdge }>> {
  const adjacency = new Map<string, Array<{ neighbor: string; edge: LegalUniverseEdge }>>();

  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)!.push({ neighbor: edge.target, edge });
    adjacency.get(edge.target)!.push({ neighbor: edge.source, edge });
  }

  return adjacency;
}

export function findLegalUniversePath(
  fromId: string,
  toId: string,
  edges: LegalUniverseEdge[] = legalUniverseEdges,
  options: { maxHops?: number; requireWeightFloor?: number } = {}
): LegalUniversePath | null {
  if (fromId === toId) {
    return { nodeIds: [fromId], steps: [], totalWeight: 0, hopCount: 0 };
  }

  const maxHops = options.maxHops ?? 6;
  const requireWeightFloor = options.requireWeightFloor ?? 0;
  const adjacency = buildAdjacency(edges);

  // Dijkstra on edge cost = 101 - weight, so strongest edges cost least.
  const costs = new Map<string, number>();
  const cameFrom = new Map<string, { previous: string; edge: LegalUniverseEdge } | null>();
  const queue: Array<{ id: string; cost: number; hops: number }> = [{ id: fromId, cost: 0, hops: 0 }];
  costs.set(fromId, 0);
  cameFrom.set(fromId, null);

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (current.id === toId) {
      break;
    }

    if (current.hops >= maxHops) {
      continue;
    }

    const neighbors = adjacency.get(current.id) ?? [];
    for (const { neighbor, edge } of neighbors) {
      if (edge.weight < requireWeightFloor) {
        continue;
      }
      const stepCost = Math.max(1, 101 - edge.weight);
      const candidateCost = current.cost + stepCost;
      const knownCost = costs.get(neighbor);
      if (knownCost === undefined || candidateCost < knownCost) {
        costs.set(neighbor, candidateCost);
        cameFrom.set(neighbor, { previous: current.id, edge });
        queue.push({ id: neighbor, cost: candidateCost, hops: current.hops + 1 });
      }
    }
  }

  if (!costs.has(toId)) {
    return null;
  }

  const nodeIds: string[] = [];
  const steps: LegalUniversePathStep[] = [];
  let cursor: string | null = toId;
  while (cursor) {
    nodeIds.unshift(cursor);
    const previous = cameFrom.get(cursor);
    if (!previous) {
      break;
    }
    steps.unshift({ from: previous.previous, to: cursor, edge: previous.edge });
    cursor = previous.previous;
  }

  return {
    nodeIds,
    steps,
    totalWeight: costs.get(toId) ?? 0,
    hopCount: steps.length
  };
}

export function validateLegalUniverseData(nodes = legalUniverseNodes, edges = legalUniverseEdges): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const systemIds = new Set(legalUniverseSystems.map((system) => system.id));
  const sourceIds = new Set(legalUniverseSourceRefs.map((source) => source.id));

  for (const node of nodes) {
    if (!node.title.trim()) {
      errors.push(`Missing title: ${node.id}`);
    }
    if (!node.shortDescription.trim()) {
      errors.push(`Missing shortDescription: ${node.id}`);
    }
    if (!systemIds.has(node.systemId)) {
      errors.push(`Unknown systemId ${node.systemId}: ${node.id}`);
    }
    if (node.parentId && !nodeIds.has(node.parentId)) {
      errors.push(`Unknown parentId ${node.parentId}: ${node.id}`);
    }
    if (node.sourceRefs.length === 0) {
      errors.push(`Missing sourceRefs: ${node.id}`);
    }
    for (const sourceRef of node.sourceRefs) {
      if (!sourceIds.has(sourceRef)) {
        errors.push(`Unknown sourceRef ${sourceRef}: ${node.id}`);
      }
    }
  }

  for (const relation of edges) {
    if (!nodeIds.has(relation.source)) {
      errors.push(`Missing edge source: ${relation.source}`);
    }
    if (!nodeIds.has(relation.target)) {
      errors.push(`Missing edge target: ${relation.target}`);
    }
    if (relation.source === relation.target) {
      errors.push(`Self edge: ${relation.source}`);
    }
    if (relation.weight <= 0 || relation.weight > 100) {
      errors.push(`Invalid edge weight: ${relation.source}->${relation.target}`);
    }
    if (!relation.label.trim()) {
      errors.push(`Missing edge label: ${relation.source}->${relation.target}`);
    }
    if (!relation.evidenceLevel.trim()) {
      errors.push(`Missing evidenceLevel: ${relation.source}->${relation.target}`);
    }
    if (relation.sourceRefs.length === 0) {
      errors.push(`Missing edge sourceRefs: ${relation.source}->${relation.target}`);
    }
    for (const sourceRef of relation.sourceRefs) {
      if (!sourceIds.has(sourceRef)) {
        errors.push(`Unknown edge sourceRef ${sourceRef}: ${relation.source}->${relation.target}`);
      }
    }
  }

  return errors;
}
