import { PageHeader } from "@/components/app/page-header";
import { WorkoutEditor } from "@/components/app/workout-editor";

export default function NewWorkoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Entrenar"
        title="Registrar sesión"
        description="Cargá sets rápido, copiá el último y usá el timer de descanso sin salir del flujo."
      />
      <WorkoutEditor />
    </>
  );
}
