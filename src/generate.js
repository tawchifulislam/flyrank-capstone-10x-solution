import { requestMap } from "./llm.js";

export async function generateMap(topic, slug) {
  const map = await requestMap(topic, slug);
  return { topic, ...map };
}
