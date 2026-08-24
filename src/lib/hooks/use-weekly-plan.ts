"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { recommendWeeklyPlan, weeklyPlanTemplates } from "@/lib/data/weekly-plans";
import { getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { weeklyPlanPath } from "@/lib/firebase/paths";
import type { UserWeeklyPlan, WeeklyPlanDay } from "@/types/training";

export function useWeeklyPlan(uid?: string, preferredDays = 4) {
  const [savedPlan, setSavedPlan] = useState<UserWeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid || !hasFirebaseConfig) {
      return;
    }

    const unsubscribe = onSnapshot(doc(getFirebaseDb(), weeklyPlanPath(uid)), (snapshot) => {
      setSavedPlan(snapshot.exists() ? snapshot.data() as UserWeeklyPlan : null);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  const fallback = recommendWeeklyPlan(preferredDays);
  const plan = useMemo(() => {
    if (!savedPlan) return fallback;
    const template = weeklyPlanTemplates.find((item) => item.id === savedPlan.templateId) ?? fallback;
    return { ...template, name: savedPlan.name, daysPerWeek: savedPlan.daysPerWeek, days: savedPlan.days };
  }, [fallback, savedPlan]);

  const savePlan = useCallback(async ({ templateId, name, days }: { templateId: string; name: string; days: WeeklyPlanDay[] }) => {
    if (!uid) throw new Error("Usuario no autenticado.");
    const payload: UserWeeklyPlan = {
      id: "current",
      templateId,
      name,
      daysPerWeek: days.length,
      days,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(getFirebaseDb(), weeklyPlanPath(uid)), payload);
  }, [uid]);

  return { plan, loading, savePlan };
}
