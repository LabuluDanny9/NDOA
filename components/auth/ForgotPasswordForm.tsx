"use client"

import { startTransition, useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { requestPasswordResetAction } from "@/app/auth/actions"
import {
  AuthConfigurationNotice,
  AuthFeedback,
  FieldError,
} from "@/components/auth/AuthFeedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/auth/schemas"
import { initialAuthActionState } from "@/lib/auth/action-state"

export default function ForgotPasswordForm({
  configured,
}: {
  configured: boolean
}) {
  const [state, dispatch, pending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const submit = handleSubmit((_values, event) => {
    if (!(event?.target instanceof HTMLFormElement)) return
    const data = new FormData(event.target)
    startTransition(() => dispatch(data))
  })

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {!configured ? <AuthConfigurationNotice /> : null}
      <AuthFeedback state={state} />

      <div>
        <label
          htmlFor="email"
          className="text-sm font-semibold text-slate-800"
        >
          Adresse e-mail
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          disabled={!configured || pending}
          aria-invalid={Boolean(errors.email || state.fieldErrors?.email)}
          className="mt-2 h-12"
          {...register("email")}
        />
        <FieldError
          clientMessage={errors.email?.message}
          serverMessages={state.fieldErrors?.email}
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800"
        disabled={!configured || pending}
      >
        {pending ? "Envoi…" : "Envoyer le lien"}
      </Button>
    </form>
  )
}
