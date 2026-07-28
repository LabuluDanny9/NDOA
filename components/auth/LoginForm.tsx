"use client"

import { startTransition, useActionState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signInAction } from "@/app/auth/actions"
import {
  AuthConfigurationNotice,
  AuthFeedback,
  FieldError,
} from "@/components/auth/AuthFeedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginInput } from "@/lib/auth/schemas"
import { initialAuthActionState } from "@/lib/auth/action-state"

export default function LoginForm({
  configured,
  next,
  notice,
}: {
  configured: boolean
  next: string
  notice?: string
}) {
  const [state, dispatch, pending] = useActionState(
    signInAction,
    initialAuthActionState
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", next },
  })

  const submit = handleSubmit((_values, event) => {
    if (!(event?.target instanceof HTMLFormElement)) return
    const data = new FormData(event.target)
    startTransition(() => dispatch(data))
  })

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {!configured ? <AuthConfigurationNotice /> : null}
      {notice ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      ) : null}
      <AuthFeedback state={state} />

      <input type="hidden" {...register("next")} />

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

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-800"
          >
            Mot de passe
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={!configured || pending}
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

      <Button
        type="submit"
        className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800"
        disabled={!configured || pending}
      >
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  )
}
