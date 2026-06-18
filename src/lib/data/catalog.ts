import type { Exercise, Routine } from "@/types/training";

const now = new Date().toISOString();

export const baseExercises: Exercise[] = [
  { id: "press-banca", name: "Press banca", muscleGroup: "pecho", tags: ["barra", "fuerza"], favorite: true, custom: false, createdAt: now },
  { id: "sentadilla", name: "Sentadilla", muscleGroup: "piernas", tags: ["barra", "compuesto"], favorite: true, custom: false, createdAt: now },
  { id: "peso-muerto", name: "Peso muerto", muscleGroup: "espalda", tags: ["barra", "posterior"], favorite: false, custom: false, createdAt: now },
  { id: "dominadas", name: "Dominadas", muscleGroup: "espalda", tags: ["calistenia"], favorite: true, custom: false, createdAt: now },
  { id: "press-militar", name: "Press militar", muscleGroup: "hombros", tags: ["barra"], favorite: false, custom: false, createdAt: now },
  { id: "remo-barra", name: "Remo con barra", muscleGroup: "espalda", tags: ["barra"], favorite: false, custom: false, createdAt: now },
  { id: "hip-thrust", name: "Hip thrust", muscleGroup: "gluteos", tags: ["barra"], favorite: false, custom: false, createdAt: now },
  { id: "plancha", name: "Plancha", muscleGroup: "core", tags: ["isometrico"], favorite: false, custom: false, createdAt: now },
];

export const starterRoutines: Routine[] = [
  {
    id: "push",
    name: "Empuje",
    description: "Pecho, hombros y tríceps con foco en fuerza controlada.",
    muscleGroups: ["pecho", "hombros", "brazos"],
    favorite: true,
    createdAt: now,
    exercises: [
      { exerciseName: "Press banca", muscleGroup: "pecho", sets: 4, reps: 8, weight: 60, restSeconds: 120 },
      { exerciseName: "Press militar", muscleGroup: "hombros", sets: 3, reps: 8, weight: 35, restSeconds: 90 },
      { exerciseName: "Fondos", muscleGroup: "brazos", sets: 3, reps: 10, weight: 0, restSeconds: 90 },
    ],
  },
  {
    id: "pull",
    name: "Tirón",
    description: "Espalda y bíceps con volumen moderado.",
    muscleGroups: ["espalda", "brazos"],
    favorite: true,
    createdAt: now,
    exercises: [
      { exerciseName: "Dominadas", muscleGroup: "espalda", sets: 4, reps: 6, weight: 0, restSeconds: 120 },
      { exerciseName: "Remo con barra", muscleGroup: "espalda", sets: 4, reps: 8, weight: 55, restSeconds: 120 },
      { exerciseName: "Curl bíceps", muscleGroup: "brazos", sets: 3, reps: 12, weight: 14, restSeconds: 75 },
    ],
  },
  {
    id: "legs",
    name: "Piernas",
    description: "Base fuerte para tren inferior.",
    muscleGroups: ["piernas", "gluteos", "core"],
    favorite: true,
    createdAt: now,
    exercises: [
      { exerciseName: "Sentadilla", muscleGroup: "piernas", sets: 4, reps: 8, weight: 75, restSeconds: 150 },
      { exerciseName: "Peso muerto rumano", muscleGroup: "gluteos", sets: 3, reps: 10, weight: 65, restSeconds: 120 },
      { exerciseName: "Plancha", muscleGroup: "core", sets: 3, reps: 45, weight: 0, restSeconds: 60 },
    ],
  },
  {
    id: "full-body",
    name: "Full body",
    description: "Sesión completa cuando querés cubrir todo sin complicarte.",
    muscleGroups: ["full-body"],
    favorite: false,
    createdAt: now,
    exercises: [
      { exerciseName: "Sentadilla", muscleGroup: "piernas", sets: 3, reps: 8, weight: 70, restSeconds: 120 },
      { exerciseName: "Press banca", muscleGroup: "pecho", sets: 3, reps: 8, weight: 55, restSeconds: 120 },
      { exerciseName: "Remo con barra", muscleGroup: "espalda", sets: 3, reps: 10, weight: 45, restSeconds: 90 },
    ],
  },
];
