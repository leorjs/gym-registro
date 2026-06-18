"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Timer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { getWorkoutVolume } from "@/lib/metrics/training";
import type { MuscleGroup, Workout, WorkoutSet } from "@/types/training";

function newSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: crypto.randomUUID(),
    exerciseId: overrides.exerciseId ?? "custom",
    exerciseName: overrides.exerciseName ?? "",
    muscleGroup: overrides.muscleGroup ?? "full-body",
    setNumber: overrides.setNumber ?? 1,
    reps: overrides.reps ?? 8,
    weight: overrides.weight ?? 0,
    rpe: overrides.rpe,
    restSeconds: overrides.restSeconds ?? 90,
    completed: overrides.completed ?? false,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

export function WorkoutEditor({ workout }: { workout?: Workout }) {
  const router = useRouter();
  const { user } = useAuth();
  const { routines } = useRoutines(user?.uid);
  const { saveWorkout } = useWorkouts(user?.uid);
  const [focus, setFocus] = useState(workout?.focus ?? "");
  const [date, setDate] = useState(workout?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [durationMinutes, setDurationMinutes] = useState(workout?.durationMinutes ?? 55);
  const [notes, setNotes] = useState(workout?.notes ?? "");
  const [sets, setSets] = useState<WorkoutSet[]>(workout?.sets.length ? workout.sets : [newSet()]);
  const [saving, setSaving] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const volume = useMemo(() => getWorkoutVolume({ sets }), [sets]);
  const exerciseGroups = useMemo(() => {
    const grouped = new Map<string, { name: string; muscleGroup: MuscleGroup; total: number; done: number }>();
    sets.forEach((set) => {
      const key = set.exerciseName || set.id;
      const current = grouped.get(key) ?? {
        name: set.exerciseName || "Ejercicio",
        muscleGroup: set.muscleGroup,
        total: 0,
        done: 0,
      };
      current.total += 1;
      if (set.completed !== false) current.done += 1;
      grouped.set(key, current);
    });
    return Array.from(grouped.values());
  }, [sets]);
  const completedSets = sets.filter((set) => set.completed !== false).length;

  useEffect(() => {
    if (timerSeconds <= 0) return;
    const timeout = window.setTimeout(() => setTimerSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
    return () => window.clearTimeout(timeout);
  }, [timerSeconds]);

  function updateSet(id: string, patch: Partial<WorkoutSet>) {
    setSets((current) => current.map((set) => (set.id === id ? { ...set, ...patch } : set)));
  }

  function toggleExerciseDone(exerciseName: string) {
    const relatedSets = sets.filter((set) => set.exerciseName === exerciseName);
    const shouldComplete = relatedSets.some((set) => set.completed === false);
    setSets((current) =>
      current.map((set) => (set.exerciseName === exerciseName ? { ...set, completed: shouldComplete } : set)),
    );
  }

  function removeSet(id: string) {
    setSets((current) => (current.length > 1 ? current.filter((set) => set.id !== id) : current));
  }

  function duplicateSet(source: WorkoutSet) {
    const similarSets = sets.filter((set) => set.exerciseName === source.exerciseName);
    setSets((current) => [...current, newSet({ ...source, id: undefined, setNumber: similarSets.length + 1 })]);
  }

  function applyRoutine(routineId: string) {
    const routine = routines.find((item) => item.id === routineId);
    if (!routine) return;
    setFocus(routine.name);
    setSets(
      routine.exercises.flatMap((exercise) =>
        Array.from({ length: exercise.sets }, (_, index) =>
          newSet({
            exerciseId: exercise.exerciseName.toLowerCase().replaceAll(" ", "-"),
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            reps: exercise.reps,
            weight: exercise.weight,
            restSeconds: exercise.restSeconds,
            completed: false,
            setNumber: index + 1,
          }),
        ),
      ),
    );
  }

  async function save(status: "draft" | "completed") {
    if (!focus.trim() || !sets.every((set) => set.exerciseName.trim())) return;
    setSaving(true);
    await saveWorkout(
      {
        date,
        focus,
        durationMinutes,
        status,
        notes,
        sets: sets.map((set, index) => ({ ...set, setNumber: index + 1 })),
      },
      workout?.id,
    );
    setSaving(false);
    router.push("/app/history");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-xs font-black uppercase text-[#1d6b57]">Sesión activa</p>
            <h2 className="text-xl font-black">{workout ? "Editar entrenamiento" : "Nuevo entrenamiento"}</h2>
          </div>
          <Badge tone="lime">{Math.round(volume)} kg</Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Label className="sm:col-span-2">
              Enfoque
              <Input value={focus} onChange={(event) => setFocus(event.target.value)} placeholder="Push, piernas, full body..." />
            </Label>
            <Label>
              Fecha
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Label>
            <Label>
              Minutos
              <Input type="number" min={1} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
            </Label>
          </div>

          <Label>
            Plantilla
            <Select defaultValue="" onChange={(event) => applyRoutine(event.target.value)}>
              <option value="">Elegir rutina</option>
              {routines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </Select>
          </Label>

          <div className="grid gap-3 rounded-lg border border-[#d8ded5] bg-[#151917] p-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-white/45">Toque rápido</p>
                <h3 className="text-lg font-black">Marcá lo que ya hiciste</h3>
              </div>
              <Badge tone="lime">
                {completedSets}/{sets.length}
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {exerciseGroups.map((exercise) => {
                const done = exercise.done === exercise.total;
                return (
                  <button
                    key={exercise.name}
                    type="button"
                    onClick={() => toggleExerciseDone(exercise.name)}
                    className={`flex min-h-20 items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                      done
                        ? "border-[#b9ff45] bg-[#b9ff45] text-[#151917]"
                        : "border-white/10 bg-white/8 text-white hover:border-white/25"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-black">{exercise.name}</span>
                      <span className="mt-1 block text-xs font-bold opacity-70">
                        {exercise.muscleGroup} · {exercise.done}/{exercise.total} sets
                      </span>
                    </span>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${done ? "bg-[#151917] text-white" : "bg-white/10"}`}>
                      <Check size={17} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            {sets.map((set) => (
              <div
                key={set.id}
                className={`grid gap-2 rounded-lg border p-3 transition ${
                  set.completed !== false ? "border-[#cfe89a] bg-[#f7ffe8]" : "border-[#d8ded5] bg-[#fafbf7]"
                }`}
              >
                <div className="grid gap-2 sm:grid-cols-[1.5fr_1fr]">
                  <Input value={set.exerciseName} onChange={(event) => updateSet(set.id, { exerciseName: event.target.value })} placeholder="Ejercicio" />
                  <Select value={set.muscleGroup} onChange={(event) => updateSet(set.id, { muscleGroup: event.target.value as MuscleGroup })}>
                    <option value="pecho">Pecho</option>
                    <option value="espalda">Espalda</option>
                    <option value="piernas">Piernas</option>
                    <option value="hombros">Hombros</option>
                    <option value="brazos">Brazos</option>
                    <option value="core">Core</option>
                    <option value="gluteos">Glúteos</option>
                    <option value="full-body">Full body</option>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input aria-label="Reps" type="number" min={1} value={set.reps} onChange={(event) => updateSet(set.id, { reps: Number(event.target.value) })} />
                  <Input aria-label="Peso" type="number" min={0} step={0.5} value={set.weight} onChange={(event) => updateSet(set.id, { weight: Number(event.target.value) })} />
                  <Input aria-label="RPE" type="number" min={1} max={10} placeholder="RPE" value={set.rpe ?? ""} onChange={(event) => updateSet(set.id, { rpe: Number(event.target.value) || undefined })} />
                  <Input aria-label="Descanso" type="number" min={0} value={set.restSeconds ?? 90} onChange={(event) => updateSet(set.id, { restSeconds: Number(event.target.value) })} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant={set.completed !== false ? "accent" : "secondary"} size="sm" onClick={() => updateSet(set.id, { completed: set.completed === false })}>
                    <Check size={15} />
                    {set.completed !== false ? "Hecho" : "Marcar"}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => duplicateSet(set)}>
                    <Copy size={15} />
                    Copiar
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setTimerSeconds(set.restSeconds ?? 90)}>
                    <Timer size={15} />
                    Timer
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeSet(set.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={() => setSets((current) => [...current, newSet({ setNumber: current.length + 1 })])}>
            <Plus size={18} />
            Agregar set
          </Button>

          <Label>
            Notas
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Técnica, molestias, objetivo para la próxima..." />
          </Label>
        </CardContent>
      </Card>

      <aside className="grid gap-4 self-start">
        <Card className="dark-field text-white">
          <CardContent className="grid gap-4 p-5">
            <p className="text-xs font-black uppercase text-white/50">Resumen</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Hechos" value={`${completedSets}/${sets.length}`} />
              <Stat label="Volumen" value={`${Math.round(volume)} kg`} />
            </div>
            <Button variant="accent" onClick={() => save("completed")} disabled={saving}>
              Guardar sesión
            </Button>
            <Button variant="secondary" onClick={() => save("draft")} disabled={saving}>
              Guardar borrador
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase text-[#1d6b57]">Descanso</p>
            <p className="number-font mt-2 text-5xl font-black">{timerSeconds}s</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[60, 90, 120].map((seconds) => (
                <Button key={seconds} type="button" variant="secondary" size="sm" onClick={() => setTimerSeconds(seconds)}>
                  {seconds}s
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-3">
      <p className="text-xs font-black uppercase text-white/50">{label}</p>
      <p className="number-font text-2xl font-black">{value}</p>
    </div>
  );
}
