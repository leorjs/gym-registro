import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Portal de acceso"
      title="Entrá a tu registro"
      subtitle="Tus rutinas, marcas y métricas quedan asociadas a tu usuario."
    >
      <LoginForm />
    </AuthShell>
  );
}
