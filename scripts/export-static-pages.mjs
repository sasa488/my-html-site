import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const docsDir = join(root, "docs");

async function loadKnowledgeBase() {
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

  return new vm.Script(`${executable}\n({ themes, books, knowledgePoints });`).runInNewContext({});
}

await rm(docsDir, { recursive: true, force: true });
await mkdir(docsDir, { recursive: true });

for (const file of ["index.html", "app.js", "styles.css"]) {
  await writeFile(join(docsDir, file), await readFile(join(root, "public", file), "utf8"));
}

await writeFile(join(docsDir, "knowledge.json"), JSON.stringify(await loadKnowledgeBase()));
await writeFile(join(docsDir, ".nojekyll"), "");
await writeFile(
  join(docsDir, "README.md"),
  "# GitHub Pages 静态版\n\n这个目录可直接作为 GitHub Pages 发布源。静态版保留浏览、搜索、测试推荐、知识卡片和术语解释；AI 问答会降级为本地检索提示。\n"
);

console.log("静态版已生成到 docs/。");
