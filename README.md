---
title: Zhitou
emoji: 📚
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 知投 - 金融经典知识库

一个面向投资新手的金融经典知识库。除了官方书库、学习路线和 AI 问答，用户还可以导入自己有权阅读的书籍，生成连续的全书地图、章节导读、术语白话解释和生活化例子。

## 本地运行

```bash
npm run dev
```

打开 `http://localhost:3000`。

如果当前环境没有 `npm`，也可以直接运行：

```bash
node server.mjs
```

## 项目架构

当前项目按三层组织：

- `data/`：知识库与学习内容源数据。`knowledge-base.json` 存经典书籍、主题和知识点；`app-content.json` 存新手导览、测试题、术语解释、故事化卡片模板和书籍阅读路线。
- `server.mjs` + `lib/knowledge-store.mjs`：Node 后端与数据读取层。后端提供 `/api/knowledge`、`/api/app-content`、`/api/ask`、`/api/import-book` 等接口，并负责 AI 调用、文件解析和导入任务。
- `public/`：前端工作台。前端只负责加载数据、渲染研究库、搜索筛选、阅读交互、问答面板和导入界面，不再把知识库内容写死在页面脚本里。

修改内容时优先改 `data/`。修改页面交互或样式时改 `public/`。修改 AI、上传、任务状态或安全逻辑时改 `server.mjs`。

## AI 配置

在项目根目录创建 `.env.local`：

```bash
# 推荐：Kimi 原生文件解析支持 PDF、Word、图片 OCR 和电子书
KIMI_API_KEY=你的 Kimi API Key
KIMI_MODEL=kimi-k2.6

# 以下为可选备用配置
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash

OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5-mini
OPENAI_BOOK_MODEL=gpt-5-mini
```

系统优先使用 Kimi，其次 DeepSeek，最后使用 OpenAI。三种密钥都未配置时，应用仍可浏览和搜索知识库，AI 功能会给出配置提示。

## 导入书籍

点击页面顶部的“导入一本书”，可上传 PDF、DOC、DOCX、TXT、Markdown、EPUB 或 MOBI，单个文件最大 20MB。文件只会在服务器临时处理，完成后删除，不会自动加入公共书库。

使用 Kimi 时，文件会先交给官方 `file-extract` 接口解析，PDF 和图片型内容可使用 Kimi OCR，不需要另外部署 OCR 服务；提取完成后会删除 Kimi 临时文件。较长书籍将分段归纳后再合成为章节式解读。

GitHub Pages 静态版可以完成 TXT/Markdown 的本地目录预览，但不能安全调用 AI，也不能处理完整书籍。要让所有访客使用完整生成能力，需要部署本项目的 Node 服务并在服务端配置 `KIMI_API_KEY`、`DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY`。

## 在线部署

项目已经包含 `Dockerfile` 和 `render.yaml`，可以作为 Node Web Service 部署。部署平台需要把服务端口绑定到平台提供的 `PORT`，生产环境会自动监听 `0.0.0.0`。

### 方案 A：GitHub Pages 静态版，不需要绑卡

如果只想先让所有人能在线打开，使用 GitHub Pages 最简单。运行：

```bash
node scripts/export-static-pages.mjs
```

然后把生成的 `docs/` 文件夹上传到 GitHub。在仓库设置里选择 **Settings → Pages → Deploy from a branch → main / docs**。静态版保留测试、路线推荐、搜索、知识卡片、术语解释和书籍导入入口；AI 问答与完整书籍解读会明确提示需要后端。

### 方案 B：Render 后端版，支持 AI 问答

以 Render 为例：

1. 把本项目推送到 GitHub。
2. 在 Render 创建 Blueprint 或 Web Service，选择这个仓库。
3. 推荐添加 Secret `KIMI_API_KEY`，并设置 `KIMI_MODEL=kimi-k2.6`；也可使用 DeepSeek 或 OpenAI 备用配置。
4. 部署完成后，使用平台分配的公网域名访问。

## 内容边界

- 所有知识点均为原创概括和学习解读，不复制书籍长段原文。
- 本项目仅用于学习，不构成投资建议。
- 第一版章节来源使用主题备注，后续可人工补充精确章节或页码。
