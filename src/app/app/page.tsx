"use client";

import Link from "next/link";
import { Activity, Flame, Plus, Trophy } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { getBestSet, getCurrentStreak, getTotalVolume, getVolumeByWeek, getWeeklySessions } from "@/lib/metrics/training";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { formatKg } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { workouts, loading } = useWorkouts(user?.uid);
  const weeklyGoal = profile?.weeklyGoal ?? 4;
  const weeklySessions = getWeeklySessions(workouts);
  const bestSet = getBestSet(workouts);
  const chartData = getVolumeByWeek(workouts, 6);
  const latestWorkout = workouts[0];

  return (
    <>
      <PageHeader
        eyebrow="Panel"
        title={`Hola, ${profile?.displayName ?? "atleta"}`}
        description="Vista rápida de adherencia, volumen y próximas acciones."
        action={
          <Button asChild variant="accent" size="lg">
            <Link href="/app/workout/new">
              <Plus size={18} />
              Iniciar sesión
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Activity />} label="Volumen total" value={formatKg(getTotalVolume(workouts), profile?.unit)} />
          <MetricCard icon={<Flame />} label="Racha" value={`${getCurrentStreak(workouts)} días`} />
          <MetricCard icon={<Trophy />} label="Mejor marca" value={bestSet ? `${bestSet.exerciseName} ${formatKg(bestSet.weight, profile?.unit)}` : "Sin datos"} />
          <MetricCard icon={<Activity />} label="Semana" value={`${weeklySessions}/${weeklyGoal}`} />
        </section>

        <Card className="dark-field text-white">
          <CardHeader>
            <div>
              <p className="text-xs font-black uppercase text-white/50">Hoy</p>
              <h2 className="text-2xl font-black">Entrenamiento</h2>
            </div>
            <Badge tone={weeklySessions >= weeklyGoal ? "lime" : "green"}>{weeklySessions >= weeklyGoal ? "Objetivo listo" : "En progreso"}</Badge>
          </CardHeader>
          <CardContent>
            {latestWorkout ? (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Última sesión</p>
                <div>
                  <p className="text-4xl font-black">{latestWorkout.focus}</p>
                  <p className="mt-1 text-sm font-semibold text-white/60">
                    {latestWorkout.totalSets} sets · {formatKg(latestWorkout.totalVolume, profile?.unit)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/70">Todavía no hay sesiones. Guardá la primera y este panel empieza a moverse.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-xs font-black uppercase text-[#1d6b57]">Últimas 6 semanas</p>
              <h2 className="text-xl font-black">Volumen</h2>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="grid h-full place-items-center text-sm font-bold text-[#66706b]">Cargando datos...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f3f2ec" }} />
                  <Bar dataKey="volume" fill="#151917" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-xs font-black uppercase text-[#1d6b57]">Próxima acción</p>
              <h2 className="text-xl font-black">Flujo rápido</h2>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="primary">
              <Link href="/app/workout/new">Registrar entrenamiento</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/routines">Elegir rutina</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/history">Revisar historial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-[#efffcb] text-[#151917]">{icon}</div>
        <p className="text-xs font-black uppercase text-[#66706b]">{label}</p>
        <p className="number-font mt-1 text-2xl font-black leading-tight text-[#151917]">{value}</p>
      </CardContent>
    </Card>
  );
}
