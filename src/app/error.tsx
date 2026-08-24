"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <section className="w-full max-w-sm rounded-[20px] bg-[var(--surface)] p-6 text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--orange-soft)] text-[var(--orange)]">
          <AlertTriangle size={24} />
        </span>
        <h1 className="text-[24px] font-semibold tracking-[-.02em]">No pudimos cargar esta pantalla</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--label-2)]">
          Reintentá la carga. Tus entrenamientos y datos guardados no se modificaron.
        </p>
        <Button className="mt-5 w-full" onClick={() => unstable_retry()}>
          <RotateCcw size={17} />
          Reintentar
        </Button>
        <Button className="mt-2 w-full" variant="ghost" onClick={() => window.location.reload()}>
          Recargar aplicación
        </Button>
      </section>
    </main>
  );
}
