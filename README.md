# TopicMap

Type a programming topic, get a step-by-step learning map that a complete beginner can follow. Save it, reuse it instantly, and download it as a PDF roadmap.

## The problem

Someone starting a topic such as JavaScript closures, Python decorators or SQL joins does not know where to begin. They open many tabs, read scattered tutorials, and still do not know what to learn first, what to skip, and what comes next. Beginners lose the first hour just deciding on a path, and many give up before they start.

## The 10x claim

Finding a clear, beginner-safe learning path for one topic takes about 1 hour of searching. With TopicMap it takes one request. A new topic is generated in 20 to 45 seconds, and every repeat request is answered from the database in milliseconds.

## Concepts used

| Concept | Where it lives in the code |
|---|---|
| API endpoints | `src/server.js`: POST /breakdown, GET /topics/:slug, GET /topics/:slug/pdf, GET /stats, with status codes 200, 201, 400, 404, 502, 503 |
| LLM integration | `src/llm.js`, `src/schema.js`, `src/generate.js`: one narrow job (topic to JSON map), Zod validation, up to 3 attempts, token and latency log in the `llm_calls` table, kill switch `LLM_ENABLED=false` |
| Database | `src/db.js`: SQLite file through `node:sqlite`, tables `maps` and `llm_calls`, data survives restarts |
| Caching | `src/server.js` and `src/db.js`: maps are stored by normalized topic slug and reused, hit counter, `X-Cache: HIT` or `MISS` header, in-flight deduplication so parallel requests for one new topic make a single LLM call |
| Reporting (PDF) | `src/pdf.js`: GET /topics/:slug/pdf builds a PDF roadmap with pdfkit |

No swaps. All 5 concepts come from the main list.

## Requirements

- Node.js 24
- A bash style shell with curl (Git Bash on Windows, any terminal on macOS or Linux)

## Run it (2 commands)

    npm install
    npm run demo

`npm run demo` loads 2 seeded maps into a local SQLite file and starts the server on http://localhost:3000. No API key is needed for the seeded topics.

## 5-minute demo path

Keep the server running and open a second terminal.

1. Read a seeded map. Expect status 200 and `X-Cache: HIT`.

        curl -i localhost:3000/topics/javascript-closures

2. Download the PDF roadmap and open it.

        curl -o javascript-closures.pdf localhost:3000/topics/javascript-closures/pdf

3. Ask for the same topic with different capitalization and spacing. Expect 200 and `X-Cache: HIT`, no new LLM call.

        curl -i -X POST localhost:3000/breakdown -H "Content-Type: application/json" -d '{"topic":"JavaScript   Closures"}'

4. See the counters. Expect `cache_hits` to have grown and `llm_calls` to be 0.

        curl localhost:3000/stats

5. Ask for a topic that does not exist. Expect status 404.

        curl -i localhost:3000/topics/nothing-here

6. Generate a brand new map with the LLM (needs a free API key, see below). Expect status 201 and `X-Cache: MISS` after 20 to 45 seconds. Run it again and expect 200 and `HIT`.

        curl -i -X POST localhost:3000/breakdown -H "Content-Type: application/json" -d '{"topic":"SQL joins"}'

7. Try the kill switch. Stop the server, then start it with generation turned off. A new topic returns 503 while saved topics are still served.

        LLM_ENABLED=false npm start
        curl -i -X POST localhost:3000/breakdown -H "Content-Type: application/json" -d '{"topic":"Rust ownership"}'

## Generating new topics

Any OpenAI compatible chat API works. A free Google Gemini key needs no credit card.

1. Create a key in Google AI Studio.
2. Copy `.env.example` to `.env` and fill it in:

        LLM_API_KEY=your key
        LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
        LLM_MODEL=gemini-flash-latest

3. Restart with `npm run demo`.

Groq also works: base URL `https://api.groq.com/openai/v1` and a model from its console.

## Environment variables

| Name | Meaning |
|---|---|
| PORT | Server port, default 3000 |
| DB_PATH | SQLite file path, default `topicmap.db` |
| LLM_ENABLED | Set to `false` to switch generation off |
| LLM_API_KEY | Key for the LLM provider |
| LLM_BASE_URL | OpenAI compatible base URL |
| LLM_MODEL | Model name |

Secrets live only in `.env`, which is ignored by Git.

## API

| Method and path | Result |
|---|---|
| POST /breakdown with `{"topic": "..."}` | 201 new map, 200 cached map, 400 bad topic, 502 invalid LLM output after 3 attempts, 503 generation disabled |
| GET /topics/:slug | 200 saved map, 404 unknown slug |
| GET /topics/:slug/pdf | 200 PDF file, 404 unknown slug |
| GET /stats | Maps stored, cache hits, LLM calls, token totals |

## Project structure

    src/server.js    routes, cache logic, error mapping
    src/llm.js       LLM call, retries, cost log, kill switch
    src/schema.js    Zod schema of a learning map
    src/generate.js  topic to map
    src/db.js        SQLite access
    src/pdf.js       PDF builder
    src/seed.js      loads seed/maps.json
    seed/maps.json   2 demo maps

## Limits

- Maps are written by an AI. Treat them as a starting map and verify details in official docs.
- Free tier LLM limits apply. Caching keeps repeat calls at zero.
- The PDF uses a built-in Latin font, so use English topic names.

## Non-goals

No user accounts, no course or video content, no mobile app, no graph visuals. The map is a clean tree of text.

## Future ideas

Login with learning progress ticks, a simple web page for the map, more export formats.
