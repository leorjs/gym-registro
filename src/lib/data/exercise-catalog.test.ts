import { describe, expect, it } from "vitest";
import { alternativesForExercise, exerciseByIdOrName, exerciseGifSrc, exerciseGuideFrameSrcs, openGymExercises, workoutGuideGymExercises } from "./exercise-catalog";
import { weeklyPlanTemplates } from "./weekly-plans";

describe("catálogo openGym", () => {
  it("conserva los 1.324 ejercicios originales y suma el catálogo de gimnasio", () => {
    expect(openGymExercises.length).toBeGreaterThan(1450);
    expect(new Set(openGymExercises.map((exercise) => exercise.id)).size).toBe(openGymExercises.length);
  });

  it("integra 148 ejercicios de Workout Guide sin movimientos domésticos, dominadas ni fondos", () => {
    expect(workoutGuideGymExercises).toHaveLength(148);
    expect(workoutGuideGymExercises.every((exercise) => exercise.tags.includes("gym"))).toBe(true);
    expect(workoutGuideGymExercises.every((exercise) => !["bodyweight", "chair", "doorway", "resistance band", "towel", "wall"].includes(exercise.equipment ?? ""))).toBe(true);
    expect(workoutGuideGymExercises.every((exercise) => !/(pull-up|chin-up|dip)/i.test(exercise.name))).toBe(true);
  });

  it("resuelve tres fotogramas SVG versionados para Workout Guide", () => {
    const benchPress = workoutGuideGymExercises.find((exercise) => exercise.guideSlug === "bench-press");
    const frames = exerciseGuideFrameSrcs(benchPress);
    expect(frames).toHaveLength(3);
    expect(frames.every((frame) => frame.includes("aac599224bb9780305239607ef98540b7e0ce389") && frame.endsWith(".svg"))).toBe(true);
  });

  it("aplica las nuevas ilustraciones a los ejercicios principales de las rutinas", () => {
    expect(exerciseByIdOrName("0025")?.guideSlug).toBe("bench-press");
    expect(exerciseByIdOrName("0577")?.guideSlug).toBe("machine-chest-press");
    expect(exerciseByIdOrName("0739")?.guideSlug).toBe("leg-press");
  });

  it("resuelve el GIF exacto de cada ejercicio", () => {
    const benchPress = exerciseByIdOrName("0025", "barbell bench press");
    expect(benchPress?.gif).toBe("0025-EIeI8Vf.gif");
    expect(exerciseGifSrc(benchPress)).toContain("/videos/0025-EIeI8Vf.gif");
  });

  it("ofrece planes distintos para 3, 4 y 7 días", () => {
    expect(weeklyPlanTemplates.some((plan) => plan.id === "full-body-3" && plan.days.length === 3)).toBe(true);
    expect(weeklyPlanTemplates.some((plan) => plan.id === "full-body-4" && plan.days.length === 4)).toBe(true);
    expect(weeklyPlanTemplates.some((plan) => plan.id === "six-plus-recovery-7" && plan.days.length === 7)).toBe(true);
  });

  it("ofrece reemplazos del mismo músculo objetivo", () => {
    const benchPress = exerciseByIdOrName("0025", "barbell bench press");
    const alternatives = alternativesForExercise(benchPress);
    expect(alternatives.length).toBeGreaterThan(10);
    expect(alternatives.every((exercise) => exercise.target === "pectorals")).toBe(true);
    expect(alternatives.some((exercise) => exercise.target === "triceps")).toBe(false);
    expect(alternatives.some((exercise) => exercise.id === "0025")).toBe(false);
  });
});
