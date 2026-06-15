const state = {
  themes: [],
  books: [],
  knowledgePoints: [],
  query: "",
  themeId: "all",
  selectedBookId: "",
  selectedSectionId: "",
  selectedPointId: "",
  quizResult: null,
  masteredIds: new Set(),
  introSeen: false,
  importFile: null,
  importedGuide: null,
  importedChapterId: ""
};

const els = {
  bookCount: document.querySelector("#book-count"),
  pointCount: document.querySelector("#point-count"),
  themeCount: document.querySelector("#theme-count"),
  masteredCount: document.querySelector("#mastered-count"),
  searchInput: document.querySelector("#search-input"),
  introOpen: document.querySelector("#intro-open"),
  importOpen: document.querySelector("#import-open"),
  themeTabs: document.querySelector("#theme-tabs"),
  bookList: document.querySelector("#book-list"),
  bookHero: document.querySelector("#book-hero"),
  pointList: document.querySelector("#point-list"),
  pointDetail: document.querySelector("#point-detail"),
  questionInput: document.querySelector("#question-input"),
  askButton: document.querySelector("#ask-button"),
  answerBox: document.querySelector("#answer-box"),
  citations: document.querySelector("#citations"),
  recommendationPanel: document.querySelector("#recommendation-panel"),
  quizModal: document.querySelector("#quiz-modal"),
  introPanel: document.querySelector("#intro-panel"),
  quizForm: document.querySelector("#quiz-form"),
  importModal: document.querySelector("#import-modal"),
  importClose: document.querySelector("#import-close"),
  importSetup: document.querySelector("#import-setup"),
  importResult: document.querySelector("#import-result"),
  bookDropzone: document.querySelector("#book-dropzone"),
  bookFile: document.querySelector("#book-file"),
  bookFileInfo: document.querySelector("#book-file-info"),
  readingLevel: document.querySelector("#reading-level"),
  readingGoal: document.querySelector("#reading-goal"),
  generateGuide: document.querySelector("#generate-guide"),
  importStatus: document.querySelector("#import-status"),
  importShelf: document.querySelector("#import-shelf"),
  importShelfList: document.querySelector("#import-shelf-list"),
  importResultHead: document.querySelector("#import-result-head"),
  importChapters: document.querySelector("#import-chapters"),
  importChapterDetail: document.querySelector("#import-chapter-detail"),
  importRestart: document.querySelector("#import-restart"),
  saveGuide: document.querySelector("#save-guide"),
  downloadGuide: document.querySelector("#download-guide")
};

const marketIntroSteps = [
  {
    title: "1. 你买的不是代码，是资产",
    body: "股票可以先理解成“拥有一小块公司”；基金和指数可以先理解成“一篮子公司”。屏幕上跳动的是价格，背后真正重要的是资产能不能长期创造价值。"
  },
  {
    title: "2. 市场每天报价，但不等于每天审判",
    body: "价格会上下波动，有时是信息变化，有时只是大家情绪变化。新手先练习一件事：把“今天涨跌”跟“这个东西到底好不好”分开看。"
  },
  {
    title: "3. 风险不是吓人的词，是不确定性",
    body: "投资没有“稳赚剧本”。风险包括买贵了、看错了、急用钱、跟风上头、承受不了下跌。先知道自己能承受什么，再谈适合读哪类书。"
  },
  {
    title: "4. 经典书不是让你背黑话",
    body: "安全边际、护城河、有效市场这些词，本质都是生活问题：贵不贵、靠不靠谱、能不能坚持。知投会先把它们翻成白话，再带你回到书。"
  }
];

const quizQuestions = [
  {
    id: "hotNews",
    question: "刷到一条消息：某只股票三天涨了很多，朋友圈都在聊。你的第一反应是？",
    options: [
      { label: "先别急，我想知道它到底值不值这个价", scores: { value: 3, behavior: 1 } },
      { label: "有点心动，但我更想知道这家公司是不是真的变强了", scores: { growth: 3, value: 1 } },
      { label: "太热闹了，我还是按自己的长期计划来", scores: { index: 3, psychology: 1 } },
      { label: "先看走势和成交量，别光听大家喊", scores: { technical: 2, quant: 1, macro: 1 } }
    ]
  },
  {
    id: "weekend",
    question: "周末你决定学一点投资，更像会打开哪一种内容？",
    options: [
      { label: "《普通人别踩坑清单》这种越实用越好", scores: { value: 2, behavior: 2, psychology: 1 } },
      { label: "《我身边的品牌为什么赚钱》这种故事最好懂", scores: { growth: 3, value: 1 } },
      { label: "《懒人也能坚持的长期配置》听起来很适合我", scores: { index: 3, psychology: 2 } },
      { label: "《用数据测试一个想法》这种我会忍不住点开", scores: { quant: 3, technical: 1 } }
    ]
  },
  {
    id: "downMarket",
    question: "如果市场突然大跌，你最可能做什么？",
    options: [
      { label: "翻出自己的理由：当初为什么买，现在变了吗？", scores: { value: 3, behavior: 1 } },
      { label: "先看看是不是整个环境变了，比如利率、政策、周期", scores: { macro: 3, index: 1 } },
      { label: "按计划继续，不想每天被涨跌牵着走", scores: { index: 3, psychology: 2 } },
      { label: "看有没有跌破自己的规则，破了就认错", scores: { technical: 2, quant: 2 } }
    ]
  },
  {
    id: "friend",
    question: "朋友问你“现在买什么能赚？”你心里的弹幕是？",
    options: [
      { label: "先别问买什么，先问你能承受亏多少", scores: { psychology: 3, behavior: 2 } },
      { label: "我更想问：这个东西凭什么值这个价？", scores: { value: 3 } },
      { label: "我可能会说：别押一把，先做分散配置", scores: { index: 3, psychology: 1 } },
      { label: "如果没有规则，买什么都容易变成乱猜", scores: { technical: 2, quant: 2, behavior: 1 } }
    ]
  },
  {
    id: "character",
    question: "如果把你放进一个投资游戏，你更像哪个角色？",
    options: [
      { label: "捡漏鉴定师：便宜可以，但必须真有价值", scores: { value: 3 } },
      { label: "商业侦探：喜欢研究一家公司怎么长大", scores: { growth: 3 } },
      { label: "长期挂机玩家：少折腾，靠时间和纪律升级", scores: { index: 2, psychology: 2 } },
      { label: "雷达观察员：想看趋势、周期、信号和数据", scores: { macro: 2, technical: 2, quant: 1 } }
    ]
  }
];

const themeAdvice = {
  value: {
    code: "SAFE",
    title: "安全垫守护型",
    reason: "你不是胆小，你只是讨厌不明不白地亏钱。你适合先学会看价格和价值的关系，给每个决定留出余地。",
    bookIds: ["intelligent-investor", "buffett-letters"]
  },
  growth: {
    code: "SEEK",
    title: "十倍股侦探型",
    reason: "你会被“这家公司为什么会变强”吸引。你适合从生活里的好产品出发，再学习怎么验证增长是不是真的。",
    bookIds: ["common-stocks", "lynch-one-up"]
  },
  index: {
    code: "LAZY",
    title: "佛系配置型",
    reason: "你不想每天盯盘，也不想把人生押在一次判断上。你适合先建立简单、分散、低成本、能长期坚持的底座。",
    bookIds: ["random-walk", "common-sense-mutual-funds"]
  },
  technical: {
    code: "FLOW",
    title: "趋势雷达型",
    reason: "你对市场节奏很敏感，喜欢看价格怎么走。你适合把图表当作观察工具，同时先学会失败时怎么退出。",
    bookIds: ["market-technical-analysis"]
  },
  macro: {
    code: "CYCLE",
    title: "周期天气预报型",
    reason: "你会自然地问：现在的大环境是不是变了？你适合从周期、情绪和风险偏好理解市场温度。",
    bookIds: ["cycles"]
  },
  behavior: {
    code: "MIND",
    title: "反上头清醒型",
    reason: "你知道最大的对手常常不是市场，而是自己的情绪。你适合先学习怎么识别冲动、偏见和追涨杀跌。",
    bookIds: ["thinking-fast-slow", "psychology-of-money"]
  },
  quant: {
    code: "DATA",
    title: "数据规则控型",
    reason: "你更信规则和证据，不太喜欢只凭感觉。你适合学习如何把想法变成可测试的规则，也要小心过度拟合历史。",
    bookIds: ["quant-black-box"]
  },
  psychology: {
    code: "CALM",
    title: "长期心态派",
    reason: "你更关心这套方法自己能不能坚持。你适合从财富观、习惯、时间和留有余地开始，先把系统搭稳。",
    bookIds: ["psychology-of-money", "intelligent-investor"]
  }
};

const glossaryTerms = [
  { term: "安全边际", plain: "给自己留余地。就像买东西先确认质量，再等到价格足够划算时下手。", example: "估值可能算错、市场可能下跌，安全边际就是防止一次错误造成大伤害。" },
  { term: "内在价值", plain: "一家公司长期真正值多少钱的估算，不等于每天变化的股价。", example: "股价像报价，内在价值像你心里对这门生意的合理估价。" },
  { term: "估值", plain: "判断价格贵不贵的过程。", example: "同样一家公司，100 元和 300 元买入，风险和未来回报完全不同。" },
  { term: "现金流", plain: "企业真正流进流出的现金，比纸面利润更接近生意的生命力。", example: "利润好看但收不到钱，可能只是账面漂亮。" },
  { term: "护城河", plain: "保护企业不容易被竞争者打败的优势。", example: "品牌、成本、网络效应、转换成本都可能是护城河。" },
  { term: "资本配置", plain: "公司赚到钱后怎么用：继续投入、分红、回购，还是并购。", example: "管理层会不会花钱，决定企业能不能长期复利。" },
  { term: "复利", plain: "收益继续产生收益，时间越长效果越明显。", example: "复利怕中断，也怕一次巨大亏损。" },
  { term: "回撤", plain: "账户或资产从高点跌下来的幅度。", example: "能不能承受回撤，决定你能不能坚持策略。" },
  { term: "分散", plain: "不要把结果押在单一公司、行业或判断上。", example: "分散不是乱买很多东西，而是降低同一类风险。" },
  { term: "再平衡", plain: "定期把组合比例拉回原计划。", example: "不是预测涨跌，而是让风险水平别越跑越偏。" },
  { term: "有效市场", plain: "市场里很多聪明人都在找机会，所以持续捡便宜很难。", example: "这也是指数投资强调低成本和长期持有的原因。" },
  { term: "择时", plain: "试图判断什么时候买、什么时候卖。", example: "难点在于你不仅要判断方向，还要判断时间。" },
  { term: "支撑", plain: "价格跌到某些位置时，可能出现较多买盘的区域。", example: "它只是概率线索，不是保证不会跌破。" },
  { term: "阻力", plain: "价格涨到某些位置时，可能出现较多卖盘的区域。", example: "突破是否有效，通常还要看成交量和后续表现。" },
  { term: "成交量", plain: "某段时间内买卖发生了多少。", example: "价格变化配合成交量，通常比孤立价格更有信息量。" },
  { term: "信用周期", plain: "钱容易借和不容易借之间的循环。", example: "融资宽松会推高资产，收紧时压力也会被放大。" },
  { term: "风险偏好", plain: "市场愿意承担风险的程度。", example: "大家都很大胆时，价格可能已经把好消息算得太满。" },
  { term: "确认偏误", plain: "只找支持自己观点的信息，忽略反对证据。", example: "研究一只股票时，刻意写一段反方观点可以对抗它。" },
  { term: "损失厌恶", plain: "亏钱带来的痛苦通常比赚钱的快乐更强。", example: "这会让人死扛错误，或者太早卖掉盈利资产。" },
  { term: "锚定", plain: "被某个数字绑住判断，比如买入价、历史高点。", example: "买入价不决定企业现在值多少钱。" },
  { term: "基准率", plain: "同类事情通常会怎样的平均情况。", example: "再动人的故事，也要先看同类公司的长期结果。" },
  { term: "回测", plain: "把策略放回历史数据里试跑。", example: "回测漂亮不等于未来一定有效。" },
  { term: "过拟合", plain: "模型太迎合历史噪声，未来反而容易失效。", example: "参数越多，不一定越聪明，也可能越脆弱。" },
  { term: "因子", plain: "用来解释或筛选资产的一类特征。", example: "价值、动量、质量都可以是因子思路。" },
  { term: "尾部事件", plain: "概率小但影响很大的事情。", example: "长期投资要承认它无法完全预测，所以要留余地。" }
];

const themeDefaults = {
  value: ["安全边际", "内在价值", "估值", "现金流"],
  growth: ["护城河", "现金流", "资本配置", "估值"],
  index: ["有效市场", "分散", "再平衡", "择时"],
  technical: ["支撑", "阻力", "成交量", "回撤"],
  macro: ["信用周期", "风险偏好", "尾部事件", "估值"],
  behavior: ["确认偏误", "损失厌恶", "锚定", "基准率"],
  quant: ["回测", "过拟合", "因子", "成交量"],
  psychology: ["复利", "尾部事件", "安全边际", "回撤"]
};

const themeAnalogies = {
  value: "像买一件重要东西：先看质量，再看价格，还要留点砍价空间。",
  growth: "像观察一家小店能不能开成连锁：看产品、顾客、管理和市场空间。",
  index: "像不押某个选手，而是买下整条赛道的平均成绩。",
  technical: "像观察人群脚步：你不猜某个人下一步，而是看整体方向和节奏。",
  macro: "像看季节和天气：不是决定每一天，但会影响大多数人的行动。",
  behavior: "像给自己的大脑装提醒器：先承认会犯错，再设计办法少犯错。",
  quant: "像把经验写成菜谱：每一步都能复查，也能知道菜谱什么时候失效。",
  psychology: "像管理生活余量：钱、时间和情绪都不要压到极限。"
};

const themeChecks = {
  value: "如果价格再跌 30%，我还能说清楚自己为什么持有吗？",
  growth: "这个增长来自真实需求，还是只来自一个听起来很好的故事？",
  index: "我是在长期配置，还是披着配置外衣做短期择时？",
  technical: "如果信号失败，我的退出规则是什么？",
  macro: "我是在判断周期位置，还是在预测一个确定日期？",
  behavior: "我有没有主动找反方证据？",
  quant: "这个规则离开历史样本后还站得住吗？",
  psychology: "这套做法在压力很大时，我还能坚持吗？"
};

const bookGuides = {
  "intelligent-investor": {
    question: "市场每天给你一个价格，你怎么不被它牵着走？",
    entry: "先把这本书当成“新手防踩坑手册”：它不是教你找暴富按钮，而是教你先别把自己买到被动。",
    steps: ["先分清价格和价值", "再理解安全边际", "最后学习怎么面对市场情绪"]
  },
  "buffett-letters": {
    question: "如果股票背后是一门生意，你要看懂什么？",
    entry: "这本更像企业观察课：从买卖股票，切换到理解公司、管理层和长期现金流。",
    steps: ["先看公司怎么赚钱", "再看优势能不能延续", "最后看管理层怎么花钱"]
  },
  "common-stocks": {
    question: "一家好公司为什么能一年一年变强？",
    entry: "把它当作成长公司侦探课：不是听故事热血，而是验证增长有没有真实土壤。",
    steps: ["先看市场空间", "再看产品和组织能力", "最后检查增长质量"]
  },
  "lynch-one-up": {
    question: "生活里看到的好产品，怎么变成真正的研究？",
    entry: "这本适合小白入门，因为它从商场、超市、身边品牌出发，但会提醒你：喜欢不等于懂。",
    steps: ["先记录生活线索", "再讲清商业故事", "最后用财务和估值验证"]
  },
  "random-walk": {
    question: "如果市场里聪明人很多，普通人该怎么参与？",
    entry: "它先帮你降低“我必须打败所有人”的压力，理解为什么低成本、分散、长期会成为底层方案。",
    steps: ["先理解市场很难预测", "再理解分散和成本", "最后建立长期规则"]
  },
  "common-sense-mutual-funds": {
    question: "买基金时，哪些东西会悄悄吃掉你的收益？",
    entry: "这本像基金消费避坑指南：先看费用、结构和纪律，再看收益排行榜。",
    steps: ["先看成本", "再看分散和跟踪", "最后设计持有和再平衡规则"]
  },
  "market-technical-analysis": {
    question: "价格图表到底能告诉你什么，不能告诉你什么？",
    entry: "把技术分析当成观察市场行为的工具，不当成预测未来的水晶球。",
    steps: ["先看趋势", "再看成交量确认", "最后永远准备失败预案"]
  },
  cycles: {
    question: "为什么大家越乐观时，风险可能越高？",
    entry: "这本不是教你精确预测日期，而是教你看市场温度：热到发烫时少点上头，冷到没人看时多点冷静。",
    steps: ["先看情绪温度", "再看信用和风险偏好", "最后承认周期不是钟表"]
  },
  "thinking-fast-slow": {
    question: "为什么明明想理性，最后还是会冲动？",
    entry: "这本是投资前的大脑说明书：先认识自己的错觉，再设计办法减少冲动决策。",
    steps: ["先认识直觉反应", "再识别常见偏误", "最后建立慢一点的决策流程"]
  },
  "quant-black-box": {
    question: "如果把投资想法写成规则，会发生什么？",
    entry: "这本把量化拆成普通人能理解的流程：数据、规则、回测、执行、风控，一个都不能神化。",
    steps: ["先理解规则化", "再理解回测局限", "最后看成本和风控"]
  },
  "psychology-of-money": {
    question: "为什么投资最后拼的常常不是智商，而是行为？",
    entry: "这本适合完全小白先读，因为它从生活、欲望、自由感和留余地讲起。",
    steps: ["先理解钱和人的关系", "再理解时间和复利", "最后给生活留安全边际"]
  }
};

const bookDeepGuides = {
  "intelligent-investor": {
    oneLine: "这本书不是教你抓暴涨股票，而是教你在市场情绪很乱的时候，如何少犯大错、看懂价格和价值的关系。",
    problem: "新手最容易把“价格上涨”当成“东西更值钱”，也容易把“跌很多”当成“变便宜”。这本书先帮你建立一个防守框架：先看清资产，再看价格，最后决定要不要参与。",
    story:
      "想象你每天路过一家店，有个人天天问你要不要买下这家店。有时候他报价很高，有时候突然很低。你真正要做的不是被他的报价吓到，而是判断这家店本身值多少钱，以及这个报价有没有给你留下余地。",
    takeaways: ["市场每天报价，但报价不等于价值", "便宜不等于值得买，买入要留安全边际", "普通投资者先学会防守，比追求聪明操作更重要", "投资要有依据、纪律和复核，而不是只靠感觉"],
    sections: [
      {
        id: "ii-market",
        title: "第一章：市场不是老师，只是报价员",
        plainTitle: "先别被涨跌牵着走",
        summary: "这部分先解决一个小白最常见的问题：看到涨跌就觉得市场在告诉自己对错。格雷厄姆的意思是，市场只是每天给你报价，情绪经常很重，你可以利用它，但不用服从它。",
        pointIds: ["kp-002", "kp-003", "kp-007"],
        checkpoint: "看完这一章，你应该能解释：为什么今天涨了不代表你判断正确，今天跌了也不代表你一定错了。"
      },
      {
        id: "ii-price-value",
        title: "第二章：价格和价值不是一回事",
        plainTitle: "先问值不值，再问涨不涨",
        summary: "这一章把投资从“猜价格”拉回“看资产”。价格是市场今天愿意给的数字，价值是你对这门生意或资产长期质量的判断。",
        pointIds: ["kp-005", "kp-006"],
        checkpoint: "看完这一章，你应该能解释：为什么好公司买贵了也可能不是好投资。"
      },
      {
        id: "ii-margin",
        title: "第三章：安全边际到底保护什么",
        plainTitle: "别把自己买到被动的位置",
        summary: "安全边际不是稳赚按钮，而是承认自己会估错、市场会波动、企业会变化，所以买入时要给错误留下缓冲。",
        pointIds: ["kp-001", "kp-008"],
        checkpoint: "看完这一章，你应该能解释：为什么“跌得多”不等于有安全边际。"
      },
      {
        id: "ii-defensive",
        title: "第四章：普通投资者先防守",
        plainTitle: "先避免大错，再追求做对",
        summary: "对新手来说，最重要的不是每次都很聪明，而是别让一次冲动毁掉长期复利。防御型投资者的核心，是分散、纪律、低成本和可坚持。",
        pointIds: ["kp-004", "kp-007", "kp-008"],
        checkpoint: "看完这一章，你应该能解释：为什么保守不等于没追求，而是在保护长期游戏资格。"
      },
      {
        id: "ii-process",
        title: "第五章：把投资变成可复核的流程",
        plainTitle: "不要只凭感觉下单",
        summary: "最后把前面的概念连成一个动作：写下理由、估算价值、检查风险、设置纪律，并在市场情绪很强时回到流程。",
        pointIds: ["kp-003", "kp-005", "kp-007"],
        checkpoint: "看完这一章，你应该能说出：一次投资决定至少要写清哪些依据。"
      }
    ],
    finalQuestions: [
      "为什么股价上涨不一定代表公司更值钱？",
      "为什么便宜不等于值得买？",
      "安全边际到底防的是什么？",
      "普通投资者为什么先要防守？",
      "市场情绪很极端时，应该先问什么？"
    ]
  }
};

const conceptTranslations = [
  { terms: ["安全边际"], text: "别把自己买到进退两难的位置。先估一个保守价值，再等价格给你留余地。" },
  { terms: ["内在价值"], text: "先问“它大概真正值多少钱”，不要只盯着今天别人愿意多少钱买。" },
  { terms: ["估值"], text: "就是判断现在这个价格贵不贵，像买房、买手机前先问值不值。" },
  { terms: ["市场先生"], text: "把市场想成一个每天来报价、情绪很不稳定的人。你可以听报价，但不用被他指挥。" },
  { terms: ["护城河"], text: "问的是：别人为什么不容易抢走这家公司生意？" },
  { terms: ["资本配置"], text: "公司赚到钱后怎么花。会花钱的公司，才更可能长期变强。" },
  { terms: ["有效市场"], text: "市场里聪明人很多，长期捡漏没那么容易，所以普通人要重视成本和分散。" },
  { terms: ["分散"], text: "别把一次判断变成人生押注，把风险分给不同资产和不同时间。" },
  { terms: ["择时"], text: "想猜最低点和最高点，难度通常比新手想象高很多。" },
  { terms: ["再平衡"], text: "组合跑偏后拉回原计划，像定期整理书桌，不是预测明天涨跌。" },
  { terms: ["回撤"], text: "账户从高点跌下来多少。你能不能扛住它，决定你能不能坚持。" },
  { terms: ["趋势"], text: "先看市场脚步往哪边走，但要记住脚步也会突然变向。" },
  { terms: ["支撑", "阻力"], text: "它们是市场记忆，不是魔法墙。价格到这些位置时，买卖力量可能变化。" },
  { terms: ["成交量"], text: "看有多少人真的参与了这次价格变化，热闹程度也会传递信息。" },
  { terms: ["信用周期"], text: "钱容易借和不容易借的循环，会放大经济和资产价格的起伏。" },
  { terms: ["风险偏好"], text: "大家愿不愿意冒险。越兴奋的时候，价格里可能塞进了越多好消息。" },
  { terms: ["确认偏误"], text: "只看支持自己观点的证据。投资里它会让人越研究越固执。" },
  { terms: ["损失厌恶"], text: "亏钱的痛感太强，所以人容易死扛错误，也容易太早卖掉好东西。" },
  { terms: ["锚定"], text: "被某个数字绑住，比如买入价或历史高点，但这些数字不一定说明现在值多少。" },
  { terms: ["基准率"], text: "先看同类事情通常怎样，别一上来就相信自己遇到了例外。" },
  { terms: ["回测"], text: "拿历史数据试跑策略。它能帮你排雷，但不能承诺未来。" },
  { terms: ["过拟合"], text: "规则太迎合过去的细节，看起来聪明，换个环境可能就失灵。" },
  { terms: ["因子"], text: "用一些可观察特征给资产分类，比如便宜、动量、质量。" },
  { terms: ["尾部事件"], text: "小概率但影响巨大的事。承认它存在，所以投资和生活都要留余地。" },
  { terms: ["复利"], text: "收益继续生收益。它最怕中断，也怕一次大亏把前面积累打掉。" },
  { terms: ["现金流"], text: "真正进出账户的钱。故事再好，也要看有没有真金白银支持。" },
  { terms: ["能力圈"], text: "不是只待在舒适区，而是诚实承认自己哪些东西看得懂、哪些看不懂。" },
  { terms: ["价值陷阱"], text: "看起来便宜，但便宜背后可能是生意真的变差了。" }
];

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function themeById(id) {
  return state.themes.find((theme) => theme.id === id);
}

function bookById(id) {
  return state.books.find((book) => book.id === id);
}

function glossaryByTerm(term) {
  return glossaryTerms.find((item) => item.term === term);
}

function loadMasteredIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem("zhitou.masteredIds") || "[]"));
  } catch {
    return new Set();
  }
}

function saveMasteredIds() {
  localStorage.setItem("zhitou.masteredIds", JSON.stringify([...state.masteredIds]));
}

function loadIntroSeen() {
  return localStorage.getItem("zhitou.marketIntroSeen") === "yes";
}

function saveIntroSeen() {
  state.introSeen = true;
  localStorage.setItem("zhitou.marketIntroSeen", "yes");
}

function guideForBook(book) {
  const theme = themeById(book.themeId);
  return (
    bookGuides[book.id] || {
      question: `这本书想帮你理解${theme?.name || "投资"}里的哪一个核心问题？`,
      entry: "先抓主问题，再看关键概念，最后回到知识点和原书。这样学习会更像一条路线，而不是随机背卡片。",
      steps: ["先读白话入口", "再看核心概念", "最后做自己的复述"]
    }
  );
}

function conceptTranslationForPoint(point) {
  const haystack = [point.title, point.explanation, point.application, point.misconception, point.tags.join(" ")].join(" ");
  return conceptTranslations.find((entry) => entry.terms.some((term) => haystack.includes(term)))?.text || "";
}

function pointById(id) {
  return state.knowledgePoints.find((point) => point.id === id);
}

function pointsForBook(bookId) {
  return state.knowledgePoints.filter((point) => point.bookId === bookId);
}

function chunkPoints(points, count) {
  const chunkSize = Math.max(1, Math.ceil(points.length / count));
  return Array.from({ length: count }, (_, index) => points.slice(index * chunkSize, (index + 1) * chunkSize));
}

function sectionsForBook(book) {
  if (!book) return [];
  const deepGuide = bookDeepGuides[book.id];
  if (deepGuide) return deepGuide.sections;

  const guide = guideForBook(book);
  const bookPoints = pointsForBook(book.id);
  const chunks = chunkPoints(bookPoints, guide.steps.length);
  return guide.steps.map((step, index) => ({
    id: `${book.id}-section-${index + 1}`,
    title: `第 ${index + 1} 章：${step}`,
    plainTitle: step,
    summary: index === 0 ? guide.entry : "这一章把相关知识点连成一条线，先理解主问题，再回到具体概念。",
    pointIds: chunks[index].map((point) => point.id),
    checkpoint: `看完这一章，试着用自己的话解释：${step} 为什么重要？`
  }));
}

function sectionById(bookId, sectionId) {
  return sectionsForBook(bookById(bookId)).find((section) => section.id === sectionId);
}

function firstSectionForBook(bookId) {
  return sectionsForBook(bookById(bookId))[0];
}

function sectionForPoint(bookId, pointId) {
  return sectionsForBook(bookById(bookId)).find((section) => section.pointIds.includes(pointId));
}

function setSelectedBook(bookId) {
  state.selectedBookId = bookId;
  const firstSection = firstSectionForBook(bookId);
  state.selectedSectionId = firstSection?.id || "";
  state.selectedPointId = firstSection?.pointIds.find((pointId) => pointById(pointId)) || pointsForBook(bookId)[0]?.id || "";
}

function filteredBooks() {
  const q = normalize(state.query);
  return state.books.filter((book) => {
    const themeName = themeById(book.themeId)?.name || "";
    const matchesTheme = state.themeId === "all" || book.themeId === state.themeId;
    const haystack = normalize([book.title, book.author, book.summary, book.audience, themeName].join(" "));
    return matchesTheme && (!q || haystack.includes(q));
  });
}

function filteredPoints() {
  const q = normalize(state.query);
  return state.knowledgePoints.filter((point) => {
    const book = bookById(point.bookId);
    const themeName = themeById(point.themeId)?.name || "";
    const matchesTheme = state.themeId === "all" || point.themeId === state.themeId;
    const matchesBook = !state.selectedBookId || point.bookId === state.selectedBookId;
    const haystack = normalize(
      [
        point.title,
        point.explanation,
        point.application,
        point.misconception,
        point.sourceBook,
        point.sourceNote,
        point.tags.join(" "),
        book?.author || "",
        themeName
      ].join(" ")
    );
    return matchesTheme && matchesBook && (!q || haystack.includes(q));
  });
}

function scoreKnowledgePoint(point, query) {
  const normalizedQuery = normalize(query);
  const book = bookById(point.bookId);
  const haystack = normalize(
    [
      point.title,
      point.explanation,
      point.application,
      point.misconception,
      point.sourceBook,
      point.sourceNote,
      point.tags.join(" "),
      book?.author || "",
      book?.summary || ""
    ].join(" ")
  );

  let score = 0;
  if (haystack.includes(normalizedQuery)) score += 20;

  for (const tag of point.tags) {
    const normalizedTag = normalize(tag);
    if (normalizedQuery.includes(normalizedTag) || normalizedTag.includes(normalizedQuery)) score += 10;
  }

  for (const token of query.split(/[\s，。！？、,.!?]+/).filter(Boolean)) {
    const normalizedToken = normalize(token);
    if (normalizedToken.length >= 2 && haystack.includes(normalizedToken)) score += 3;
  }

  return score;
}

function findRelevantKnowledge(query, limit = 6) {
  return state.knowledgePoints
    .map((point) => ({ point, score: scoreKnowledgePoint(point, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.point);
}

function localAsk(question) {
  const matches = findRelevantKnowledge(question, 6);
  const advicePattern = /买哪|卖哪|荐股|推荐.*股票|明天.*买|目标价|预测.*涨跌|能不能买|该不该买|仓位|满仓|杠杆|收益率|翻倍/;

  if (advicePattern.test(question)) {
    return {
      answer:
        "这个问题涉及具体买卖、仓位或收益判断，已经超出知识库的学习范围。知投只能基于经典书籍解释概念和框架，不提供任何投资建议。",
      citations: matches
    };
  }

  if (matches.length === 0) {
    return {
      answer: "知识库暂无足够依据回答这个问题。你可以换成概念类问题，例如“什么是安全边际？”或“指数投资为什么强调低成本？”。",
      citations: []
    };
  }

  return {
    answer:
      "当前是 GitHub Pages 静态演示版，暂时不能调用 AI 模型。我先基于本地知识库为你找到相关卡片；部署后端并配置 KIMI_API_KEY、DEEPSEEK_API_KEY 或 OPENAI_API_KEY 后，就能恢复完整 AI 问答。",
    citations: matches
  };
}

function selectTheme(themeId) {
  state.themeId = themeId;
  const nextBook = state.books.find((book) => themeId === "all" || book.themeId === themeId);
  if (nextBook) {
    setSelectedBook(nextBook.id);
  }
  render();
}

function applyRecommendation(themeId) {
  const firstBook = state.books.find((book) => book.themeId === themeId);
  if (!firstBook) return;
  state.themeId = themeId;
  setSelectedBook(firstBook.id);
  render();
}

function selectBook(bookId) {
  setSelectedBook(bookId);
  render();
}

function selectPoint(pointId) {
  state.selectedPointId = pointId;
  const point = pointById(pointId);
  if (point) {
    state.selectedBookId = point.bookId;
    state.selectedSectionId = sectionForPoint(point.bookId, point.id)?.id || state.selectedSectionId;
  }
  render();
}

function selectSection(sectionId) {
  state.selectedSectionId = sectionId;
  const section = sectionById(state.selectedBookId, sectionId);
  state.selectedPointId = section?.pointIds.find((pointId) => pointById(pointId)) || state.selectedPointId;
  render();
}

function toggleMastered(pointId) {
  if (state.masteredIds.has(pointId)) {
    state.masteredIds.delete(pointId);
  } else {
    state.masteredIds.add(pointId);
  }
  saveMasteredIds();
  render();
}

function movePoint(step) {
  const points = filteredPoints();
  if (points.length === 0) return;
  const currentIndex = Math.max(0, points.findIndex((point) => point.id === state.selectedPointId));
  const nextPoint = points[(currentIndex + step + points.length) % points.length];
  selectPoint(nextPoint.id);
}

function selectRandomPoint() {
  const points = filteredPoints();
  if (points.length === 0) return;
  const nextPoint = points[Math.floor(Math.random() * points.length)];
  selectPoint(nextPoint.id);
}

function askAboutPoint(point) {
  els.questionInput.value = `请用小白能听懂的方式解释“${point.title}”，并说明它来自哪本书。`;
  document.querySelector(".ask-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  els.questionInput.focus();
}

function termsForPoint(point) {
  const haystack = [point.title, point.explanation, point.application, point.misconception, point.tags.join(" ")].join(" ");
  const matched = glossaryTerms.filter((item) => haystack.includes(item.term)).map((item) => item.term);
  const fallback = themeDefaults[point.themeId] || [];
  return [...new Set([...matched, ...fallback])].map(glossaryByTerm).filter(Boolean).slice(0, 5);
}

function renderWithTerms(text) {
  const sortedTerms = glossaryTerms
    .map((item) => item.term)
    .sort((a, b) => b.length - a.length);
  let output = "";
  let index = 0;

  while (index < text.length) {
    const matched = sortedTerms.find((term) => text.startsWith(term, index));
    if (matched) {
      output += `<button class="term-inline" data-term="${escapeHtml(matched)}" type="button">${escapeHtml(matched)}</button>`;
      index += matched.length;
    } else {
      output += escapeHtml(text[index]);
      index += 1;
    }
  }

  return output.replace(new RegExp(escapeRegExp("\n"), "g"), "<br />");
}

function renderBeginnerBlock(point) {
  return `
    <section class="beginner-card" aria-label="小白解释">
      <div>
        <span class="mini-label">小白版</span>
        <p>先把它当成一个决策提醒：${escapeHtml(point.application)}</p>
      </div>
      <div>
        <span class="mini-label">生活类比</span>
        <p>${escapeHtml(themeAnalogies[point.themeId] || "把抽象概念换成生活问题，会更容易判断自己是否真的理解。")}</p>
      </div>
      <div>
        <span class="mini-label">问问自己</span>
        <p>${escapeHtml(themeChecks[point.themeId] || "我能不能用自己的话解释它，并说出一个反例？")}</p>
      </div>
    </section>
  `;
}

function renderGlossary(point) {
  const terms = termsForPoint(point);
  return `
    <section class="term-glossary" aria-label="术语速查">
      <h4>别怕，这些词可以这样理解</h4>
      <div class="term-list">
        ${terms
          .map(
            (item) => `
              <button data-term="${escapeHtml(item.term)}" type="button">
                <strong>${escapeHtml(item.term)}</strong>
                <span>${escapeHtml(item.plain)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div id="term-help" class="term-help hidden"></div>
    </section>
  `;
}

function showTerm(term) {
  const item = glossaryByTerm(term);
  const target = document.querySelector("#term-help");
  if (!item || !target) return;
  target.classList.remove("hidden");
  target.innerHTML = `
    <strong>${escapeHtml(item.term)}</strong>
    <p>${escapeHtml(item.plain)}</p>
    <small>${escapeHtml(item.example)}</small>
  `;
}

function renderThemes() {
  const buttons = [
    `<button class="${state.themeId === "all" ? "active" : ""}" data-theme="all" type="button">全部</button>`,
    ...state.themes.map(
      (theme) =>
        `<button class="${state.themeId === theme.id ? "active" : ""}" data-theme="${escapeHtml(theme.id)}" type="button">${escapeHtml(theme.name)}</button>`
    )
  ];
  els.themeTabs.innerHTML = buttons.join("");
  els.themeTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => selectTheme(button.dataset.theme));
  });
}

function renderBooks() {
  const books = filteredBooks();
  els.bookList.innerHTML = books
    .map(
      (book) => `
        <button class="book-row ${state.selectedBookId === book.id ? "selected" : ""}" data-book="${escapeHtml(book.id)}" type="button">
          <span>${escapeHtml(book.title)}</span>
          <small>${escapeHtml(book.author)}</small>
        </button>
      `
    )
    .join("");
  els.bookList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => selectBook(button.dataset.book));
  });
}

function renderBookHero() {
  const book = bookById(state.selectedBookId) || filteredBooks()[0] || state.books[0];
  if (!book) return;
  const theme = themeById(book.themeId);
  const guide = guideForBook(book);
  const deepGuide = bookDeepGuides[book.id];
  const heroSteps = deepGuide ? deepGuide.sections.map((section) => section.plainTitle) : guide.steps;
  els.bookHero.innerHTML = `
    <div class="book-overview">
      <p class="eyebrow">${escapeHtml(theme?.name || "")}</p>
      <h2>${escapeHtml(book.title)}</h2>
      <p>${escapeHtml(deepGuide?.oneLine || book.summary)}</p>
    </div>
    <div class="meta-box">
      <span>${escapeHtml(book.difficulty)}</span>
      <span>${escapeHtml(book.audience)}</span>
    </div>
    <section class="book-guide ${deepGuide ? "book-guide-deep" : ""}" aria-label="书籍导读">
      <div>
        <span class="mini-label">${deepGuide ? "这本书到底在讲什么" : "这本书先解决"}</span>
        <h3>${escapeHtml(guide.question)}</h3>
        <p>${escapeHtml(deepGuide?.problem || guide.entry)}</p>
      </div>
      <ol class="guide-steps">
        ${heroSteps.map((step, index) => `<li><strong>${index + 1}</strong><span>${escapeHtml(step)}</span></li>`).join("")}
      </ol>
    </section>
    ${
      deepGuide
        ? `
          <section class="book-story" aria-label="小白故事版导读">
            <span class="mini-label">小白故事版导读</span>
            <p>${escapeHtml(deepGuide.story)}</p>
          </section>
          <section class="book-takeaways" aria-label="读完应该明白什么">
            <span class="mini-label">读完这本书，你应该明白</span>
            <ul>${deepGuide.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>
        `
        : ""
    }
  `;
}

function renderPoints() {
  const currentBook = bookById(state.selectedBookId);
  if (!currentBook) return;

  const matchingPointIds = new Set(filteredPoints().map((point) => point.id));
  const allSections = sectionsForBook(currentBook);
  const visibleSections = state.query
    ? allSections.filter((section) => section.pointIds.some((pointId) => matchingPointIds.has(pointId)))
    : allSections;
  const sections = visibleSections.length > 0 ? visibleSections : allSections;
  const selectedSection = sections.find((section) => section.id === state.selectedSectionId) || sections[0];

  if (!selectedSection) {
    els.pointList.innerHTML = `<p class="empty-state">这本书还没有整理章节。</p>`;
    els.pointDetail.innerHTML = "";
    return;
  }

  state.selectedSectionId = selectedSection.id;
  const sectionPoints = selectedSection.pointIds.map(pointById).filter(Boolean);
  const visibleSectionPoints = state.query ? sectionPoints.filter((point) => matchingPointIds.has(point.id)) : sectionPoints;
  const displayPoints = visibleSectionPoints.length > 0 ? visibleSectionPoints : sectionPoints;

  if (!displayPoints.some((point) => point.id === state.selectedPointId)) {
    state.selectedPointId = displayPoints[0]?.id || "";
  }

  els.pointList.innerHTML = `
    <div class="learning-map-head">
      <span>本书阅读地图</span>
      <small>${escapeHtml(currentBook.title)}｜先看章节主线，再看知识点</small>
    </div>
    ${sections
      .map((section, index) => {
        const points = section.pointIds.map(pointById).filter(Boolean);
        const masteredCount = points.filter((point) => state.masteredIds.has(point.id)).length;
        return `
          <button class="section-row ${selectedSection.id === section.id ? "selected" : ""}" data-section="${escapeHtml(section.id)}" type="button">
            <strong>${index + 1}</strong>
            <span>${escapeHtml(section.plainTitle || section.title)}</span>
            <small>${escapeHtml(section.title)}｜${masteredCount}/${points.length} 已掌握</small>
          </button>
        `;
      })
      .join("")}
  `;

  els.pointList.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => selectSection(button.dataset.section));
  });

  const selectedPoint = pointById(state.selectedPointId) || displayPoints[0];
  if (!selectedPoint) return;
  const isMastered = state.masteredIds.has(selectedPoint.id);
  const conceptTranslation = conceptTranslationForPoint(selectedPoint);
  const deepGuide = bookDeepGuides[currentBook.id];
  els.pointDetail.innerHTML = `
    <section class="section-detail" aria-label="当前章节">
      <div class="section-intro">
        <span class="mini-label">当前章节</span>
        <h3>${escapeHtml(selectedSection.title)}</h3>
        <p class="section-plain">${escapeHtml(selectedSection.plainTitle || "")}</p>
        <p>${escapeHtml(selectedSection.summary)}</p>
        <div class="section-check">
          <strong>读完自测</strong>
          <span>${escapeHtml(selectedSection.checkpoint)}</span>
        </div>
      </div>
      <div class="section-cards" aria-label="本章知识点">
        ${displayPoints
          .map(
            (point) => `
              <button class="section-point-card ${state.selectedPointId === point.id ? "selected" : ""} ${state.masteredIds.has(point.id) ? "mastered" : ""}" data-point="${escapeHtml(point.id)}" type="button">
                <span>${state.masteredIds.has(point.id) ? "✓ " : ""}${escapeHtml(conceptTranslationForPoint(point) || point.title)}</span>
                <small>${escapeHtml(point.title)}｜${escapeHtml(point.tags.slice(0, 2).join(" / "))}</small>
              </button>
            `
          )
          .join("")}
      </div>
    </section>

    <article class="knowledge-detail-card" aria-label="知识点解释">
      <div class="detail-heading">
        <span aria-hidden="true">▤</span>
        <div>
          <span class="mini-label">本章知识点</span>
          <h3>${escapeHtml(selectedPoint.title)}</h3>
          ${conceptTranslation ? `<p class="concept-translation">小白翻译：${escapeHtml(conceptTranslation)}</p>` : ""}
          <p>${escapeHtml(selectedPoint.sourceBook)}｜${escapeHtml(selectedPoint.sourceNote)}</p>
        </div>
      </div>
      ${renderBeginnerBlock(selectedPoint)}
      <dl>
        <div><dt>这句话在讲什么</dt><dd>${renderWithTerms(selectedPoint.explanation)}</dd></div>
        <div><dt>什么时候会用到</dt><dd>${renderWithTerms(selectedPoint.application)}</dd></div>
        <div><dt>新手最容易误会</dt><dd>${renderWithTerms(selectedPoint.misconception)}</dd></div>
      </dl>
      ${renderGlossary(selectedPoint)}
      <div class="tag-row">${selectedPoint.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="${isMastered ? "active" : ""}" data-action="mastered" type="button">${isMastered ? "已掌握，取消标记" : "标记为已掌握"}</button>
        <button data-action="next" type="button">下一张</button>
        <button data-action="random" type="button">随机知识点</button>
        <button data-action="ask" type="button">让 AI 解释这张</button>
      </div>
    </article>

    ${
      deepGuide
        ? `<section class="book-final-questions" aria-label="整本书自测问题">
            <span class="mini-label">读完这本书，你能回答这些问题吗</span>
            <ol>${deepGuide.finalQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
          </section>`
        : ""
    }
  `;

  els.pointDetail.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => selectSection(button.dataset.section));
  });
  els.pointDetail.querySelectorAll("[data-point]").forEach((button) => {
    button.addEventListener("click", () => selectPoint(button.dataset.point));
  });
  els.pointDetail.querySelectorAll("[data-term]").forEach((button) => {
    button.addEventListener("click", () => showTerm(button.dataset.term));
  });
  els.pointDetail.querySelector('[data-action="mastered"]')?.addEventListener("click", () => toggleMastered(selectedPoint.id));
  els.pointDetail.querySelector('[data-action="next"]')?.addEventListener("click", () => movePoint(1));
  els.pointDetail.querySelector('[data-action="random"]')?.addEventListener("click", selectRandomPoint);
  els.pointDetail.querySelector('[data-action="ask"]')?.addEventListener("click", () => askAboutPoint(selectedPoint));
}

function render() {
  els.bookCount.textContent = state.books.length;
  els.pointCount.textContent = state.knowledgePoints.length;
  els.themeCount.textContent = state.themes.length;
  els.masteredCount.textContent = `${state.masteredIds.size}/${state.knowledgePoints.length}`;
  renderThemes();
  renderBooks();
  renderBookHero();
  renderPoints();
  renderRecommendation();
}

function showQuizStep() {
  saveIntroSeen();
  els.introPanel?.classList.add("hidden");
  els.quizForm.classList.remove("hidden");
  els.quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeIntro() {
  saveIntroSeen();
  els.quizModal.classList.add("hidden");
  els.introPanel?.classList.add("hidden");
}

function openIntro() {
  renderIntro();
  renderQuiz();
  els.quizModal.classList.remove("hidden");
  els.introPanel?.classList.remove("hidden");
  els.quizForm.classList.add("hidden");
}

function renderIntro() {
  if (!els.introPanel) return;
  els.introPanel.innerHTML = `
    <section class="intro-panel-content" aria-label="金融市场小白先修课">
      <div class="intro-lead">
        <span class="mini-label">完全小白先看这里</span>
        <h3>不用先懂股票术语，先建立 4 个最小概念</h3>
        <p>看完这一步，再做测试就不会像在答专业考试。你只需要先知道：市场里交易的是资产，价格会波动，风险来自不确定性，经典书是在帮你建立判断框架。</p>
      </div>
      <div class="intro-steps">
        ${marketIntroSteps
          .map(
            (step) => `
              <article>
                <h4>${escapeHtml(step.title)}</h4>
                <p>${escapeHtml(step.body)}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="intro-actions">
        <button class="intro-start" data-intro-action="start" type="button">我大概懂了，开始测试</button>
        <button class="intro-skip" data-intro-action="start" type="button">我已经懂一点，直接测</button>
        <button class="intro-close" data-intro-action="close" type="button">先逛逛网站</button>
      </div>
    </section>
  `;
  els.introPanel.querySelectorAll("[data-intro-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.introAction === "close") {
        closeIntro();
      } else {
        showQuizStep();
      }
    });
  });
}

function renderQuiz() {
  els.quizForm.innerHTML = `
    ${quizQuestions
      .map(
        (question, index) => `
          <fieldset class="quiz-question">
            <legend>${index + 1}. ${escapeHtml(question.question)}</legend>
            <div class="quiz-options">
              ${question.options
                .map(
                  (option, optionIndex) => `
                    <label>
                      <input type="radio" name="${escapeHtml(question.id)}" value="${optionIndex}" ${optionIndex === 0 ? "required" : ""} />
                      <span>${escapeHtml(option.label)}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </fieldset>
        `
      )
      .join("")}
    <button class="quiz-submit" type="submit">生成我的入门学习路线</button>
  `;
}

function calculateQuizResult(formData) {
  const scores = Object.fromEntries(state.themes.map((theme) => [theme.id, 0]));

  for (const question of quizQuestions) {
    const selectedIndex = Number(formData.get(question.id));
    const selected = question.options[selectedIndex];
    if (!selected) continue;
    for (const [themeId, score] of Object.entries(selected.scores)) {
      scores[themeId] = (scores[themeId] || 0) + score;
    }
  }

  const rankedThemeIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([themeId]) => themeId);

  return {
    primaryThemeId: rankedThemeIds[0],
    secondaryThemeIds: rankedThemeIds.slice(1, 3),
    scores
  };
}

function saveQuizResult(result) {
  state.quizResult = result;
  localStorage.setItem("zhitou.quizResult", JSON.stringify(result));
}

function loadQuizResult() {
  try {
    const raw = localStorage.getItem("zhitou.quizResult");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function showQuizIfNeeded() {
  renderIntro();
  renderQuiz();
  state.quizResult = loadQuizResult();
  state.introSeen = loadIntroSeen();
  if (!state.quizResult) {
    els.quizModal.classList.remove("hidden");
    els.introPanel?.classList.toggle("hidden", state.introSeen);
    els.quizForm.classList.toggle("hidden", !state.introSeen);
    return;
  }
  applyRecommendation(state.quizResult.primaryThemeId);
}

function renderRecommendation() {
  if (!state.quizResult) {
    els.recommendationPanel.classList.add("hidden");
    els.recommendationPanel.innerHTML = "";
    return;
  }

  const primaryAdvice = themeAdvice[state.quizResult.primaryThemeId];
  const primaryTheme = themeById(state.quizResult.primaryThemeId);
  const secondaryThemes = state.quizResult.secondaryThemeIds.map(themeById).filter(Boolean);
  const recommendedBooks = primaryAdvice.bookIds.map(bookById).filter(Boolean);

  els.recommendationPanel.classList.remove("hidden");
  els.recommendationPanel.innerHTML = `
    <div>
      <p class="eyebrow">你的入门路线：${escapeHtml(primaryAdvice.code)}</p>
      <h2>${escapeHtml(primaryAdvice.title)}</h2>
      <p>${escapeHtml(primaryAdvice.reason)}</p>
      <div class="route-tags">
        <span>适配流派：${escapeHtml(primaryTheme?.name || "")}</span>
        ${secondaryThemes.map((theme) => `<span>可补充：${escapeHtml(theme.name)}</span>`).join("")}
      </div>
    </div>
    <div class="recommended-books">
      ${recommendedBooks
        .map(
          (book) => `
            <button data-book="${escapeHtml(book.id)}" type="button">
              <strong>${escapeHtml(book.title)}</strong>
              <small>${escapeHtml(book.author)}｜${escapeHtml(book.difficulty)}</small>
            </button>
          `
        )
        .join("")}
      <button class="secondary-action" id="retake-quiz" type="button">重新测路线</button>
    </div>
  `;

  els.recommendationPanel.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => {
      selectBook(button.dataset.book);
      document.querySelector(".workspace-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  els.recommendationPanel.querySelector("#retake-quiz")?.addEventListener("click", () => {
    renderQuiz();
    els.introPanel?.classList.add("hidden");
    els.quizForm.classList.remove("hidden");
    els.quizModal.classList.remove("hidden");
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function setImportStatus(message, type = "working") {
  els.importStatus.className = `import-status ${type}`;
  els.importStatus.innerHTML = `<span aria-hidden="true">${type === "error" ? "!" : type === "success" ? "✓" : "⋯"}</span><p>${escapeHtml(message)}</p>`;
}

function resetImport() {
  state.importFile = null;
  state.importedGuide = null;
  state.importedChapterId = "";
  els.bookFile.value = "";
  els.bookFileInfo.classList.add("hidden");
  els.bookFileInfo.innerHTML = "";
  els.generateGuide.disabled = true;
  els.generateGuide.textContent = "开始生成通俗解读";
  els.importStatus.className = "import-status hidden";
  els.importStatus.innerHTML = "";
  els.importSetup.classList.remove("hidden");
  els.importResult.classList.add("hidden");
  renderImportShelf();
}

function openImport() {
  renderImportShelf();
  els.importModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeImport() {
  els.importModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function chooseImportFile(file) {
  if (!file) return;
  const extension = file.name.split(".").pop()?.toLowerCase();
  const supported = ["pdf", "doc", "docx", "txt", "md", "epub", "mobi"];

  if (!supported.includes(extension)) {
    state.importFile = null;
    els.generateGuide.disabled = true;
    setImportStatus("目前支持 PDF、DOC、DOCX、TXT、Markdown、EPUB 和 MOBI 文件。", "error");
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    state.importFile = null;
    els.generateGuide.disabled = true;
    setImportStatus("文件超过 20MB，请先压缩或拆分后再上传。", "error");
    return;
  }

  state.importFile = file;
  els.bookFileInfo.classList.remove("hidden");
  els.bookFileInfo.innerHTML = `
    <span aria-hidden="true">▤</span>
    <div><strong>${escapeHtml(file.name)}</strong><small>${escapeHtml(formatFileSize(file.size))}｜文件只用于本次生成</small></div>
  `;
  els.generateGuide.disabled = false;
  els.importStatus.className = "import-status hidden";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("无法读取这个文件。"));
    reader.readAsDataURL(file);
  });
}

function extractLocalHeadings(text, fileName) {
  const lines = text.replace(/\r/g, "").split("\n");
  const headings = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => /^#{1,3}\s+\S+/.test(line) || /^第[一二三四五六七八九十百0-9]+[章节篇部]\s*\S*/.test(line))
    .map(({ line, index }) => ({ title: line.replace(/^#{1,3}\s+/, "").trim(), index }));

  if (headings.length === 0) {
    return [{ title: fileName.replace(/\.[^.]+$/, ""), length: text.length }];
  }

  return headings.slice(0, 12).map((heading, index) => {
    const next = headings[index + 1]?.index ?? lines.length;
    return { title: heading.title, length: lines.slice(heading.index + 1, next).join("\n").trim().length };
  });
}

async function createLocalStructurePreview(file) {
  const text = await file.text();
  const sections = extractLocalHeadings(text, file.name);
  const title = file.name.replace(/\.[^.]+$/, "");
  return {
    book: {
      title,
      author: "本地预览未识别",
      oneLine: "已识别文件结构；连接 AI 后端后可生成完整的全书主线和通俗解读。",
      suitableFor: els.readingLevel.value,
      difficulty: "入门"
    },
    overview: {
      coreQuestion: "这本书试图解决什么问题，需要 AI 阅读正文后确认。",
      mainThesis: "当前为静态站本地结构预览，没有把原文发送到任何服务器。",
      beforeReading: ["先查看下方识别出的章节是否完整", "完整解读需要站点管理员启用 AI 后端"],
      readingPath: sections.map((section) => section.title)
    },
    chapters: sections.map((section, index) => ({
      id: `local-${index + 1}`,
      sourceTitle: section.title,
      plainTitle: `这一部分在谈：${section.title}`,
      summary: `已识别到约 ${section.length} 字正文。静态预览不会擅自猜测作者观点。`,
      lifeExample: "连接 AI 后端后，这里会补充一个与本章概念对应的生活化例子。",
      sourceNote: `本地识别：${section.title}`,
      keyPoints: [
        {
          title: "等待正文解读",
          plainExplanation: "当前只完成章节识别，尚未对正文进行语义归纳。",
          whenUseful: "可先确认目录结构是否正确。",
          misconception: "不要把章节标题当成作者完整观点。"
        }
      ],
      terms: [],
      checkpoint: "这一章的标题是否与原书目录一致？"
    })),
    closing: {
      whatChanged: ["已把文件整理为可继续处理的章节结构"],
      nextSteps: ["部署 Node 后端并配置 KIMI_API_KEY、DEEPSEEK_API_KEY 或 OPENAI_API_KEY", "重新上传后生成完整解读"],
      disclaimer: "这是本地结构预览，不是对原书内容的完整解读，也不构成投资建议。"
    },
    quality: {
      sourceConfidence: sections.length > 1 ? "中" : "低",
      warnings: ["当前站点未连接 AI 书籍解读服务，仅展示本地识别的目录结构。"]
    }
  };
}

function renderImportedOverview(guide) {
  const overview = guide.overview || {};
  return `
    <section class="import-overview">
      <p class="eyebrow">先看全书地图</p>
      <h3>${escapeHtml(overview.coreQuestion || "这本书在解决什么问题？")}</h3>
      <p class="import-main-thesis">${escapeHtml(overview.mainThesis || "")}</p>
      <div class="import-overview-grid">
        <div>
          <span class="mini-label">阅读前先知道</span>
          <ul>${(overview.beforeReading || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <span class="mini-label">建议阅读顺序</span>
          <ol>${(overview.readingPath || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        </div>
      </div>
      ${(guide.quality?.warnings || []).length ? `<div class="guide-warning"><strong>识别提醒</strong><p>${guide.quality.warnings.map(escapeHtml).join("；")}</p></div>` : ""}
    </section>
  `;
}

function renderImportedChapter(guide, chapter) {
  if (!chapter) return renderImportedOverview(guide);
  return `
    <section class="import-chapter-view">
      <p class="eyebrow">${escapeHtml(chapter.sourceTitle || "章节")}</p>
      <h3>${escapeHtml(chapter.plainTitle || chapter.sourceTitle || "本章解读")}</h3>
      <p class="chapter-summary">${escapeHtml(chapter.summary || "")}</p>
      <div class="life-example"><span class="mini-label">生活里怎么理解</span><p>${escapeHtml(chapter.lifeExample || "")}</p></div>
      <div class="import-key-points">
        ${(chapter.keyPoints || [])
          .map(
            (point, index) => `
              <section>
                <span class="point-number">${index + 1}</span>
                <h4>${escapeHtml(point.title || "关键点")}</h4>
                <p>${escapeHtml(point.plainExplanation || "")}</p>
                <dl>
                  <div><dt>什么时候有用</dt><dd>${escapeHtml(point.whenUseful || "")}</dd></div>
                  <div><dt>最容易误会</dt><dd>${escapeHtml(point.misconception || "")}</dd></div>
                </dl>
              </section>
            `
          )
          .join("")}
      </div>
      ${(chapter.terms || []).length ? `
        <section class="import-terms">
          <h4>本章黑话翻译</h4>
          ${(chapter.terms || []).map((term) => `<div><strong>${escapeHtml(term.term)}</strong><p>${escapeHtml(term.plainMeaning)}</p><small>可以类比成：${escapeHtml(term.analogy)}</small></div>`).join("")}
        </section>` : ""}
      <div class="chapter-checkpoint"><span class="mini-label">读完问自己</span><p>${escapeHtml(chapter.checkpoint || "")}</p></div>
      <p class="source-note">来源定位：${escapeHtml(chapter.sourceNote || "文件章节未确认")}</p>
    </section>
  `;
}

function selectImportedChapter(chapterId) {
  state.importedChapterId = chapterId;
  const guide = state.importedGuide;
  if (!guide) return;
  els.importChapters.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.importChapter === chapterId);
  });
  const chapter = chapterId === "overview" ? null : (guide.chapters || []).find((item) => item.id === chapterId);
  els.importChapterDetail.innerHTML = renderImportedChapter(guide, chapter);
}

function renderImportedGuide(guide) {
  state.importedGuide = guide;
  state.importedChapterId = "overview";
  els.saveGuide.textContent = "保存到我的书架";
  els.importSetup.classList.add("hidden");
  els.importResult.classList.remove("hidden");
  els.importResultHead.innerHTML = `
    <div>
      <p class="eyebrow">生成完成｜来源可信度 ${escapeHtml(guide.quality?.sourceConfidence || "未标注")}</p>
      <h2>${escapeHtml(guide.book?.title || "未命名书籍")}</h2>
      <p>${escapeHtml(guide.book?.oneLine || "")}</p>
    </div>
    <div class="guide-meta">
      <span>${escapeHtml(guide.book?.author || "作者未注明")}</span>
      <span>${escapeHtml(guide.book?.difficulty || "入门")}</span>
      <span>${escapeHtml(guide.book?.suitableFor || "普通读者")}</span>
    </div>
  `;
  els.importChapters.innerHTML = `
    <button class="active" data-import-chapter="overview" type="button"><strong>全书地图</strong><small>先知道这本书要带你去哪</small></button>
    ${(guide.chapters || [])
      .map((chapter, index) => `<button data-import-chapter="${escapeHtml(chapter.id)}" type="button"><span>${index + 1}</span><strong>${escapeHtml(chapter.plainTitle || chapter.sourceTitle)}</strong><small>${escapeHtml(chapter.sourceTitle || "")}</small></button>`)
      .join("")}
  `;
  els.importChapters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => selectImportedChapter(button.dataset.importChapter));
  });
  selectImportedChapter("overview");
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForImportJob(jobId) {
  const deadline = Date.now() + 10 * 60 * 1000;
  let lastMessage = "";

  while (Date.now() < deadline) {
    const response = await fetch(`/api/import-book/${encodeURIComponent(jobId)}`, { cache: "no-store" });
    const job = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(job.error || "无法读取书籍处理进度。");

    if (job.status === "complete" && job.guide) return job;
    if (job.status === "failed") throw new Error(job.message || "书籍解读失败，请稍后重试。");
    if (job.message && job.message !== lastMessage) {
      lastMessage = job.message;
      setImportStatus(job.message, "working");
    }
    await wait(2_000);
  }

  throw new Error("这本书处理时间较长，任务已等待超过 10 分钟。请稍后重新尝试。 ");
}

async function generateImportedGuide() {
  const file = state.importFile;
  if (!file) return;
  els.generateGuide.disabled = true;
  els.generateGuide.textContent = "正在阅读整本书…";
  setImportStatus("正在识别目录和全书主线，较长的书可能需要一两分钟。", "working");

  try {
    const fileData = await fileToDataUrl(file);
    const response = await fetch("/api/import-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        fileData,
        readingLevel: els.readingLevel.value,
        userGoal: els.readingGoal.value.trim()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "当前站点还没有启用书籍解读后端。");
    const result = data.jobId ? await waitForImportJob(data.jobId) : data;
    setImportStatus("解读完成，正在整理阅读路线。", "success");
    renderImportedGuide(result.guide);
  } catch (error) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (["txt", "md"].includes(extension)) {
      const preview = await createLocalStructurePreview(file);
      renderImportedGuide(preview);
      return;
    }
    const staticHint = location.hostname.endsWith("github.io")
      ? " 当前 GitHub Pages 是静态版，请使用知投的 Hugging Face 公网地址导入完整书籍。"
      : "";
    setImportStatus(`${error.message || "生成失败。"}${staticHint}`, "error");
  } finally {
    els.generateGuide.disabled = false;
    els.generateGuide.textContent = "开始生成通俗解读";
  }
}

function downloadImportedGuide() {
  const guide = state.importedGuide;
  if (!guide) return;
  const blob = new Blob([JSON.stringify(guide, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTitle = String(guide.book?.title || "book-guide").replace(/[\\/:*?"<>|]/g, "-");
  link.href = url;
  link.download = `${safeTitle}-知投解读.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function loadImportShelf() {
  try {
    const saved = JSON.parse(localStorage.getItem("zhitou.importShelf") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeImportShelf(items) {
  localStorage.setItem("zhitou.importShelf", JSON.stringify(items.slice(0, 6)));
}

function renderImportShelf() {
  const items = loadImportShelf();
  els.importShelf.classList.toggle("hidden", items.length === 0);
  els.importShelfList.innerHTML = items
    .map(
      (item) => `
        <div class="shelf-book">
          <button data-shelf-open="${escapeHtml(item.id)}" type="button">
            <strong>${escapeHtml(item.guide?.book?.title || "未命名书籍")}</strong>
            <small>${escapeHtml(item.guide?.book?.oneLine || "")}</small>
          </button>
          <button class="shelf-remove" data-shelf-remove="${escapeHtml(item.id)}" type="button" aria-label="从书架移除 ${escapeHtml(item.guide?.book?.title || "这本书")}" title="从书架移除">×</button>
        </div>
      `
    )
    .join("");
  els.importShelfList.querySelectorAll("[data-shelf-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const saved = loadImportShelf().find((item) => item.id === button.dataset.shelfOpen);
      if (saved?.guide) renderImportedGuide(saved.guide);
    });
  });
  els.importShelfList.querySelectorAll("[data-shelf-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      writeImportShelf(loadImportShelf().filter((item) => item.id !== button.dataset.shelfRemove));
      renderImportShelf();
    });
  });
}

function saveImportedGuide() {
  const guide = state.importedGuide;
  if (!guide) return;
  const title = guide.book?.title || "未命名书籍";
  const id = `${title}-${Date.now()}`;
  const existing = loadImportShelf().filter((item) => item.guide?.book?.title !== title);
  try {
    writeImportShelf([{ id, savedAt: new Date().toISOString(), guide }, ...existing]);
    els.saveGuide.textContent = "已保存到本机书架";
  } catch {
    els.saveGuide.textContent = "保存失败，请下载 JSON";
  }
}

function renderAskResult(data) {
  els.answerBox.innerHTML = `
    ${data.error ? `<p class="error-text">${escapeHtml(data.error)}</p>` : ""}
    <p>${escapeHtml(data.answer || "没有返回回答。")}</p>
  `;
  const citations = data.citations || [];
  els.citations.innerHTML = citations.length
    ? `<h3>引用来源</h3>${citations
        .map(
          (item) => `
            <button data-book="${escapeHtml(item.bookId)}" data-point="${escapeHtml(item.id)}" type="button">
              <span aria-hidden="true">✓</span>
              <span>${escapeHtml(item.title)}</span>
              <small>${escapeHtml(item.sourceBook)}</small>
            </button>
          `
        )
        .join("")}`
    : "";
  els.citations.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedBookId = button.dataset.book;
      state.selectedPointId = button.dataset.point;
      render();
    });
  });
}

async function ask() {
  const question = els.questionInput.value.trim();
  if (!question) return;

  els.askButton.disabled = true;
  els.askButton.querySelector("span:last-child").textContent = "生成中";
  els.answerBox.classList.remove("hidden");
  els.answerBox.innerHTML = "<p>正在检索知识库并生成回答...</p>";
  els.citations.innerHTML = "";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    if (!response.ok) throw new Error("AI API unavailable");
    const data = await response.json();
    renderAskResult(data);
  } catch {
    renderAskResult(localAsk(question));
  } finally {
    els.askButton.disabled = false;
    els.askButton.querySelector("span:last-child").textContent = "基于知识库回答";
  }
}

async function loadKnowledge() {
  try {
    const response = await fetch("/api/knowledge");
    if (response.ok) return await response.json();
  } catch {
    // Static hosting does not provide the API route; fall back to bundled JSON.
  }

  const staticResponse = await fetch("./knowledge.json");
  if (!staticResponse.ok) throw new Error("无法加载静态知识库数据。");
  return staticResponse.json();
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});
els.askButton.addEventListener("click", ask);
els.introOpen?.addEventListener("click", openIntro);
els.importOpen?.addEventListener("click", openImport);
els.importClose?.addEventListener("click", closeImport);
els.importRestart?.addEventListener("click", resetImport);
els.saveGuide?.addEventListener("click", saveImportedGuide);
els.downloadGuide?.addEventListener("click", downloadImportedGuide);
els.generateGuide?.addEventListener("click", generateImportedGuide);
els.bookFile?.addEventListener("change", (event) => chooseImportFile(event.target.files?.[0]));
els.bookDropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  els.bookDropzone.classList.add("dragging");
});
els.bookDropzone?.addEventListener("dragleave", () => els.bookDropzone.classList.remove("dragging"));
els.bookDropzone?.addEventListener("drop", (event) => {
  event.preventDefault();
  els.bookDropzone.classList.remove("dragging");
  chooseImportFile(event.dataTransfer?.files?.[0]);
});
els.importModal?.addEventListener("click", (event) => {
  if (event.target === els.importModal) closeImport();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.importModal?.classList.contains("hidden")) closeImport();
});
els.quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = calculateQuizResult(new FormData(els.quizForm));
  saveQuizResult(result);
  els.quizModal.classList.add("hidden");
  applyRecommendation(result.primaryThemeId);
});

const data = await loadKnowledge();
state.themes = data.themes;
state.books = data.books;
state.knowledgePoints = data.knowledgePoints;
state.masteredIds = loadMasteredIds();
state.introSeen = loadIntroSeen();
if (state.books[0]) setSelectedBook(state.books[0].id);
render();
showQuizIfNeeded();
