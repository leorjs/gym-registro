"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useExercises } from "@/lib/hooks/use-exercises";
import type { Exercise, MuscleGroup } from "@/types/training";

export default function ExercisesPage() {
  const { user } = useAuth();
  const { exercises, saveExercise } = useExercises(user?.uid);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("pecho");

  async function addExercise() {
    if (!name.trim()) return;
    const exercise: Exercise = {
      id: name.toLowerCase().trim().replaceAll(" ", "-"),
      name: name.trim(),
      muscleGroup,
      tags: ["personal"],
      favorite: true,
      custom: true,
      createdAt: new Date().toISOString(),
    };
    await saveExercise(exercise);
    setName("");
  }

  return (
    <>
      <PageHeader eyebrow="Biblioteca" title="Ejercicios" description="Base inicial y ejercicios propios por grupo muscular." />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardContent className="grid gap-4 p-5">
            <h2 className="text-xl font-black">Nuevo ejercicio</h2>
            <Label>
              Nombre
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Aperturas, zancadas..." />
            </Label>
            <Label>
              Grupo
              <Select value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value as MuscleGroup)}>
                {["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos", "full-body"].map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
            </Label>
            <Button onClick={addExercise}>
              <Plus size={18} />
              Guardar ejercicio
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="p-4">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{exercise.name}</h2>
                    <p className="text-sm font-bold text-[#66706b]">{exercise.muscleGroup}</p>
                  </div>
                  {exercise.favorite && <Star className="fill-[#b9ff45] text-[#151917]" size={18} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.tags.map((tag) => (
                    <Badge key={tag} tone={exercise.custom ? "lime" : "green"}>
                      {tag}
                    </Badge>
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
