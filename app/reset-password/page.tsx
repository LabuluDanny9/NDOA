import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choisissez un nouveau mot de passe"
      description="Cette page nécessite une session de récupération valide reçue par e-mail."
      footer={
        <Link
          href="/forgot-password"
          className="font-semibold text-amber-700 hover:text-amber-800"
        >
          Demander un nouveau lien
        </Link>
      }
    >
      <ResetPasswordForm
        configured={getOptionalSupabaseEnvironment() !== null}
      />
    </AuthShell>
  )
}
