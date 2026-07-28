"use client"

import { startTransition, useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updatePasswordAction } from "@/app/auth/actions"
import {
  AuthConfigurationNotice,
  AuthFeedback,
  FieldError,
} from "@/components/auth/AuthFeedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/auth/schemas"
import { initialAuthActionState } from "@/lib/auth/action-state"

export default function ResetPasswordForm({
  configured,
}: {
  configured: boolean
}) {
  const [state, dispatch, pending] = useActionState(
    updatePasswordAction,
    initialAuthActionState
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const submit = handleSubmit((_values, event) => {
    if (!(event?.target instanceof HTMLFormElement)) return
    const data = new FormData(event.target)
    startTransition(() => dispatch(data))
  })

  const disabled = !configured || pending

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {!configured ? <AuthConfigurationNotice /> : null}
      <AuthFeedback state={state} />

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-800"
        >
          Nouveau mot de passe
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          disabled={disabled}
          aria-invalid={Boolean(
            errors.password || state.fieldErrors?.password
          )}
          className="mt-2 h-12"
          {...register("password")}
        />
        <FieldError
          clientMessage={errors.password?.message}
          serverMessages={state.fieldErrors?.password}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-slate-800"
        >
          Confirmer le mot de passe
        </label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={disabled}
          aria-invalid={Boolean(
            errors.confirmPassword || state.fieldErrors?.confirmPassword
          )}
          className="mt-2 h-12"
          {...register("confirmPassword")}
        />
        <FieldError
          clientMessage={errors.confirmPassword?.message}
          serverMessages={state.fieldErrors?.confirmPassword}
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800"
        disabled={disabled}
      >
        {pending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </Button>
    </form>
  )
}
