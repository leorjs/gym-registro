"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { starterRoutines } from "@/lib/data/catalog";
import { getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { routinesPath } from "@/lib/firebase/paths";
import type { Routine } from "@/types/training";

export function useRoutines(uid?: string) {
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !hasFirebaseConfig) {
      return;
    }

    const unsubscribe = onSnapshot(collection(getFirebaseDb(), routinesPath(uid)), (snapshot) => {
      setCustomRoutines(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Routine));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const routines = useMemo(() => {
    const byId = new Map(starterRoutines.map((routine) => [routine.id, routine]));
    customRoutines.forEach((routine) => byId.set(routine.id, routine));
    return Array.from(byId.values());
  }, [customRoutines]);

  const saveRoutine = useCallback(
    async (routine: Routine) => {
      if (!uid) throw new Error("Usuario no autenticado.");
      await setDoc(doc(getFirebaseDb(), routinesPath(uid), routine.id), routine, { merge: true });
    },
    [uid],
  );

  return { routines: uid && hasFirebaseConfig ? routines : starterRoutines, loading: uid && hasFirebaseConfig ? loading : false, saveRoutine };
}
