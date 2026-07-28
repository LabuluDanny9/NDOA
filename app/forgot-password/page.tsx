import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Mot de passe oublié",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Réinitialisez votre accès"
      description="Indiquez votre adresse e-mail. Le message de réponse ne révélera jamais si un compte existe."
      footer={
        <Link
          href="/login"
          className="font-semibold text-amber-700 hover:text-amber-800"
        >
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm
        configured={getOptionalSupabaseEnvironment() !== null}
      />
    </AuthShell>
  )
}
