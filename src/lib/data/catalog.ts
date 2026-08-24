import type { Exercise, MuscleGroup, Routine, RoutineExercise } from "../../types/training";
import { openGymExercises } from "./exercise-catalog";

const now = new Date().toISOString();

export const baseExercises: Exercise[] = openGymExercises;

function rx(
  exerciseId: string,
  exerciseName: string,
  muscleGroup: MuscleGroup,
  sets: number,
  reps: number,
  weight: number,
  restSeconds: number,
): RoutineExercise {
  return { exerciseId, exerciseName, muscleGroup, sets, reps, weight, restSeconds };
}

function routine(
  id: string,
  name: string,
  description: string,
  muscleGroups: MuscleGroup[],
  exercises: RoutineExercise[],
  favorite = false,
): Routine {
  return { id, name, description, muscleGroups, exercises, favorite, createdAt: now };
}

export function estimateRoutineMinutes(item: Pick<Routine, "exercises">) {
  const warmupSeconds = 10 * 60;
  const transitionSeconds = item.exercises.length * 2 * 60;
  const trainingSeconds = item.exercises.reduce(
    (total, exercise) => total + exercise.sets * 45 + Math.max(0, exercise.sets - 1) * exercise.restSeconds,
    0,
  );
  return Math.round((warmupSeconds + transitionSeconds + trainingSeconds) / 60);
}

export const starterRoutines: Routine[] = [
  routine("push", "Empuje", "Pecho, hombros y tríceps completos en aproximadamente una hora.", ["pecho", "hombros", "brazos"], [
    rx("0025", "Press banca", "pecho", 4, 8, 60, 120),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 24, 90),
    rx("1457", "Press militar", "hombros", 3, 8, 35, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 8, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 25, 60),
    rx("0814", "Fondos", "brazos", 3, 10, 0, 90),
  ], true),
  routine("pull", "Tirón", "Espalda completa, deltoides posterior y bíceps con volumen equilibrado.", ["espalda", "hombros", "brazos"], [
    rx("0652", "Dominadas", "espalda", 4, 6, 0, 120),
    rx("0027", "Remo con barra", "espalda", 4, 8, 55, 120),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0180", "Remo sentado en polea", "espalda", 3, 12, 45, 90),
    rx("0203", "Face pull", "hombros", 3, 14, 18, 60),
    rx("0294", "Curl de bíceps", "brazos", 3, 12, 14, 75),
  ], true),
  routine("legs", "Piernas", "Cuádriceps, posterior, glúteos y pantorrillas en una sesión completa.", ["piernas", "gluteos", "core"], [
    rx("0043", "Sentadilla", "piernas", 4, 8, 75, 150),
    rx("0085", "Peso muerto rumano", "gluteos", 4, 8, 65, 120),
    rx("0739", "Prensa de piernas", "piernas", 3, 12, 130, 120),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 45, 75),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
  ], true),
  routine("full-body", "Full body", "Piernas, empuje, tracción, hombros y core en seis movimientos.", ["full-body"], [
    rx("0043", "Sentadilla", "piernas", 3, 8, 70, 120),
    rx("0025", "Press banca", "pecho", 3, 8, 55, 120),
    rx("0027", "Remo con barra", "espalda", 3, 10, 45, 90),
    rx("0085", "Peso muerto rumano", "gluteos", 3, 10, 60, 120),
    rx("0405", "Press de hombros con mancuernas", "hombros", 3, 10, 18, 90),
    rx("0175", "Crunch en polea", "core", 3, 12, 25, 60),
  ]),
  routine("full-body-a", "Full Body A", "Sentadilla, empuje y tracción con accesorios de hombros y core.", ["full-body"], [
    rx("0043", "Sentadilla", "piernas", 3, 8, 70, 120),
    rx("0025", "Press banca", "pecho", 3, 8, 55, 120),
    rx("0027", "Remo con barra", "espalda", 3, 10, 45, 90),
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 8, 60),
    rx("0276", "Dead bug", "core", 3, 10, 0, 60),
  ], true),
  routine("full-body-b", "Full Body B", "Bisagra, hombros y tirón vertical con glúteos, brazos y abdomen.", ["full-body"], [
    rx("0085", "Peso muerto rumano", "gluteos", 3, 10, 65, 120),
    rx("1457", "Press militar", "hombros", 3, 8, 35, 90),
    rx("0652", "Dominadas", "espalda", 4, 6, 0, 120),
    rx("1409", "Puente de glúteos con barra", "gluteos", 3, 10, 70, 90),
    rx("0294", "Curl de bíceps", "brazos", 3, 12, 14, 75),
    rx("0175", "Crunch en polea", "core", 3, 12, 25, 60),
  ]),
  routine("full-body-c", "Full Body C", "Pierna unilateral, pecho, espalda, posterior, hombros y tríceps.", ["full-body"], [
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 24, 90),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 8, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 25, 60),
  ]),
  routine("upper-push", "Upper Push", "Pecho completo, hombros y tríceps con seis ejercicios.", ["pecho", "hombros", "brazos"], [
    rx("0025", "Press banca", "pecho", 4, 6, 62.5, 150),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 24, 90),
    rx("1457", "Press militar", "hombros", 3, 8, 35, 90),
    rx("0308", "Aperturas con mancuernas", "pecho", 3, 12, 12, 60),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 8, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 25, 60),
  ]),
  routine("upper-pull", "Upper Pull", "Espalda vertical y horizontal, deltoides posterior y bíceps.", ["espalda", "brazos", "hombros"], [
    rx("0652", "Dominadas", "espalda", 4, 6, 0, 120),
    rx("0027", "Remo con barra", "espalda", 4, 8, 55, 120),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0180", "Remo sentado en polea", "espalda", 3, 12, 45, 90),
    rx("0203", "Face pull", "hombros", 3, 14, 18, 60),
    rx("0294", "Curl de bíceps", "brazos", 3, 12, 14, 75),
  ]),
  routine("lower-squat", "Lower Squat", "Piernas completas con énfasis en cuádriceps y posterior.", ["piernas", "gluteos", "core"], [
    rx("0043", "Sentadilla", "piernas", 4, 6, 80, 150),
    rx("0739", "Prensa de piernas", "piernas", 3, 12, 130, 120),
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 45, 75),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
  ]),
  routine("lower-hinge", "Lower Hinge", "Posterior, glúteos, pierna unilateral, pantorrillas y estabilidad.", ["piernas", "gluteos", "core"], [
    rx("0085", "Peso muerto rumano", "gluteos", 4, 8, 70, 150),
    rx("1409", "Puente de glúteos con barra", "gluteos", 4, 10, 80, 120),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
    rx("0276", "Dead bug", "core", 3, 10, 0, 60),
  ]),
  routine("upper-mix", "Upper Mix", "Torso completo con dos empujes, dos tirones, hombros y brazos.", ["pecho", "espalda", "hombros", "brazos"], [
    rx("0025", "Press banca", "pecho", 3, 8, 55, 120),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 24, 90),
    rx("0180", "Remo sentado en polea", "espalda", 3, 12, 45, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 8, 60),
    rx("0313", "Curl martillo", "brazos", 3, 12, 14, 60),
  ]),
  routine("lower-core", "Lower + Core", "Pierna completa, glúteos y dos estímulos directos de abdomen.", ["piernas", "gluteos", "core"], [
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("1409", "Puente de glúteos con barra", "gluteos", 3, 12, 75, 90),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 45, 75),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0472", "Elevación de piernas colgado", "core", 3, 10, 0, 60),
    rx("0846", "Russian twist con peso", "core", 3, 20, 8, 60),
  ]),
  routine("push-a", "Push A", "Empuje pesado de pecho con cobertura completa de hombros y tríceps.", ["pecho", "hombros", "brazos"], [
    rx("0025", "Press banca", "pecho", 4, 6, 65, 150),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 24, 90),
    rx("1457", "Press militar", "hombros", 3, 8, 35, 90),
    rx("0308", "Aperturas con mancuernas", "pecho", 3, 12, 12, 60),
    rx("0814", "Fondos", "brazos", 3, 10, 0, 90),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 25, 60),
  ]),
  routine("pull-a", "Pull A", "Tirón pesado con amplitud, densidad, deltoides posterior y bíceps.", ["espalda", "hombros", "brazos"], [
    rx("0652", "Dominadas", "espalda", 4, 6, 0, 120),
    rx("0027", "Remo con barra", "espalda", 4, 8, 55, 120),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0203", "Face pull", "hombros", 3, 14, 18, 60),
    rx("0070", "Curl predicador", "brazos", 3, 10, 20, 75),
    rx("0313", "Curl martillo", "brazos", 3, 12, 14, 60),
  ]),
  routine("legs-a", "Legs A", "Pierna pesada con cuádriceps, posterior, glúteos y gemelos.", ["piernas", "gluteos", "core"], [
    rx("0043", "Sentadilla", "piernas", 4, 6, 80, 150),
    rx("0085", "Peso muerto rumano", "gluteos", 4, 8, 70, 120),
    rx("0739", "Prensa de piernas", "piernas", 3, 12, 130, 120),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 45, 75),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
  ]),
  routine("push-b", "Push B", "Empuje con volumen para pecho, hombros y tríceps desde distintos ángulos.", ["pecho", "hombros", "brazos"], [
    rx("0314", "Press inclinado con mancuernas", "pecho", 4, 10, 24, 90),
    rx("0030", "Press banca agarre cerrado", "pecho", 3, 8, 45, 90),
    rx("2137", "Press Arnold", "hombros", 3, 10, 16, 90),
    rx("0334", "Elevaciones laterales", "hombros", 4, 14, 8, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 25, 60),
    rx("0814", "Fondos", "brazos", 3, 10, 0, 90),
  ]),
  routine("pull-b", "Pull B", "Tirón horizontal, amplitud y trabajo completo de bíceps.", ["espalda", "brazos", "hombros"], [
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 55, 90),
    rx("0180", "Remo sentado en polea", "espalda", 4, 12, 45, 90),
    rx("0027", "Remo con barra", "espalda", 3, 10, 50, 120),
    rx("0203", "Face pull", "hombros", 3, 14, 18, 60),
    rx("0294", "Curl de bíceps", "brazos", 3, 12, 14, 75),
    rx("0313", "Curl martillo", "brazos", 3, 12, 14, 60),
  ]),
  routine("legs-b", "Legs B", "Posterior y glúteos con apoyo de cuádriceps y pantorrillas.", ["piernas", "gluteos", "core"], [
    rx("0085", "Peso muerto rumano", "gluteos", 4, 8, 70, 150),
    rx("1409", "Puente de glúteos con barra", "gluteos", 4, 10, 80, 120),
    rx("0046", "Sentadilla hack con barra", "piernas", 3, 10, 45, 120),
    rx("0586", "Curl femoral", "piernas", 3, 12, 40, 75),
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 18, 90),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
  ]),
  routine("recovery", "Movilidad + cardio", "Entre 45 y 60 minutos de cardio suave, movilidad, glúteos y core.", ["core", "full-body"], [
    rx("3666", "Caminata inclinada (minutos)", "full-body", 1, 25, 0, 0),
    rx("1604", "World greatest stretch", "piernas", 3, 8, 0, 30),
    rx("0276", "Dead bug", "core", 3, 10, 0, 45),
    rx("3013", "Puente de glúteos", "gluteos", 3, 12, 0, 45),
    rx("1490", "Elevación de gemelos en escalón", "piernas", 3, 15, 0, 45),
    rx("0687", "Russian twist", "core", 3, 16, 0, 45),
  ]),
  routine("full-body-d", "Full Body D", "Glúteos, pecho, espalda, hombros y abdomen en una sesión completa.", ["full-body"], [
    rx("0336", "Zancadas con mancuernas", "piernas", 3, 10, 16, 90),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 20, 90),
    rx("0150", "Jalón al pecho", "espalda", 3, 10, 45, 90),
    rx("1409", "Puente de glúteos con barra", "gluteos", 3, 10, 70, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 7, 60),
    rx("0175", "Crunch en polea", "core", 3, 12, 25, 60),
  ]),
  routine("chest-arms", "Pecho + brazos", "Pecho completo con trabajo directo y equilibrado de tríceps y bíceps.", ["pecho", "brazos"], [
    rx("0025", "Press banca", "pecho", 4, 8, 55, 120),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 20, 90),
    rx("0308", "Aperturas con mancuernas", "pecho", 3, 12, 12, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 20, 60),
    rx("0070", "Curl predicador", "brazos", 3, 10, 20, 75),
    rx("0313", "Curl martillo", "brazos", 3, 12, 12, 60),
  ]),
  routine("back-shoulders", "Espalda + hombros", "Amplitud y densidad de espalda con cobertura completa del hombro.", ["espalda", "hombros", "brazos"], [
    rx("0150", "Jalón al pecho", "espalda", 4, 10, 45, 90),
    rx("0027", "Remo con barra", "espalda", 4, 8, 50, 120),
    rx("0180", "Remo sentado en polea", "espalda", 3, 12, 45, 90),
    rx("0203", "Face pull", "hombros", 3, 14, 18, 60),
    rx("2137", "Press Arnold", "hombros", 3, 10, 16, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 7, 60),
  ]),
  routine("legs-complete", "Piernas completas", "Cuádriceps, posterior, glúteos y pantorrillas con volumen para una hora.", ["piernas", "gluteos", "core"], [
    rx("0043", "Sentadilla", "piernas", 4, 8, 70, 150),
    rx("0085", "Peso muerto rumano", "gluteos", 4, 8, 65, 120),
    rx("0739", "Prensa de piernas", "piernas", 3, 12, 130, 120),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 40, 75),
    rx("0586", "Curl femoral", "piernas", 3, 12, 35, 75),
    rx("0605", "Elevación de gemelos", "piernas", 4, 14, 45, 60),
  ]),
  routine("priority-chest-arms-a", "Pecho + brazos A", "Prioridad de pecho con brazos completos y ejercicios de carga regulable.", ["pecho", "brazos", "hombros"], [
    rx("0577", "Press de pecho en máquina", "pecho", 4, 8, 0, 120),
    rx("0314", "Press inclinado con mancuernas", "pecho", 3, 10, 0, 90),
    rx("0308", "Aperturas con mancuernas", "pecho", 3, 12, 0, 60),
    rx("0200", "Tríceps con cuerda", "brazos", 3, 12, 0, 60),
    rx("0592", "Curl predicador en máquina", "brazos", 3, 10, 0, 75),
    rx("0313", "Curl martillo", "brazos", 3, 12, 0, 60),
  ], true),
  routine("priority-back-core-a", "Espalda + core A", "Fortalecimiento de espalda con poleas y remos, sin dominadas.", ["espalda", "hombros", "core"], [
    rx("0150", "Jalón al pecho", "espalda", 4, 10, 0, 90),
    rx("1350", "Remo sentado en máquina", "espalda", 4, 10, 0, 120),
    rx("0180", "Remo bajo en polea", "espalda", 3, 12, 0, 90),
    rx("0203", "Face pull", "hombros", 3, 14, 0, 60),
    rx("0175", "Crunch en polea", "core", 3, 12, 0, 60),
    rx("0276", "Dead bug", "core", 3, 10, 0, 60),
  ], true),
  routine("priority-legs", "Piernas adaptadas", "Piernas completas con máquinas y cargas regulables para progresar con control.", ["piernas", "gluteos", "core"], [
    rx("0739", "Prensa de piernas", "piernas", 4, 10, 0, 120),
    rx("1459", "Peso muerto rumano con mancuernas", "gluteos", 3, 10, 0, 120),
    rx("0585", "Extensión de piernas", "piernas", 3, 12, 0, 75),
    rx("0586", "Curl femoral", "piernas", 3, 12, 0, 75),
    rx("1409", "Puente de glúteos con barra", "gluteos", 3, 12, 0, 90),
    rx("0417", "Elevación de gemelos con mancuernas", "piernas", 4, 14, 0, 60),
  ], true),
  routine("priority-chest-arms-b", "Pecho + brazos B", "Segundo estímulo de pecho y brazos sin fondos ni ejercicios suspendidos.", ["pecho", "brazos", "hombros"], [
    rx("0314", "Press inclinado con mancuernas", "pecho", 4, 10, 0, 90),
    rx("0577", "Press de pecho en máquina", "pecho", 3, 10, 0, 90),
    rx("0308", "Aperturas con mancuernas", "pecho", 3, 12, 0, 60),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 0, 60),
    rx("0194", "Extensión de tríceps sobre cabeza con cuerda", "brazos", 3, 12, 0, 60),
    rx("0294", "Curl de bíceps", "brazos", 3, 12, 0, 75),
  ], true),
  routine("priority-back-shoulders-core", "Espalda + hombros + core", "Segundo estímulo de espalda con hombros completos y estabilidad abdominal.", ["espalda", "hombros", "core"], [
    rx("2330", "Jalón al pecho con recorrido completo", "espalda", 3, 10, 0, 90),
    rx("1350", "Remo sentado en máquina", "espalda", 3, 12, 0, 90),
    rx("0603", "Press de hombros en máquina", "hombros", 3, 10, 0, 90),
    rx("0334", "Elevaciones laterales", "hombros", 3, 14, 0, 60),
    rx("0203", "Face pull", "hombros", 3, 14, 0, 60),
    rx("0175", "Crunch en polea", "core", 3, 12, 0, 60),
    rx("0276", "Dead bug", "core", 3, 10, 0, 60),
  ], true),
];
