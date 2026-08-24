"use client";

import Link from "next/link";
import { format, parseISO, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart3, CalendarDays, ChevronRight, Flame, History, Scale } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { useBodyweights } from "@/lib/hooks/use-bodyweights";
import { getBestSet, getWeekStreak } from "@/lib/metrics/training";

export default function ProgressPage() {
  const { user, profile } = useAuth();
  const { workouts } = useWorkouts(user?.uid);
  const { entries: bodyweights } = useBodyweights(user?.uid);
  const best = getBestSet(workouts);
  const completed = workouts.filter((workout) => workout.status === "completed");
  const doneDays = new Set(completed.map((workout) => workout.date));
  const heatDays = Array.from({ length: 364 }, (_, index) => subDays(new Date(), 363 - index));
  const thisMonth = completed.filter((workout) => workout.date.slice(0, 7) === format(new Date(), "yyyy-MM")).length;
  const recentWeights = bodyweights.filter((entry) => parseISO(entry.date) >= subMonths(new Date(), 3));
  const weight30 = bodyweights.filter((entry) => parseISO(entry.date) >= subDays(new Date(), 30));
  const weightDelta = weight30.length > 1 ? weight30.at(-1)!.weight - weight30[0].weight : null;

  return (
    <>
      <header className="mb-[18px] mt-1 flex items-end justify-between gap-3">
        <div><h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em]">Estadísticas</h1><p className="mt-1 text-[15px] text-[var(--label-2)]">Progreso e historial</p></div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface)]"><History size={18} /></span>
      </header>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Metric icon={<BarChart3 />} label="Entrenamientos" value={String(completed.length)} />
        <Metric icon={<CalendarDays />} label="Este mes" value={String(thisMonth)} />
        <Metric icon={<Flame />} label="Racha semanal" value={String(getWeekStreak(completed))} />
        <Metric icon={<Scale />} label="Peso 30d" value={weightDelta == null ? "—" : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} ${profile?.unit ?? "kg"}`} accent={weightDelta != null} />
      </div>

      <Card className="mb-3">
        <CardContent className="p-4">
          <h2 className="mb-4 text-[13px] font-normal text-[var(--label-2)]">Actividad · últimos 12 meses · por tiempo entrenado</h2>
          <div className="mb-2 grid grid-cols-5 text-center text-[11px] text-[var(--label-3)]"><span>Ago</span><span>Nov</span><span>Feb</span><span>May</span><span>Ago</span></div>
          <div className="grid grid-flow-col grid-rows-7 justify-start gap-[1.5px] overflow-hidden">
            {heatDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              return <span key={key} title={key} className={`h-[5px] w-[5px] rounded-[1.5px] ${doneDays.has(key) ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]"}`} />;
            })}
          </div>
          <p className="mt-3 text-right text-[11px] text-[var(--label-3)]">Menos tiempo　▰ ▰ ▰ ▰　Más tiempo</p>
        </CardContent>
      </Card>

      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-[13px] font-normal text-[var(--label-2)]">Peso corporal</h2><span className="text-[13px] text-[var(--accent)]">◎ {profile?.targetWeight ?? "Objetivo"}　＋ Registrar</span></div>
          <div className="mb-3 grid grid-cols-4 rounded-xl bg-[var(--surface-3)] p-1 text-center text-[13px] text-[var(--label-2)]"><span className="py-1.5">1M</span><span className="rounded-lg bg-[var(--surface)] py-1.5 text-white">3M</span><span className="py-1.5">1A</span><span className="py-1.5">Todo</span></div>
          {recentWeights.length > 1 ? <div className="h-[180px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={recentWeights}><defs><linearGradient id="statsWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#30d158" stopOpacity={0.3}/><stop offset="100%" stopColor="#30d158" stopOpacity={0}/></linearGradient></defs><YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />{profile?.targetWeight && <ReferenceLine y={profile.targetWeight} stroke="#ffd60a" strokeDasharray="5 5" />}<Area type="monotone" dataKey="weight" stroke="#30d158" strokeWidth={2.5} fill="url(#statsWeight)" dot={false} /></AreaChart></ResponsiveContainer></div> : <p className="py-8 text-center text-[13px] text-[var(--label-2)]">Registrá al menos dos pesos para ver la curva.</p>}
        </CardContent>
      </Card>

      <Card className="mb-5"><CardContent className="p-4"><h2 className="mb-3 text-[13px] font-normal text-[var(--label-2)]">Progreso por ejercicio</h2>{best ? <Link href="/app/exercises" className="flex items-center justify-between"><span><strong className="block text-[18px] font-medium">{best.exerciseName}</strong><span className="text-[13px] text-[var(--label-2)]">Mejor serie · {best.weight} {profile?.unit ?? "kg"} × {best.reps}</span></span><ChevronRight size={17} className="text-[var(--label-3)]" /></Link> : <p className="text-[13px] text-[var(--label-2)]">Terminá tu primer entrenamiento para ver el progreso.</p>}</CardContent></Card>

      <div className="mb-2 flex items-center justify-between px-1"><h2 className="text-[13px] font-normal text-[var(--label-2)]">Entrenamientos recientes</h2><span className="text-[13px] text-[var(--accent)]">Todos {workouts.length}</span></div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {workouts.map((workout, index) => (
            <Link key={workout.id} href={`/app/workout/${workout.id}`} className={`flex min-h-[64px] items-center gap-3 px-4 active:bg-[var(--surface-2)] ${index ? "border-t border-white/10" : ""}`}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><BarChart3 size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[17px]">{workout.focus}</span><span className="block text-[13px] text-[var(--label-2)]">{format(parseISO(workout.date), "d MMM", { locale: es })} · {workout.durationMinutes} min · {workout.totalSets} series</span></span>
              <ChevronRight size={16} className="text-[var(--label-3)]" />
            </Link>
          ))}
          {!workouts.length && <p className="p-4 text-[13px] text-[var(--label-2)]">No hay entrenamientos todavía.</p>}
        </CardContent>
      </Card>
    </>
  );
}

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return <Card><CardContent className="p-4"><p className="mb-3 flex items-center gap-2 text-[12px] text-[var(--label-2)]"><span className="text-[var(--label-3)]">{icon}</span>{label}</p><p className={`truncate text-[24px] font-semibold tracking-[-.02em] ${accent ? "text-[var(--accent)]" : ""}`}>{value}</p></CardContent></Card>;
}
