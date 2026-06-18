"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { WorkoutEditor } from "@/components/app/workout-editor";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWorkouts } from "@/lib/hooks/use-workouts";

export default function EditWorkoutPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { workouts, loading } = useWorkouts(user?.uid);
  const workout = workouts.find((item) => item.id === params.id);

  return (
    <>
      <PageHeader eyebrow="Editar" title="Ajustar sesión" description="Corregí sets, notas o duración de un entrenamiento guardado." />
      {loading ? (
        <div className="rounded-lg bg-white p-5 text-sm font-black shadow-[var(--shadow-soft)]">Cargando sesión...</div>
      ) : workout ? (
        <WorkoutEditor workout={workout} />
      ) : (
        <div className="rounded-lg bg-white p-5 text-sm font-black shadow-[var(--shadow-soft)]">No encontramos esta sesión.</div>
      )}
    </>
  );
}
