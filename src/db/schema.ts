import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Exercise Library ────────────────────────────────────────────────────────

export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    muscleGroups: text("muscle_groups"),
    equipmentType: text("equipment_type"),
  },
  (table) => [uniqueIndex("exercises_name_idx").on(table.name)]
);

// ─── Workouts ────────────────────────────────────────────────────────────────

export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    startedAt: timestamp("started_at").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("workouts_user_id_idx").on(table.userId)]
);

// ─── Workout Exercises ───────────────────────────────────────────────────────

export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sets ─────────────────────────────────────────────────────────────────────

export const sets = pgTable("sets", {
  id: serial("id").primaryKey(),
  workoutExerciseId: integer("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: numeric("weight", { precision: 8, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type WorkoutSet = typeof sets.$inferSelect;
export type NewWorkoutSet = typeof sets.$inferInsert;
