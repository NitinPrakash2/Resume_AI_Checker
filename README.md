# Resume AI Checker

An AI-powered resume analysis tool with ATS scoring, job matching, and interview prep.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A PostgreSQL database (free options: [Neon](https://neon.tech) · [Supabase](https://supabase.com) · local Postgres)

---

## Setup

### 1. Clone & install dependencies

```bash
git clone <your-repo-url>
cd Resume_AI_Checker
npm run install:all
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (see below) |
| `JWT_SECRET` | ✅ Yes | Any long random string |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | ⚠️ Optional | From [Adzuna](https://developer.adzuna.com/) — only needed for job search |
| `GEMINI_API_KEY` / `GROQ_API_KEY` / `OPENROUTER_API_KEY` | ⚠️ Optional | Server-level fallback keys — users set their own AI key directly in the app under **Settings → AI Models** |

---

## Getting your DATABASE_URL

### Option A — Neon (recommended, free)

1. Go to [neon.tech](https://neon.tech) → create a project
2. Copy the **Connection string** (looks like `postgresql://user:pass@host/dbname?sslmode=require`)
3. Paste it as `DATABASE_URL` in `server/.env`

### Option B — Supabase (free)

1. Go to [supabase.com](https://supabase.com) → create a project
2. Go to **Settings → Database → Connection string → URI**
3. Paste it as `DATABASE_URL` in `server/.env`

### Option C — Local PostgreSQL

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/resume_ai
```

> For local Postgres, also open `server/config/db.js` and change `rejectUnauthorized: true` → `false` and `require: true` → `false` inside `sslOptions`, or the SSL handshake will fail against a local server.

---

## Run the app

From the project root:

```bash
npm run dev
```

This starts both the server (port 5000) and the client (port 3000) in separate terminals.

Or run them individually:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

On first start the server will auto-create all database tables via Sequelize (`sync({ alter: true })`). You should see:

```
[DB] Schema synced
[Server] Running on port 5000
```

---

## Troubleshooting DB connection

| Error | Fix |
|---|---|
| `ENOTFOUND` / DNS error | Check your `DATABASE_URL` hostname is correct |
| `SSL SYSCALL error` | Make sure `?sslmode=require` is in the URL (Neon/Supabase require SSL) |
| `password authentication failed` | Double-check username/password in the connection string |
| `database does not exist` | Create the database first, or use the provider's default DB name |
| `sequelize not initialized` | `DATABASE_URL` is missing or `.env` file not found — ensure `server/.env` exists |
