const state = {
  themes: [],
  books: [],
  knowledgePoints: [],
  query: "",
  themeId: "all",
  selectedBookId: "",
  selectedPointId: "",
  quizResult: null,
  masteredIds: new Set(),
  beginnerMode: true
};

const els = {
  bookCount: document.querySelector("#book-count"),
  pointCount: document.querySelector("#point-count"),
  themeCount: document.querySelector("#theme-count"),
  masteredCount: document.querySelector("#mastered-count"),
  searchInput: document.querySelector("#search-input"),
  beginnerToggle: document.querySelector("#beginner-toggle"),
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
  quizForm: document.querySelector("#quiz-form")
};

const quizQuestions = [
  {
    id: "risk",
    question: "你现在最想先解决的问题是什么？",
    options: [
      { label: "先别犯大错，理解风险和估值", scores: { value: 3, index: 2, behavior: 1 } },
      { label: "想找到长期增长的好公司", scores: { growth: 3, value: 1 } },
      { label: "想用简单方法长期配置资产", scores: { index: 3, psychology: 1 } },
      { label: "想理解市场波动和买卖节奏", scores: { technical: 2, macro: 2, behavior: 1 } }
    ]
  },
  {
    id: "effort",
    question: "你愿意投入多少时间研究单家公司？",
    options: [
      { label: "时间很少，更想要可执行的长期方案", scores: { index: 3, psychology: 2 } },
      { label: "愿意读财报和商业模式，但先从基础开始", scores: { value: 3, growth: 1 } },
      { label: "愿意深度调研行业、产品和管理层", scores: { growth: 3, value: 1 } },
      { label: "更喜欢用数据、规则和模型做验证", scores: { quant: 3, technical: 1 } }
    ]
  },
  {
    id: "horizon",
    question: "你的学习视角更接近哪一种？",
    options: [
      { label: "长期持有，重点看企业价值", scores: { value: 3, growth: 1 } },
      { label: "长期配置，重点看分散和成本", scores: { index: 3, psychology: 1 } },
      { label: "理解周期，重点看宏观环境和情绪", scores: { macro: 3, behavior: 1 } },
      { label: "识别趋势，重点看价格行为和规则", scores: { technical: 3, quant: 1 } }
    ]
  },
  {
    id: "weakness",
    question: "你最担心自己在哪方面出问题？",
    options: [
      { label: "追涨杀跌，被市场情绪带着走", scores: { behavior: 3, psychology: 2 } },
      { label: "看不懂估值，分不清便宜和陷阱", scores: { value: 3, macro: 1 } },
      { label: "选股太难，容易被热门故事吸引", scores: { index: 3, behavior: 1 } },
      { label: "没有纪律，交易规则经常变形", scores: { technical: 2, quant: 2, psychology: 1 } }
    ]
  },
  {
    id: "style",
    question: "你更喜欢哪种学习材料？",
    options: [
      { label: "经典原则和大师原典", scores: { value: 3, behavior: 1 } },
      { label: "案例、故事和容易坚持的习惯", scores: { psychology: 3, growth: 1 } },
      { label: "体系化框架和宏观解释", scores: { macro: 3, index: 1 } },
      { label: "方法、指标、模型和可验证规则", scores: { quant: 2, technical: 2 } }
    ]
  }
];

const themeAdvice = {
  value: {
    title: "价值投资路线",
    reason: "你适合先建立估值、风险控制和企业所有权视角，再慢慢学习公司研究。",
    bookIds: ["intelligent-investor", "buffett-letters"]
  },
  growth: {
    title: "成长投资路线",
    reason: "你更适合从行业空间、产品竞争力和管理层质量理解优秀公司的成长。",
    bookIds: ["common-stocks", "lynch-one-up"]
  },
  index: {
    title: "指数投资路线",
    reason: "你适合先用低成本、分散化和长期配置建立稳健的投资底座。",
    bookIds: ["random-walk", "common-sense-mutual-funds"]
  },
  technical: {
    title: "技术分析路线",
    reason: "你适合把价格行为当成观察工具，同时把风险收益比和交易纪律放在前面。",
    bookIds: ["market-technical-analysis"]
  },
  macro: {
    title: "宏观与周期路线",
    reason: "你适合从信用、估值、情绪和风险偏好理解市场所处的位置。",
    bookIds: ["cycles"]
  },
  behavior: {
    title: "行为金融路线",
    reason: "你适合优先识别认知偏误、损失厌恶和过度自信，减少情绪化决策。",
    bookIds: ["thinking-fast-slow", "psychology-of-money"]
  },
  quant: {
    title: "量化投资路线",
    reason: "你适合学习数据、回测、因子和规则化流程，但要先理解过拟合和交易成本。",
    bookIds: ["quant-black-box"]
  },
  psychology: {
    title: "心理与叙事路线",
    reason: "你适合从长期财富观、行为习惯和留有余地开始，先建立能坚持的系统。",
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

function loadBeginnerMode() {
  return localStorage.getItem("zhitou.beginnerMode") !== "off";
}

function saveBeginnerMode() {
  localStorage.setItem("zhitou.beginnerMode", state.beginnerMode ? "on" : "off");
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
      "当前是 GitHub Pages 静态演示版，暂时不能调用 AI 模型。我先基于本地知识库为你找到相关卡片；如果以后部署到支持后端的平台，再配置 OPENAI_API_KEY 就能恢复完整 AI 问答。",
    citations: matches
  };
}

function selectTheme(themeId) {
  state.themeId = themeId;
  const nextBook = state.books.find((book) => themeId === "all" || book.themeId === themeId);
  if (nextBook) {
    state.selectedBookId = nextBook.id;
    state.selectedPointId = state.knowledgePoints.find((point) => point.bookId === nextBook.id)?.id || "";
  }
  render();
}

function applyRecommendation(themeId) {
  const firstBook = state.books.find((book) => book.themeId === themeId);
  if (!firstBook) return;
  state.themeId = themeId;
  state.selectedBookId = firstBook.id;
  state.selectedPointId = state.knowledgePoints.find((point) => point.bookId === firstBook.id)?.id || "";
  render();
}

function selectBook(bookId) {
  state.selectedBookId = bookId;
  state.selectedPointId = state.knowledgePoints.find((point) => point.bookId === bookId)?.id || "";
  render();
}

function selectPoint(pointId) {
  state.selectedPointId = pointId;
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
    const matched = state.beginnerMode ? sortedTerms.find((term) => text.startsWith(term, index)) : null;
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
  if (!state.beginnerMode) return "";
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
  if (!state.beginnerMode) return "";
  const terms = termsForPoint(point);
  return `
    <section class="term-glossary" aria-label="术语速查">
      <h4>这张卡里的术语</h4>
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
  els.bookHero.innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(theme?.name || "")}</p>
      <h2>${escapeHtml(book.title)}</h2>
      <p>${escapeHtml(book.summary)}</p>
    </div>
    <div class="meta-box">
      <span>${escapeHtml(book.difficulty)}</span>
      <span>${escapeHtml(book.audience)}</span>
    </div>
  `;
}

function renderPoints() {
  const points = filteredPoints();
  els.pointList.innerHTML =
    points.length > 0
      ? points
          .map(
            (point) => `
              <button class="point-card ${state.selectedPointId === point.id ? "selected" : ""} ${state.masteredIds.has(point.id) ? "mastered" : ""}" data-point="${escapeHtml(point.id)}" type="button">
                <span>${state.masteredIds.has(point.id) ? "✓ " : ""}${escapeHtml(point.title)}</span>
                <small>${escapeHtml(point.tags.slice(0, 3).join(" / "))}</small>
              </button>
            `
          )
          .join("")
      : `<p class="empty-state">没有匹配的知识点，试试放宽搜索词或切换主题。</p>`;

  els.pointList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => selectPoint(button.dataset.point));
  });

  const selectedPoint = state.knowledgePoints.find((point) => point.id === state.selectedPointId) || points[0] || state.knowledgePoints[0];
  if (!selectedPoint) return;
  const isMastered = state.masteredIds.has(selectedPoint.id);
  els.pointDetail.innerHTML = `
    <div class="detail-heading">
      <span aria-hidden="true">▤</span>
      <div>
        <h3>${escapeHtml(selectedPoint.title)}</h3>
        <p>${escapeHtml(selectedPoint.sourceBook)}｜${escapeHtml(selectedPoint.sourceNote)}</p>
      </div>
    </div>
    ${renderBeginnerBlock(selectedPoint)}
    <dl>
      <div><dt>核心解释</dt><dd>${renderWithTerms(selectedPoint.explanation)}</dd></div>
      <div><dt>适用场景</dt><dd>${renderWithTerms(selectedPoint.application)}</dd></div>
      <div><dt>常见误区</dt><dd>${renderWithTerms(selectedPoint.misconception)}</dd></div>
    </dl>
    ${renderGlossary(selectedPoint)}
    <div class="tag-row">${selectedPoint.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    <div class="card-actions">
      <button class="${isMastered ? "active" : ""}" data-action="mastered" type="button">${isMastered ? "已掌握，取消标记" : "标记为已掌握"}</button>
      <button data-action="next" type="button">下一张</button>
      <button data-action="random" type="button">随机卡片</button>
      <button data-action="ask" type="button">让 AI 解释这张</button>
    </div>
  `;
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
  els.beginnerToggle.textContent = `小白模式：${state.beginnerMode ? "开" : "关"}`;
  els.beginnerToggle.classList.toggle("active", state.beginnerMode);
  renderThemes();
  renderBooks();
  renderBookHero();
  renderPoints();
  renderRecommendation();
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
    <button class="quiz-submit" type="submit">查看推荐路线</button>
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
  renderQuiz();
  state.quizResult = loadQuizResult();
  if (!state.quizResult) {
    els.quizModal.classList.remove("hidden");
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
      <p class="eyebrow">你的学习路线</p>
      <h2>${escapeHtml(primaryAdvice.title)}</h2>
      <p>${escapeHtml(primaryAdvice.reason)}</p>
      <div class="route-tags">
        <span>主路线：${escapeHtml(primaryTheme?.name || "")}</span>
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
      <button class="secondary-action" id="retake-quiz" type="button">重新测试</button>
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
    els.quizModal.classList.remove("hidden");
  });
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
els.beginnerToggle.addEventListener("click", () => {
  state.beginnerMode = !state.beginnerMode;
  saveBeginnerMode();
  render();
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
state.beginnerMode = loadBeginnerMode();
state.selectedBookId = state.books[0]?.id || "";
state.selectedPointId = state.knowledgePoints.find((point) => point.bookId === state.selectedBookId)?.id || "";
render();
showQuizIfNeeded();
