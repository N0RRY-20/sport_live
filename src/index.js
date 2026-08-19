import express from "express";
import { eq } from "drizzle-orm";
import { db, matches, commentary } from "./db/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Health check / Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Real-time Sports API is running!" });
});

// 2. Get all matches (including their live commentary)
app.get("/matches", async (req, res) => {
  try {
    const allMatches = await db.query.matches.findMany({
      with: {
        commentaries: true,
      },
    });
    res.json(allMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create a new match
app.post("/matches", async (req, res) => {
  try {
    const { sport, homeTeam, awayTeam, startTime } = req.body;
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport,
        homeTeam,
        awayTeam,
        startTime: startTime ? new Date(startTime) : new Date(),
      })
      .returning();

    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Add live commentary event to a match
app.post("/matches/:id/commentary", async (req, res) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    const {
      minute,
      sequence,
      period,
      eventType,
      actor,
      team,
      message,
      metadata,
      tags,
    } = req.body;

    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId,
        minute,
        sequence,
        period,
        eventType,
        actor,
        team,
        message,
        metadata,
        tags,
      })
      .returning();

    res.status(201).json(newCommentary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
