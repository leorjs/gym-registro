import { describe, expect, it } from "vitest";
import { exerciseByIdOrName, exerciseGifSrc, openGymExercises } from "./exercise-catalog";
import { weeklyPlanTemplates } from "./weekly-plans";

describe("catálogo openGym", () => {
  it("incluye los 1.324 ejercicios del repositorio original", () => {
    expect(openGymExercises).toHaveLength(1324);
    expect(new Set(openGymExercises.map((exercise) => exercise.id)).size).toBe(1324);
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
});
