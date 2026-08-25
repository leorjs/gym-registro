"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Dumbbell, Gauge, Info, Lightbulb, Minus, Pause, Play, Plus, Save, Search, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { alternativesForExercise, exerciseByIdOrName, exerciseGifSrc, exerciseImageSrc, exerciseMediaAttribution } from "@/lib/data/exercise-catalog";
import { estimateRoutineMinutes } from "@/lib/data/catalog";
import { effortFromRpe, progressionMessage, routineExercisesFromSets, rpeForEffort, type ExerciseEffort } from "@/lib/training/workout-progress";
import type { Workout, WorkoutSet } from "@/types/training";

function makeSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: crypto.randomUUID(), exerciseId: overrides.exerciseId ?? "custom", exerciseName: overrides.exerciseName ?? "",
    muscleGroup: overrides.muscleGroup ?? "full-body", setNumber: overrides.setNumber ?? 1, reps: overrides.reps ?? 8,
    weight: overrides.weight ?? 0, rpe: overrides.rpe, restSeconds: overrides.restSeconds ?? 90,
    completed: overrides.completed ?? false, createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

function clock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function WorkoutEditor({ workout, initialRoutineId }: { workout?: Workout; initialRoutineId?: string }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { routines, loading: routinesLoading, saveRoutine } = useRoutines(user?.uid);
  const { workouts, loading: workoutsLoading, saveWorkout } = useWorkouts(user?.uid);
  const initialRoutineApplied = useRef(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState(workout?.id);
  const [sourceRoutineId, setSourceRoutineId] = useState(workout?.routineId ?? initialRoutineId);
  const [focus, setFocus] = useState(workout?.focus ?? "");
  const [sets, setSets] = useState<WorkoutSet[]>(workout?.sets.length ? workout.sets : []);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [changingExercise, setChangingExercise] = useState(false);
  const [alternativeQuery, setAlternativeQuery] = useState("");

  const applyRoutine = useCallback((routineId: string) => {
    const routine = routines.find((item) => item.id === routineId);
    if (!routine) return false;
    setSourceRoutineId(routineId);
    setFocus(routine.name);
    setExerciseIndex(0);
    setPlaying(true);
    setMediaFailed(false);
    setSets(routine.exercises.flatMap((exercise) => {
      const prescriptions = exercise.setPrescriptions?.length
        ? exercise.setPrescriptions
        : Array.from({ length: exercise.sets }, () => ({ reps: exercise.reps, weight: exercise.weight }));
      return prescriptions.map((prescription, index) => makeSet({
        exerciseId: exercise.exerciseId ?? exercise.exerciseName.toLowerCase().replaceAll(" ", "-"), exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup, reps: prescription.reps, weight: prescription.weight,
        restSeconds: exercise.restSeconds, setNumber: index + 1,
      }));
    }));
    return true;
  }, [routines]);

  useEffect(() => {
    if (!initialRoutineId || workout || routinesLoading || workoutsLoading || initialRoutineApplied.current) return;
    const timer = window.setTimeout(() => {
      const today = format(new Date(), "yyyy-MM-dd");
      const draft = workouts.find((item) => item.status === "draft" && item.routineId === initialRoutineId && item.date === today);
      if (draft?.sets.length) {
        initialRoutineApplied.current = true;
        setActiveWorkoutId(draft.id);
        setSourceRoutineId(draft.routineId ?? initialRoutineId);
        setFocus(draft.focus);
        setSets(draft.sets);
        setElapsed(Math.max(0, draft.durationMinutes * 60));
        return;
      }
      initialRoutineApplied.current = applyRoutine(initialRoutineId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applyRoutine, initialRoutineId, routinesLoading, workout, workouts, workoutsLoading]);

  useEffect(() => {
    if (!focus) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [focus]);

  useEffect(() => {
    if (rest <= 0) return;
    const timer = window.setTimeout(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [rest]);

  const groups = useMemo(() => {
    const names: string[] = [];
    sets.forEach((set) => { if (!names.includes(set.exerciseName)) names.push(set.exerciseName); });
    return names.map((name) => ({ name, sets: sets.filter((set) => set.exerciseName === name) }));
  }, [sets]);
  const current = groups[Math.min(exerciseIndex, Math.max(0, groups.length - 1))];
  const completed = sets.filter((set) => set.completed !== false).length;
  const catalogExercise = current ? exerciseByIdOrName(current.sets[0]?.exerciseId, current.name) : undefined;
  const gif = exerciseGifSrc(catalogExercise);
  const image = exerciseImageSrc(catalogExercise);
  const usedExerciseIds = useMemo(() => [...new Set(sets.map((set) => set.exerciseId))], [sets]);
  const alternatives = useMemo(() => {
    const normalized = alternativeQuery.trim().toLowerCase();
    return alternativesForExercise(catalogExercise, usedExerciseIds)
      .filter((exercise) => !normalized || `${exercise.name} ${exercise.equipment}`.toLowerCase().includes(normalized))
      .slice(0, 40);
  }, [alternativeQuery, catalogExercise, usedExerciseIds]);
  const currentEffort = effortFromRpe(current?.sets.find((set) => set.rpe !== undefined)?.rpe);
  const currentWeight = current ? Math.max(...current.sets.map((set) => set.weight)) : 0;
  const currentCompleted = current?.sets.filter((set) => set.completed !== false).length ?? 0;

  function updateSet(id: string, patch: Partial<WorkoutSet>) {
    setSets((items) => items.map((set) => set.id === id ? { ...set, ...patch } : set));
  }

  function toggleSet(set: WorkoutSet) {
    const done = set.completed === false;
    updateSet(set.id, { completed: done });
    if (done) setRest(set.restSeconds ?? 90);
  }

  function goToExercise(index: number) {
    setExerciseIndex(index);
    setPlaying(true);
    setMediaFailed(false);
  }

  function replaceCurrentExercise(replacement: NonNullable<typeof catalogExercise>) {
    if (!current) return;
    const previousName = current.name;
    setSets((items) => items.map((set) => set.exerciseName === previousName ? {
      ...set,
      exerciseId: replacement.id,
      exerciseName: replacement.name,
      muscleGroup: replacement.muscleGroup,
      weight: 0,
      completed: false,
    } : set));
    setChangingExercise(false);
    setAlternativeQuery("");
    setPlaying(true);
    setMediaFailed(false);
  }

  function setExerciseEffort(effort: ExerciseEffort) {
    if (!current) return;
    const rpe = rpeForEffort(effort);
    setSets((items) => items.map((set) => set.exerciseName === current.name ? { ...set, rpe } : set));
  }

  async function updateSourceRoutine() {
    if (!sourceRoutineId) return;
    const routine = routines.find((item) => item.id === sourceRoutineId);
    if (!routine) return;
    const exercises = routineExercisesFromSets(sets);
    await saveRoutine({
      ...routine,
      exercises,
      muscleGroups: [...new Set(exercises.map((exercise) => exercise.muscleGroup))],
    });
  }

  async function finish(status: "draft" | "completed") {
    if (!focus || !sets.length) return;
    setSaving(true);
    setSaveError(null);
    try {
      const savedId = await saveWorkout({
        routineId: sourceRoutineId,
        date: workout?.date ?? format(new Date(), "yyyy-MM-dd"), focus,
        durationMinutes: Math.max(1, Math.round(elapsed / 60)), status,
        notes: workout?.notes ?? "", sets: sets.map((set, index) => ({ ...set, setNumber: index + 1 })),
      }, activeWorkoutId);
      setActiveWorkoutId(savedId);
      await updateSourceRoutine();
      router.push(status === "completed" ? "/app" : "/app/history");
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "No se pudo guardar el entrenamiento.");
      setSaving(false);
    }
  }

  if (!focus || !sets.length) {
    if (routinesLoading || workoutsLoading) return <p className="rounded-[16px] bg-[var(--surface)] p-4 text-center text-[13px] text-[var(--label-2)]">Cargando tus rutinas guardadas…</p>;
    return <RoutineChooser routines={routines} onChoose={applyRoutine} />;
  }

  return (
    <div className="pb-16">
      <header className="mb-4 grid grid-cols-[44px_1fr_44px] items-center gap-3">
        <button aria-label="Descartar" onClick={() => router.back()} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface)]"><X size={22} /></button>
        <div className="text-center"><h1 className="text-[18px] font-semibold">{focus}</h1><p className="mt-1 text-[13px] text-[var(--label-2)]">{clock(elapsed)} · {completed}/{sets.length} series</p></div>
        <button type="button" aria-label={saving ? "Guardando entrenamiento" : "Guardar y finalizar rutina"} disabled={saving} onClick={() => finish("completed")} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface)] text-[var(--accent)] disabled:opacity-50"><Check size={22} /></button>
      </header>
      {saveError && <p role="alert" className="mb-3 rounded-xl bg-[color-mix(in_srgb,var(--red)_16%,transparent)] p-3 text-[13px] text-[var(--red)]">{saveError} Volvé a intentarlo.</p>}
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-[var(--surface-3)]"><span className="block h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${sets.length ? completed / sets.length * 100 : 0}%` }} /></div>

      <p className="mb-2 text-[13px] text-[var(--label-2)]">Ejercicio {exerciseIndex + 1} / {groups.length}</p>
      {!mediaFailed && (gif || image) && <button type="button" onClick={() => setPlaying((value) => !value)} className="relative mb-3 block aspect-square w-full overflow-hidden rounded-[18px] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={playing ? gif : image} alt={current.name} onError={() => { if (playing && image) setPlaying(false); else setMediaFailed(true); }} className="h-full w-full object-contain" />
        <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[13px] text-white backdrop-blur">{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "tocá para pausar" : "tocá para reproducir"}</span>
      </button>}
      {!mediaFailed && (gif || image) && <a href="https://gymvisual.com/" target="_blank" rel="noreferrer" className="mb-3 block text-center text-[10px] text-[var(--label-3)]">{exerciseMediaAttribution}</a>}

      <div className="mb-2 flex items-center justify-between gap-3"><h2 className="min-w-0 flex-1 text-[24px] font-bold capitalize tracking-[-.02em]">{current.name}</h2><div className="flex shrink-0 gap-2"><button type="button" aria-label={`Cambiar ${current.name} por otro ejercicio del mismo músculo`} onClick={() => setChangingExercise(true)} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)] text-black"><Plus size={20} /></button><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)]"><Info size={19} /></span></div></div>
      <div className="mb-2 flex flex-wrap gap-2"><span className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-[13px] capitalize text-[var(--label-2)]">{current.sets[0]?.muscleGroup}</span><span className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-[13px] text-[var(--label-2)]">Mejor: {Math.max(...current.sets.map((set) => set.weight))} {profile?.unit ?? "kg"}</span></div>
      <p className="mb-2 text-[13px] text-[var(--label-3)]">Sesión actual: {current.sets.map((set) => `${set.weight}×${set.reps}`).join(", ")}</p>
      <p className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-[var(--accent)]"><Lightbulb size={15} />Los cambios se guardarán como base de la próxima sesión.</p>

      <section className="rounded-[18px] bg-[var(--surface)] p-4">
        <div className="mb-2 grid grid-cols-[28px_1fr_1fr_38px] gap-2 text-center text-[11px] uppercase text-[var(--label-3)]"><span /><span>Peso ({profile?.unit ?? "kg"})</span><span>Reps</span><span /></div>
        {current.sets.map((set, index) => (
          <div key={set.id} className={`grid grid-cols-[28px_1fr_1fr_38px] items-center gap-2 py-2 ${index ? "border-t border-white/10" : ""}`}>
            <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] ${set.completed !== false ? "bg-[color-mix(in_srgb,var(--accent)_45%,transparent)] text-black" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>{index + 1}</span>
            <Stepper ariaLabel={`Peso serie ${index + 1}`} value={set.weight} step={0.5} onChange={(value) => updateSet(set.id, { weight: value })} />
            <Stepper ariaLabel={`Repeticiones serie ${index + 1}`} value={set.reps} step={1} onChange={(value) => updateSet(set.id, { reps: value })} />
            <button aria-label={`Completar serie ${index + 1}`} onClick={() => toggleSet(set)} className={`grid h-9 w-9 place-items-center rounded-full ${set.completed !== false ? "bg-[var(--accent)] text-black" : "border-2 border-[var(--surface-3)] text-transparent"}`}><Check size={18} /></button>
          </div>
        ))}
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => setSets((items) => [...items, makeSet({ ...current.sets.at(-1), id: undefined, setNumber: current.sets.length + 1, completed: false })])}><Plus size={15} />Agregar serie</Button>
      </section>

      <section className="mt-3 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_17%,var(--surface)),var(--surface))] p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-black"><Gauge size={20} /></span>
          <div className="min-w-0 flex-1"><h3 className="text-[16px] font-semibold">¿Cómo se siente este peso?</h3><p className="mt-1 text-[12px] leading-5 text-[var(--label-2)]">{currentCompleted}/{current.sets.length} series completas · Usaremos tu respuesta para sugerir la próxima carga.</p></div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([{"value":"easy","label":"Fácil","hint":"Puedo subir"},{"value":"right","label":"Justo","hint":"Está bien"},{"value":"hard","label":"Pesado","hint":"Me costó"}] as const).map((option) => (
            <button key={option.value} type="button" aria-pressed={currentEffort === option.value} onClick={() => setExerciseEffort(option.value)} className={`rounded-xl px-2 py-2.5 text-center transition active:scale-[.97] ${currentEffort === option.value ? "bg-[var(--accent)] text-black" : "bg-black/25 text-white"}`}>
              <strong className="block text-[13px]">{option.label}</strong><span className={`mt-0.5 block text-[10px] ${currentEffort === option.value ? "text-black/65" : "text-[var(--label-3)]"}`}>{option.hint}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 flex items-start gap-2 rounded-xl bg-black/20 px-3 py-2.5 text-[12px] leading-5 text-[var(--label-2)]"><Sparkles size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />{progressionMessage(currentEffort, currentWeight, profile?.unit ?? "kg")}</p>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" disabled={exerciseIndex === 0} onClick={() => goToExercise(exerciseIndex - 1)}><ChevronLeft size={16} />Anterior</Button><Button variant="secondary" disabled={exerciseIndex >= groups.length - 1} onClick={() => goToExercise(exerciseIndex + 1)}>Siguiente<ChevronRight size={16} /></Button></div>
      <section className="mt-4 rounded-[18px] border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[var(--surface)] p-4">
        <div className="mb-3 flex items-start gap-3"><CheckCircle2 size={22} className="mt-0.5 shrink-0 text-[var(--accent)]" /><div><h3 className="text-[17px] font-semibold">Terminar la rutina</h3><p className="mt-1 text-[12px] leading-5 text-[var(--label-2)]">Guardaremos pesos, repeticiones, ejercicios elegidos y esfuerzo. El día aparecerá completado en el calendario.</p></div></div>
        <Button className="w-full" disabled={saving} onClick={() => finish("completed")}><CheckCircle2 size={17} />{saving ? "Guardando…" : "Guardar y finalizar rutina"}</Button>
        <Button variant="secondary" className="mt-2 w-full" disabled={saving} onClick={() => finish("draft")}><Save size={16} />Guardar progreso y salir</Button>
      </section>

      {rest > 0 && <div className="fixed inset-x-0 bottom-[78px] z-50 mx-auto flex w-[calc(100%-32px)] max-w-[528px] items-center gap-4 rounded-[16px] bg-[rgba(28,28,30,.94)] p-4 shadow-2xl backdrop-blur-xl"><strong className="text-[30px]">{clock(rest)}</strong><span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]"><i className="block h-full bg-[var(--accent)]" style={{ width: `${Math.min(100, rest / 90 * 100)}%` }} /></span><button onClick={() => setRest((value) => value + 15)} className="text-[var(--accent)]">+ 15s</button><Button className="min-h-10 px-4" onClick={() => setRest(0)}>Saltar</Button></div>}

      {changingExercise && catalogExercise && <div role="dialog" aria-modal="true" aria-label={`Cambiar ${current.name}`} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 px-2 pt-8 backdrop-blur-sm"><button type="button" aria-label="Cerrar alternativas" className="absolute inset-0" onClick={() => setChangingExercise(false)} /><section className="relative max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-t-[24px] bg-[#111113] p-4 pb-8"><div className="mb-4 flex items-start gap-3"><div className="min-w-0 flex-1"><p className="text-[12px] uppercase text-[var(--accent)]">Mismo músculo · {catalogExercise.target ?? catalogExercise.muscleGroup}</p><h2 className="mt-1 text-[24px] font-semibold">Cambiar ejercicio</h2><p className="mt-1 text-[12px] leading-5 text-[var(--label-2)]">Conservamos series y repeticiones. El peso vuelve a 0 para que elijas una carga adecuada.</p></div><button type="button" aria-label="Cerrar alternativas" onClick={() => setChangingExercise(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--surface)]"><X size={19} /></button></div><div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--label-3)]" size={18} /><Input className="pl-10" value={alternativeQuery} onChange={(event) => setAlternativeQuery(event.target.value)} placeholder={`Buscar alternativas para ${catalogExercise.target ?? catalogExercise.muscleGroup}`} /></div><div className="grid gap-2">{alternatives.map((exercise) => <button type="button" key={exercise.id} onClick={() => replaceCurrentExercise(exercise)} className="flex min-h-[58px] items-center gap-3 rounded-[14px] bg-[var(--surface)] px-3 text-left"><span className="min-w-0 flex-1"><strong className="block truncate text-[14px] capitalize">{exercise.name}</strong><span className="text-[11px] capitalize text-[var(--label-3)]">{exercise.equipment}</span></span><Plus size={17} className="text-[var(--accent)]" /></button>)}{!alternatives.length && <p className="rounded-[14px] bg-[var(--surface)] p-4 text-center text-[13px] text-[var(--label-2)]">No encontramos otra alternativa con ese filtro.</p>}</div></section></div>}
    </div>
  );
}

function Stepper({ ariaLabel, value, step, onChange }: { ariaLabel: string; value: number; step: number; onChange: (value: number) => void }) {
  const adjust = (direction: -1 | 1) => onChange(Math.max(0, Math.round((value + direction * step) * 100) / 100));
  return <div className="grid h-11 grid-cols-[34px_1fr_34px] items-center rounded-xl bg-[var(--surface-2)] text-[var(--label-2)]"><button type="button" aria-label={`Bajar ${ariaLabel.toLowerCase()}`} onClick={() => adjust(-1)} className="grid h-full place-items-center"><Minus size={14} /></button><input aria-label={ariaLabel} type="number" min={0} step={step} inputMode="decimal" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className="min-w-0 bg-transparent text-center text-[17px] text-white outline-none" /><button type="button" aria-label={`Subir ${ariaLabel.toLowerCase()}`} onClick={() => adjust(1)} className="grid h-full place-items-center"><Plus size={14} /></button></div>;
}

function RoutineChooser({ routines, onChoose }: { routines: ReturnType<typeof useRoutines>["routines"]; onChoose: (id: string) => boolean }) {
  return <div><header className="mb-6 mt-1"><h1 className="text-[34px] font-bold tracking-[-.028em]">Iniciar entrenamiento</h1><p className="mt-1 text-[15px] text-[var(--label-2)]">Elegí una rutina para comenzar</p></header><div className="grid gap-3">{routines.map((routine) => <button key={routine.id} onClick={() => onChoose(routine.id)} className="flex min-h-[72px] items-center gap-3 rounded-[16px] bg-[var(--surface)] p-4 text-left"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)] text-black"><Dumbbell size={20} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[17px] font-medium">{routine.name}</strong><span className="text-[13px] text-[var(--label-2)]">{routine.exercises.length} ejercicios · ≈ {estimateRoutineMinutes(routine)} min</span></span><Play size={18} className="text-[var(--accent)]" /></button>)}</div></div>;
}
