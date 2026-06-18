"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Dumbbell, Plus, Star, Timer, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { dynamicTrainingRules, recommendWeeklyPlan } from "@/lib/data/weekly-plans";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import type { Routine } from "@/types/training";

const selectableDays = [3, 4, 5, 6, 7];

function intensityTone(intensity: string) {
  if (intensity === "alta") return "red";
  if (intensity === "media") return "amber";
  return "green";
}

export default function RoutinesPage() {
  const { user } = useAuth();
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const initialRoutineId = recommendWeeklyPlan(4).days[0]?.routineId ?? "full-body-a";
  const [selectedRoutineId, setSelectedRoutineId] = useState(initialRoutineId);

  const recommendedPlan = recommendWeeklyPlan(daysPerWeek);
  const selectedPlanDay = recommendedPlan.days.find((day) => day.routineId === selectedRoutineId);
  const selectedRoutine =
    routines.find((routine) => routine.id === selectedRoutineId) ??
    routines.find((routine) => routine.id === selectedPlanDay?.routineId) ??
    routines.find((routine) => routine.id === recommendedPlan.days[0]?.routineId);
  const totalSets = selectedRoutine?.exercises.reduce((total, exercise) => total + exercise.sets, 0) ?? 0;

  function selectDays(days: number) {
    const nextPlan = recommendWeeklyPlan(days);
    setDaysPerWeek(days);
    setSelectedRoutineId(nextPlan.days[0]?.routineId ?? "full-body-a");
  }

  async function addRoutine() {
    if (!name.trim()) return;
    const routine: Routine = {
      id: name.toLowerCase().trim().replaceAll(" ", "-"),
      name: name.trim(),
      description,
      muscleGroups: ["full-body"],
      favorite: false,
      createdAt: new Date().toISOString(),
      exercises: [{ exerciseName: "Ejercicio base", muscleGroup: "full-body", sets: 3, reps: 10, weight: 0, restSeconds: 90 }],
    };
    await saveRoutine(routine);
    setName("");
    setDescription("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Plantillas"
        title="Rutinas por día"
        description="Elegí cuántos días vas a entrenar y tocá una rutina. La app muestra solo ese bloque para que en el celular no pierdas el foco."
        action={
          <Button asChild variant="accent">
            <Link href="/app/workout/new">Entrenar</Link>
          </Button>
        }
      />

      <section className="mb-4 grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="overflow-hidden">
          <div className="relative h-40 sm:h-48">
            <Image src={recommendedPlan.image} alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#151917] via-[#151917]/78 to-[#151917]/10" />
            <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="lime" className="min-h-6 px-2 text-[10px]">
                  {recommendedPlan.shortName}
                </Badge>
                <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black uppercase">{recommendedPlan.level}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/55">Plan recomendado</p>
                <h2 className="mt-1 text-2xl font-black leading-tight">{recommendedPlan.name}</h2>
                <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-white/70">{recommendedPlan.bestFor}</p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-3 p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {selectableDays.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => selectDays(days)}
                  className={`min-h-11 rounded-lg border text-center text-sm font-black transition ${
                    daysPerWeek === days
                      ? "border-[#151917] bg-[#151917] text-white"
                      : "border-[#d8ded5] bg-white text-[#66706b] active:border-[#151917]"
                  }`}
                >
                  {days}
                  <span className="block text-[9px] uppercase opacity-70">días</span>
                </button>
              ))}
            </div>

            <div className="grid gap-1.5">
              {recommendedPlan.days.map((day) => {
                const isSelected = selectedRoutineId === day.routineId;
                return (
                  <button
                    key={`${recommendedPlan.id}-${day.weekday}`}
                    type="button"
                    onClick={() => setSelectedRoutineId(day.routineId)}
                    className={`grid grid-cols-[38px_1fr_auto] items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                      isSelected
                        ? "border-[#151917] bg-[#efffcb] shadow-[0_8px_20px_rgba(21,25,23,0.08)]"
                        : "border-[#e2e6dd] bg-[#fafbf7] active:border-[#151917]"
                    }`}
                  >
                    <span className="number-font rounded-md bg-white px-2 py-1 text-center text-xs font-black text-[#66706b]">{day.label.slice(0, 3)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-[#151917]">{day.focus}</span>
                      <span className="block truncate text-[11px] font-bold text-[#66706b]">{day.routineId}</span>
                    </span>
                    <Badge tone={intensityTone(day.intensity)} className="min-h-6 px-2 text-[10px]">
                      {day.intensity}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#151917] bg-[#151917] text-white">
          <CardContent className="grid gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-white/45">{selectedPlanDay?.label ?? "Rutina"}</p>
                <h2 className="mt-1 truncate text-2xl font-black">{selectedRoutine?.name ?? selectedPlanDay?.focus ?? "Rutina"}</h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/62">{selectedRoutine?.description ?? "Seleccioná un bloque del plan para ver sus ejercicios."}</p>
              </div>
              {selectedRoutine?.favorite ? <Star className="shrink-0 fill-[#b9ff45] text-[#b9ff45]" size={18} /> : <Zap className="shrink-0 text-[#b9ff45]" size={18} />}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-lg border border-white/10 bg-white/8 p-2">
                <p className="number-font text-lg font-black">{selectedRoutine?.exercises.length ?? 0}</p>
                <p className="text-[10px] font-black uppercase text-white/45">Ejercicios</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/8 p-2">
                <p className="number-font text-lg font-black">{totalSets}</p>
                <p className="text-[10px] font-black uppercase text-white/45">Series</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/8 p-2">
                <p className="number-font text-lg font-black">{selectedPlanDay?.intensity ?? "propia"}</p>
                <p className="text-[10px] font-black uppercase text-white/45">Carga</p>
              </div>
            </div>

            <div className="grid gap-1.5">
              {selectedRoutine?.exercises.map((exercise, index) => (
                <div key={`${exercise.exerciseName}-${index}`} className="grid grid-cols-[26px_1fr_auto] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] p-2.5">
                  <span className="number-font rounded-md bg-[#b9ff45] py-1 text-center text-xs font-black text-[#151917]">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{exercise.exerciseName}</p>
                    <p className="truncate text-[11px] font-bold text-white/45">{exercise.muscleGroup}</p>
                  </div>
                  <div className="text-right">
                    <p className="number-font text-sm font-black">
                      {exercise.sets} x {exercise.reps}
                    </p>
                    <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white/45">
                      <Timer size={11} />
                      {exercise.restSeconds}s
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild variant="accent" className="w-full">
              <Link href={selectedRoutine ? `/app/workout/new?routine=${selectedRoutine.id}` : "/app/workout/new"}>
                <Dumbbell size={17} />
                Empezar esta rutina
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <details className="group rounded-lg border border-[#d8ded5] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="block text-sm font-black">Motor dinámico</span>
              <span className="block text-xs font-semibold text-[#66706b]">Reglas que adaptan la semana si faltás o cambiás la carga.</span>
            </span>
            <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
          </summary>
          <div className="grid gap-1.5 px-4 pb-4">
            {dynamicTrainingRules.slice(0, 5).map((rule) => (
              <div key={rule.trigger} className="rounded-lg border border-[#e2e6dd] bg-[#fafbf7] p-3">
                <p className="text-xs font-black">{rule.trigger}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#66706b]">{rule.action}</p>
              </div>
            ))}
          </div>
        </details>

        <details className="group rounded-lg border border-[#d8ded5] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="block text-sm font-black">Crear rutina propia</span>
              <span className="block text-xs font-semibold text-[#66706b]">Para plantillas personales fuera del split recomendado.</span>
            </span>
            <Plus className="shrink-0" size={18} />
          </summary>
          <div className="grid gap-3 px-4 pb-4">
            <Label>
              Nombre
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Torso, fuerza A..." />
            </Label>
            <Label>
              Descripción
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </Label>
            <Button onClick={addRoutine}>
              <Plus size={18} />
              Guardar rutina
            </Button>
          </div>
        </details>

        <details className="group rounded-lg border border-[#d8ded5] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="block text-sm font-black">Biblioteca completa</span>
              <span className="block text-xs font-semibold text-[#66706b]">{routines.length} rutinas disponibles.</span>
            </span>
            <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
          </summary>
          <div className="grid gap-2 px-4 pb-4">
            {routines.map((routine) => (
              <button
                key={routine.id}
                type="button"
                onClick={() => setSelectedRoutineId(routine.id)}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-[#e2e6dd] bg-[#fafbf7] p-3 text-left active:border-[#151917]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{routine.name}</span>
                  <span className="block truncate text-xs font-semibold text-[#66706b]">{routine.exercises.length} ejercicios</span>
                </span>
                {routine.favorite ? <Star className="fill-[#b9ff45] text-[#151917]" size={17} /> : <Dumbbell className="text-[#1d6b57]" size={17} />}
              </button>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}
