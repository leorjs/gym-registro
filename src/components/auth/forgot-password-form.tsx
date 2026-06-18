"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
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
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const { resetPassword, configReady } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch {
      setError("No pudimos enviar el email de recuperación.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {!configReady && <FirebaseConfigAlert />}
      <Label>
        Email
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Label>
      {form.formState.errors.email && <p className="text-sm font-semibold text-[#b23b32]">{form.formState.errors.email.message}</p>}
      {sent && <p className="rounded-lg bg-[#dcefe8] p-3 text-sm font-semibold text-[#124b3e]">Te enviamos el enlace de recuperación.</p>}
      {error && <p className="rounded-lg bg-[#f7dfdc] p-3 text-sm font-semibold text-[#8f251f]">{error}</p>}
      <Button type="submit" size="lg" disabled={!configReady || form.formState.isSubmitting}>
        <Send size={18} />
        Enviar enlace
      </Button>
      <Link className="text-sm font-bold text-[#66706b] hover:text-[#151917]" href="/login">
        Volver al login
      </Link>
    </form>
  );
}
