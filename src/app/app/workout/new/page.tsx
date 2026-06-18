import { PageHeader } from "@/components/app/page-header";
import { WorkoutEditor } from "@/components/app/workout-editor";

type NewWorkoutPageProps = {
  searchParams: Promise<{ routine?: string | string[] }>;
};

export default async function NewWorkoutPage({ searchParams }: NewWorkoutPageProps) {
  const params = await searchParams;
  const routineId = Array.isArray(params.routine) ? params.routine[0] : params.routine;

  return (
    <>
      <PageHeader
        eyebrow="Entrenar"
        title="Registrar sesión"
        description="Cargá sets rápido, copiá el último y usá el timer de descanso sin salir del flujo."
      />
      <WorkoutEditor initialRoutineId={routineId} />
    </>
  );
}
