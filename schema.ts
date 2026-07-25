import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** One authoritative record for each candidate's Round 1 attempt. */
export const assessmentSessions = sqliteTable(
  "assessment_sessions",
  {
    id: text("id").primaryKey(),
    candidateId: text("candidate_id").notNull().unique(),
    candidateName: text("candidate_name").notNull(),
    candidateEmail: text("candidate_email"),
    status: text("status").notNull().default("registered"),
    registeredAt: text("registered_at").notNull(),
    startedAt: text("started_at"),
    submittedAt: text("submitted_at"),
    updatedAt: text("updated_at").notNull(),
    timeRemainingSeconds: integer("time_remaining_seconds").notNull().default(3600),
    attemptedCount: integer("attempted_count").notNull().default(0),
    score: integer("score"),
    focusWarnings: integer("focus_warnings").notNull().default(0),
    answersJson: text("answers_json").notNull().default("{}"),
    flaggedJson: text("flagged_json").notNull().default("[]"),
  },
  (table) => [
    index("assessment_sessions_status_idx").on(table.status),
    index("assessment_sessions_registered_at_idx").on(table.registeredAt),
  ],
);
