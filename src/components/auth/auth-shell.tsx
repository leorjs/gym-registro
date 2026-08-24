"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-10 text-white">
      <section className="w-full max-w-[420px]">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent)] text-black"><Dumbbell size={23} /></span>
          <span><strong className="block text-[30px] leading-none tracking-[-.03em]">openGym</strong><small className="text-[13px] font-normal text-[var(--label-2)]">Tus entrenamientos. Tus marcas. Tus datos.</small></span>
        </Link>
        <div className="mb-7">
          <p className="mb-2 text-[13px] text-[var(--accent)]">{eyebrow}</p>
          <h1 className="text-[30px] font-bold tracking-[-.025em]">{title}</h1>
          <p className="mt-2 text-[15px] leading-6 text-[var(--label-2)]">{subtitle}</p>
        </div>
        {children}
        <p className="mt-8 text-center text-[12px] leading-5 text-[var(--label-3)]">Tus rutinas, entrenamientos y peso quedan asociados a tu perfil y sincronizados entre dispositivos.</p>
      </section>
    </main>
  );
}
