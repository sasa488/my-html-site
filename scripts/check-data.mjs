import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = await readFile(join(root, "lib", "knowledge-base.ts"), "utf8");
const executable = source
  .replace(/export type ThemeId[\s\S]*?export const themes/, "const themes")
  .replace(/const themes: Theme\[\] =/, "const themes =")
  .replace(/export const books: Book\[\] =/, "const books =")
  .replace(
    /const pointTemplates: Array<Omit<KnowledgePoint, "id" \| "sourceBook"> & \{ bookId: string \}> =/,
    "const pointTemplates ="
  )
  .replace(/export const knowledgePoints: KnowledgePoint\[\] =/, "const knowledgePoints =");

const data = new vm.Script(`${executable}\n({ themes, books, knowledgePoints });`).runInNewContext({});
const bookIds = new Set(data.books.map((book) => book.id));
const broken = data.knowledgePoints.filter((point) => !bookIds.has(point.bookId));

if (broken.length > 0) {
  console.error("存在知识点引用了不存在的书籍：", broken);
  process.exit(1);
}

console.log(`数据检查通过：${data.themes.length} 个主题，${data.books.length} 本书，${data.knowledgePoints.length} 个知识点。`);
