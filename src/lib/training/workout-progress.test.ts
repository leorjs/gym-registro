import { describe, expect, it } from "vitest";
import type { WorkoutSet } from "@/types/training";
import { adaptiveRestSeconds, effortFromRpe, nextWeightForSet, progressionMessage, restCountdownCue, routineExercisesFromSets, rpeForEffort } from "./workout-progress";

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
    expect(progressionMessage("easy", 40, "kg")).toContain("40.5 kg");
  });

  it("ajusta el próximo peso de cada serie por separado", () => {
    expect(nextWeightForSet({ weight: 40, rpe: 6 }, "kg")).toBe(40.5);
    expect(nextWeightForSet({ weight: 40, rpe: 8 }, "kg")).toBe(40);
    expect(nextWeightForSet({ weight: 40, rpe: 9 }, "kg")).toBe(39.5);
  });

  it("guarda en la rutina la carga recomendada para cada serie", () => {
    const result = routineExercisesFromSets([
      { ...baseSet, rpe: 6 },
      { ...baseSet, id: "set-2", setNumber: 2, rpe: 9 },
    ]);
    expect(result[0].setPrescriptions).toEqual([
      { reps: 10, weight: 40.5 },
      { reps: 10, weight: 39.5 },
    ]);
  });

  it("agrega 30 segundos de descanso por cada serie ya completada", () => {
    expect(adaptiveRestSeconds(90, 0)).toBe(90);
    expect(adaptiveRestSeconds(90, 1)).toBe(120);
    expect(adaptiveRestSeconds(90, 2)).toBe(150);
  });

  it("emite avisos en los últimos diez segundos y refuerza los tres finales", () => {
    expect(restCountdownCue(11)).toBeNull();
    expect(restCountdownCue(10)).toEqual({ frequency: 660, durationMs: 80 });
    expect(restCountdownCue(3)).toEqual({ frequency: 880, durationMs: 130 });
    expect(restCountdownCue(1)).toEqual({ frequency: 880, durationMs: 220 });
    expect(restCountdownCue(0)).toBeNull();
  });
});
