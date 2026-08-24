"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { recommendWeeklyPlan } from "@/lib/data/weekly-plans";
import { starterRoutines } from "@/lib/data/catalog";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import type { Routine } from "@/types/training";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function PlanPage() {
  const { user, profile } = useAuth();
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const plan = recommendWeeklyPlan(profile?.weeklyGoal ?? 4);
  const starterIds = new Set(starterRoutines.map((routine) => routine.id));
  const plannedIds = new Set(plan.days.map((day) => day.routineId));
  const visibleRoutines = routines.filter((routine) => plannedIds.has(routine.id) || !starterIds.has(routine.id));

  async function addRoutine() {
    if (!name.trim()) return;
    const routine: Routine = {
      id: `${name.toLowerCase().trim().replaceAll(" ", "-")}-${Date.now()}`,
      name: name.trim(), description: "Rutina personalizada", muscleGroups: ["full-body"],
      exercises: [], favorite: false, createdAt: new Date().toISOString(),
    };
    await saveRoutine(routine);
    setName(""); setCreating(false);
  }

  return (
    <>
      <header className="mb-7 mt-1">
        <h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">Plan</h1><p className="mt-1 text-[15px] text-[var(--label-2)]">Tu rutina semanal</p>
      </header>

      <h2 className="mb-3 px-1 text-[15px] font-normal text-[var(--label-2)]">Calendario semanal</h2>
      <div className="mb-7 grid gap-3">
          {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
            const scheduled = plan.days.find((day) => day.weekday === weekday);
            return (
              <Link key={weekday} href={scheduled ? `/app/workout/new?routine=${scheduled.routineId}` : "/app/routines"} className="flex min-h-[72px] items-center gap-3 rounded-[16px] bg-[var(--surface)] px-4 active:brightness-125">
                <span className="flex-1 text-[17px]">{dayNames[weekday]}</span>
                <span className={`rounded-full px-3 py-1 text-[13px] ${scheduled ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--surface-2)] text-[var(--label-2)]"}`}>{scheduled?.focus ?? "Descanso"}</span>
                <ChevronRight size={16} className="text-[var(--label-3)]" />
              </Link>
            );
          })}
      </div>

      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-[13px] font-normal text-[var(--label-2)]">Rutinas</h2>
        <Button size="sm" variant="ghost" onClick={() => setCreating((value) => !value)}><Plus size={15} />Nueva</Button>
      </div>
      {creating && <Card className="mb-3"><CardContent className="flex gap-2 p-3"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la rutina" /><Button onClick={addRoutine}>Crear</Button></CardContent></Card>}
      <div className="grid gap-3">
          {visibleRoutines.map((routine) => (
            <Link key={routine.id} href={`/app/workout/new?routine=${routine.id}`} className="flex min-h-[72px] items-center gap-3 rounded-[16px] bg-[var(--surface)] px-4 active:brightness-125">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)] text-black"><Dumbbell size={19} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[17px]">{routine.name}</span><span className="block text-[13px] text-[var(--label-2)]">{routine.exercises.length} ejercicios</span></span>
              <ChevronRight size={16} className="text-[var(--label-3)]" />
            </Link>
          ))}
      </div>
    </>
  );
}
