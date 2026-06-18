export type WeightUnit = "kg" | "lb";

export type MuscleGroup =
  | "pecho"
  | "espalda"
  | "piernas"
  | "hombros"
  | "brazos"
  | "core"
  | "gluteos"
  | "full-body";

export type Goal = "fuerza" | "hipertrofia" | "resistencia" | "salud";

export type WorkoutStatus = "draft" | "completed";

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  unit: WeightUnit;
  goal: Goal;
  weeklyGoal: number;
  priorityMuscles: MuscleGroup[];
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  tags: string[];
  favorite: boolean;
  custom: boolean;
  createdAt: string;
};

export type WorkoutSet = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
  restSeconds?: number;
  createdAt: string;
};

export type Workout = {
  id: string;
  date: string;
  focus: string;
  durationMinutes: number;
  status: WorkoutStatus;
  notes?: string;
  totalVolume: number;
  totalSets: number;
  muscles: MuscleGroup[];
  sets: WorkoutSet[];
  createdAt: string;
  updatedAt: string;
};

export type RoutineExercise = {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  exercises: RoutineExercise[];
  favorite: boolean;
  createdAt: string;
};
