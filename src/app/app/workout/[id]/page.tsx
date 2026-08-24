"use client";

import { useParams } from "next/navigation";
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
      {loading ? (
        <div className="rounded-[14px] bg-[var(--surface)] p-5 text-sm text-[var(--label-2)]">Cargando sesión...</div>
      ) : workout ? (
        <WorkoutEditor workout={workout} />
      ) : (
        <div className="rounded-[14px] bg-[var(--surface)] p-5 text-sm text-[var(--label-2)]">No encontramos esta sesión.</div>
      )}
    </>
  );
}
