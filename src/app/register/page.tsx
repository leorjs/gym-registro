import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Nueva cuenta"
      title="Prepará tu bitácora"
      subtitle="Creá tu usuario y después ajustamos objetivo, unidad y frecuencia semanal."
    >
      <RegisterForm />
    </AuthShell>
  );
}
