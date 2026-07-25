CREATE TABLE `assessment_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`candidate_name` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`registered_at` text NOT NULL,
	`started_at` text,
	`submitted_at` text,
	`updated_at` text NOT NULL,
	`time_remaining_seconds` integer DEFAULT 3600 NOT NULL,
	`attempted_count` integer DEFAULT 0 NOT NULL,
	`score` integer,
	`focus_warnings` integer DEFAULT 0 NOT NULL,
	`answers_json` text DEFAULT '{}' NOT NULL,
	`flagged_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_sessions_candidate_id_unique` ON `assessment_sessions` (`candidate_id`);--> statement-breakpoint
CREATE INDEX `assessment_sessions_status_idx` ON `assessment_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `assessment_sessions_registered_at_idx` ON `assessment_sessions` (`registered_at`);