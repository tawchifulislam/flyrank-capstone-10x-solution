import express from "express";
import { saveMap, getMap } from "./db.js";
import { generateMap } from "./generate.js";

const app = express();
app.use(express.json());

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

app.post("/breakdown", (req, res) => {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
  if (!topic || topic.length > 100) {
    return res.status(400).json({ error: "topic must be 1 to 100 characters" });
  }
  const slug = slugify(topic);
  if (!slug) {
    return res.status(400).json({ error: "topic must contain letters or numbers" });
  }
  const existing = getMap(slug);
  if (existing) return res.status(200).json(existing);
  saveMap(slug, topic, generateMap(topic));
  return res.status(201).json(getMap(slug));
});

app.get("/topics/:slug", (req, res) => {
  const found = getMap(req.params.slug);
  if (!found) return res.status(404).json({ error: "not found" });
  return res.json(found);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
