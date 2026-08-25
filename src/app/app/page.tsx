"use client";

import Link from "next/link";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Dumbbell, Flame, Settings, Moon, Play, Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWeekStreak, getWeeklySessions } from "@/lib/metrics/training";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { useBodyweights } from "@/lib/hooks/use-bodyweights";
import { useWeeklyPlan } from "@/lib/hooks/use-weekly-plan";
import { useRoutines } from "@/lib/hooks/use-routines";
import { estimateRoutineMinutes } from "@/lib/data/catalog";

export default function HomePage() {
  const { user, profile } = useAuth();
  const { workouts } = useWorkouts(user?.uid);
  const { entries: bodyweights, latest: latestWeight, saveWeight } = useBodyweights(user?.uid);
  const { plan } = useWeeklyPlan(user?.uid, profile?.weeklyGoal ?? 4);
  const { routines } = useRoutines(user?.uid);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [weight, setWeight] = useState(0);
  const today = new Date();
  const monday = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const selectedDate = weekDays.find((day) => day.getDay() === selectedWeekday) ?? weekDays[0];
  const selectedPlan = plan.days.find((day) => day.weekday === selectedWeekday);
  const selectedRoutine = routines.find((routine) => routine.id === selectedPlan?.routineId);
  const completedWorkouts = workouts.filter((workout) => workout.status === "completed");
  const doneDates = new Set(completedWorkouts.map((workout) => workout.date));
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedWorkout = completedWorkouts.find((workout) => workout.date === selectedDateKey);
  const weeklySessions = getWeeklySessions(completedWorkouts);
  const streak = getWeekStreak(completedWorkouts);
  const previousWeight = bodyweights.at(-2);
  const weightDelta = latestWeight && previousWeight ? latestWeight.weight - previousWeight.weight : 0;

  return (
    <>
      <header className="mb-[18px] mt-1 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">
            openGym
          </h1>
          <p className="mt-1 capitalize text-[15px] text-[var(--label-2)]">
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <Link href="/app/profile" aria-label="Configuración" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface)] active:scale-90">
          <Settings size={18} />
        </Link>
      </header>

      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between text-[13px] text-[var(--label-2)]">
            <button aria-label="Semana anterior" onClick={() => setWeekOffset((value) => value - 1)} className="grid h-8 w-8 place-items-center"><ChevronLeft size={17} /></button>
            <span>{weekOffset === 0 ? "Esta semana" : `${format(monday, "d MMM", { locale: es })} – ${format(addDays(monday, 6), "d MMM", { locale: es })}`}</span>
            <button aria-label="Semana siguiente" onClick={() => setWeekOffset((value) => value + 1)} className="grid h-8 w-8 place-items-center"><ChevronRight size={17} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => {
              const iso = format(day, "yyyy-MM-dd");
              const planned = plan.days.some((item) => item.weekday === day.getDay());
              const current = isSameDay(day, today);
              const done = doneDates.has(iso);
              return (
                <button key={iso} type="button" aria-label={`${format(day, "EEEE d 'de' MMMM", { locale: es })}${done ? ", rutina completada" : planned ? ", entrenamiento programado" : ", descanso"}`} onClick={() => setSelectedWeekday(day.getDay())} className={`grid justify-items-center gap-1 rounded-xl px-0.5 py-1 text-[13px] transition-colors ${done ? "bg-[var(--accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)]" : selectedWeekday === day.getDay() ? "bg-[var(--surface-2)]" : ""}`}>
                  <span className={`text-[10px] uppercase ${done ? "font-semibold text-[var(--accent)]" : "text-[var(--label-3)]"}`}>{format(day, "EEEEE", { locale: es })}</span>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-[var(--accent)] font-bold text-black" : current ? "ring-1 ring-[var(--accent)] font-semibold text-[var(--accent)]" : ""}`}>{done ? <Check size={16} strokeWidth={3} /> : format(day, "d")}</span>
                  <span className={`h-1 w-1 rounded-full ${done ? "bg-[var(--accent)]" : planned ? "bg-[var(--label-3)]" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selectedWorkout || selectedPlan ? "bg-[var(--accent)] text-black" : "bg-[var(--surface-3)]"}`}>{selectedWorkout ? <CheckCircle2 size={17} /> : selectedPlan ? <Dumbbell size={17} /> : <Moon size={17} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase text-[var(--label-3)]">{format(selectedDate, "EEEE d", { locale: es })}</span>
                <span className="block truncate text-[17px]">{selectedWorkout ? `${selectedWorkout.focus} · Completada` : selectedPlan?.focus ?? "Día de descanso"}</span>
              </span>
              {selectedRoutine && <span className="text-[12px] text-[var(--label-2)]">≈ {estimateRoutineMinutes(selectedRoutine)} min</span>}
            </div>
            {selectedRoutine ? (
              <>
                <ul className="mt-3 grid gap-1.5 border-t border-white/10 pt-3">
                  {selectedRoutine.exercises.map((exercise) => (
                    <li key={`${selectedRoutine.id}-${exercise.exerciseId ?? exercise.exerciseName}`} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="min-w-0 truncate">{exercise.exerciseName}</span>
                      <span className="shrink-0 text-[var(--label-3)]">{exercise.sets} × {exercise.reps}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" className="mt-3 w-full"><Link href={`/app/workout/new?routine=${selectedRoutine.id}`}><Play size={15} />Iniciar {selectedRoutine.name}</Link></Button>
              </>
            ) : (
              <Link href="/app/routines" className="mt-3 flex items-center justify-center gap-2 border-t border-white/10 pt-3 text-[13px] text-[var(--accent)]"><Plus size={15} />Programar una rutina</Link>
            )}
          </div>
        </CardContent>
      </Card>

      {!workouts.length && (
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-black"><Sparkles size={16} /></span>
              <h2 className="text-[22px] font-semibold tracking-[-.021em]">¡Bienvenido!</h2>
            </div>
            <p className="mb-3 text-[13px] leading-[1.45] text-[var(--label-2)]">Configurá tu rutina semanal o empezá con el plan recomendado según tus días disponibles.</p>
            <Button asChild className="w-full"><Link href="/app/routines"><Sparkles size={16} />Ver plan recomendado</Link></Button>
            <Button asChild variant="ghost" className="mt-2 w-full"><Link href="/app/routines">Armar mi propio plan</Link></Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-normal text-[var(--label-2)]">Peso corporal</h2>
            <div className="flex items-center gap-4 text-[15px] text-[var(--accent)]">
              <Link href="/app/profile">◎ {profile?.targetWeight ? `${profile.targetWeight} ${profile.unit}` : "Objetivo"}</Link>
              <button onClick={() => setLoggingWeight((value) => !value)}>＋ Registrar</button>
            </div>
          </div>
          {loggingWeight && <div className="mb-3 flex gap-2"><input className="h-11 min-w-0 flex-1 rounded-xl bg-[var(--surface-2)] px-3 text-white outline-none" type="number" min={1} step={0.1} placeholder={`Peso en ${profile?.unit ?? "kg"}`} value={weight || ""} onChange={(event) => setWeight(Number(event.target.value))} /><Button onClick={async () => { if (weight > 0) { await saveWeight(weight); setLoggingWeight(false); setWeight(0); } }}>Guardar</Button></div>}
          {latestWeight ? <>
            <p className="text-[30px] font-semibold leading-none">{latestWeight.weight} <span className="text-[16px] font-normal text-[var(--label-2)]">{profile?.unit ?? "kg"}</span>{weightDelta !== 0 && <span className="ml-2 text-[14px] font-normal text-[var(--accent)]">{weightDelta > 0 ? "↑" : "↓"} {Math.abs(weightDelta).toFixed(1)}</span>}</p>
            {profile?.targetWeight && <p className="mt-2 text-[13px] text-[#ffd60a]">◎ Objetivo {profile.targetWeight} {profile.unit} · {Math.abs(latestWeight.weight - profile.targetWeight).toFixed(1)} {profile.unit} restantes</p>}
            {bodyweights.length > 1 && <div className="mt-3 h-[130px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={bodyweights}><defs><linearGradient id="homeWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#30d158" stopOpacity={0.28}/><stop offset="100%" stopColor="#30d158" stopOpacity={0}/></linearGradient></defs><YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />{profile?.targetWeight && <ReferenceLine y={profile.targetWeight} stroke="#ffd60a" strokeDasharray="5 5" />}<Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2.5} fill="url(#homeWeight)" dot={false} /></AreaChart></ResponsiveContainer></div>}
          </> : <p className="text-[13px] leading-[1.45] text-[var(--label-2)]">No hay registros todavía: cargá tu peso para empezar la curva.</p>}
        </CardContent>
      </Card>

      <Link href="/app/history">
        <Card className="active:brightness-125">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="flex items-center gap-2 text-[22px] font-semibold tracking-[-.021em]"><Flame size={19} className="text-[var(--orange)]" />{streak} semanas de racha</p>
              <p className="mt-1 text-[13px] text-[var(--label-2)]">{weeklySessions} / {profile?.weeklyGoal ?? 4} esta semana · {workouts.length} entrenamientos en total</p>
            </div>
            <CalendarDays size={20} />
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
