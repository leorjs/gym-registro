import { EXDB, type OpenGymRawExercise } from "./opengym-exercises-data.js";
import { workoutGuideGymRecords } from "./workout-guide-gym-data";
import type { Exercise, MuscleGroup } from "../../types/training";

const MEDIA_VERSION = "7455efae41b330c265e7cd4b78dfa848e7ce5ebd";
const MEDIA_BASE = `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@${MEDIA_VERSION}`;
const WORKOUT_GUIDE_VERSION = "aac599224bb9780305239607ef98540b7e0ce389";
const WORKOUT_GUIDE_BASE = `https://cdn.jsdelivr.net/gh/bryllim/workout-guide@${WORKOUT_GUIDE_VERSION}/packages/workout-guide/assets`;

const normalizedName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

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

function guideMuscleGroup(primaryMuscle: string): MuscleGroup {
  if (primaryMuscle === "Chest") return "pecho";
  if (["Back", "Lats", "Upper Back", "Lower Back", "Posterior Chain"].includes(primaryMuscle)) return "espalda";
  if (["Shoulders", "Rear Delts"].includes(primaryMuscle)) return "hombros";
  if (["Biceps", "Triceps", "Forearms"].includes(primaryMuscle)) return "brazos";
  if (["Quads", "Hamstrings", "Calves", "Legs", "Adductors"].includes(primaryMuscle)) return "piernas";
  if (primaryMuscle === "Glutes") return "gluteos";
  if (primaryMuscle === "Core") return "core";
  return "full-body";
}

function guideTarget(primaryMuscle: string) {
  const targets: Record<string, string> = {
    Chest: "pectorals", Shoulders: "delts", "Rear Delts": "delts", Back: "upper back", Lats: "lats",
    "Upper Back": "upper back", "Lower Back": "lower back", "Posterior Chain": "hamstrings", Biceps: "biceps",
    Triceps: "triceps", Forearms: "forearms", Quads: "quadriceps", Hamstrings: "hamstrings", Calves: "calves",
    Legs: "quadriceps", Adductors: "adductors", Glutes: "glutes", Core: "abs",
  };
  return targets[primaryMuscle] ?? primaryMuscle.toLowerCase();
}

function guideBodyPart(primaryMuscle: string) {
  const group = guideMuscleGroup(primaryMuscle);
  if (group === "pecho") return "chest";
  if (group === "espalda") return "back";
  if (group === "hombros") return "shoulders";
  if (group === "brazos") return "upper arms";
  if (group === "piernas" || group === "gluteos") return "upper legs";
  if (group === "core") return "waist";
  return "cardio";
}

const guideByName = new Map(workoutGuideGymRecords.map((exercise) => [normalizedName(exercise.name), exercise]));
const guideSlugByOpenGymId: Record<string, string> = {
  "0025": "bench-press", "0027": "barbell-row", "0030": "close-grip-bench-press", "0043": "squat",
  "0070": "preacher-curl", "0085": "romanian-deadlift", "0150": "lat-pulldown", "0175": "cable-crunch",
  "0180": "seated-row", "0194": "overhead-tricep-extension", "0200": "rope-tricep-pushdown", "0203": "face-pull",
  "0294": "bicep-curl", "0308": "dumbbell-fly", "0313": "hammer-curl", "0314": "incline-dumbbell-press",
  "0334": "lateral-raise", "0336": "walking-lunge", "0405": "seated-dumbbell-press", "0577": "machine-chest-press",
  "0585": "leg-extension", "0586": "leg-curl", "0592": "preacher-curl", "0603": "machine-shoulder-press",
  "0605": "standing-calf-raise", "0739": "leg-press", "0846": "weighted-russian-twist", "1350": "machine-row",
  "1409": "barbell-glute-bridge", "1457": "overhead-press", "1459": "dumbbell-romanian-deadlift",
  "2137": "arnold-press", "2330": "lat-pulldown", "3666": "treadmill-incline-walk",
};

const baseOpenGymExercises: Exercise[] = EXDB.map((exercise) => ({
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
  guideSlug: guideSlugByOpenGymId[exercise.id] ?? guideByName.get(normalizedName(exercise.n))?.slug,
}));

export const workoutGuideGymExercises: Exercise[] = workoutGuideGymRecords.map((exercise) => ({
  id: `wg-${exercise.slug}`,
  name: exercise.name.toLowerCase(),
  muscleGroup: guideMuscleGroup(exercise.primaryMuscle),
  tags: ["gym", "workout-guide", exercise.equipment, exercise.primaryMuscle, ...exercise.secondaryMuscles].map((tag) => tag.toLowerCase()),
  favorite: false,
  custom: false,
  createdAt: "2026-08-27T00:00:00.000Z",
  bodyPart: guideBodyPart(exercise.primaryMuscle),
  equipment: exercise.equipment.toLowerCase(),
  target: guideTarget(exercise.primaryMuscle),
  secondaryMuscles: exercise.secondaryMuscles.map((muscle) => muscle.toLowerCase()),
  guideSlug: exercise.slug,
}));

const baseNames = new Set(baseOpenGymExercises.map((exercise) => normalizedName(exercise.name)));

export const openGymExercises: Exercise[] = [
  ...baseOpenGymExercises,
  ...workoutGuideGymExercises.filter((exercise) => !baseNames.has(normalizedName(exercise.name))),
];

const byId = new Map(openGymExercises.map((exercise) => [exercise.id, exercise]));
const byName = new Map(openGymExercises.map((exercise) => [exercise.name.toLowerCase(), exercise]));

const spanishAliases: Record<string, string> = {
  "aperturas con mancuernas": "0308",
  "caminata inclinada (minutos)": "3666",
  "curl de bíceps": "0294",
  "curl femoral": "0586",
  "curl martillo": "0313",
  "curl predicador": "0070",
  "dead bug": "0276",
  "press banca": "0025",
  "press banca agarre cerrado": "0030",
  "press inclinado con mancuernas": "0314",
  "press de hombros con mancuernas": "0405",
  "press arnold": "2137",
  sentadilla: "0043",
  "sentadilla hack con barra": "0046",
  "peso muerto rumano": "0085",
  "press militar": "1457",
  dominadas: "0652",
  "remo con barra": "0027",
  "remo sentado en polea": "0180",
  "jalón al pecho": "0150",
  "face pull": "0203",
  fondos: "0814",
  "tríceps con cuerda": "0200",
  "prensa de piernas": "0739",
  "extensión de piernas": "0585",
  "elevación de gemelos": "0605",
  "elevación de gemelos en escalón": "1490",
  "elevación de piernas colgado": "0472",
  "elevaciones laterales": "0334",
  "zancadas con mancuernas": "0336",
  "puente de glúteos": "3013",
  "puente de glúteos con barra": "1409",
  "crunch en polea": "0175",
  "russian twist": "0687",
  "russian twist con peso": "0846",
  "world greatest stretch": "1604",
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

export function alternativesForExercise(exercise?: Exercise, excludedIds: string[] = []) {
  if (!exercise) return [];
  const excluded = new Set([exercise.id, ...excludedIds]);
  return openGymExercises.filter((candidate) => {
    if (excluded.has(candidate.id)) return false;
    if (exercise.target) return candidate.target === exercise.target;
    return candidate.muscleGroup === exercise.muscleGroup;
  });
}

export function exerciseGuideFrameSrcs(exercise?: Pick<Exercise, "guideSlug">) {
  if (!exercise?.guideSlug) return [];
  return [1, 2, 3].map((frame) => `${WORKOUT_GUIDE_BASE}/${exercise.guideSlug}/frame-${frame}.svg`);
}

export function exerciseImageSrc(exercise?: Pick<Exercise, "image" | "guideSlug">) {
  const guideFrame = exerciseGuideFrameSrcs(exercise)[0];
  if (guideFrame) return guideFrame;
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

export function exerciseAttributionFor(exercise?: Pick<Exercise, "guideSlug">) {
  return exercise?.guideSlug
    ? { label: "Ilustraciones: Bryl Lim / Everkinetic · CC BY-SA 4.0", href: "https://bryllim.github.io/workout-guide/" }
    : { label: exerciseMediaAttribution, href: "https://gymvisual.com/" };
}
