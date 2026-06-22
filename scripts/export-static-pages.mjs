import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAppContent, loadKnowledgeBase } from "../lib/knowledge-store.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const docsDir = join(root, "docs");
const docsDataDir = join(docsDir, "data");

await rm(docsDir, { recursive: true, force: true });
await mkdir(docsDataDir, { recursive: true });

for (const file of ["index.html", "app.js", "styles.css"]) {
  await writeFile(join(docsDir, file), await readFile(join(root, "public", file), "utf8"));
}

const knowledgeBase = await loadKnowledgeBase();
const appContent = await loadAppContent();
await writeFile(join(docsDataDir, "knowledge.json"), JSON.stringify(knowledgeBase));
await writeFile(join(docsDataDir, "app-content.json"), JSON.stringify(appContent));
await writeFile(join(docsDir, "knowledge.json"), JSON.stringify(knowledgeBase));
await writeFile(join(docsDir, ".nojekyll"), "");
await writeFile(
  join(docsDir, "README.md"),
  "# GitHub Pages 静态版\n\n这个目录可直接作为 GitHub Pages 发布源。静态版保留浏览、搜索、测试推荐、知识卡片和术语解释；AI 问答会降级为本地检索提示。\n\n静态数据位于 `data/`，由项目根目录的 `data/` 源文件生成。\n"
);

console.log("静态版已生成到 docs/。");
