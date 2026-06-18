"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  Library,
  LogOut,
  Plus,
  Settings,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingPanel } from "@/components/app/onboarding-panel";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Panel", icon: BarChart3 },
  { href: "/app/workout/new", label: "Entrenar", icon: Plus },
  { href: "/app/history", label: "Historial", icon: CalendarDays },
  { href: "/app/exercises", label: "Ejercicios", icon: Library },
  { href: "/app/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/app/profile", label: "Perfil", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout, configReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !configReady)) {
      router.replace("/login");
    }
  }, [configReady, loading, router, user]);

  if (loading || !user || !configReady) {
    return (
      <main className="app-bg grid min-h-screen place-items-center">
        <div className="rounded-lg bg-white px-5 py-4 text-sm font-black shadow-[var(--shadow-soft)]">Cargando registro...</div>
      </main>
    );
  }

  return (
    <div className="app-bg min-h-screen pb-24 md:grid md:grid-cols-[280px_1fr] md:pb-0">
      <aside className="dark-field sticky top-0 hidden h-screen flex-col justify-between p-5 text-white md:flex">
        <div>
          <Link href="/app" className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#b9ff45] text-[#151917]">
              <Dumbbell size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white/50">Gym Registro</p>
              <p className="font-black">{profile?.displayName ?? "Atleta"}</p>
            </div>
          </Link>
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white",
                    active && "bg-white text-[#151917] hover:bg-white hover:text-[#151917]",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Button variant="ghost" className="justify-start text-white hover:bg-white/10 hover:text-white" onClick={logout}>
          <LogOut size={18} />
          Salir
        </Button>
      </aside>

      <main className="min-w-0 px-4 py-4 sm:px-6 md:px-8 md:py-8">
        {!profile?.onboardingComplete && <OnboardingPanel />}
        {children}
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[#d8ded5] bg-white/95 px-2 pt-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "grid min-h-14 place-items-center rounded-lg text-[10px] font-black text-[#66706b]",
                  active && "bg-[#151917] text-white",
                )}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
