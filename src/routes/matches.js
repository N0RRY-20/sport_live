import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, matches } from "../db/index.js";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";

const MAX_LIMIT = 100;

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query.", details: parsed.error.issues });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (e) {
    console.error("Failed to list matches:", e);
    res.status(500).json({ error: "Failed to list matches." });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const {
    data: { startTime, endTime, homeScore, awayScore, status },
  } = parsed;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: status ?? "scheduled",
      })
      .returning();

    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json(event);
  } catch (e) {
    console.error("Failed to create match:", e);
    res.status(500).json({ error: "Failed to create match." });
  }
});
