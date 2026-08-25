import { describe, expect, it } from "vitest";
import type { WorkoutSet } from "@/types/training";
import { effortFromRpe, progressionMessage, routineExercisesFromSets, rpeForEffort } from "./workout-progress";

const baseSet: WorkoutSet = {
  id: "set-1",
  exerciseId: "exercise-1",
  exerciseName: "Press de pecho",
  muscleGroup: "pecho",
  setNumber: 1,
  reps: 10,
  weight: 40,
  restSeconds: 90,
  completed: true,
  createdAt: "2026-08-24T00:00:00.000Z",
};

describe("progreso del entrenamiento", () => {
  it("conserva el peso y las repeticiones de cada serie al actualizar la rutina", () => {
    const result = routineExercisesFromSets([
      baseSet,
      { ...baseSet, id: "set-2", setNumber: 2, reps: 9, weight: 42.5 },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].setPrescriptions).toEqual([
      { reps: 10, weight: 40 },
      { reps: 9, weight: 42.5 },
    ]);
  });

  it("mantiene separados los ejercicios sustituidos", () => {
    const result = routineExercisesFromSets([
      baseSet,
      { ...baseSet, id: "set-2", exerciseId: "exercise-2", exerciseName: "Press inclinado" },
    ]);

    expect(result.map((exercise) => exercise.exerciseName)).toEqual(["Press de pecho", "Press inclinado"]);
  });

  it("traduce la percepción fácil a una progresión concreta", () => {
    expect(effortFromRpe(rpeForEffort("easy"))).toBe("easy");
    expect(progressionMessage("easy", 40, "kg")).toContain("42.5 kg");
  });
});
