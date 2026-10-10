import { readFileSync } from "node:fs";
import { getMap, saveMap } from "./db.js";
import { mapSchema } from "./schema.js";

const items = JSON.parse(
  readFileSync(new URL("../seed/maps.json", import.meta.url), "utf8")
);

let added = 0;
for (const item of items) {
  const parsed = mapSchema.parse(item.map);
  if (getMap(item.slug)) continue;
  saveMap(item.slug, item.topic, { topic: item.topic, ...parsed });
  added += 1;
}

console.log(`seeded ${added} of ${items.length} maps`);
