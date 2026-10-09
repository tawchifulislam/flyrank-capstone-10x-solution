import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.DB_PATH || "topicmap.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    topic TEXT NOT NULL,
    map_json TEXT NOT NULL,
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
    .prepare("SELECT slug, topic, map_json, created_at FROM maps WHERE slug = ?")
    .get(slug);
  if (!row) return null;
  return {
    slug: row.slug,
    topic: row.topic,
    created_at: row.created_at,
    map: JSON.parse(row.map_json),
  };
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
