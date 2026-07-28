import { z } from "zod"
import { ApiError } from "@/lib/api/errors"

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export type Pagination = z.infer<typeof paginationSchema> & { from: number; to: number }

export function parsePagination(searchParams: URLSearchParams): Pagination {
  const parsed = paginationSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })
  if (!parsed.success) throw ApiError.badRequest("La pagination demandée est invalide.", parsed.error.flatten())
  const from = (parsed.data.page - 1) * parsed.data.pageSize
  return { ...parsed.data, from, to: from + parsed.data.pageSize - 1 }
}

export function paginationMeta(pagination: Pagination, total: number | null) {
  const count = total ?? 0
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: count,
    totalPages: count === 0 ? 0 : Math.ceil(count / pagination.pageSize),
  }
}

export function parseSearch(searchParams: URLSearchParams) {
  const search = searchParams.get("search")?.trim() ?? ""
  if (search.length > 100) throw ApiError.badRequest("Le terme de recherche est trop long.")
  return search
}

export function escapePostgrestSearch(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", "").replaceAll("(", "").replaceAll(")", "")
}

export function parseSort<T extends string>(searchParams: URLSearchParams, allowed: readonly T[], fallback: T) {
  const requested = searchParams.get("sort")
  return allowed.includes(requested as T) ? (requested as T) : fallback
}

export function parseAscending(searchParams: URLSearchParams) {
  const value = searchParams.get("direction")
  if (value !== null && value !== "asc" && value !== "desc") throw ApiError.badRequest("La direction de tri est invalide.")
  return value !== "desc"
}
