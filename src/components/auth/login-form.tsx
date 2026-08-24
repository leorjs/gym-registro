"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FirebaseConfigAlert } from "@/components/auth/firebase-config-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Ingresá un email válido."),
  password: z.string().min(6, "Mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn, configReady } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await signIn(values.email, values.password);
      router.push("/app");
    } catch {
      setError("No pudimos iniciar sesión. Revisá email y contraseña.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {!configReady && <FirebaseConfigAlert />}
      <Label>
        Email
        <Input type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && <span className="text-xs text-[#b23b32]">{form.formState.errors.email.message}</span>}
      </Label>
      <Label>
        Contraseña
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password && (
          <span className="text-xs text-[#b23b32]">{form.formState.errors.password.message}</span>
        )}
      </Label>
      {error && <p className="rounded-xl bg-[color-mix(in_srgb,var(--red)_16%,transparent)] p-3 text-sm text-[var(--red)]">{error}</p>}
      <Button type="submit" size="lg" disabled={!configReady || form.formState.isSubmitting}>
        <LogIn size={18} />
        Entrar
      </Button>
      <div className="flex flex-wrap justify-between gap-3 text-sm text-[var(--label-2)]">
        <Link className="hover:text-white" href="/register">
          Crear cuenta
        </Link>
        <Link className="hover:text-white" href="/forgot-password">
          Recuperar clave
        </Link>
      </div>
    </form>
  );
}
