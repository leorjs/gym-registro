import type { WeeklyPlanTemplate } from "@/types/training";

export const dynamicTrainingRules = [
  {
    trigger: "Faltaste al entrenamiento programado",
    action: "Mover la rutina pendiente al próximo día disponible y desplazar el resto sin duplicar grupo muscular.",
  },
  {
    trigger: "Entrenaste piernas o posterior pesado ayer",
    action: "Evitar piernas pesadas hoy y sugerir upper, core o movilidad.",
  },
  {
    trigger: "Completaste todas las reps con RPE menor o igual a 7",
    action: "Sugerir subir 2.5-5% el peso o agregar 1-2 reps la próxima vez.",
  },
  {
    trigger: "Marcaste fatiga alta o bajó el rendimiento",
    action: "Reducir una serie por ejercicio y priorizar técnica, descanso y rango de movimiento.",
  },
  {
    trigger: "Tenés poco tiempo",
    action: "Convertir la rutina en modo express con 3 movimientos principales y descanso fijo.",
  },
  {
    trigger: "Ya cubriste todo el cuerpo en la semana",
    action: "Ofrecer recuperación activa, cardio suave o core en vez de fuerza pesada.",
  },
];

export const weeklyPlanTemplates: WeeklyPlanTemplate[] = [
  {
    id: "full-body-3",
    name: "Full Body 3 días",
    shortName: "FB 3",
    daysPerWeek: 3,
    level: "principiante",
    goal: "hipertrofia",
    image: "/training-visuals/full-body.png",
    description: "Tres sesiones completas para cubrir todo el cuerpo sin saturar la semana.",
    bestFor: "Poco tiempo, volver al gym o crear consistencia.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "full-body-a", focus: "Full Body A", intensity: "media" },
      { weekday: 3, label: "Miércoles", routineId: "full-body-b", focus: "Full Body B", intensity: "media" },
      { weekday: 5, label: "Viernes", routineId: "full-body-c", focus: "Full Body C", intensity: "media" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
  {
    id: "upper-lower-4",
    name: "Upper / Lower 4 días",
    shortName: "UL 4",
    daysPerWeek: 4,
    level: "intermedio",
    goal: "hipertrofia",
    image: "/training-visuals/upper-lower.png",
    description: "La base recomendada: torso y piernas dos veces por semana con recuperación clara.",
    bestFor: "Progresar sin vivir en el gym.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "upper-push", focus: "Upper Push", intensity: "alta" },
      { weekday: 2, label: "Martes", routineId: "lower-squat", focus: "Lower Squat", intensity: "alta" },
      { weekday: 4, label: "Jueves", routineId: "upper-pull", focus: "Upper Pull", intensity: "media" },
      { weekday: 5, label: "Viernes", routineId: "lower-hinge", focus: "Lower Hinge", intensity: "media" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
  {
    id: "full-body-4",
    name: "Full Body 4 días",
    shortName: "FB 4",
    daysPerWeek: 4,
    level: "intermedio",
    goal: "hipertrofia",
    image: "/training-visuals/full-body.png",
    description: "Cuatro sesiones full body distintas para repartir el volumen durante la semana.",
    bestFor: "Entrenar todo el cuerpo cuatro veces con cargas y movimientos variados.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "full-body-a", focus: "Full Body A", intensity: "alta" },
      { weekday: 2, label: "Martes", routineId: "full-body-b", focus: "Full Body B", intensity: "media" },
      { weekday: 4, label: "Jueves", routineId: "full-body-c", focus: "Full Body C", intensity: "alta" },
      { weekday: 6, label: "Sábado", routineId: "full-body-d", focus: "Full Body D", intensity: "media" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
  {
    id: "ppl-hybrid-5",
    name: "PPL híbrido 5 días",
    shortName: "PPL 5",
    daysPerWeek: 5,
    level: "intermedio",
    goal: "hipertrofia",
    image: "/training-visuals/ppl-split.png",
    description: "Push, Pull, Legs y dos días mixtos para repetir estímulos sin perder recuperación.",
    bestFor: "Usuarios constantes que quieren más volumen.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "push", focus: "Push", intensity: "alta" },
      { weekday: 2, label: "Martes", routineId: "pull", focus: "Pull", intensity: "alta" },
      { weekday: 3, label: "Miércoles", routineId: "legs", focus: "Legs", intensity: "alta" },
      { weekday: 5, label: "Viernes", routineId: "upper-mix", focus: "Upper Mix", intensity: "media" },
      { weekday: 6, label: "Sábado", routineId: "lower-core", focus: "Lower + Core", intensity: "media" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
  {
    id: "ppl-6",
    name: "Push Pull Legs 6 días",
    shortName: "PPL 6",
    daysPerWeek: 6,
    level: "avanzado",
    goal: "hipertrofia",
    image: "/training-visuals/ppl-split.png",
    description: "Dos vueltas semanales de PPL, alternando fuerza y bombeo para cubrir todo.",
    bestFor: "Alta adherencia y buena recuperación.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "push-a", focus: "Push A", intensity: "alta" },
      { weekday: 2, label: "Martes", routineId: "pull-a", focus: "Pull A", intensity: "alta" },
      { weekday: 3, label: "Miércoles", routineId: "legs-a", focus: "Legs A", intensity: "alta" },
      { weekday: 4, label: "Jueves", routineId: "push-b", focus: "Push B", intensity: "media" },
      { weekday: 5, label: "Viernes", routineId: "pull-b", focus: "Pull B", intensity: "media" },
      { weekday: 6, label: "Sábado", routineId: "legs-b", focus: "Legs B", intensity: "media" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
  {
    id: "six-plus-recovery-7",
    name: "Semana completa 7 días",
    shortName: "Full 7",
    daysPerWeek: 7,
    level: "avanzado",
    goal: "salud",
    image: "/training-visuals/full-body.png",
    description: "Seis sesiones de fuerza y un día de movilidad/cardio suave para no romper recuperación.",
    bestFor: "Quien quiere moverse todos los días sin entrenar pesado todos los días.",
    coverage: ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"],
    days: [
      { weekday: 1, label: "Lunes", routineId: "push-a", focus: "Push A", intensity: "alta" },
      { weekday: 2, label: "Martes", routineId: "pull-a", focus: "Pull A", intensity: "alta" },
      { weekday: 3, label: "Miércoles", routineId: "legs-a", focus: "Legs A", intensity: "alta" },
      { weekday: 4, label: "Jueves", routineId: "push-b", focus: "Push B", intensity: "media" },
      { weekday: 5, label: "Viernes", routineId: "pull-b", focus: "Pull B", intensity: "media" },
      { weekday: 6, label: "Sábado", routineId: "legs-b", focus: "Legs B", intensity: "media" },
      { weekday: 0, label: "Domingo", routineId: "recovery", focus: "Movilidad + cardio", intensity: "suave" },
    ],
    dynamicRules: dynamicTrainingRules,
  },
];

export function recommendWeeklyPlan(daysPerWeek: number) {
  if (daysPerWeek <= 3) return weeklyPlanTemplates.find((plan) => plan.id === "full-body-3")!;
  if (daysPerWeek === 4) return weeklyPlanTemplates.find((plan) => plan.id === "upper-lower-4")!;
  if (daysPerWeek === 5) return weeklyPlanTemplates.find((plan) => plan.id === "ppl-hybrid-5")!;
  if (daysPerWeek === 6) return weeklyPlanTemplates.find((plan) => plan.id === "ppl-6")!;
  return weeklyPlanTemplates.find((plan) => plan.id === "six-plus-recovery-7")!;
}
