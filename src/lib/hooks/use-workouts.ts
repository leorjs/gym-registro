"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { workoutPath, workoutsPath } from "@/lib/firebase/paths";
import type { Workout, WorkoutSet } from "@/types/training";

type WorkoutDraft = Omit<Workout, "id" | "createdAt" | "updatedAt" | "totalVolume" | "totalSets" | "muscles">;

function summarizeSets(sets: WorkoutSet[]) {
  const completedSets = sets.filter((set) => set.completed !== false);
  return {
    totalVolume: completedSets.reduce((sum, set) => sum + set.reps * set.weight, 0),
    totalSets: completedSets.length,
    muscles: Array.from(new Set(sets.map((set) => set.muscleGroup))),
  };
}

function firestoreSet(set: WorkoutSet, now: string) {
  const payload = { ...set, createdAt: set.createdAt || now };
  if (payload.rpe === undefined) delete payload.rpe;
  return payload;
}

export function useWorkouts(uid?: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !hasFirebaseConfig) {
      return;
    }

    let active = true;
    const db = getFirebaseDb();
    const workoutsRef = collection(db, workoutsPath(uid));
    const q = query(workoutsRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const hydrated = await Promise.all(
            snapshot.docs.map(async (workoutDoc) => {
              const setsSnap = await getDocs(collection(workoutDoc.ref, "sets"));
              const sets = setsSnap.docs
                .map((setDoc) => ({ id: setDoc.id, ...setDoc.data() }) as WorkoutSet)
                .sort((a, b) => a.setNumber - b.setNumber);
              return { id: workoutDoc.id, ...workoutDoc.data(), sets } as Workout;
            }),
          );
          if (!active) return;
          setWorkouts(hydrated);
          setLoading(false);
          setError(null);
        } catch (reason) {
          if (!active) return;
          setError(reason instanceof Error ? reason.message : "No se pudieron cargar los entrenamientos.");
          setLoading(false);
        }
      },
      (reason) => {
        if (!active) return;
        setError(reason.message);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  const saveWorkout = useCallback(
    async (draft: WorkoutDraft, workoutId?: string) => {
      if (!uid) throw new Error("Usuario no autenticado.");
      const db = getFirebaseDb();
      const now = new Date().toISOString();
      const summary = summarizeSets(draft.sets);
      const payload = {
        ...(draft.routineId ? { routineId: draft.routineId } : {}),
        date: draft.date,
        focus: draft.focus,
        durationMinutes: draft.durationMinutes,
        status: draft.status,
        notes: draft.notes ?? "",
        ...summary,
        updatedAt: now,
      };

      const ref = workoutId
        ? doc(db, workoutPath(uid, workoutId))
        : await addDoc(collection(db, workoutsPath(uid)), { ...payload, createdAt: now });

      if (workoutId) {
        await updateDoc(ref, payload);
      }

      const existingSets = await getDocs(collection(ref, "sets"));
      await Promise.all(existingSets.docs.map((setDoc) => deleteDoc(setDoc.ref)));
      await Promise.all(
        draft.sets.map((set) => {
          const setRef = doc(collection(ref, "sets"), set.id);
          return setDoc(setRef, firestoreSet(set, now));
        }),
      );

      return ref.id;
    },
    [uid],
  );

  const deleteWorkout = useCallback(
    async (workoutId: string) => {
      if (!uid) throw new Error("Usuario no autenticado.");
      const db = getFirebaseDb();
      const ref = doc(db, workoutPath(uid, workoutId));
      const existingSets = await getDocs(collection(ref, "sets"));
      await Promise.all(existingSets.docs.map((setDoc) => deleteDoc(setDoc.ref)));
      await deleteDoc(ref);
    },
    [uid],
  );

  const value = useMemo(
    () => ({
      workouts: uid && hasFirebaseConfig ? workouts : [],
      loading: uid && hasFirebaseConfig ? loading : false,
      error,
      saveWorkout,
      deleteWorkout,
    }),
    [deleteWorkout, error, loading, saveWorkout, uid, workouts],
  );

  return value;
}
