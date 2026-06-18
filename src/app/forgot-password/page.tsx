import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperación"
      title="Volvé a entrar"
      subtitle="Te mandamos un enlace a tu email para cambiar la contraseña."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
