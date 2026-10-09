import { z } from "zod";

export const mapSchema = z.object({
  prerequisites: z.array(z.string().min(1)).min(1).max(8),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(1),
        title: z.string().min(1),
        why: z.string().min(1),
        minutes: z.number().int().min(5).max(600),
      })
    )
    .min(3)
    .max(12),
  first_project: z.string().min(1),
  common_mistakes: z.array(z.string().min(1)).min(1).max(8),
});
