UPDATE "matches" SET "start_time" = NOW() WHERE "start_time" IS NULL;--> statement-breakpoint
UPDATE "matches" SET "end_time" = NOW() + INTERVAL '2 hours' WHERE "end_time" IS NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "start_time" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "end_time" SET NOT NULL;