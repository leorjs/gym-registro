import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import type { MuscleGroup, Workout, WorkoutSet } from "@/types/training";

export function getSetVolume(set: WorkoutSet) {
  return set.reps * set.weight;
}

export function getWorkoutVolume(workout: Pick<Workout, "sets">) {
  return workout.sets.reduce((sum, set) => sum + getSetVolume(set), 0);
}

export function getTotalVolume(workouts: Workout[]) {
  return workouts.reduce((sum, workout) => sum + getWorkoutVolume(workout), 0);
}

export function getBestSet(workouts: Workout[]) {
  return workouts
    .flatMap((workout) => workout.sets)
    .sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0];
}

export function getCurrentStreak(workouts: Pick<Workout, "date">[], today = new Date()) {
  const trainedDays = Array.from(new Set(workouts.map((workout) => workout.date))).sort().reverse();
  if (!trainedDays.length) return 0;

  let cursor = today;
  let streak = 0;
  const daySet = new Set(trainedDays);

  if (!daySet.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = parseISO(trainedDays[0]);
    if (differenceInCalendarDays(today, cursor) > 1) return 0;
  }

  while (daySet.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }

  return streak;
}

export function getWeeklySessions(workouts: Pick<Workout, "date">[], date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return workouts.filter((workout) => {
    const workoutDate = parseISO(workout.date);
    return (
      isSameDay(workoutDate, start) ||
      isSameDay(workoutDate, end) ||
      (isAfter(workoutDate, start) && isBefore(workoutDate, end))
    );
  }).length;
}

export function getVolumeByWeek(workouts: Workout[], weeks = 4, today = new Date()) {
  return Array.from({ length: weeks }, (_, index) => {
    const weekDate = subWeeks(today, weeks - index - 1);
    const start = startOfWeek(weekDate, { weekStartsOn: 1 });
    const end = endOfWeek(weekDate, { weekStartsOn: 1 });
    const volume = workouts
      .filter((workout) => {
        const workoutDate = parseISO(workout.date);
        return (
          isSameDay(workoutDate, start) ||
          isSameDay(workoutDate, end) ||
          (isAfter(workoutDate, start) && isBefore(workoutDate, end))
        );
      })
      .reduce((sum, workout) => sum + getWorkoutVolume(workout), 0);

    return {
      label: index === weeks - 1 ? "Esta" : `-${weeks - index - 1}`,
      volume,
    };
  });
}

export function getMuscleFrequency(workouts: Workout[]) {
  return workouts.reduce<Record<MuscleGroup, number>>((acc, workout) => {
    workout.muscles.forEach((muscle) => {
      acc[muscle] = (acc[muscle] ?? 0) + 1;
    });
    return acc;
  }, {} as Record<MuscleGroup, number>);
}
