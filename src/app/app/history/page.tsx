"use client";

import Link from "next/link";
import { Edit3, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";
import { formatKg } from "@/lib/utils";

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const { workouts, deleteWorkout } = useWorkouts(user?.uid);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    return workouts
      .filter((workout) => {
        const text = [workout.focus, workout.notes, ...workout.sets.map((set) => set.exerciseName)].join(" ").toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sort === "volume") return b.totalVolume - a.totalVolume;
        return sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      });
  }, [query, sort, workouts]);

  return (
    <>
      <PageHeader eyebrow="Historial" title="Sesiones guardadas" description="Buscá por ejercicio, enfoque o nota." />

      <div className="mb-4 grid gap-3 rounded-lg border border-[#d8ded5] bg-white p-3 shadow-[var(--shadow-soft)] sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 text-[#66706b]" size={18} />
          <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar sesión..." />
        </div>
        <Select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="volume">Mayor volumen</option>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map((workout) => (
          <Card key={workout.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{workout.focus}</h2>
                    <Badge tone={workout.status === "completed" ? "green" : "amber"}>{workout.status === "completed" ? "Completa" : "Borrador"}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#66706b]">
                    {format(parseISO(workout.date), "dd/MM/yyyy")} · {workout.durationMinutes} min · {workout.totalSets} sets ·{" "}
                    {formatKg(workout.totalVolume, profile?.unit)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/app/workout/${workout.id}`}>
                      <Edit3 size={15} />
                      Editar
                    </Link>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteWorkout(workout.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {workout.sets.slice(0, 5).map((set) => (
                  <div key={set.id} className="flex justify-between gap-3 border-t border-[#e8ebe3] py-2 text-sm">
                    <span className="font-black">{set.exerciseName}</span>
                    <span className="number-font text-[#66706b]">
                      {set.reps} reps · {formatKg(set.weight, profile?.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <div className="rounded-lg border border-dashed border-[#b8c6bf] bg-white p-8 text-center text-sm font-bold text-[#66706b]">
            No hay sesiones que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </>
  );
}
