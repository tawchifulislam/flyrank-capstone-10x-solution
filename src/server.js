import express from "express";
import { fileURLToPath } from "node:url";
import { saveMap, getMap, recordHit, getStats } from "./db.js";
import { generateMap } from "./generate.js";
import { buildPdf } from "./pdf.js";
import { LlmDisabledError, LlmFailedError } from "./llm.js";

const app = express();
app.use(express.json());
app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));

const inflight = new Map();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

app.post("/breakdown", async (req, res) => {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
  if (!topic || topic.length > 100) {
    return res.status(400).json({ error: "topic must be 1 to 100 characters" });
  }
  const slug = slugify(topic);
  if (!slug) {
    return res.status(400).json({ error: "topic must contain letters or numbers" });
  }

  const existing = getMap(slug);
  if (existing) {
    recordHit(slug);
    res.set("X-Cache", "HIT");
    return res.status(200).json({ ...existing, cached: true });
  }

  try {
    let pending = inflight.get(slug);
    if (!pending) {
      pending = generateMap(topic, slug)
        .then((map) => saveMap(slug, topic, map))
        .finally(() => inflight.delete(slug));
      inflight.set(slug, pending);
    }
    await pending;
    res.set("X-Cache", "MISS");
    return res.status(201).json({ ...getMap(slug), cached: false });
  } catch (err) {
    if (err instanceof LlmDisabledError) {
      return res.status(503).json({ error: "generation is currently disabled" });
    }
    if (err instanceof LlmFailedError) {
      return res.status(502).json({ error: "could not generate a valid map, try again later" });
    }
    return res.status(500).json({ error: "internal error" });
  }
});

app.get("/topics/:slug", (req, res) => {
  const found = getMap(req.params.slug);
  if (!found) return res.status(404).json({ error: "not found" });
  recordHit(found.slug);
  res.set("X-Cache", "HIT");
  return res.json({ ...found, cached: true });
});

app.get("/topics/:slug/pdf", (req, res) => {
  const found = getMap(req.params.slug);
  if (!found) return res.status(404).json({ error: "not found" });
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${found.slug}.pdf"`,
  });
  return buildPdf(found, res);
});

app.get("/stats", (req, res) => res.json(getStats()));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
