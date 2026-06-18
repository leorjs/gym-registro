"use client";

import { Download, LogOut, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import type { Goal, MuscleGroup, WeightUnit, Workout, WorkoutSet } from "@/types/training";

export default function ProfilePage() {
  const { user, profile, completeOnboarding, logout } = useAuth();
  const { workouts, saveWorkout } = useWorkouts(user?.uid);
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [unit, setUnit] = useState<WeightUnit>(profile?.unit ?? "kg");
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? "hipertrofia");
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weeklyGoal ?? 4);
  const [message, setMessage] = useState("");

  async function saveProfile() {
    await completeOnboarding({
      displayName,
      unit,
      goal,
      weeklyGoal,
      priorityMuscles: profile?.priorityMuscles ?? ["pecho", "espalda", "piernas"],
    });
    setMessage("Perfil actualizado.");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ profile, workouts }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gym-registro-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    const text = await file.text();
    const payload = JSON.parse(text);
    const importedWorkouts = Array.isArray(payload) ? legacyToWorkouts(payload) : (payload.workouts as Workout[] | undefined);
    if (!importedWorkouts?.length) {
      setMessage("No encontramos entrenamientos en el archivo.");
      return;
    }
    await Promise.all(importedWorkouts.map((workout) => saveWorkout(workout)));
    setMessage(`Importamos ${importedWorkouts.length} entrenamientos.`);
  }

  return (
    <>
      <PageHeader eyebrow="Perfil" title="Cuenta y datos" description="Preferencias, exportación e importación de entrenamientos." />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <Label>
              Nombre
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </Label>
            <Label>
              Email
              <Input value={profile?.email ?? ""} disabled />
            </Label>
            <Label>
              Unidad
              <Select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)}>
                <option value="kg">Kilogramos</option>
                <option value="lb">Libras</option>
              </Select>
            </Label>
            <Label>
              Objetivo
              <Select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="fuerza">Fuerza</option>
                <option value="resistencia">Resistencia</option>
                <option value="salud">Salud</option>
              </Select>
            </Label>
            <Label>
              Días por semana
              <Input type="number" min={1} max={7} value={weeklyGoal} onChange={(event) => setWeeklyGoal(Number(event.target.value))} />
            </Label>
            <div className="flex items-end">
              <Button className="w-full" onClick={saveProfile}>
                Guardar cambios
              </Button>
            </div>
            {message && <p className="sm:col-span-2 rounded-lg bg-[#dcefe8] p-3 text-sm font-bold text-[#124b3e]">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3 p-5">
            <h2 className="text-xl font-black">Datos</h2>
            <Button variant="secondary" onClick={exportData}>
              <Download size={18} />
              Exportar JSON
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={18} />
              Importar JSON
            </Button>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importData(file);
              }}
            />
            <Button variant="danger" onClick={logout}>
              <LogOut size={18} />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function legacyToWorkouts(items: Array<Record<string, unknown>>): Workout[] {
  return items.map((item) => {
    const now = new Date().toISOString();
    const sets = ((item.exercises as Array<Record<string, unknown>> | undefined) ?? []).map((exercise, index) => {
      const reps = Number(exercise.reps ?? 1);
      const count = Number(exercise.sets ?? 1);
      const weight = Number(exercise.weight ?? 0);
      return Array.from({ length: count }, (_, setIndex): WorkoutSet => ({
        id: crypto.randomUUID(),
        exerciseId: String(exercise.name ?? "custom").toLowerCase().replaceAll(" ", "-"),
        exerciseName: String(exercise.name ?? "Ejercicio"),
        muscleGroup: "full-body" as MuscleGroup,
        setNumber: index + setIndex + 1,
        reps,
        weight,
        createdAt: now,
      }));
    }).flat();

    return {
      id: crypto.randomUUID(),
      date: String(item.date ?? new Date().toISOString().slice(0, 10)),
      focus: String(item.focus ?? "Importado"),
      durationMinutes: Number(item.duration ?? 45),
      status: "completed",
      notes: String(item.notes ?? ""),
      totalVolume: sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
      totalSets: sets.length,
      muscles: ["full-body"],
      sets,
      createdAt: now,
      updatedAt: now,
    };
  });
}
