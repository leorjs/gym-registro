import { describe, expect, it } from "vitest";
import { estimateRoutineMinutes, starterRoutines } from "./catalog";
import { exerciseByIdOrName, exerciseGifSrc } from "./exercise-catalog";

describe("rutinas iniciales", () => {
  it("incluye seis ejercicios en cada sesión", () => {
    expect(starterRoutines.every((routine) => routine.exercises.length >= 6)).toBe(true);
  });

  it("resuelve un visual animado para todos los ejercicios", () => {
    for (const routine of starterRoutines) {
      for (const item of routine.exercises) {
        const exercise = exerciseByIdOrName(item.exerciseId, item.exerciseName);
        expect(exercise, `${routine.name}: ${item.exerciseName}`).toBeDefined();
        expect(exerciseGifSrc(exercise), `${routine.name}: ${item.exerciseName}`).toMatch(/\.gif$/);
      }
    }
  });

  it("estima cerca de una hora para las rutinas de fuerza", () => {
    const strengthRoutines = starterRoutines.filter((routine) => routine.id !== "recovery");
    for (const routine of strengthRoutines) {
      expect(estimateRoutineMinutes(routine), routine.name).toBeGreaterThanOrEqual(50);
      expect(estimateRoutineMinutes(routine), routine.name).toBeLessThanOrEqual(75);
    }
  });

  it("asocia Fondos de Push A al GIF de triceps dip", () => {
    const pushA = starterRoutines.find((routine) => routine.id === "push-a");
    const dips = pushA?.exercises.find((exercise) => exercise.exerciseName === "Fondos");
    expect(dips?.exerciseId).toBe("0814");
    expect(exerciseGifSrc(exerciseByIdOrName(dips?.exerciseId, dips?.exerciseName))).toContain("0814-X6C6i5Y.gif");
  });
});
