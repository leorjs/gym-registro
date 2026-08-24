"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Dumbbell, Pause, Play, Plus, Search, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  equipmentFor,
  exerciseBodyParts,
  exerciseGifSrc,
  exerciseImageSrc,
  exerciseMediaAttribution,
  spanishInstructionsFor,
} from "@/lib/data/exercise-catalog";
import { useAuth } from "@/lib/hooks/use-auth";
import { useExercises } from "@/lib/hooks/use-exercises";
import { useRoutines } from "@/lib/hooks/use-routines";
import type { Exercise, MuscleGroup, Routine } from "@/types/training";

const pageSize = 40;
const muscleGroups: MuscleGroup[] = ["pecho", "espalda", "piernas", "hombros", "brazos", "core", "gluteos", "full-body"];

export default function ExercisesPage() {
  const { user } = useAuth();
  const { exercises, saveExercise } = useExercises(user?.uid);
  const { routines, saveRoutine } = useRoutines(user?.uid);
  const [query, setQuery] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [equipment, setEquipment] = useState("");
  const [shown, setShown] = useState(pageSize);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("pecho");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const searched = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return exercises.filter((exercise) => {
      if (bodyPart && exercise.bodyPart !== bodyPart) return false;
      if (!normalized) return true;
      return `${exercise.name} ${exercise.bodyPart ?? ""} ${exercise.equipment ?? ""} ${exercise.target ?? ""} ${exercise.tags.join(" ")}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [bodyPart, exercises, query]);

  const equipmentOptions = useMemo(() => equipmentFor(searched), [searched]);
  const activeEquipment = equipmentOptions.includes(equipment) ? equipment : "";
  const filtered = useMemo(
    () => activeEquipment ? searched.filter((exercise) => exercise.equipment === activeEquipment) : searched,
    [activeEquipment, searched],
  );

  function resetPage() {
    setShown(pageSize);
  }

  async function addExercise() {
    if (!name.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const item: Exercise = {
        id: `custom-${crypto.randomUUID()}`,
        name: name.trim(),
        muscleGroup,
        tags: ["personal"],
        favorite: true,
        custom: true,
        createdAt: new Date().toISOString(),
        bodyPart: muscleGroup,
        equipment: "personalizado",
      };
      await saveExercise(item);
      setName("");
      setCreating(false);
      setMessage("Ejercicio creado.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "No se pudo guardar el ejercicio.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(exercise: Exercise) {
    await saveExercise({ ...exercise, favorite: !exercise.favorite });
  }

  async function addExerciseToRoutine(exercise: Exercise, routineId: string) {
    const routine = routines.find((item) => item.id === routineId);
    if (!routine) return;
    const updated: Routine = {
      ...routine,
      muscleGroups: [...new Set([...routine.muscleGroups, exercise.muscleGroup])],
      exercises: [...routine.exercises, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: 3,
        reps: 10,
        weight: 0,
        restSeconds: 90,
      }],
    };
    await saveRoutine(updated);
    setMessage(`${exercise.name} se agregó a ${routine.name}.`);
  }

  return (
    <>
      <header className="mb-[18px] mt-1 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">Ejercicios</h1>
          <p className="mt-1 text-[15px] text-[var(--label-2)]">1.324 movimientos con demostración animada</p>
        </div>
        <button onClick={() => setCreating((value) => !value)} aria-label="Nuevo ejercicio" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface)]"><Plus size={19} /></button>
      </header>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-3 text-[var(--label-3)]" size={18} />
        <Input className="pl-10" value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="Buscar por ejercicio, músculo o equipo" />
      </div>

      <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip label="Todos" active={!bodyPart} onClick={() => { setBodyPart(""); setEquipment(""); resetPage(); }} />
        {exerciseBodyParts.map((part) => <FilterChip key={part} label={part} active={bodyPart === part} onClick={() => { setBodyPart(part); setEquipment(""); resetPage(); }} />)}
      </div>
      {equipmentOptions.length > 1 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <FilterChip label="Cualquier equipo" active={!activeEquipment} onClick={() => { setEquipment(""); resetPage(); }} />
          {equipmentOptions.map((item) => <FilterChip key={item} label={item} active={activeEquipment === item} onClick={() => { setEquipment(item); resetPage(); }} />)}
        </div>
      )}

      {creating && (
        <Card className="mb-3">
          <CardContent className="grid gap-2 p-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del ejercicio" />
            <Select value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value as MuscleGroup)}>{muscleGroups.map((group) => <option key={group}>{group}</option>)}</Select>
            <Button onClick={addExercise} disabled={saving || !name.trim()}>{saving ? "Guardando…" : "Guardar ejercicio"}</Button>
          </CardContent>
        </Card>
      )}

      {message && <p className="mb-3 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-[var(--accent)]">{message}</p>}
      <p className="mb-2 px-1 text-[13px] text-[var(--label-2)]">{filtered.length} ejercicios</p>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filtered.slice(0, shown).map((exercise, index) => (
            <div key={exercise.id} className={`flex min-h-[68px] items-center gap-2 px-3 ${index ? "border-t border-white/10" : ""}`}>
              <button type="button" onClick={() => setSelected(exercise)} className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left">
                <ExerciseThumb exercise={exercise} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[16px] capitalize">{exercise.name}</span><span className="block truncate text-[12px] capitalize text-[var(--label-2)]">{exercise.target ?? exercise.muscleGroup} · {exercise.equipment ?? "personalizado"}</span></span>
                <ChevronRight size={16} className="text-[var(--label-3)]" />
              </button>
              <button type="button" aria-label={exercise.favorite ? "Quitar favorito" : "Agregar favorito"} onClick={() => toggleFavorite(exercise)} className="grid h-10 w-10 place-items-center"><Star size={16} className={exercise.favorite ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--label-3)]"} /></button>
            </div>
          ))}
          {!filtered.length && <p className="p-6 text-center text-[14px] text-[var(--label-2)]">No encontramos coincidencias.</p>}
        </CardContent>
      </Card>
      {filtered.length > shown && <Button variant="secondary" className="mt-3 w-full" onClick={() => setShown((value) => value + pageSize)}>Mostrar más</Button>}
      <a href="https://gymvisual.com/" target="_blank" rel="noreferrer" className="mt-4 block text-center text-[11px] text-[var(--label-3)]">{exerciseMediaAttribution}</a>

      {selected && <ExerciseDetail exercise={selected} routines={routines} onClose={() => setSelected(null)} onAddToRoutine={addExerciseToRoutine} />}
    </>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`shrink-0 rounded-full px-3 py-2 text-[12px] capitalize ${active ? "bg-[var(--accent)] text-black" : "bg-[var(--surface)] text-[var(--label-2)]"}`}>{label}</button>;
}

function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  const src = exerciseImageSrc(exercise);
  if (!src) return <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Dumbbell size={18} /></span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain" />;
}

function ExerciseDetail({ exercise, routines, onClose, onAddToRoutine }: { exercise: Exercise; routines: Routine[]; onClose: () => void; onAddToRoutine: (exercise: Exercise, routineId: string) => Promise<void> }) {
  const [playing, setPlaying] = useState(true);
  const [instructions, setInstructions] = useState(exercise.instructions ?? []);
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const gif = exerciseGifSrc(exercise);
  const image = exerciseImageSrc(exercise);

  useEffect(() => {
    let active = true;
    spanishInstructionsFor(exercise).then((items) => { if (active) setInstructions(items); });
    return () => { active = false; };
  }, [exercise]);

  return (
    <div role="dialog" aria-modal="true" aria-label={exercise.name} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 px-2 pt-10 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar detalle" className="absolute inset-0" onClick={onClose} />
      <section className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[24px] bg-[#111113] p-4 pb-8 shadow-2xl">
        <div className="mb-3 flex items-start gap-3"><div className="min-w-0 flex-1"><h2 className="text-[24px] font-semibold capitalize tracking-[-.02em]">{exercise.name}</h2><p className="mt-1 text-[13px] capitalize text-[var(--label-2)]">{exercise.target ?? exercise.muscleGroup} · {exercise.equipment}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)]"><X size={19} /></button></div>

        {(gif || image) ? (
          <button type="button" onClick={() => setPlaying((value) => !value)} className="relative mb-4 block aspect-square w-full overflow-hidden rounded-[18px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={playing ? gif : image} alt={exercise.name} className="h-full w-full object-contain" />
            <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[12px] text-white backdrop-blur">{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "Pausar" : "Reproducir"}</span>
          </button>
        ) : <div className="mb-4 grid aspect-video place-items-center rounded-[18px] bg-[var(--surface)] text-[var(--label-3)]"><Dumbbell size={34} /></div>}

        {!!instructions.length && <div className="mb-4 rounded-[16px] bg-[var(--surface)] p-4"><h3 className="mb-2 text-[16px] font-semibold">Cómo hacerlo</h3><ol className="grid list-decimal gap-2 pl-5 text-[13px] leading-relaxed text-[var(--label-2)]">{instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}</ol></div>}

        {!!routines.length && <div className="rounded-[16px] bg-[var(--surface)] p-4"><h3 className="mb-2 text-[16px] font-semibold">Agregar a una rutina</h3><Select value={routineId} onChange={(event) => setRoutineId(event.target.value)}>{routines.map((routine) => <option value={routine.id} key={routine.id}>{routine.name}</option>)}</Select>{error && <p className="mt-2 text-[12px] text-[var(--red)]">{error}</p>}<Button className="mt-2 w-full" disabled={!routineId || adding} onClick={async () => { setAdding(true); setError(""); try { await onAddToRoutine(exercise, routineId); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo agregar el ejercicio."); } finally { setAdding(false); } }}>{adding ? "Agregando…" : "Agregar al plan"}</Button></div>}
        <a href="https://gymvisual.com/" target="_blank" rel="noreferrer" className="mt-4 block text-center text-[11px] text-[var(--label-3)]">{exerciseMediaAttribution}</a>
      </section>
    </div>
  );
}
