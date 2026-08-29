import type { MuscleGroup, RoutineExercise, WeightUnit, WorkoutSet } from "@/types/training";

export type ExerciseEffort = "easy" | "right" | "hard";

const effortRpe: Record<ExerciseEffort, number> = {
  easy: 6,
  right: 8,
  hard: 9,
};

export function effortFromRpe(rpe?: number): ExerciseEffort | undefined {
  if (rpe === undefined) return undefined;
  if (rpe <= 6) return "easy";
  if (rpe >= 9) return "hard";
  return "right";
}

export function rpeForEffort(effort: ExerciseEffort) {
  return effortRpe[effort];
}

export function progressionMessage(effort: ExerciseEffort | undefined, weight: number, unit: WeightUnit) {
  const increment = unit === "lb" ? 1 : 0.5;
  if (effort === "easy") {
    return weight > 0
      ? `La próxima vez probá ${weight + increment} ${unit} y mantené las repeticiones.`
      : "La próxima vez agregá una carga pequeña y mantené las repeticiones.";
  }
  if (effort === "hard") {
    return "Mantené o bajá un poco la carga hasta completar las repeticiones con buena técnica.";
  }
  if (effort === "right") {
    return "Carga adecuada: repetila hasta que todas las series se sientan fáciles.";
  }
  return "Al terminar, indicá cómo se sintió para ajustar la próxima sesión.";
}

export function nextWeightForSet(set: Pick<WorkoutSet, "weight" | "rpe">, unit: WeightUnit) {
  const step = unit === "lb" ? 1 : 0.5;
  const effort = effortFromRpe(set.rpe);
  const adjustment = effort === "easy" ? step : effort === "hard" ? -step : 0;
  return Math.max(0, Math.round((set.weight + adjustment) * 100) / 100);
}

export function adaptiveRestSeconds(baseSeconds: number, completedSetsInExercise: number) {
  return Math.max(0, baseSeconds) + Math.max(0, completedSetsInExercise) * 30;
}

export function restCountdownCue(remainingSeconds: number) {
  if (remainingSeconds < 1 || remainingSeconds > 10) return null;
  const urgent = remainingSeconds <= 3;
  return {
    frequency: urgent ? 880 : 660,
    durationMs: remainingSeconds === 1 ? 220 : urgent ? 130 : 80,
  };
}

export function exerciseIndexAfterSwipe(currentIndex: number, exerciseCount: number, deltaX: number, deltaY: number) {
  const horizontalSwipe = Math.abs(deltaX) >= 56 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
  if (!horizontalSwipe || exerciseCount < 1) return currentIndex;
  const direction = deltaX < 0 ? 1 : -1;
  return Math.min(exerciseCount - 1, Math.max(0, currentIndex + direction));
}

export function routineExercisesFromSets(sets: WorkoutSet[], unit: WeightUnit = "kg"): RoutineExercise[] {
  const order: string[] = [];
  const grouped = new Map<string, WorkoutSet[]>();

  sets.forEach((set) => {
    const key = set.exerciseId || set.exerciseName;
    if (!grouped.has(key)) {
      order.push(key);
      grouped.set(key, []);
    }
    grouped.get(key)!.push(set);
  });

  return order.map((key) => {
    const exerciseSets = grouped.get(key)!;
    const first = exerciseSets[0];
    return {
      exerciseId: first.exerciseId,
      exerciseName: first.exerciseName,
      muscleGroup: first.muscleGroup as MuscleGroup,
      sets: exerciseSets.length,
      reps: first.reps,
      weight: first.weight,
      restSeconds: first.restSeconds ?? 90,
      setPrescriptions: exerciseSets.map((set) => ({ reps: set.reps, weight: nextWeightForSet(set, unit) })),
    };
  });
}
