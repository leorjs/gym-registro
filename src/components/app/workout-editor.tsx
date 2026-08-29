"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Dumbbell, Info, Minus, Pause, Play, Plus, Save, Search, Volume2, VolumeX, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseVisual } from "@/components/app/exercise-visual";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRoutines } from "@/lib/hooks/use-routines";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { alternativesForExercise, exerciseAttributionFor, exerciseByIdOrName, exerciseGifSrc, exerciseImageSrc } from "@/lib/data/exercise-catalog";
import { estimateRoutineMinutes } from "@/lib/data/catalog";
import { adaptiveRestSeconds, effortFromRpe, exerciseIndexAfterSwipe, restCountdownCue, routineExercisesFromSets, rpeForEffort, type ExerciseEffort } from "@/lib/training/workout-progress";
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

const effortOptions = [
  { value: "easy", label: "Fácil" },
  { value: "right", label: "Justo" },
  { value: "hard", label: "Difícil" },
] as const;

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
  const [restTotal, setRestTotal] = useState(90);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [changingExercise, setChangingExercise] = useState(false);
  const [alternativeQuery, setAlternativeQuery] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastRestCueRef = useRef<number | null>(null);
  const activeExerciseThumbRef = useRef<HTMLButtonElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);

  const prepareRestAudio = useCallback(() => {
    const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
  }, []);

  const playRestCue = useCallback((remainingSeconds: number) => {
    const cue = restCountdownCue(remainingSeconds);
    const context = audioContextRef.current;
    if (!cue || !context || context.state !== "running") return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(cue.frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + cue.durationMs / 1000 + 0.02);
  }, []);

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

  useEffect(() => {
    if (rest <= 0) {
      lastRestCueRef.current = null;
      return;
    }
    if (!restSoundEnabled || rest > 10 || lastRestCueRef.current === rest) return;
    lastRestCueRef.current = rest;
    playRestCue(rest);
  }, [playRestCue, rest, restSoundEnabled]);

  useEffect(() => () => {
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

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
  const attribution = exerciseAttributionFor(catalogExercise);
  const usedExerciseIds = useMemo(() => [...new Set(sets.map((set) => set.exerciseId))], [sets]);
  const alternatives = useMemo(() => {
    const normalized = alternativeQuery.trim().toLowerCase();
    return alternativesForExercise(catalogExercise, usedExerciseIds)
      .filter((exercise) => !normalized || `${exercise.name} ${exercise.equipment}`.toLowerCase().includes(normalized))
      .slice(0, 40);
  }, [alternativeQuery, catalogExercise, usedExerciseIds]);

  useEffect(() => {
    activeExerciseThumbRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [exerciseIndex, groups.length]);

  function updateSet(id: string, patch: Partial<WorkoutSet>) {
    setSets((items) => items.map((set) => set.id === id ? { ...set, ...patch } : set));
  }

  function toggleSet(set: WorkoutSet) {
    const done = set.completed === false;
    updateSet(set.id, { completed: done });
    if (done) {
      const completedInExercise = current?.sets.filter((item) => item.completed !== false).length ?? 0;
      const adaptiveRest = adaptiveRestSeconds(set.restSeconds ?? 90, completedInExercise);
      lastRestCueRef.current = null;
      if (restSoundEnabled) prepareRestAudio();
      setRestTotal(adaptiveRest);
      setRest(adaptiveRest);
    }
  }

  function goToExercise(index: number) {
    setExerciseIndex(index);
    setPlaying(true);
    setMediaFailed(false);
  }

  function startExerciseSwipe(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    swipeStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    didSwipeRef.current = false;
  }

  function finishExerciseSwipe(event: TouchEvent<HTMLElement>) {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;
    if (!start || !touch) return;
    const nextIndex = exerciseIndexAfterSwipe(exerciseIndex, groups.length, touch.clientX - start.x, touch.clientY - start.y);
    if (nextIndex === exerciseIndex) return;
    didSwipeRef.current = true;
    goToExercise(nextIndex);
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

  function setSeriesEffort(setId: string, effort: ExerciseEffort) {
    updateSet(setId, { rpe: rpeForEffort(effort) });
  }

  async function updateSourceRoutine() {
    if (!sourceRoutineId) return;
    const routine = routines.find((item) => item.id === sourceRoutineId);
    if (!routine) return;
    const exercises = routineExercisesFromSets(sets, profile?.unit ?? "kg");
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
    <div className="pb-20">
      <header className="mb-3 grid grid-cols-[44px_1fr_auto] items-center gap-3">
        <button aria-label="Descartar" onClick={() => router.back()} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface)]"><X size={22} /></button>
        <div className="min-w-0 text-center"><h1 className="truncate text-[17px] font-semibold">{focus}</h1><p className="mt-0.5 text-[12px] tabular-nums text-[var(--label-2)]">{clock(elapsed)}</p></div>
        <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-[12px] font-medium tabular-nums text-[var(--accent)]">{completed}/{sets.length}</span>
      </header>
      {saveError && <p role="alert" className="mb-3 rounded-xl bg-[color-mix(in_srgb,var(--red)_16%,transparent)] p-3 text-[13px] text-[var(--red)]">{saveError} Volvé a intentarlo.</p>}
      <div className="mb-3 h-0.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><span className="block h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${sets.length ? completed / sets.length * 100 : 0}%` }} /></div>

      <nav aria-label="Ejercicios de la rutina" className="-mx-4 mb-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {groups.map((group, index) => {
            const exercise = exerciseByIdOrName(group.sets[0]?.exerciseId, group.name);
            const hasVisual = !!(exerciseGifSrc(exercise) || exerciseImageSrc(exercise));
            const done = group.sets.every((set) => set.completed !== false);
            const active = index === exerciseIndex;
            return <button ref={active ? activeExerciseThumbRef : undefined} key={`${group.name}-${index}`} type="button" aria-label={`Ir a ${group.name}${done ? ", completado" : ""}`} aria-current={active ? "step" : undefined} onClick={() => goToExercise(index)} className={`relative grid h-[66px] w-[66px] shrink-0 place-items-center overflow-hidden rounded-[15px] border-2 transition ${active ? "border-[var(--accent)] bg-white shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_18%,transparent)]" : done ? "border-[color-mix(in_srgb,var(--accent)_50%,transparent)] bg-white/90" : "border-white/10 bg-[var(--surface)]"}`}>
              {exercise && hasVisual ? <ExerciseVisual exercise={exercise} playing={false} alt="" className="h-full w-full object-contain" /> : <Dumbbell size={19} className="text-[var(--label-3)]" />}
              <span className={`absolute left-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold ${active ? "bg-[var(--accent)] text-black" : "bg-black/65 text-white"}`}>{index + 1}</span>
              {done && <span className="absolute bottom-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--accent)] text-black"><Check size={10} strokeWidth={3} /></span>}
            </button>;
          })}
        </div>
      </nav>

      <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--label-3)]"><span>Ejercicio {exerciseIndex + 1} de {groups.length}</span><span>Deslizá para cambiar</span></div>
      <section onTouchStart={startExerciseSwipe} onTouchEnd={finishExerciseSwipe} className="touch-pan-y">
      {!mediaFailed && (gif || image) && <button type="button" aria-label={playing ? `Pausar animación de ${current.name}` : `Reproducir animación de ${current.name}`} onClick={() => { if (didSwipeRef.current) { didSwipeRef.current = false; return; } setPlaying((value) => !value); }} className="relative mb-3 block aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white">
        {catalogExercise && <ExerciseVisual key={catalogExercise.id} exercise={catalogExercise} playing={playing} alt={current.name} onError={() => setMediaFailed(true)} className="h-full w-full object-contain" />}
        <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur">{playing ? <Pause size={13} /> : <Play size={13} />}</span>
      </button>}
      {!mediaFailed && (gif || image) && <a href={attribution.href} target="_blank" rel="noreferrer" className="mb-3 block text-center text-[10px] text-[var(--label-3)]">{attribution.label}</a>}

      <div className="mb-2 flex items-center justify-between gap-3"><h2 className="min-w-0 flex-1 text-[24px] font-bold capitalize tracking-[-.02em]">{current.name}</h2><div className="flex shrink-0 gap-2"><button type="button" aria-label={`Cambiar ${current.name} por otro ejercicio del mismo músculo`} onClick={() => setChangingExercise(true)} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)] text-black"><Plus size={20} /></button><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)]"><Info size={19} /></span></div></div>
      <div className="mb-2 flex flex-wrap gap-2"><span className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-[13px] capitalize text-[var(--label-2)]">{current.sets[0]?.muscleGroup}</span><span className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-[13px] text-[var(--label-2)]">Mejor: {Math.max(...current.sets.map((set) => set.weight))} {profile?.unit ?? "kg"}</span></div>
      <p className="mb-3 text-[12px] text-[var(--label-3)]">{current.sets.map((set) => `${set.weight}×${set.reps}`).join(" · ")}</p>
      </section>

      <section className="rounded-[18px] bg-[var(--surface)] p-3">
        <div className="mb-2 grid grid-cols-[28px_1fr_1fr_38px] gap-2 text-center text-[11px] uppercase text-[var(--label-3)]"><span /><span>Peso ({profile?.unit ?? "kg"})</span><span>Reps</span><span /></div>
        {current.sets.map((set, index) => (
          <div key={set.id} className={`py-2 ${index ? "border-t border-white/10" : ""}`}>
            <div className="grid grid-cols-[28px_1fr_1fr_38px] items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] ${set.completed !== false ? "bg-[color-mix(in_srgb,var(--accent)_45%,transparent)] text-black" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>{index + 1}</span>
              <Stepper ariaLabel={`Peso serie ${index + 1}`} value={set.weight} step={0.5} onChange={(value) => updateSet(set.id, { weight: value })} />
              <Stepper ariaLabel={`Repeticiones serie ${index + 1}`} value={set.reps} step={1} onChange={(value) => updateSet(set.id, { reps: value })} />
              <button aria-label={`Completar serie ${index + 1}`} onClick={() => toggleSet(set)} className={`grid h-9 w-9 place-items-center rounded-full ${set.completed !== false ? "bg-[var(--accent)] text-black" : "border-2 border-[var(--surface-3)] text-transparent"}`}><Check size={18} /></button>
            </div>
            <div className="ml-9 mt-1.5 grid grid-cols-3 gap-1.5 rounded-full bg-[var(--surface-2)] p-1">
              {effortOptions.map((option) => {
                const selected = effortFromRpe(set.rpe) === option.value;
                return <button key={option.value} type="button" aria-label={`${option.label} en serie ${index + 1}`} aria-pressed={selected} onClick={() => setSeriesEffort(set.id, option.value)} className={`rounded-full px-2 py-1.5 text-[11px] transition active:scale-[.97] ${selected ? "bg-[var(--accent)] font-semibold text-black" : "text-[var(--label-2)]"}`}>{option.label}</button>;
              })}
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => setSets((items) => [...items, makeSet({ ...current.sets.at(-1), id: undefined, setNumber: current.sets.length + 1, completed: false })])}><Plus size={15} />Agregar serie</Button>
      </section>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
        <button type="button" disabled={saving} onClick={() => finish("draft")} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] text-[var(--label-2)] transition active:bg-[var(--surface)] disabled:opacity-50"><Save size={14} />Guardar</button>
        <button type="button" disabled={saving} onClick={() => finish("completed")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 text-[12px] font-semibold text-black transition active:scale-[.98] disabled:opacity-50"><Check size={15} />{saving ? "Guardando…" : "Finalizar"}</button>
      </div>

      {rest > 0 && <div className="fixed inset-x-0 bottom-[78px] z-50 mx-auto flex w-[calc(100%-32px)] max-w-[528px] items-center gap-3 rounded-[16px] bg-[rgba(28,28,30,.94)] p-4 shadow-2xl backdrop-blur-xl"><span className="shrink-0"><strong className="block text-[30px] leading-none">{clock(rest)}</strong><small className="mt-1 block text-[9px] uppercase text-[var(--label-3)]">{rest <= 10 && restSoundEnabled ? "Aviso sonoro" : "Descanso adaptativo"}</small></span><button type="button" aria-label={restSoundEnabled ? "Silenciar avisos del descanso" : "Activar avisos del descanso"} onClick={() => { if (!restSoundEnabled) prepareRestAudio(); setRestSoundEnabled((value) => !value); }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--accent)]">{restSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]"><i className="block h-full bg-[var(--accent)]" style={{ width: `${Math.min(100, rest / restTotal * 100)}%` }} /></span><button onClick={() => { setRest((value) => value + 15); setRestTotal((value) => value + 15); }} className="shrink-0 text-[var(--accent)]">+ 15s</button><Button className="min-h-10 shrink-0 px-3" onClick={() => setRest(0)}>Saltar</Button></div>}

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
