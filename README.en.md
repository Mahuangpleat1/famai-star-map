# Famai Star Map · 法脉星河

**Turn your legal study notes into an explorable 3D knowledge graph.**

Import notes, connect concepts across documents with your own AI service, review the results, and export a study report.

[Live preview](https://pallwalt.github.io/famai-star-map/) · [中文](README.md) · [Examples](examples/README.md) · [Contributing](CONTRIBUTING.md)

The online preview needs no installation or API key to browse the built-in map. AI analysis and reports still require your own service and key, with the data, privacy, and feature limits described below. Local setup and self-hosting remain available.

![Exploring a concept in the criminal-law galaxy](docs/screenshots/focus.png)

**No account needed. Explore the built-in map without an API key.** Bring your own key for AI analysis and reports; your provider may charge for requests.

The interface and built-in content are primarily in Chinese. The starting map contains **610 nodes and 969 relationships across 11 Chinese-law learning galaxies**.

## Try it locally

Use Node.js 20.19+ within the 20.x line, or 22.12+, and npm 10+. The recommended version is in [.nvmrc](.nvmrc).

```bash
git clone https://github.com/pallwalt/famai-star-map.git
cd famai-star-map
npm ci
npm run dev
```

Open the address printed in your terminal, usually [http://localhost:5173](http://localhost:5173). You can also use GitHub's **Code → Download ZIP** and run the extracted source.

Dismiss the introduction, select a galaxy, and explore its concepts. Search with `Cmd/Ctrl + K`; use `Esc` to return to the overview.

## Build your own learning graph

1. Open **个人工作台** using the database icon in the left toolbar.
2. Configure an OpenAI-compatible API base URL, model ID, and your key.
3. Import [the synthetic contract example](examples/contract-learning.md) or paste your notes.
4. Click **分析待处理资料** to extract concepts and relationships, including suggested links to previous documents.
5. Check the results against your source material. Edit classifications and relationships, or merge concepts.
6. Select analyzed documents under **综合学习报告**, generate a study report, and download Markdown.

Text, Markdown, and PDFs with extractable text are supported. Scanned PDFs require external OCR. Importing a file saves it locally; analysis is an explicit action.

The endpoint must allow browser requests through CORS and support `/chat/completions`. Enter the API base URL without that suffix, such as `https://api.openai.com/v1`, and a model that can return structured JSON. HTTPS and local HTTP endpoints are supported. For an unauthenticated localhost service, `local` can be used as a placeholder key. Compatibility varies by provider.

## What you can do

- Explore and search a 3D legal learning map.
- Organize imported concepts and inspect cross-document relationships.
- Review, edit, merge, and undo changes.
- Export Markdown study reports, Obsidian notes, and JSON backups.
- Practice with local template questions and spaced repetition.

![Overview of the learning map](docs/screenshots/overview.png)

## Data and current limits

Documents and learning records stay in this browser until you export them or explicitly send relevant content to your configured AI service. Analysis sends source text and relevant existing concepts; reports use extraction summaries, relationships, and citations. Reports do not reread or verify the original documents.

Keys stay in page memory by default and are cleared on reload. Optional saved keys are unencrypted; JSON backups exclude them. The app sends no telemetry, but hosts and AI providers may keep their own access logs.

Each source is limited to 200,000 characters, with 12,000-character analysis chunks. PDF files are limited to 100 MB. Existing-concept context and report summaries have explicit size limits. There is no cloud account, automatic cross-device backup, OCR, or server-side key proxy. Export a JSON backup before clearing site data.

**For learning, not legal advice.** Source coverage is incomplete, AI output may be wrong, and generated exercises are not an official exam bank. Verify source references, classifications, and inferred relationships.

[Privacy](docs/PRIVACY.md) · [Security](docs/SECURITY.md) · [Validation record](docs/OPEN-SOURCE-READINESS.md) · [Deployment](docs/DEPLOYMENT.md)

## Development and contributions

React · TypeScript · Vite · Three.js / React Three Fiber · IndexedDB · PDF.js

```bash
npm run verify:all
npm run test:scripts
npx playwright install chromium
npm run test:e2e
npm run build
```

The output is a static site. GitHub Pages deployment is a manual workflow; pushing code does not publish a website automatically. Browser AI tests use synthetic keys and mocked responses, rather than real paid API calls.

Contributions to source citations, accessibility, mobile interaction, reproducible provider examples, and localization are welcome. Use synthetic material in issues; omit private documents and real keys. See [Contributing](CONTRIBUTING.md).

If this helps your learning, consider starring the project or sharing how you use it.

## License

[AGPL-3.0](LICENSE). Dependencies retain their respective licenses. The public source excludes unreviewed development history and third-party reference assets; included screenshots show this app, and learning examples are synthetic.
