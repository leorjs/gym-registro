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
  targetWeight?: number;
  priorityMuscles: MuscleGroup[];
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BodyWeightEntry = {
  id: string;
  date: string;
  weight: number;
  createdAt: string;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  tags: string[];
  favorite: boolean;
  custom: boolean;
  createdAt: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  image?: string;
  gif?: string;
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
  completed?: boolean;
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
  exerciseId?: string;
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

export type TrainingLevel = "principiante" | "intermedio" | "avanzado";

export type DynamicRule = {
  trigger: string;
  action: string;
};

export type WeeklyPlanDay = {
  weekday: number;
  label: string;
  routineId: string;
  focus: string;
  intensity: "suave" | "media" | "alta";
};

export type WeeklyPlanTemplate = {
  id: string;
  name: string;
  shortName: string;
  daysPerWeek: number;
  level: TrainingLevel;
  goal: Goal;
  image: string;
  description: string;
  bestFor: string;
  coverage: MuscleGroup[];
  days: WeeklyPlanDay[];
  dynamicRules: DynamicRule[];
};

export type UserWeeklyPlan = {
  id: "current";
  templateId: string;
  name: string;
  daysPerWeek: number;
  days: WeeklyPlanDay[];
  updatedAt: string;
};
