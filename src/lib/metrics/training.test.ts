import { describe, expect, it } from "vitest";
import {
  getBestSet,
  getCurrentStreak,
  getMuscleFrequency,
  getTotalVolume,
  getVolumeByWeek,
  getWeeklySessions,
} from "./training";
import type { Workout } from "@/types/training";

const workout = (date: string, weight: number, reps = 8): Workout => ({
  id: date,
  date,
  focus: "Test",
  durationMinutes: 50,
  status: "completed",
  totalVolume: weight * reps,
  totalSets: 1,
  muscles: ["pecho"],
  createdAt: date,
  updatedAt: date,
  sets: [
    {
      id: `${date}-set`,
      exerciseId: "press-banca",
      exerciseName: "Press banca",
      muscleGroup: "pecho",
      setNumber: 1,
      reps,
      weight,
      createdAt: date,
    },
  ],
});

describe("training metrics", () => {
  it("calcula volumen total desde sets", () => {
    expect(getTotalVolume([workout("2026-06-15", 60), workout("2026-06-16", 70, 5)])).toBe(830);
  });

  it("detecta el mejor set por peso y reps", () => {
    expect(getBestSet([workout("2026-06-15", 60), workout("2026-06-16", 70, 5)])?.weight).toBe(70);
  });

  it("calcula racha actual", () => {
    const today = new Date(2026, 5, 17);
    expect(getCurrentStreak([workout("2026-06-17", 60), workout("2026-06-16", 60)], today)).toBe(2);
  });

  it("calcula sesiones de la semana", () => {
    const today = new Date(2026, 5, 17);
    expect(getWeeklySessions([workout("2026-06-15", 60), workout("2026-06-10", 60)], today)).toBe(1);
  });

  it("agrupa volumen por semana y frecuencia muscular", () => {
    const today = new Date(2026, 5, 17);
    expect(getVolumeByWeek([workout("2026-06-15", 60)], 2, today).at(-1)?.volume).toBe(480);
    expect(getMuscleFrequency([workout("2026-06-15", 60)])).toEqual({ pecho: 1 });
  });
});
