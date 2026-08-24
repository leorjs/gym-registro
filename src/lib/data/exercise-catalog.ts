import { EXDB, type OpenGymRawExercise } from "./opengym-exercises-data.js";
import type { Exercise, MuscleGroup } from "../../types/training";

const MEDIA_VERSION = "7455efae41b330c265e7cd4b78dfa848e7ce5ebd";
const MEDIA_BASE = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@${MEDIA_VERSION}`;

function muscleGroupOf(exercise: OpenGymRawExercise): MuscleGroup {
  if (exercise.tg === "glutes") return "gluteos";
  if (exercise.bp === "chest") return "pecho";
  if (exercise.bp === "back") return "espalda";
  if (exercise.bp === "shoulders" || exercise.bp === "neck") return "hombros";
  if (exercise.bp === "upper arms" || exercise.bp === "lower arms") return "brazos";
  if (exercise.bp === "upper legs" || exercise.bp === "lower legs") return "piernas";
  if (exercise.bp === "waist") return "core";
  return "full-body";
}

export const openGymExercises: Exercise[] = EXDB.map((exercise) => ({
  id: exercise.id,
  name: exercise.n,
  muscleGroup: muscleGroupOf(exercise),
  tags: [exercise.bp, exercise.eq, exercise.tg, exercise.mg, ...exercise.sm].filter(Boolean),
  favorite: false,
  custom: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  bodyPart: exercise.bp,
  equipment: exercise.eq,
  target: exercise.tg,
  secondaryMuscles: exercise.sm,
  instructions: exercise.st,
  image: exercise.img,
  gif: exercise.gif,
}));

const byId = new Map(openGymExercises.map((exercise) => [exercise.id, exercise]));
const byName = new Map(openGymExercises.map((exercise) => [exercise.name.toLowerCase(), exercise]));

const spanishAliases: Record<string, string> = {
  "press banca": "0025",
  sentadilla: "0043",
  "peso muerto rumano": "0085",
  "press militar": "1457",
  dominadas: "0651",
  "remo con barra": "0027",
  plancha: "0464",
};

export const exerciseBodyParts = [...new Set(openGymExercises.map((exercise) => exercise.bodyPart ?? ""))].filter(Boolean).sort();

export function equipmentFor(exercises: Exercise[]) {
  const counts = new Map<string, number>();
  exercises.forEach((exercise) => {
    if (exercise.equipment) counts.set(exercise.equipment, (counts.get(exercise.equipment) ?? 0) + 1);
  });
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([equipment]) => equipment);
}

export function exerciseByIdOrName(id?: string, name?: string) {
  if (id && byId.has(id)) return byId.get(id);
  if (!name) return undefined;
  return byName.get(name.toLowerCase()) ?? byId.get(spanishAliases[name.toLowerCase()]);
}

export function exerciseImageSrc(exercise?: Pick<Exercise, "image">) {
  return exercise?.image ? `${MEDIA_BASE}/images/${exercise.image}` : undefined;
}

export function exerciseGifSrc(exercise?: Pick<Exercise, "gif">) {
  return exercise?.gif ? `${MEDIA_BASE}/videos/${exercise.gif}` : undefined;
}

export async function spanishInstructionsFor(exercise: Exercise) {
  const { default: instructions } = await import("./opengym-instructions-es.js");
  return instructions[exercise.id] ?? exercise.instructions ?? [];
}

export const exerciseMediaAttribution = "© Gym visual — https://gymvisual.com/";
