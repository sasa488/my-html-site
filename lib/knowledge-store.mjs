import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dataDir = join(root, "data");

let knowledgeBaseCache;
let appContentCache;

function assertArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`${name} 必须是数组。`);
}

function assertObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} 必须是对象。`);
}

async function readJsonFile(fileName) {
  const raw = await readFile(join(dataDir, fileName), "utf8");
  return JSON.parse(raw);
}

function validateKnowledgeBase(data) {
  assertObject(data, "knowledge-base");
  assertArray(data.themes, "themes");
  assertArray(data.books, "books");
  assertArray(data.knowledgePoints, "knowledgePoints");

  const themeIds = new Set(data.themes.map((theme) => theme.id));
  const bookIds = new Set(data.books.map((book) => book.id));
  const pointIds = new Set();

  for (const book of data.books) {
    if (!book.id || !book.title) throw new Error("每本书必须包含 id 和 title。");
    if (!themeIds.has(book.themeId)) throw new Error(`书籍 ${book.id} 引用了不存在的主题 ${book.themeId}。`);
  }

  for (const point of data.knowledgePoints) {
    if (!point.id || !point.title) throw new Error("每个知识点必须包含 id 和 title。");
    if (pointIds.has(point.id)) throw new Error(`知识点 id 重复：${point.id}。`);
    pointIds.add(point.id);
    if (!bookIds.has(point.bookId)) throw new Error(`知识点 ${point.id} 引用了不存在的书籍 ${point.bookId}。`);
    if (!themeIds.has(point.themeId)) throw new Error(`知识点 ${point.id} 引用了不存在的主题 ${point.themeId}。`);
    if (!Array.isArray(point.tags)) point.tags = [];
  }

  return data;
}

function validateAppContent(data) {
  assertObject(data, "app-content");
  for (const key of ["marketIntroSteps", "quizQuestions", "glossaryTerms", "insightPatterns", "narrativePatterns"]) {
    assertArray(data[key], key);
  }
  for (const key of ["themeAdvice", "themeDefaults", "themeAnalogies", "themeChecks", "bookGuides"]) {
    assertObject(data[key], key);
  }
  return data;
}

export async function loadKnowledgeBase() {
  if (!knowledgeBaseCache) knowledgeBaseCache = validateKnowledgeBase(await readJsonFile("knowledge-base.json"));
  return knowledgeBaseCache;
}

export async function loadAppContent() {
  if (!appContentCache) appContentCache = validateAppContent(await readJsonFile("app-content.json"));
  return appContentCache;
}
