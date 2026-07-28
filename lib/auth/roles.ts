export const APP_ROLES = ["admin", "organizer", "guest"] as const

export type AppRole = (typeof APP_ROLES)[number]

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseAppRole(value: unknown): AppRole | null {
  return typeof value === "string" &&
    APP_ROLES.includes(value as AppRole)
    ? (value as AppRole)
    : null
}

export function getAuthenticatedRole(claims: unknown): AppRole | null {
  if (!isRecord(claims) || typeof claims.sub !== "string" || !claims.sub) {
    return null
  }

  const customRole = parseAppRole(claims.user_role)

  if (customRole) {
    return customRole
  }

  if (isRecord(claims.app_metadata)) {
    const appMetadataRole =
      parseAppRole(claims.app_metadata.user_role) ??
      parseAppRole(claims.app_metadata.role)

    if (appMetadataRole) {
      return appMetadataRole
    }
  }

  // Tout compte standard confirmé commence comme organisateur. Les rôles
  // privilégiés doivent toujours provenir d'un claim signé.
  return "organizer"
}

export function getRoleHome(role: AppRole) {
  if (role === "admin") {
    return "/admin"
  }

  if (role === "guest") {
    return "/guest"
  }

  return "/dashboard"
}

export function canAccessPath(role: AppRole, pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return role === "admin"
  }

  if (pathname === "/guest" || pathname.startsWith("/guest/")) {
    return role === "guest"
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return role === "admin" || role === "organizer"
  }

  return true
}

export function isProtectedPath(pathname: string) {
  return ["/admin", "/dashboard", "/guest"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
