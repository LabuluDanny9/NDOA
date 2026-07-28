import { z } from "zod"

export type SupabaseEnvironmentInput = {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
}

export type SupabaseEnvironment = {
  url: string
  publishableKey: string
}

function decodeJwtRole(value: string) {
  const payload = value.split(".")[1]

  if (!payload) {
    return null
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(atob(normalized)) as { role?: unknown }
    return typeof decoded.role === "string" ? decoded.role : null
  } catch {
    return null
  }
}

function isSecretKey(value: string) {
  return (
    value.startsWith("sb_secret_") ||
    value.toLowerCase().includes("service_role") ||
    decodeJwtRole(value) === "service_role"
  )
}

const supabaseEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("doit être une URL valide")
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "doit utiliser le protocole HTTP ou HTTPS"
    ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(20, "doit contenir une clé publique Supabase valide")
    .refine(
      (value) => !isSecretKey(value),
      "ne doit jamais contenir une clé secrète ou service_role"
    ),
})

function normalize(value: string | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function readRuntimeEnvironment(): SupabaseEnvironmentInput {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }
}

export function getOptionalSupabaseEnvironment(
  input: SupabaseEnvironmentInput = readRuntimeEnvironment()
): SupabaseEnvironment | null {
  const values = {
    NEXT_PUBLIC_SUPABASE_URL: normalize(input.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: normalize(
      input.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
  }

  if (
    !values.NEXT_PUBLIC_SUPABASE_URL &&
    !values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null
  }

  const parsed = supabaseEnvironmentSchema.safeParse(values)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    throw new Error(`Configuration Supabase invalide — ${details}`)
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }
}

export function getSupabaseEnvironment(
  input?: SupabaseEnvironmentInput
): SupabaseEnvironment {
  const environment = getOptionalSupabaseEnvironment(input)

  if (!environment) {
    throw new Error(
      "Supabase n’est pas configuré. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    )
  }

  return environment
}
