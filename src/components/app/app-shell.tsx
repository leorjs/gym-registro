"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, CalendarDays, Dumbbell, House, List } from "lucide-react";
import { OnboardingPanel } from "@/components/app/onboarding-panel";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/app", label: "Inicio", icon: House },
  { href: "/app/routines", label: "Plan", icon: CalendarDays },
  { href: "/app/history", label: "Progreso", icon: BarChart3 },
  { href: "/app/exercises", label: "Ejercicios", icon: List },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, configReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !configReady)) router.replace("/login");
  }, [configReady, loading, router, user]);

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  if (loading || !user || !configReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-[var(--label-3)]">
        <Dumbbell size={34} />
      </main>
    );
  }

  const active = (href: string) => href === "/app" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-black">
      <main className="open-gym-page mx-auto min-h-screen w-full max-w-[560px] px-4 pb-36 pt-[calc(env(safe-area-inset-top)+16px)]">
        {!profile?.onboardingComplete && <OnboardingPanel />}
        {children}
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-[560px] grid-cols-5 border-t border-white/10 bg-[#0e0e10]/95 px-2 pt-2 backdrop-blur-xl">
        <Tab item={tabs[0]} on={active(tabs[0].href)} />
        <Tab item={tabs[1]} on={active(tabs[1].href)} />
        <Link href="/app/workout/new" className="group grid min-h-[66px] place-items-center text-[11px] text-[var(--accent)]">
          <span className="-mt-8 grid h-[58px] w-[58px] place-items-center rounded-full bg-[var(--accent)] text-black shadow-[0_4px_22px_rgba(48,209,88,.32)] transition group-active:scale-95">
            <Dumbbell size={23} strokeWidth={2} />
          </span>
          <span className="-mt-3">Iniciar</span>
        </Link>
        <Tab item={tabs[2]} on={active(tabs[2].href)} />
        <Tab item={tabs[3]} on={active(tabs[3].href)} />
      </nav>
    </div>
  );
}

function Tab({ item, on }: { item: (typeof tabs)[number]; on: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "grid min-h-[66px] place-items-center content-center gap-1 text-[11px] transition active:scale-95",
        on ? "text-[var(--accent)]" : "text-[var(--label-3)]",
      )}
    >
      <Icon size={22} strokeWidth={1.8} />
      <span>{item.label}</span>
    </Link>
  );
}
