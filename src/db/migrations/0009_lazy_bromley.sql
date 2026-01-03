ALTER TABLE "chirps" ALTER COLUMN "created_at" SET DEFAULT '2026-01-02 16:06:28.431';--> statement-breakpoint
ALTER TABLE "chirps" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-02 16:06:28.431';--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET DEFAULT '2026-01-02 16:06:28.432';--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-02 16:06:28.432';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-01-02 16:06:28.430';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-02 16:06:28.430';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_chirpy_red" boolean DEFAULT false NOT NULL;