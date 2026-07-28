"use server"

import type { AuthError } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas"
import { getSafeRedirectPath, getApplicationOrigin } from "@/lib/auth/redirects"
import { getAuthenticatedRole, getRoleHome } from "@/lib/auth/roles"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type AuthActionState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Record<string, string[] | undefined>
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
}

function validationError(
  fieldErrors: Record<string, string[] | undefined>
): AuthActionState {
  return {
    status: "error",
    message: "Vérifiez les champs indiqués.",
    fieldErrors,
  }
}

function publicAuthError(error: AuthError, operation: "login" | "register") {
  if (error.code === "invalid_credentials") {
    return "Adresse e-mail ou mot de passe incorrect."
  }

  if (error.code === "email_not_confirmed") {
    return "Confirmez votre adresse e-mail avant de vous connecter."
  }

  if (
    error.code === "over_email_send_rate_limit" ||
    error.status === 429
  ) {
    return "Trop de tentatives. Patientez quelques minutes puis réessayez."
  }

  if (operation === "register" && error.code === "weak_password") {
    return "Ce mot de passe ne respecte pas les exigences de sécurité."
  }

  return operation === "login"
    ? "Connexion impossible pour le moment. Réessayez."
    : "Inscription impossible pour le moment. Réessayez."
}

async function getClient() {
  try {
    return await createServerSupabaseClient()
  } catch {
    return null
  }
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  })

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors)
  }

  const supabase = await getClient()

  if (!supabase) {
    return {
      status: "error",
      message:
        "L’authentification n’est pas configurée sur cet environnement.",
    }
  }

  let authError: AuthError | null = null

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    authError = error
  } catch {
    return {
      status: "error",
      message: "Service d’authentification indisponible. Réessayez.",
    }
  }

  if (authError) {
    return {
      status: "error",
      message: publicAuthError(authError, "login"),
    }
  }

  const { data } = await supabase.auth.getClaims()
  const role = getAuthenticatedRole(data?.claims) ?? "organizer"
  const requestedPath = getSafeRedirectPath(parsed.data.next)
  const destination =
    requestedPath === "/dashboard" ? getRoleHome(role) : requestedPath

  revalidatePath("/", "layout")
  redirect(destination)
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms"),
  })

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors)
  }

  const supabase = await getClient()

  if (!supabase) {
    return {
      status: "error",
      message:
        "L’authentification n’est pas configurée sur cet environnement.",
    }
  }

  const confirmationUrl = new URL("/auth/callback", getApplicationOrigin())
  confirmationUrl.searchParams.set("next", "/dashboard")

  let hasSession = false

  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: confirmationUrl.toString(),
        data: {
          full_name: parsed.data.fullName,
        },
      },
    })

    if (error) {
      return {
        status: "error",
        message: publicAuthError(error, "register"),
      }
    }

    hasSession = Boolean(data.session)
  } catch {
    return {
      status: "error",
      message: "Service d’authentification indisponible. Réessayez.",
    }
  }

  if (hasSession) {
    revalidatePath("/", "layout")
    redirect("/dashboard")
  }

  return {
    status: "success",
    message:
      "Si cette adresse peut être inscrite, un e-mail de confirmation vient d’être envoyé.",
  }
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors)
  }

  const supabase = await getClient()

  if (!supabase) {
    return {
      status: "error",
      message:
        "L’authentification n’est pas configurée sur cet environnement.",
    }
  }

  const recoveryUrl = new URL("/auth/callback", getApplicationOrigin())
  recoveryUrl.searchParams.set("next", "/reset-password")

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo: recoveryUrl.toString() }
    )

    if (
      error?.code === "over_email_send_rate_limit" ||
      error?.status === 429
    ) {
      return {
        status: "error",
        message:
          "Trop de demandes. Patientez quelques minutes puis réessayez.",
      }
    }
  } catch {
    return {
      status: "error",
      message: "Service d’authentification indisponible. Réessayez.",
    }
  }

  return {
    status: "success",
    message:
      "Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.",
  }
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors)
  }

  const supabase = await getClient()

  if (!supabase) {
    return {
      status: "error",
      message:
        "L’authentification n’est pas configurée sur cet environnement.",
    }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return {
        status: "error",
        message:
          "Le lien est invalide ou expiré. Demandez un nouveau lien de réinitialisation.",
      }
    }

    await supabase.auth.signOut({ scope: "local" })
  } catch {
    return {
      status: "error",
      message: "Mise à jour impossible pour le moment. Réessayez.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/login?message=password-updated")
}

export async function signOutAction() {
  const supabase = await getClient()

  if (supabase) {
    await supabase.auth.signOut({ scope: "local" })
  }

  revalidatePath("/", "layout")
  redirect("/login?message=signed-out")
}
