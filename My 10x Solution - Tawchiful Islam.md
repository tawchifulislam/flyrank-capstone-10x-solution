# My 10x Solution - Tawchiful Islam

Project: TopicMap

Repository: <https://github.com/tawchifulislam/flyrank-capstone-10x-solution>

## 1. What problem am I solving?

Someone who wants to learn a programming topic, for example JavaScript closures, Python decorators or SQL joins, usually does not know where to start. They open many tabs, read scattered tutorials and watch videos in the wrong order. They cannot tell what to learn first, what they can skip and what comes next. The first hour goes into deciding on a path instead of learning, and many beginners give up before they begin.

This hits complete beginners and self-taught learners the most, because they do not yet know the shape of the topic they are about to learn.

My 10x claim: finding a clear path for one topic takes about 1 hour of searching (my own estimate). With TopicMap a new topic takes about 20 to 45 seconds (measured on a free Gemini key), and every repeat request is answered from the database with no new AI call.

## 2. How did I implement my solution?

TopicMap is a small web API. You send it a topic name and it returns a learning map: what to know first, the core steps in learning order (each with one sentence on why it matters and an estimated time), a small first practice project, and the common beginner mistakes. The map can also be downloaded as a PDF.

What happens when you ask for a topic:

1. The server turns the topic into a clean slug (for example "JavaScript   Closures" becomes javascript-closures) and looks in the database.
2. If the map is already saved, it is returned at once and no AI call is made.
3. If not, the server asks an AI model to write the map as JSON in a fixed shape. The answer is checked against a schema. If the shape is wrong, the server retries, up to 3 attempts. Every attempt is logged with token counts and time.
4. A valid map is saved and returned. If two people ask for the same new topic at the same moment, only one AI call is made.
5. Any saved map can be downloaded as a PDF roadmap.

Concepts implemented (5 from the main list):

| Concept | Where it lives |
| --- | --- |
| API endpoints | src/server.js: POST /breakdown, GET /topics/:slug, GET /topics/:slug/pdf, GET /stats, with correct status codes and validation |
| LLM integration | src/llm.js, src/schema.js, src/generate.js: one narrow job, Zod validation, retries, cost log, kill switch |
| Database | src/db.js: SQLite, data survives a restart |
| Caching | src/server.js and src/db.js: saved maps are reused, hit counter, X-Cache header, one AI call for parallel identical requests |
| Reporting (PDF) | src/pdf.js: PDF roadmap download |

Swaps: none. All 5 concepts come from the main list, so no swap reasons are needed.

How to run it (Node 24):

    npm install
    npm run demo

This loads 2 seeded maps and starts the server on <http://localhost:3000>. The seeded topics work without any API key. Generating a new topic needs a free Gemini key in a local .env file. The README has a 5-minute demo path and the full steps.

What I decided not to build: user accounts, course or video content, a mobile app and graph visuals. Future ideas: login with learning progress ticks and a simple web page for the map.
