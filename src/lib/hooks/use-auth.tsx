"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";
import { userPath } from "@/lib/firebase/paths";
import type { Goal, MuscleGroup, UserProfile, WeightUnit } from "@/types/training";

type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

type OnboardingInput = {
  displayName: string;
  unit: WeightUnit;
  goal: Goal;
  weeklyGoal: number;
  priorityMuscles: MuscleGroup[];
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);

  const loadProfile = useCallback(async (currentUser: User) => {
    const db = getFirebaseDb();
    const ref = doc(db, userPath(currentUser.uid));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
      return;
    }

    const now = new Date().toISOString();
    const fallbackProfile: UserProfile = {
      uid: currentUser.uid,
      displayName: currentUser.displayName ?? "Atleta",
      email: currentUser.email ?? "",
      unit: "kg",
      goal: "hipertrofia",
      weeklyGoal: 4,
      priorityMuscles: ["pecho", "espalda", "piernas"],
      onboardingComplete: false,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, fallbackProfile);
    setProfile(fallbackProfile);
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configReady: hasFirebaseConfig,
      async signIn(email, password) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      async register({ displayName, email, password }) {
        const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
        await updateProfile(credential.user, { displayName });
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          displayName,
          email,
          unit: "kg",
          goal: "hipertrofia",
          weeklyGoal: 4,
          priorityMuscles: ["pecho", "espalda", "piernas"],
          onboardingComplete: false,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(getFirebaseDb(), userPath(credential.user.uid)), newProfile);
        setProfile(newProfile);
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(getFirebaseAuth(), email);
      },
      async completeOnboarding(input) {
        if (!user) return;
        const updatedProfile: UserProfile = {
          uid: user.uid,
          email: user.email ?? "",
          onboardingComplete: true,
          createdAt: profile?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...input,
        };
        await setDoc(doc(getFirebaseDb(), userPath(user.uid)), updatedProfile, { merge: true });
        setProfile(updatedProfile);
      },
      async logout() {
        await signOut(getFirebaseAuth());
      },
    }),
    [loading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
