import { describe, expect, it } from "vitest"
import {
  canAccessPath,
  getAuthenticatedRole,
  getRoleHome,
  isProtectedPath,
} from "@/lib/auth/roles"
import { getSafeRedirectPath } from "@/lib/auth/redirects"

describe("rôles applicatifs", () => {
  it("refuse les claims absents ou non authentifiés", () => {
    expect(getAuthenticatedRole(null)).toBeNull()
    expect(getAuthenticatedRole({ user_role: "admin" })).toBeNull()
  })

  it("lit le rôle depuis un claim signé de premier niveau", () => {
    expect(
      getAuthenticatedRole({ sub: "user-1", user_role: "admin" })
    ).toBe("admin")
  })

  it("accepte app_metadata mais ignore user_metadata pour l'autorisation", () => {
    expect(
      getAuthenticatedRole({
        sub: "user-1",
        app_metadata: { role: "guest" },
        user_metadata: { role: "admin" },
      })
    ).toBe("guest")
  })

  it("attribue le rôle organizer aux comptes standards", () => {
    expect(getAuthenticatedRole({ sub: "user-1" })).toBe("organizer")
  })

  it("applique les frontières admin, organizer et guest", () => {
    expect(canAccessPath("admin", "/admin")).toBe(true)
    expect(canAccessPath("organizer", "/admin")).toBe(false)
    expect(canAccessPath("guest", "/dashboard")).toBe(false)
    expect(canAccessPath("organizer", "/dashboard/guests")).toBe(true)
    expect(canAccessPath("admin", "/dashboard/settings")).toBe(true)
    expect(canAccessPath("guest", "/guest")).toBe(true)
  })

  it("associe chaque rôle à son espace", () => {
    expect(getRoleHome("admin")).toBe("/admin")
    expect(getRoleHome("organizer")).toBe("/dashboard")
    expect(getRoleHome("guest")).toBe("/guest")
  })

  it("identifie uniquement les espaces réellement protégés", () => {
    expect(isProtectedPath("/dashboard")).toBe(true)
    expect(isProtectedPath("/dashboard/guests")).toBe(true)
    expect(isProtectedPath("/invitation/demo")).toBe(false)
  })
})

describe("redirections d'authentification", () => {
  it("conserve un chemin interne", () => {
    expect(getSafeRedirectPath("/dashboard/guests?status=pending")).toBe(
      "/dashboard/guests?status=pending"
    )
  })

  it.each([
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "dashboard",
    null,
  ])("bloque une destination externe ou malformée: %s", (value) => {
    expect(getSafeRedirectPath(value)).toBe("/dashboard")
  })
})
