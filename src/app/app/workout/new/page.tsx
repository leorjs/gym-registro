import { WorkoutEditor } from "@/components/app/workout-editor";

type NewWorkoutPageProps = {
  searchParams: Promise<{ routine?: string | string[] }>;
};

export default async function NewWorkoutPage({ searchParams }: NewWorkoutPageProps) {
  const params = await searchParams;
  const routineId = Array.isArray(params.routine) ? params.routine[0] : params.routine;

  return <WorkoutEditor initialRoutineId={routineId} />;
}
