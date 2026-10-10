import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.DB_PATH || "topicmap.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    topic TEXT NOT NULL,
    map_json TEXT NOT NULL,
    hits INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS llm_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    model TEXT NOT NULL,
    attempt INTEGER NOT NULL,
    ok INTEGER NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL,
    error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export function saveMap(slug, topic, map) {
  db.prepare("INSERT INTO maps (slug, topic, map_json) VALUES (?, ?, ?)").run(
    slug,
    topic,
    JSON.stringify(map)
  );
}

export function getMap(slug) {
  const row = db
    .prepare("SELECT slug, topic, map_json, hits, created_at FROM maps WHERE slug = ?")
    .get(slug);
  if (!row) return null;
  return {
    slug: row.slug,
    topic: row.topic,
    hits: row.hits,
    created_at: row.created_at,
    map: JSON.parse(row.map_json),
  };
}

export function recordHit(slug) {
  db.prepare("UPDATE maps SET hits = hits + 1 WHERE slug = ?").run(slug);
}

export function logCall(entry) {
  db.prepare(
    `INSERT INTO llm_calls
      (slug, model, attempt, ok, prompt_tokens, completion_tokens, latency_ms, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entry.slug,
    entry.model,
    entry.attempt,
    entry.ok,
    entry.promptTokens,
    entry.completionTokens,
    entry.latencyMs,
    entry.error
  );
}

export function getStats() {
  const maps = db
    .prepare("SELECT COUNT(*) AS maps, COALESCE(SUM(hits), 0) AS cache_hits FROM maps")
    .get();
  const calls = db
    .prepare(
      `SELECT COUNT(*) AS llm_calls,
              COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
              COALESCE(SUM(completion_tokens), 0) AS completion_tokens
       FROM llm_calls`
    )
    .get();
  return { ...maps, ...calls };
}
