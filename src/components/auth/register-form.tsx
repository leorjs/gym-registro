"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FirebaseConfigAlert } from "@/components/auth/firebase-config-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";

const schema = z.object({
  displayName: z.string().min(2, "Usá al menos 2 caracteres."),
  email: z.string().email("Ingresá un email válido."),
  password: z.string().min(6, "Mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const { register, configReady } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await register(values);
      router.push("/app");
    } catch {
      setError("No pudimos crear la cuenta. Probá con otro email o intentá de nuevo.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {!configReady && <FirebaseConfigAlert />}
      <Label>
        Nombre
        <Input autoComplete="name" {...form.register("displayName")} />
      </Label>
      <Label>
        Email
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Label>
      <Label>
        Contraseña
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
      </Label>
      {Object.values(form.formState.errors)[0]?.message && (
        <p className="rounded-lg bg-[#f7dfdc] p-3 text-sm font-semibold text-[#8f251f]">
          {Object.values(form.formState.errors)[0]?.message}
        </p>
      )}
      {error && <p className="rounded-lg bg-[#f7dfdc] p-3 text-sm font-semibold text-[#8f251f]">{error}</p>}
      <Button type="submit" size="lg" disabled={!configReady || form.formState.isSubmitting}>
        <UserPlus size={18} />
        Crear cuenta
      </Button>
      <Link className="text-sm font-bold text-[#66706b] hover:text-[#151917]" href="/login">
        Ya tengo cuenta
      </Link>
    </form>
  );
}
