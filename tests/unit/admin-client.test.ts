import { describe, expect, it } from "vitest"
import { parseAppRole, getAuthenticatedRole } from "@/lib/auth/roles"

describe("garde de rôle administrateur", () => {
  it("n'accepte que les rôles applicatifs connus", () => {
    expect(parseAppRole("admin")).toBe("admin")
    expect(parseAppRole("root")).toBeNull()
    expect(getAuthenticatedRole({ sub: "user", user_role: "admin" })).toBe("admin")
  })
})
