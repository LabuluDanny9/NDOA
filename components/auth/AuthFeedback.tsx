import type { AuthActionState } from "@/app/auth/actions"

export function AuthFeedback({ state }: { state: AuthActionState }) {
  if (state.status === "idle" || !state.message) {
    return null
  }

  return (
    <div
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
      }
    >
      {state.message}
    </div>
  )
}

export function FieldError({
  clientMessage,
  serverMessages,
}: {
  clientMessage?: string
  serverMessages?: string[]
}) {
  const message = clientMessage ?? serverMessages?.[0]

  if (!message) {
    return null
  }

  return <p className="mt-1.5 text-sm text-red-700">{message}</p>
}

export function AuthConfigurationNotice() {
  return (
    <div
      role="status"
      className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
    >
      Le formulaire est prêt, mais Supabase n’est pas configuré dans cet
      environnement. Renseignez les deux variables publiques pour l’activer.
    </div>
  )
}
