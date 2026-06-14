import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.RAILWAY_ENVIRONMENT;
const host = process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1");
const publicDir = join(root, "public");

async function loadLocalEnv() {
  try {
    const envText = await readFile(join(root, ".env.local"), "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env.local is optional; the app still runs with AI answer fallback.
  }
}

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

const supportedBookExtensions = new Set([".pdf", ".doc", ".docx", ".txt", ".md"]);
const maxBookBytes = 20 * 1024 * 1024;

const bookGuideSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    book: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        oneLine: { type: "string" },
        suitableFor: { type: "string" },
        difficulty: { type: "string", enum: ["入门", "进阶", "高阶"] }
      },
      required: ["title", "author", "oneLine", "suitableFor", "difficulty"]
    },
    overview: {
      type: "object",
      additionalProperties: false,
      properties: {
        coreQuestion: { type: "string" },
        mainThesis: { type: "string" },
        beforeReading: { type: "array", items: { type: "string" }, maxItems: 5 },
        readingPath: { type: "array", items: { type: "string" }, maxItems: 8 }
      },
      required: ["coreQuestion", "mainThesis", "beforeReading", "readingPath"]
    },
    chapters: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          sourceTitle: { type: "string" },
          plainTitle: { type: "string" },
          summary: { type: "string" },
          lifeExample: { type: "string" },
          sourceNote: { type: "string" },
          keyPoints: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                plainExplanation: { type: "string" },
                whenUseful: { type: "string" },
                misconception: { type: "string" }
              },
              required: ["title", "plainExplanation", "whenUseful", "misconception"]
            }
          },
          terms: {
            type: "array",
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                term: { type: "string" },
                plainMeaning: { type: "string" },
                analogy: { type: "string" }
              },
              required: ["term", "plainMeaning", "analogy"]
            }
          },
          checkpoint: { type: "string" }
        },
        required: [
          "id",
          "sourceTitle",
          "plainTitle",
          "summary",
          "lifeExample",
          "sourceNote",
          "keyPoints",
          "terms",
          "checkpoint"
        ]
      }
    },
    closing: {
      type: "object",
      additionalProperties: false,
      properties: {
        whatChanged: { type: "array", items: { type: "string" }, maxItems: 6 },
        nextSteps: { type: "array", items: { type: "string" }, maxItems: 5 },
        disclaimer: { type: "string" }
      },
      required: ["whatChanged", "nextSteps", "disclaimer"]
    },
    quality: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceConfidence: { type: "string", enum: ["高", "中", "低"] },
        warnings: { type: "array", items: { type: "string" }, maxItems: 6 }
      },
      required: ["sourceConfidence", "warnings"]
    }
  },
  required: ["book", "overview", "chapters", "closing", "quality"]
};

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeText(value) {
  return String(value).toLowerCase().replace(/\s+/g, "");
}

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

  const script = new vm.Script(`${executable}\n({ themes, books, knowledgePoints });`);
  return script.runInNewContext({});
}

await loadLocalEnv();
const knowledgeBasePromise = loadKnowledgeBase();

function scorePoint(point, booksById, query) {
  const normalizedQuery = normalizeText(query);
  const book = booksById.get(point.bookId);
  const haystack = normalizeText(
    [
      point.title,
      point.explanation,
      point.application,
      point.misconception,
      point.sourceBook,
      point.sourceNote,
      point.tags.join(" "),
      book?.author ?? "",
      book?.summary ?? ""
    ].join(" ")
  );

  let score = 0;
  if (haystack.includes(normalizedQuery)) score += 20;

  for (const tag of point.tags) {
    const normalizedTag = normalizeText(tag);
    if (normalizedQuery.includes(normalizedTag) || normalizedTag.includes(normalizedQuery)) score += 10;
  }

  for (const token of query.split(/[\s，。！？、,.!?]+/).filter(Boolean)) {
    const normalizedToken = normalizeText(token);
    if (normalizedToken.length >= 2 && haystack.includes(normalizedToken)) score += 3;
  }

  return score;
}

async function findRelevantKnowledge(query, limit = 6) {
  const { books, knowledgePoints } = await knowledgeBasePromise;
  const booksById = new Map(books.map((book) => [book.id, book]));
  return knowledgePoints
    .map((point) => ({ point, score: scorePoint(point, booksById, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.point);
}

function extractOutputText(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return "";

  return payload.output
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n");
}

async function readBody(request, maxBytes = 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("请求内容过大。");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleAsk(request, response) {
  const rawBody = await readBody(request);
  const body = rawBody ? JSON.parse(rawBody) : {};
  const question = String(body.question || "").trim();

  if (!question) {
    json(response, 400, { error: "请输入一个问题。" });
    return;
  }

  const matches = await findRelevantKnowledge(question, 6);
  const advicePattern = /买哪|卖哪|荐股|推荐.*股票|明天.*买|目标价|预测.*涨跌|能不能买|该不该买|仓位|满仓|杠杆|收益率|翻倍/;

  if (advicePattern.test(question)) {
    json(response, 200, {
      answer:
        "这个问题涉及具体买卖、仓位或收益判断，已经超出知识库的学习范围。知投只能基于经典书籍解释概念和框架，不提供任何投资建议。",
      citations: matches
    });
    return;
  }

  if (matches.length === 0) {
    json(response, 200, {
      answer: "知识库暂无足够依据回答这个问题。你可以换成概念类问题，例如“什么是安全边际？”或“指数投资为什么强调低成本？”。",
      citations: []
    });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    json(response, 200, {
      answer:
        "已找到相关知识点，但当前未配置 OPENAI_API_KEY。请在 .env.local 中设置密钥后重启开发服务器，即可启用 AI 生成回答。",
      citations: matches
    });
    return;
  }

  const context = matches
    .map(
      (item, index) =>
        `[${index + 1}] ${item.title}\n来源：${item.sourceBook}｜${item.sourceNote}\n解释：${item.explanation}\n适用场景：${item.application}\n常见误区：${item.misconception}`
    )
    .join("\n\n");

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      instructions:
        "你是“知投”金融经典知识库的学习助手。只能基于提供的知识库上下文回答，不提供个股买卖建议、收益承诺、仓位建议或市场预测。回答要中文、清晰、适合投资新手，并在末尾列出引用来源。",
      input: `用户问题：${question}\n\n知识库上下文：\n${context}`
    })
  });

  if (!apiResponse.ok) {
    const details = await apiResponse.text().catch(() => "");
    json(response, 502, {
      answer: "AI 服务暂时不可用。你仍可以查看下方检索到的知识点来源。",
      citations: matches,
      error: details.slice(0, 300)
    });
    return;
  }

  const payload = await apiResponse.json();
  json(response, 200, {
    answer: extractOutputText(payload).trim() || "AI 未返回可读文本。请稍后重试。",
    citations: matches
  });
}

function parseJsonOutput(value) {
  const text = String(value || "").trim();
  if (!text) throw new Error("AI 未返回可用的书籍解读。");
  const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(withoutFence);
}

function estimateDataUrlBytes(fileData) {
  const base64 = String(fileData || "").split(",").pop() || "";
  return Math.floor((base64.length * 3) / 4);
}

async function handleImportBook(request, response) {
  const rawBody = await readBody(request, Math.ceil(maxBookBytes * 1.4) + 200_000);
  const body = rawBody ? JSON.parse(rawBody) : {};
  const fileName = String(body.fileName || "").trim();
  const fileData = String(body.fileData || "");
  const extension = extname(fileName).toLowerCase();

  if (!fileName || !fileData.startsWith("data:")) {
    json(response, 400, { error: "请选择一本要解读的书籍文件。" });
    return;
  }

  if (!supportedBookExtensions.has(extension)) {
    json(response, 400, { error: "目前支持 PDF、DOC、DOCX、TXT 和 Markdown 文件。" });
    return;
  }

  if (estimateDataUrlBytes(fileData) > maxBookBytes) {
    json(response, 413, { error: "文件不能超过 20MB。建议先拆分或压缩后再导入。" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    json(response, 503, {
      code: "missing_api_key",
      error: "当前站点还没有启用 AI 书籍解读服务。管理员需要配置 OPENAI_API_KEY。"
    });
    return;
  }

  const readingLevel = ["完全小白", "有一点基础", "进阶读者"].includes(body.readingLevel)
    ? body.readingLevel
    : "完全小白";
  const userGoal = String(body.userGoal || "看懂整本书的主线和关键概念").slice(0, 300);
  const prompt = `请阅读用户上传的金融或投资书籍，并生成“知投”章节式通俗解读。

读者水平：${readingLevel}
阅读目标：${userGoal}

要求：
1. 先还原整本书在解决什么问题、核心主张是什么，再按目录或思想推进顺序组织 4-12 个学习章节。
2. 不要把内容拆成彼此无关的卡片。每一章都要说明它承接了前面什么，并为后面解决什么。
3. 专有名词第一次出现时必须先用日常语言解释，再给生活化类比；避免用一个黑话解释另一个黑话。
4. 区分“作者明确表达的观点”和“为了帮助理解而补充的类比”。sourceNote 只写能够从文件中确认的章节或主题；不能确认页码时不要编造。
5. 全部使用原创归纳，不复制书中长段原文，不输出受版权保护的连续原文。
6. 不提供个股推荐、仓位建议、收益承诺或市场预测。金融内容仅供学习。
7. author 无法确认时写“文件未注明”；warnings 中说明目录缺失、扫描模糊或版本不确定等问题。
8. 输出简体中文，句子简洁，面向第一次接触金融的读者。`;

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_BOOK_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      instructions:
        "你是知投的金融经典编辑。你的任务是把整本书组织成连续、可靠、适合新手学习的阅读路线，而不是生成摘要碎片。",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_file", filename: fileName, file_data: fileData }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "zhitou_book_guide",
          strict: true,
          schema: bookGuideSchema
        }
      }
    })
  });

  if (!apiResponse.ok) {
    const details = await apiResponse.text().catch(() => "");
    json(response, 502, {
      error: "书籍解读服务暂时不可用，请稍后重试。",
      details: details.slice(0, 500)
    });
    return;
  }

  const payload = await apiResponse.json();
  const guide = parseJsonOutput(extractOutputText(payload));
  json(response, 200, { guide, temporary: true });
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes.get(extname(filePath)) || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/knowledge") {
      json(response, 200, await knowledgeBasePromise);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      json(response, 200, { ok: true, bookImport: Boolean(process.env.OPENAI_API_KEY) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/ask") {
      await handleAsk(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/import-book") {
      await handleImportBook(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(request, response);
      return;
    }

    response.writeHead(405);
    response.end("Method not allowed");
  } catch (error) {
    json(response, error?.statusCode || 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
});

server.listen(port, host, () => {
  console.log(`知投金融经典知识库已启动：http://${host}:${port}`);
});
