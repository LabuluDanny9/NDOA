import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import LoginForm from "@/components/auth/LoginForm"
import { getSafeRedirectPath } from "@/lib/auth/redirects"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace sécurisé NDOA.",
}

const NOTICES: Record<string, string> = {
  "password-updated":
    "Votre mot de passe a été mis à jour. Vous pouvez vous connecter.",
  "signed-out": "Vous êtes maintenant déconnecté.",
  confirmed: "Votre adresse e-mail est confirmée. Vous pouvez vous connecter.",
  "confirmation-failed":
    "Ce lien de confirmation est invalide ou expiré. Demandez un nouveau lien.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[]
    message?: string | string[]
  }>
}) {
  const parameters = await searchParams
  const nextValue = Array.isArray(parameters.next)
    ? parameters.next[0]
    : parameters.next
  const messageValue = Array.isArray(parameters.message)
    ? parameters.message[0]
    : parameters.message

  return (
    <AuthShell
      title="Bon retour"
      description="Connectez-vous pour gérer vos mariages, votre équipe et vos invités."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-amber-700 hover:text-amber-800"
          >
            Créer mon compte
          </Link>
        </>
      }
    >
      <LoginForm
        configured={getOptionalSupabaseEnvironment() !== null}
        next={getSafeRedirectPath(nextValue)}
        notice={messageValue ? NOTICES[messageValue] : undefined}
      />
    </AuthShell>
  )
}
