"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import type { Routine } from "@/types/training";

export default function RoutinesPage() {
  const { user } = useAuth();
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
        title="Rutinas"
        description="Usá plantillas listas o guardá estructuras propias para repetirlas desde el modo entrenamiento."
        action={
          <Button asChild variant="accent">
            <Link href="/app/workout/new">Entrenar con plantilla</Link>
          </Button>
        }
      />
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
                  {routine.favorite && <Star className="fill-[#b9ff45] text-[#151917]" size={18} />}
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
