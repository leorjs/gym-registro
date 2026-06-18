"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Gauge, Plus, Sparkles, Star, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { dynamicTrainingRules, recommendWeeklyPlan, weeklyPlanTemplates } from "@/lib/data/weekly-plans";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import type { Routine } from "@/types/training";

export default function RoutinesPage() {
  const { user } = useAuth();
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const recommendedPlan = recommendWeeklyPlan(daysPerWeek);

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
        title="Rutinas dinámicas"
        description="Elegí cuántos días querés entrenar. La app recomienda el split y deja reglas listas para adaptar la semana si faltás, te fatigás o tenés poco tiempo."
        action={
          <Button asChild variant="accent">
            <Link href="/app/workout/new">Entrenar con plantilla</Link>
          </Button>
        }
      />

      <section className="mb-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="relative min-h-[260px]">
            <Image src={recommendedPlan.image} alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#151917] via-[#151917]/82 to-[#151917]/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="lime">Recomendado</Badge>
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black">{recommendedPlan.shortName}</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-white/55">Plan semanal</p>
                <h2 className="mt-1 max-w-lg text-4xl font-black leading-none">{recommendedPlan.name}</h2>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/70">{recommendedPlan.description}</p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 p-5">
            <div className="grid grid-cols-5 gap-2">
              {[3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDaysPerWeek(days)}
                  className={`min-h-14 rounded-lg border text-center text-sm font-black transition ${
                    daysPerWeek === days
                      ? "border-[#151917] bg-[#151917] text-white"
                      : "border-[#d8ded5] bg-white text-[#66706b] hover:border-[#151917]"
                  }`}
                >
                  {days}
                  <span className="block text-[10px] uppercase opacity-70">días</span>
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedPlan.days.map((day) => (
                <div key={`${recommendedPlan.id}-${day.weekday}`} className="rounded-lg border border-[#d8ded5] bg-[#fafbf7] p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase text-[#66706b]">{day.label}</span>
                    <Badge tone={day.intensity === "alta" ? "red" : day.intensity === "media" ? "amber" : "green"}>{day.intensity}</Badge>
                  </div>
                  <p className="text-lg font-black">{day.focus}</p>
                  <p className="mt-1 text-xs font-bold text-[#66706b]">{day.routineId}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dark-field text-white">
          <CardContent className="grid gap-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-white/50">Motor dinámico</p>
                <h2 className="text-2xl font-black">Qué decide la app</h2>
              </div>
              <Sparkles className="text-[#b9ff45]" />
            </div>
            <div className="grid gap-2">
              {dynamicTrainingRules.slice(0, 5).map((rule) => (
                <div key={rule.trigger} className="rounded-lg border border-white/10 bg-white/8 p-3">
                  <p className="text-sm font-black">{rule.trigger}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/60">{rule.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-4 grid gap-3 md:grid-cols-3">
        {weeklyPlanTemplates.slice(0, 3).map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="relative h-32">
              <Image src={plan.image} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151917]/85 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-[#b9ff45] px-3 py-1 text-xs font-black text-[#151917]">
                {plan.shortName}
              </span>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-black">{plan.name}</h3>
              <p className="mt-1 text-sm leading-6 text-[#66706b]">{plan.bestFor}</p>
              <div className="mt-4 flex gap-2 text-xs font-black text-[#66706b]">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={14} />
                  {plan.daysPerWeek} días
                </span>
                <span className="inline-flex items-center gap-1">
                  <Gauge size={14} />
                  {plan.level}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardContent className="grid gap-4 p-5">
            <h2 className="text-xl font-black">Nueva rutina</h2>
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
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          {routines.map((routine) => (
            <Card key={routine.id}>
              <CardContent className="p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{routine.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#66706b]">{routine.description}</p>
                  </div>
                  {routine.favorite ? <Star className="fill-[#b9ff45] text-[#151917]" size={18} /> : <Zap className="text-[#1d6b57]" size={18} />}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {routine.muscleGroups.map((group) => (
                    <Badge key={group} tone="green">
                      {group}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-2">
                  {routine.exercises.map((exercise, index) => (
                    <div key={`${exercise.exerciseName}-${index}`} className="flex justify-between border-t border-[#e8ebe3] py-2 text-sm">
                      <span className="font-black">{exercise.exerciseName}</span>
                      <span className="number-font text-[#66706b]">
                        {exercise.sets} x {exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
