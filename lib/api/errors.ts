import { NextResponse } from "next/server"
import { z } from "zod"

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SUPABASE_NOT_CONFIGURED"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR"

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError("BAD_REQUEST", message, 400, details)
  }

  static unauthorized(message = "Authentification requise.") {
    return new ApiError("UNAUTHORIZED", message, 401)
  }

  static forbidden(message = "Vous n’avez pas accès à cette ressource.") {
    return new ApiError("FORBIDDEN", message, 403)
  }

  static notFound(message = "Ressource introuvable.") {
    return new ApiError("NOT_FOUND", message, 404)
  }

  static conflict(message = "Cette ressource existe déjà.") {
    return new ApiError("CONFLICT", message, 409)
  }

  static notConfigured() {
    return new ApiError(
      "SUPABASE_NOT_CONFIGURED",
      "Le service de données n’est pas configuré sur cet environnement.",
      503
    )
  }
}

export function apiErrorFromUnknown(error: unknown) {
  if (error instanceof ApiError) return error

  if (error instanceof z.ZodError) {
    return ApiError.badRequest(
      "Les données envoyées sont invalides.",
      error.flatten().fieldErrors
    )
  }

  return new ApiError("INTERNAL_ERROR", "Une erreur interne est survenue.", 500)
}

export function parseWithSchema<T extends z.ZodTypeAny>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw ApiError.badRequest(
      "Les données envoyées sont invalides.",
      result.error.flatten().fieldErrors
    )
  }
  return result.data
}

export function apiErrorFromSupabase(error: {
  code?: string
  status?: number
  message?: string
}) {
  if (error.code === "PGRST116") return ApiError.notFound()
  if (error.code === "P0002") return ApiError.notFound("Invitation ou invité introuvable.")
  if (error.code === "22023") return ApiError.badRequest("Les données RSVP sont invalides.")
  if (error.code === "23505") return ApiError.conflict()
  if (error.code === "23503" || error.code === "23514") {
    return ApiError.badRequest("La relation ou la contrainte demandée est invalide.")
  }
  if (error.code === "42501" || error.status === 401 || error.status === 403) {
    return ApiError.forbidden()
  }
  if (error.status === 429) {
    return new ApiError("RATE_LIMITED", "Trop de requêtes. Réessayez dans quelques instants.", 429)
  }
  return new ApiError("UPSTREAM_ERROR", "Le service de données est temporairement indisponible.", 502)
}

export function apiResponse<T>(data: T, requestId: string, init?: ResponseInit) {
  const response = NextResponse.json({ data, requestId }, init)
  response.headers.set("x-request-id", requestId)
  response.headers.set("cache-control", "private, no-store")
  return response
}

export function apiErrorResponse(error: unknown, requestId: string) {
  const apiError = apiErrorFromUnknown(error)
  const response = NextResponse.json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
        ...(apiError.details ? { details: apiError.details } : {}),
      },
      requestId,
    },
    { status: apiError.status }
  )
  response.headers.set("x-request-id", requestId)
  response.headers.set("cache-control", "private, no-store")
  return response
}

export async function withApiErrors<T>(
  handler: (requestId: string) => Promise<NextResponse<T>>
) {
  const requestId = crypto.randomUUID()

  try {
    return await handler(requestId)
  } catch (error) {
    if (!(error instanceof ApiError)) console.error("[api] unexpected error", { requestId, error })
    return apiErrorResponse(error, requestId)
  }
}

export async function readJsonBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    throw ApiError.badRequest("La requête dépasse la taille maximale autorisée.")
  }
  try {
    return await request.json()
  } catch {
    throw ApiError.badRequest("Le corps JSON est invalide.")
  }
}
