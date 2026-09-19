# Victory Portfolio

A high-end portfolio site with an admin dashboard and an AI chatbot.

## Architecture

- **Next.js (Vercel)** — public site, `/admin` dashboard, Postgres (Neon + Prisma), CRUD APIs, and RAG vector sync.
- **Cloudflare Worker** — the chatbot (NVIDIA LLM + Pinecone RAG). The Next.js route `/api/chat` proxies to it via `CHAT_WORKER_URL` and falls back to running the chat itself if the variable is unset.
- **`shared/chat/core.ts`** — chat logic shared by both the Worker and Next.js.

## Getting Started

```bash
npm install
cp worker/.dev.vars.example worker/.dev.vars   # add your API keys
npm run dev
```

Open http://localhost:3000

## Deploying

See **`create.txt`** at the project root for step-by-step deployment instructions (Cloudflare Worker first, then Vercel).

## Useful scripts

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Next.js dev server                  |
| `npm run build`     | Production build                    |
| `npm run lint`      | ESLint                              |
| `npm run db:push`   | Push Prisma schema to the database  |
| `npm run db:seed`   | Seed sample content                 |
| `npm run worker:dev`   | Run the chatbot Worker locally  |
| `npm run worker:deploy` | Deploy the chatbot to Cloudflare |