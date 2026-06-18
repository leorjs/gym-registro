"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="app-bg grid min-h-screen place-items-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[#d8ded5] bg-white shadow-[var(--shadow-soft)] md:grid-cols-[0.9fr_1.1fr]">
        <aside className="dark-field relative hidden min-h-[680px] flex-col justify-between p-8 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#b9ff45] text-[#151917]">
              <Dumbbell size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white/55">Gym Registro</p>
              <p className="text-lg font-black">Training log</p>
            </div>
          </div>
          <div className="space-y-6">
            <Badge tone="lime">Mobile-first</Badge>
            <h1 className="max-w-sm text-5xl font-black leading-[0.96]">
              Tus marcas, rutinas y progreso en un solo lugar.
            </h1>
            <div className="grid grid-cols-3 gap-3">
              {["Volumen", "PRs", "Racha"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/8 p-4">
                  <p className="text-2xl font-black number-font">0{item === "PRs" ? "" : "0"}</p>
                  <p className="text-xs font-bold uppercase text-white/55">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/58">Diseñada para usar entre series: rápida, visual y sin relleno.</p>
        </aside>

        <section className="p-5 sm:p-8 lg:p-12">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-black text-[#151917] md:hidden">
            <Dumbbell size={18} />
            Gym Registro
          </Link>
          <div className="mb-8">
            <p className="text-xs font-black uppercase text-[#1d6b57]">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-[#151917] sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#66706b]">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
