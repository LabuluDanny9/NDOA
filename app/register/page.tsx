import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import RegisterForm from "@/components/auth/RegisterForm"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre espace organisateur sécurisé sur NDOA.",
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Créez votre espace"
      description="Commencez comme organisateur et invitez ensuite votre équipe en toute sécurité."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="font-semibold text-amber-700 hover:text-amber-800"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm
        configured={getOptionalSupabaseEnvironment() !== null}
      />
    </AuthShell>
  )
}
