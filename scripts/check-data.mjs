import { loadAppContent, loadKnowledgeBase } from "../lib/knowledge-store.mjs";

const data = await loadKnowledgeBase();
const appContent = await loadAppContent();
const bookIds = new Set(data.books.map((book) => book.id));
const broken = data.knowledgePoints.filter((point) => !bookIds.has(point.bookId));

if (broken.length > 0) {
  console.error("存在知识点引用了不存在的书籍：", broken);
  process.exit(1);
}

console.log(
  `数据检查通过：${data.themes.length} 个主题，${data.books.length} 本书，${data.knowledgePoints.length} 个知识点，${appContent.quizQuestions.length} 道测试题。`
);
