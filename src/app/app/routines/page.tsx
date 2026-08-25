"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dumbbell, Pencil, Play, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { baseExercises, estimateRoutineMinutes } from "@/lib/data/catalog";
import { weeklyPlanTemplates } from "@/lib/data/weekly-plans";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import { useWeeklyPlan } from "@/lib/hooks/use-weekly-plan";
import type { Exercise, Routine, RoutineExercise, WeeklyPlanDay, WeeklyPlanTemplate } from "@/types/training";

const weekdays = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function PlanPage() {
  const { user, profile } = useAuth();
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const { plan, savePlan } = useWeeklyPlan(user?.uid, profile?.weeklyGoal ?? 4);
  const [draftDays, setDraftDays] = useState<WeeklyPlanDay[] | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sortedRoutines = useMemo(() => [...routines].sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name)), [routines]);
  const currentDays = draftDays ?? plan.days;

  function updateDay(weekday: number, routineId: string) {
    setDraftDays((current) => {
      const source = current ?? plan.days;
      const withoutDay = source.filter((day) => day.weekday !== weekday);
      if (!routineId) return withoutDay;
      const routine = routines.find((item) => item.id === routineId);
      if (!routine) return source;
      return [...withoutDay, { weekday, label: weekdays.find((day) => day.value === weekday)?.label ?? "Día", routineId, focus: routine.name, intensity: "media" as const }]
        .sort((a, b) => weekdays.findIndex((day) => day.value === a.weekday) - weekdays.findIndex((day) => day.value === b.weekday));
    });
  }

  async function applyTemplate(template: WeeklyPlanTemplate) {
    setSaving(true);
    setMessage("");
    try {
      await savePlan({ templateId: template.id, name: template.name, days: template.days });
      setDraftDays(template.days);
      setMessage(`${template.name} aplicado.`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo aplicar el plan.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCurrentPlan() {
    setSaving(true);
    setMessage("");
    try {
      await savePlan({ templateId: plan.id, name: `${currentDays.length} días · Plan personalizado`, days: currentDays });
      setMessage("Plan semanal guardado.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo guardar el plan.");
    } finally {
      setSaving(false);
    }
  }

  async function persistRoutine(routine: Routine) {
    setSaving(true);
    setMessage("");
    try {
      await saveRoutine(routine);
      setEditingRoutine(null);
      setMessage(`${routine.name} guardada.`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo guardar la rutina.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="mb-6 mt-1">
        <h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">Plan</h1>
        <p className="mt-1 text-[15px] text-[var(--label-2)]">Elegí una estructura y personalizá cada día</p>
      </header>

      {message && <p className="mb-4 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-[var(--accent)]">{message}</p>}

      <section className="mb-7">
        <h2 className="mb-3 px-1 text-[15px] font-normal text-[var(--label-2)]">Planes preparados</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {weeklyPlanTemplates.map((template) => (
            <button key={template.id} type="button" disabled={saving} onClick={() => applyTemplate(template)} className={`w-[230px] shrink-0 rounded-[18px] p-4 text-left ${plan.id === template.id ? "bg-[var(--accent)] text-black" : "bg-[var(--surface)] text-white"}`}>
              <span className="text-[11px] uppercase opacity-60">{template.daysPerWeek} días · {template.level}</span>
              <strong className="mt-1 block text-[18px] font-semibold">{template.name}</strong>
              <span className="mt-2 block text-[12px] leading-relaxed opacity-65">{template.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between px-1"><div><h2 className="text-[15px] font-normal text-[var(--label-2)]">Calendario semanal</h2><p className="mt-1 text-[12px] text-[var(--label-3)]">Podés elegir una rutina distinta para cada día.</p></div><Button size="sm" onClick={saveCurrentPlan} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></div>
        <div className="grid gap-3">
          {weekdays.map((day) => {
            const scheduled = currentDays.find((item) => item.weekday === day.value);
            return (
              <Card key={day.value}>
                <CardContent className="grid grid-cols-[88px_1fr] items-center gap-3 p-3">
                  <span className="text-[15px]">{day.label}</span>
                  <Select aria-label={`Rutina para ${day.label}`} value={scheduled?.routineId ?? ""} onChange={(event) => updateDay(day.value, event.target.value)}>
                    <option value="">Descanso</option>
                    {sortedRoutines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1"><div><h2 className="text-[15px] font-normal text-[var(--label-2)]">Rutinas</h2><p className="mt-1 text-[12px] text-[var(--label-3)]">{routines.length} rutinas disponibles</p></div><Button size="sm" variant="ghost" onClick={() => setEditingRoutine(newRoutine())}><Plus size={15} />Nueva</Button></div>
        <div className="grid gap-3">
          {sortedRoutines.map((routine) => (
            <Card key={routine.id}>
              <CardContent className="flex min-h-[76px] items-center gap-3 p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-black"><Dumbbell size={20} /></span>
                <button type="button" onClick={() => setEditingRoutine(routine)} className="min-w-0 flex-1 text-left"><span className="block truncate text-[17px]">{routine.name}</span><span className="block truncate text-[12px] text-[var(--label-2)]">{routine.exercises.length} ejercicios · ≈ {estimateRoutineMinutes(routine)} min</span><span className="block truncate text-[11px] text-[var(--label-3)]">{routine.description}</span></button>
                <button type="button" aria-label={`Editar ${routine.name}`} onClick={() => setEditingRoutine(routine)} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-2)]"><Pencil size={16} /></button>
                <Link aria-label={`Iniciar ${routine.name}`} href={`/app/workout/new?routine=${routine.id}`} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><Play size={16} /></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {editingRoutine && <RoutineEditor key={editingRoutine.id} routine={editingRoutine} saving={saving} onClose={() => setEditingRoutine(null)} onSave={persistRoutine} />}
    </>
  );
}

function newRoutine(): Routine {
  return { id: `custom-${crypto.randomUUID()}`, name: "Nueva rutina", description: "Rutina personalizada", muscleGroups: ["full-body"], exercises: [], favorite: false, createdAt: new Date().toISOString() };
}

function RoutineEditor({ routine, saving, onClose, onSave }: { routine: Routine; saving: boolean; onClose: () => void; onSave: (routine: Routine) => Promise<void> }) {
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description);
  const [exercises, setExercises] = useState<RoutineExercise[]>(routine.exercises);
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (normalized.length < 2) return [];
    const selectedIds = new Set(exercises.map((exercise) => exercise.exerciseId).filter(Boolean));
    return baseExercises.filter((exercise) => !selectedIds.has(exercise.id) && `${exercise.name} ${exercise.target} ${exercise.equipment}`.toLowerCase().includes(normalized)).slice(0, 12);
  }, [exercises, query]);

  function addExercise(exercise: Exercise) {
    setExercises((current) => [...current, { exerciseId: exercise.id, exerciseName: exercise.name, muscleGroup: exercise.muscleGroup, sets: 3, reps: 10, weight: 0, restSeconds: 90 }]);
    setQuery("");
  }

  function updateExercise(index: number, patch: Partial<RoutineExercise>) {
    setExercises((current) => current.map((exercise, position) => {
      if (position !== index) return exercise;
      const updated = { ...exercise, ...patch };
      if (!exercise.setPrescriptions) return updated;
      updated.setPrescriptions = Array.from({ length: updated.sets }, (_, setIndex) => ({
        reps: patch.reps ?? exercise.setPrescriptions?.[setIndex]?.reps ?? updated.reps,
        weight: patch.weight ?? exercise.setPrescriptions?.[setIndex]?.weight ?? updated.weight,
      }));
      return updated;
    }));
  }

  async function save() {
    const groups = [...new Set(exercises.map((exercise) => exercise.muscleGroup))];
    await onSave({ ...routine, name: name.trim() || "Rutina", description: description.trim() || "Rutina personalizada", exercises, muscleGroups: groups.length ? groups : ["full-body"] });
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Editar ${routine.name}`} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 px-2 pt-8 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar editor" className="absolute inset-0" onClick={onClose} />
      <section className="relative max-h-[94vh] w-full max-w-[560px] overflow-y-auto rounded-t-[24px] bg-[#111113] p-4 pb-8 shadow-2xl">
        <div className="mb-4 flex items-center gap-3"><div className="min-w-0 flex-1"><h2 className="text-[24px] font-semibold">Editar rutina</h2><p className="text-[13px] text-[var(--label-2)]">{exercises.length} ejercicios · ≈ {estimateRoutineMinutes({ exercises })} min</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)]"><X size={19} /></button></div>
        <div className="grid gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la rutina" /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" /></div>

        <h3 className="mb-2 mt-5 text-[15px] text-[var(--label-2)]">Ejercicios ({exercises.length})</h3>
        <div className="grid gap-2">
          {exercises.map((exercise, index) => (
            <Card key={`${exercise.exerciseId ?? exercise.exerciseName}-${index}`}>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[15px] capitalize">{exercise.exerciseName}</span><button type="button" aria-label={`Quitar ${exercise.exerciseName}`} onClick={() => setExercises((current) => current.filter((_, position) => position !== index))} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] text-[var(--red)]"><Trash2 size={14} />Quitar</button></div>
                <div className="grid grid-cols-4 gap-2"><NumberField label="Series" value={exercise.sets} onChange={(value) => updateExercise(index, { sets: value })} /><NumberField label="Reps" value={exercise.reps} onChange={(value) => updateExercise(index, { reps: value })} /><NumberField label="Peso" value={exercise.weight} step={0.5} onChange={(value) => updateExercise(index, { weight: value })} /><NumberField label="Desc." value={exercise.restSeconds} step={15} onChange={(value) => updateExercise(index, { restSeconds: value })} /></div>
              </CardContent>
            </Card>
          ))}
          {!exercises.length && <p className="rounded-[16px] bg-[var(--surface)] p-4 text-center text-[13px] text-[var(--label-2)]">Buscá abajo y agregá el primer ejercicio.</p>}
        </div>

        <div className="mt-5"><h3 className="text-[15px]">Agregar ejercicio</h3><p className="mt-1 text-[12px] text-[var(--label-3)]">Buscá un movimiento y tocá el resultado para sumarlo.</p></div>
        <div className="relative mt-3"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--label-3)]" size={18} /><Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar entre 1.324 ejercicios" /></div>
        {!!matches.length && <Card className="mt-2 overflow-hidden"><CardContent className="p-0">{matches.map((exercise, index) => <button type="button" aria-label={`Agregar ${exercise.name}`} key={exercise.id} onClick={() => addExercise(exercise)} className={`flex min-h-12 w-full items-center gap-2 px-3 text-left ${index ? "border-t border-white/10" : ""}`}><span className="min-w-0 flex-1 truncate text-[13px] capitalize">{exercise.name}</span><span className="text-[11px] capitalize text-[var(--label-3)]">{exercise.equipment}</span><Plus size={15} className="text-[var(--accent)]" /></button>)}</CardContent></Card>}

        <Button className="mt-5 w-full" disabled={saving || !name.trim() || !exercises.length} onClick={save}>{saving ? "Guardando…" : "Guardar rutina"}</Button>
      </section>
    </div>
  );
}

function NumberField({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (value: number) => void }) {
  return <label className="text-center text-[10px] uppercase text-[var(--label-3)]">{label}<Input className="mt-1 px-1 text-center" type="number" min={0} step={step} value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value)))} /></label>;
}
