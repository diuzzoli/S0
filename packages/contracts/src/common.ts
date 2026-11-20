import { z } from "zod";

export const idParam = z.object({ id: z.uuid() });

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
