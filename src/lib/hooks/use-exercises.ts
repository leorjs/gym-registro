"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { baseExercises } from "@/lib/data/catalog";
import { getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { exercisesPath } from "@/lib/firebase/paths";
import type { Exercise } from "@/types/training";

export function useExercises(uid?: string) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !hasFirebaseConfig) {
      return;
    }

    const unsubscribe = onSnapshot(collection(getFirebaseDb(), exercisesPath(uid)), (snapshot) => {
      setCustomExercises(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Exercise));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const exercises = useMemo(() => {
    const byId = new Map(baseExercises.map((exercise) => [exercise.id, exercise]));
    customExercises.forEach((exercise) => byId.set(exercise.id, exercise));
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [customExercises]);

  const saveExercise = useCallback(
    async (exercise: Exercise) => {
      if (!uid) throw new Error("Usuario no autenticado.");
      await setDoc(doc(getFirebaseDb(), exercisesPath(uid), exercise.id), exercise, { merge: true });
    },
    [uid],
  );

  return { exercises: uid && hasFirebaseConfig ? exercises : baseExercises, loading: uid && hasFirebaseConfig ? loading : false, saveExercise };
}
