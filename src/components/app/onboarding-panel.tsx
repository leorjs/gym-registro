"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Goal, MuscleGroup, WeightUnit } from "@/types/training";

const muscleOptions: MuscleGroup[] = ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos"];

export function OnboardingPanel() {
  const { profile, completeOnboarding } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [unit, setUnit] = useState<WeightUnit>(profile?.unit ?? "kg");
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? "hipertrofia");
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weeklyGoal ?? 4);
  const [priorityMuscles, setPriorityMuscles] = useState<MuscleGroup[]>(profile?.priorityMuscles ?? ["pecho", "espalda", "piernas"]);
  const [saving, setSaving] = useState(false);

  function toggleMuscle(muscle: MuscleGroup) {
    setPriorityMuscles((current) =>
      current.includes(muscle) ? current.filter((item) => item !== muscle) : [...current, muscle],
    );
  }

  async function save() {
    setSaving(true);
    await completeOnboarding({ displayName, unit, goal, weeklyGoal, priorityMuscles });
    setSaving(false);
  }

  return (
    <Card className="mb-5 border-[#b9ff45] bg-[#f8ffe8]">
      <CardHeader>
        <div>
          <p className="text-xs font-black uppercase text-[#1d6b57]">Primer ajuste</p>
          <h2 className="text-xl font-black">Armemos tu perfil de entrenamiento</h2>
        </div>
        <CheckCircle2 className="text-[#1d6b57]" />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <Label>
          Nombre
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
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
        <div className="md:col-span-4">
          <p className="mb-2 text-xs font-black uppercase text-[#66706b]">Prioridad muscular</p>
          <div className="flex flex-wrap gap-2">
            {muscleOptions.map((muscle) => (
              <button
                key={muscle}
                type="button"
                onClick={() => toggleMuscle(muscle)}
                className={`rounded-full border px-3 py-2 text-xs font-black ${
                  priorityMuscles.includes(muscle)
                    ? "border-[#151917] bg-[#151917] text-white"
                    : "border-[#d8ded5] bg-white text-[#66706b]"
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
        <Button className="md:col-span-4" onClick={save} disabled={saving || !displayName.trim()}>
          Guardar perfil
        </Button>
      </CardContent>
    </Card>
  );
}
