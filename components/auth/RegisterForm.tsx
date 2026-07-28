"use client"

import { startTransition, useActionState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signUpAction } from "@/app/auth/actions"
import {
  AuthConfigurationNotice,
  AuthFeedback,
  FieldError,
} from "@/components/auth/AuthFeedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas"
import { initialAuthActionState } from "@/lib/auth/action-state"

export default function RegisterForm({ configured }: { configured: boolean }) {
  const [state, dispatch, pending] = useActionState(
    signUpAction,
    initialAuthActionState
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
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
          htmlFor="fullName"
          className="text-sm font-semibold text-slate-800"
        >
          Nom complet
        </label>
        <Input
          id="fullName"
          autoComplete="name"
          disabled={disabled}
          aria-invalid={Boolean(
            errors.fullName || state.fieldErrors?.fullName
          )}
          className="mt-2 h-12"
          {...register("fullName")}
        />
        <FieldError
          clientMessage={errors.fullName?.message}
          serverMessages={state.fieldErrors?.fullName}
        />
      </div>

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
          disabled={disabled}
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
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-800"
        >
          Mot de passe
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
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          8 caractères minimum, avec minuscule, majuscule et chiffre.
        </p>
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

      <div>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            disabled={disabled}
            className="mt-1 size-4 rounded border-slate-300 accent-amber-500"
            {...register("acceptTerms")}
          />
          <span>
            J’accepte les{" "}
            <Link
              href="/terms"
              className="font-semibold text-slate-900 underline"
            >
              conditions d’utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/privacy"
              className="font-semibold text-slate-900 underline"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <FieldError
          clientMessage={errors.acceptTerms?.message}
          serverMessages={state.fieldErrors?.acceptTerms}
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800"
        disabled={disabled}
      >
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  )
}
