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

## AI 问答配置

在项目根目录创建 `.env.local`：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5-mini
OPENAI_BOOK_MODEL=gpt-5-mini
```

未配置 `OPENAI_API_KEY` 时，应用仍可浏览和搜索知识库，AI 问答会给出配置提示。

## 导入书籍

点击页面顶部的“导入一本书”，可上传 PDF、DOC、DOCX、TXT 或 Markdown，单个文件最大 20MB。文件不会写入本项目磁盘，也不会自动加入公共书库；配置后端 API 密钥后，服务端会把文件作为本次请求的输入生成章节式解读。

GitHub Pages 静态版可以完成 TXT/Markdown 的本地目录预览，但不能安全调用 AI，也不能处理 PDF/Word。要让所有访客使用完整生成能力，需要部署本项目的 Node 服务并在服务端配置 `OPENAI_API_KEY`。

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
3. 添加环境变量 `OPENAI_API_KEY`，可选添加 `OPENAI_MODEL=gpt-5-mini`。
4. 部署完成后，使用平台分配的公网域名访问。

## 内容边界

- 所有知识点均为原创概括和学习解读，不复制书籍长段原文。
- 本项目仅用于学习，不构成投资建议。
- 第一版章节来源使用主题备注，后续可人工补充精确章节或页码。
