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

let marketIntroSteps = [];
let marketIntroMap = [];
let marketIntroPitfalls = [];
let marketIntroPath = [];
let quizQuestions = [];
let themeAdvice = {};
let glossaryTerms = [];
let themeDefaults = {};
let themeAnalogies = {};
let themeChecks = {};
let insightPatterns = [];
let themeInsightFallbacks = {};
let narrativePatterns = [];
let themeNarrativeFallbacks = {};
let bookCasePatterns = [];
let bookGuides = {};
let bookDeepGuides = {};
let conceptTranslations = [];

function arrayFromContent(content, key) {
  return Array.isArray(content?.[key]) ? content[key] : [];
}

function objectFromContent(content, key) {
  const value = content?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function applyAppContent(content) {
  marketIntroSteps = arrayFromContent(content, "marketIntroSteps");
  marketIntroMap = arrayFromContent(content, "marketIntroMap");
  marketIntroPitfalls = arrayFromContent(content, "marketIntroPitfalls");
  marketIntroPath = arrayFromContent(content, "marketIntroPath");
  quizQuestions = arrayFromContent(content, "quizQuestions");
  themeAdvice = objectFromContent(content, "themeAdvice");
  glossaryTerms = arrayFromContent(content, "glossaryTerms");
  themeDefaults = objectFromContent(content, "themeDefaults");
  themeAnalogies = objectFromContent(content, "themeAnalogies");
  themeChecks = objectFromContent(content, "themeChecks");
  insightPatterns = arrayFromContent(content, "insightPatterns");
  themeInsightFallbacks = objectFromContent(content, "themeInsightFallbacks");
  narrativePatterns = arrayFromContent(content, "narrativePatterns");
  themeNarrativeFallbacks = objectFromContent(content, "themeNarrativeFallbacks");
  bookCasePatterns = arrayFromContent(content, "bookCasePatterns");
  bookGuides = objectFromContent(content, "bookGuides");
  bookDeepGuides = objectFromContent(content, "bookDeepGuides");
  conceptTranslations = arrayFromContent(content, "conceptTranslations");
}

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

function insightPatternForPoint(point) {
  const haystack = [point.title, point.explanation, point.application, point.misconception, point.tags.join(" ")].join(" ");
  return insightPatterns.find((entry) => entry.terms.some((term) => haystack.includes(term)));
}

function narrativePatternForPoint(point) {
  const haystack = [point.title, point.explanation, point.application, point.misconception, point.tags.join(" ")].join(" ");
  return narrativePatterns.find((entry) => entry.terms.some((term) => haystack.includes(term)));
}

function bookCaseForPoint(point) {
  const haystack = [point.title, point.explanation, point.application, point.misconception, point.tags.join(" ")].join(" ");
  return bookCasePatterns.find((entry) => {
    if (entry.bookId && entry.bookId !== point.bookId) return false;
    if (Array.isArray(entry.pointIds) && entry.pointIds.includes(point.id)) return true;
    return Array.isArray(entry.terms) && entry.terms.some((term) => haystack.includes(term));
  });
}

function insightForPoint(point, section) {
  const pattern = insightPatternForPoint(point);
  const fallback = themeInsightFallbacks[point.themeId] || themeInsightFallbacks.value;
  const bookCase = bookCaseForPoint(point);
  const narrative = narrativePatternForPoint(point);
  const narrativeFallback = themeNarrativeFallbacks[point.themeId] || themeNarrativeFallbacks.value;
  const translation = conceptTranslationForPoint(point);
  const sourceBook = point.sourceBook || bookById(point.bookId)?.title || "来源书籍";
  const sectionName = section?.plainTitle || section?.title || point.sourceNote || "当前章节";
  const argument = bookCase?.argument || narrative?.argument || [
    `先从一个真实投资困境切入：${narrativeFallback.tension}`,
    `再用这本书的核心观点拆解它：${point.explanation}`,
    `最后回到行动边界：${point.application}`
  ];

  return {
    question: pattern?.question || fallback.question || `${point.title}真正想提醒你什么？`,
    caseTitle: bookCase?.caseTitle || narrative?.caseTitle || narrativeFallback.caseTitle,
    storyLabel: bookCase ? "书中案例 / 投资操作" : "故事开场",
    story: bookCase?.story || narrative?.story || narrativeFallback.story,
    tension: bookCase?.tension || narrative?.tension || narrativeFallback.tension,
    argument,
    takeaway: bookCase?.takeaway || pattern?.takeaway || translation || point.explanation,
    analogy: themeAnalogies[point.themeId] || "把抽象概念换成生活问题，会更容易判断自己是否真的理解。",
    bookRole:
      bookCase?.bookRole || `在《${sourceBook}》里，这张卡属于“${sectionName}”这条线索：${point.explanation}`,
    turn: pattern?.turn || fallback.turn || point.misconception,
    decision: bookCase?.decision || narrative?.decision || narrativeFallback.decision || point.application,
    observation: bookCase?.observation || narrative?.observation || narrativeFallback.observation || point.application,
    reflection: pattern?.reflection || fallback.reflection || themeChecks[point.themeId] || "我能不能用自己的话解释它，并说出一个反例？",
    sourceLine: `${sourceBook}｜${bookCase?.caseSource || point.sourceNote}`
  };
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
  const insight = insightForPoint(selectedPoint, selectedSection);
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
          .map((point, index) => {
            const cardInsight = insightForPoint(point, selectedSection);
            return `
              <button class="section-point-card ${state.selectedPointId === point.id ? "selected" : ""} ${state.masteredIds.has(point.id) ? "mastered" : ""}" data-point="${escapeHtml(point.id)}" type="button">
                <small>案例 ${index + 1}｜${escapeHtml(point.title)}</small>
                <span>${state.masteredIds.has(point.id) ? "✓ " : ""}${escapeHtml(cardInsight.caseTitle)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>

    <article class="knowledge-detail-card insight-card" aria-label="洞察卡">
      <div class="detail-heading insight-heading">
        <span class="insight-badge" aria-hidden="true">CASE</span>
        <div>
          <span class="mini-label">从一个投资问题开始</span>
          <h3>${escapeHtml(insight.caseTitle)}</h3>
          <p>${escapeHtml(insight.sourceLine)}</p>
        </div>
      </div>

      <section class="story-opening" aria-label="投资故事开场">
        <span class="mini-label">${escapeHtml(insight.storyLabel)}</span>
        <p>${renderWithTerms(insight.story)}</p>
        <div class="story-tension"><strong>真正的冲突</strong><span>${renderWithTerms(insight.tension)}</span></div>
      </section>

      <section class="argument-card" aria-label="书中的论证路线">
        <span class="mini-label">这本书是怎么说服你的</span>
        <ol>${insight.argument.map((step) => `<li>${renderWithTerms(step)}</li>`).join("")}</ol>
      </section>

      <section class="insight-takeaway" aria-label="最终带走">
        <span class="mini-label">最终带走</span>
        <p>${renderWithTerms(insight.takeaway)}</p>
      </section>

      <div class="decision-grid">
        <section>
          <span class="mini-label">落到一次真实决策</span>
          <p>${renderWithTerms(insight.decision)}</p>
        </section>
        <section>
          <span class="mini-label">你该观察什么</span>
          <p>${renderWithTerms(insight.observation)}</p>
        </section>
      </div>

      <section class="insight-turn" aria-label="反直觉提醒">
        <span class="mini-label">反直觉提醒</span>
        <p>${renderWithTerms(insight.turn)}</p>
      </section>

      <section class="book-role-card" aria-label="书中位置">
        <span class="mini-label">放回原书脉络</span>
        <p>${renderWithTerms(insight.bookRole)}</p>
      </section>

      <section class="reflection-card" aria-label="看完问自己">
        <span class="mini-label">看完问自己</span>
        <p>${escapeHtml(insight.reflection)}</p>
      </section>

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

function importedGuidesForStats() {
  const guides = [];
  const seen = new Set();
  for (const item of loadImportShelf()) {
    if (!item?.guide) continue;
    const key = item.guide.book?.title || item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    guides.push(item.guide);
  }
  if (state.importedGuide) {
    const key = state.importedGuide.book?.title || "current-imported-guide";
    if (!seen.has(key)) guides.push(state.importedGuide);
  }
  return guides;
}

function importedKnowledgeCount(guide) {
  const chapters = Array.isArray(guide?.chapters) ? guide.chapters : [];
  const keyPointCount = chapters.reduce(
    (total, chapter) => total + (Array.isArray(chapter.keyPoints) ? chapter.keyPoints.length : 0),
    0
  );
  return keyPointCount || chapters.length;
}

function renderStats() {
  const importedGuides = importedGuidesForStats();
  const importedBookCount = importedGuides.length;
  const importedPointCount = importedGuides.reduce((total, guide) => total + importedKnowledgeCount(guide), 0);
  const totalBooks = state.books.length + importedBookCount;
  const totalPoints = state.knowledgePoints.length + importedPointCount;

  els.bookCount.textContent = totalBooks;
  els.pointCount.textContent = totalPoints;
  els.themeCount.textContent = state.themes.length;
  els.masteredCount.textContent = `${state.masteredIds.size}/${state.knowledgePoints.length}`;
  els.bookCount.title = importedBookCount ? `内置 ${state.books.length} 本，已导入 ${importedBookCount} 本` : `内置 ${state.books.length} 本`;
  els.pointCount.title = importedPointCount
    ? `内置 ${state.knowledgePoints.length} 个，导入解读 ${importedPointCount} 个`
    : `内置 ${state.knowledgePoints.length} 个`;
  els.masteredCount.title = "已掌握统计目前只计算内置经典知识点。";
}

function render() {
  renderStats();
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
        <h3>先用一张地图看懂金融世界，再做测试</h3>
        <p>你不需要一开始就懂财报、估值模型或宏观周期。先抓住五个词：资产、价格、价值、风险、时间。后面的经典书，基本都在围绕这五件事展开。</p>
      </div>
      <div class="intro-map" aria-label="金融世界五个基本词">
        ${marketIntroMap
          .map(
            (item, index) => `
              <article>
                <strong>${index + 1}</strong>
                <div>
                  <h4>${escapeHtml(item.label)}</h4>
                  <p>${escapeHtml(item.text)}</p>
                </div>
              </article>
            `
          )
          .join("")}
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
      <div class="intro-bottom-grid">
        <section class="intro-pitfalls" aria-label="新手常见误区">
          <span class="mini-label">先别急着做这些</span>
          <h4>新手最容易踩的 4 个坑</h4>
          <ul>${marketIntroPitfalls.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <section class="intro-path" aria-label="学习路线">
          <span class="mini-label">接下来怎么学</span>
          <h4>从小白到能读经典的三步</h4>
          <ol>${marketIntroPath.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        </section>
      </div>
      <div class="intro-actions">
        <button class="intro-start" data-intro-action="start" type="button">看懂这张地图，开始测试</button>
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
  const labels = getImportedChapterLabels(chapter);
  return `
    <section class="import-chapter-view">
      <p class="eyebrow">${escapeHtml(labels.eyebrow)}</p>
      <h3>${escapeHtml(labels.title)}</h3>
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

function isIncompleteImportedTitle(value) {
  const title = String(value || "").trim();
  if (!title || title.length < 4) return true;
  return /(?:[，、：:—-]|是被|是由|因为|所以|但是|不过|而且|以及|来自|取决于|意味着|由|被|把|让|在|对|从|向|为)$/.test(title);
}

function getImportedChapterLabels(chapter) {
  const sourceTitle = String(chapter?.sourceTitle || "").trim();
  const plainTitle = String(chapter?.plainTitle || "").trim();
  const title = isIncompleteImportedTitle(plainTitle)
    ? sourceTitle || plainTitle || "本章解读"
    : plainTitle;

  return {
    title,
    eyebrow: sourceTitle && sourceTitle !== title ? sourceTitle : "原书章节",
    subtitle: sourceTitle && sourceTitle !== title ? sourceTitle : "用完整主线理解这一章"
  };
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
      .map((chapter, index) => {
        const labels = getImportedChapterLabels(chapter);
        return `<button data-import-chapter="${escapeHtml(chapter.id)}" type="button"><span>${index + 1}</span><strong>${escapeHtml(labels.title)}</strong><small>${escapeHtml(labels.subtitle)}</small></button>`;
      })
      .join("")}
  `;
  els.importChapters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => selectImportedChapter(button.dataset.importChapter));
  });
  selectImportedChapter("overview");
  renderStats();
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForImportJob(jobId) {
  const deadline = Date.now() + 60 * 60 * 1000;
  let lastMessage = "";
  let connectionFailures = 0;

  while (Date.now() < deadline) {
    let response;
    let job;
    try {
      response = await fetch(`/api/import-book/${encodeURIComponent(jobId)}`, { cache: "no-store" });
      const body = await response.text();
      job = body ? JSON.parse(body) : null;
      if (!job || typeof job !== "object") throw new Error("进度响应为空");
      connectionFailures = 0;
    } catch {
      connectionFailures += 1;
      if (connectionFailures >= 5) {
        throw new Error("与解读服务的连接多次中断，请保留文件并重新点击生成。");
      }
      setImportStatus(`连接短暂中断，正在自动恢复（${connectionFailures}/5）…`, "working");
      await wait(2_000 * connectionFailures);
      continue;
    }
    if (!response.ok) throw new Error(job.error || "无法读取书籍处理进度。");

    if (job.status === "complete" && job.guide) return job;
    if (job.status === "failed") throw new Error(job.message || "书籍解读失败，请稍后重试。");
    if (job.message && job.message !== lastMessage) {
      lastMessage = job.message;
      setImportStatus(job.message, "working");
    }
    await wait(2_000);
  }

  throw new Error("这本书处理时间超过 60 分钟。建议先拆分文件，或稍后重新导入。");
}

async function generateImportedGuide() {
  const file = state.importFile;
  if (!file) return;
  els.generateGuide.disabled = true;
  els.generateGuide.textContent = "正在阅读整本书…";
  setImportStatus("正在识别目录和全书主线。长书会逐章生成，可能需要 15-30 分钟，请保持页面打开。", "working");

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
    const responseBody = await response.text();
    let data = {};
    try {
      data = responseBody ? JSON.parse(responseBody) : {};
    } catch {
      throw new Error("服务器返回内容不完整，请重新点击生成。");
    }
    if (!response.ok) throw new Error(data.error || "当前站点还没有启用书籍解读后端。");
    const result = data.jobId ? await waitForImportJob(data.jobId) : data;
    setImportStatus("解读完成，正在整理阅读路线。", "success");
    renderImportedGuide(result.guide);
  } catch (error) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isStaticSite = location.hostname.endsWith("github.io");
    if (isStaticSite && ["txt", "md"].includes(extension)) {
      const preview = await createLocalStructurePreview(file);
      renderImportedGuide(preview);
      return;
    }
    const staticHint = isStaticSite
      ? " 当前 GitHub Pages 是静态版，请使用知投的 Hugging Face 公网地址导入完整书籍。"
      : "";
    setImportStatus(`完整解读失败：${error.message || "生成失败，请稍后重试。"}${staticHint}`, "error");
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
      renderStats();
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
    renderImportShelf();
    renderStats();
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
    els.askButton.querySelector("span:last-child").textContent = "检索并回答";
  }
}

async function loadKnowledge() {
  try {
    const response = await fetch("/api/knowledge");
    if (response.ok) return await response.json();
  } catch {
    // Static hosting does not provide the API route; fall back to bundled JSON.
  }

  for (const path of ["./data/knowledge.json", "./knowledge.json"]) {
    const staticResponse = await fetch(path);
    if (staticResponse.ok) return staticResponse.json();
  }
  throw new Error("无法加载静态知识库数据。");
}

async function loadAppContent() {
  try {
    const response = await fetch("/api/app-content");
    if (response.ok) return await response.json();
  } catch {
    // Static hosting does not provide the API route; fall back to bundled JSON.
  }

  const staticResponse = await fetch("./data/app-content.json");
  if (!staticResponse.ok) throw new Error("无法加载学习内容数据。");
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

const [data, appContent] = await Promise.all([loadKnowledge(), loadAppContent()]);
applyAppContent(appContent);
state.themes = data.themes;
state.books = data.books;
state.knowledgePoints = data.knowledgePoints;
state.masteredIds = loadMasteredIds();
state.introSeen = loadIntroSeen();
if (state.books[0]) setSelectedBook(state.books[0].id);
render();
showQuizIfNeeded();
