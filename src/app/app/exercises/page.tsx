"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Dumbbell, Plus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/hooks/use-auth";
import { useExercises } from "@/lib/hooks/use-exercises";
import type { Exercise, MuscleGroup } from "@/types/training";

export default function ExercisesPage() {
  const { user } = useAuth();
  const { exercises, saveExercise } = useExercises(user?.uid);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("pecho");
  const filtered = useMemo(() => exercises.filter((exercise) => `${exercise.name} ${exercise.muscleGroup}`.toLowerCase().includes(query.toLowerCase())), [exercises, query]);

  async function addExercise() {
    if (!name.trim()) return;
    const item: Exercise = { id: `${name.toLowerCase().trim().replaceAll(" ", "-")}-${Date.now()}`, name: name.trim(), muscleGroup, tags: ["personal"], favorite: true, custom: true, createdAt: new Date().toISOString() };
    await saveExercise(item); setName(""); setCreating(false);
  }

  return (
    <>
      <header className="mb-[18px] mt-1 flex items-end justify-between gap-3">
        <div><h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">Ejercicios</h1><p className="mt-1 text-[15px] text-[var(--label-2)]">Biblioteca de movimientos</p></div>
        <button onClick={() => setCreating((value) => !value)} aria-label="Nuevo ejercicio" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface)]"><Plus size={19} /></button>
      </header>

      <div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--label-3)]" size={18} /><Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicios" /></div>
      {creating && <Card className="mb-3"><CardContent className="grid gap-2 p-3"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del ejercicio" /><Select value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value as MuscleGroup)}>{["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos", "full-body"].map((group) => <option key={group}>{group}</option>)}</Select><Button onClick={addExercise}>Guardar ejercicio</Button></CardContent></Card>}

      <p className="mb-2 px-1 text-[13px] text-[var(--label-2)]">{filtered.length} ejercicios</p>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filtered.map((exercise, index) => (
            <div key={exercise.id} className={`flex min-h-[58px] items-center gap-3 px-4 ${index ? "border-t border-white/10" : ""}`}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Dumbbell size={17} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[17px] capitalize">{exercise.name}</span><span className="block text-[13px] capitalize text-[var(--label-2)]">{exercise.muscleGroup}</span></span>
              {exercise.favorite && <Star size={15} className="fill-[var(--accent)] text-[var(--accent)]" />}
              <ChevronRight size={16} className="text-[var(--label-3)]" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
