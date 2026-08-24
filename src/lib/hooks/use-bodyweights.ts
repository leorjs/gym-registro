"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { bodyweightsPath } from "@/lib/firebase/paths";
import type { BodyWeightEntry } from "@/types/training";

export function useBodyweights(uid?: string) {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);

  useEffect(() => {
    if (!uid || !hasFirebaseConfig) return;
    const q = query(collection(getFirebaseDb(), bodyweightsPath(uid)), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as BodyWeightEntry));
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  const saveWeight = useCallback(async (weight: number, date = new Date().toISOString().slice(0, 10)) => {
    if (!uid) throw new Error("Usuario no autenticado.");
    await setDoc(doc(getFirebaseDb(), bodyweightsPath(uid), date), { date, weight, createdAt: new Date().toISOString() }, { merge: true });
  }, [uid]);

  return useMemo(() => ({ entries, latest: entries.at(-1), saveWeight }), [entries, saveWeight]);
}
