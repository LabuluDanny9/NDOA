import { describe, expect, it } from "vitest"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas"

const validPassword = "NdoaSecure2026"

describe("schémas d'authentification", () => {
  it("normalise l'adresse e-mail de connexion", () => {
    expect(
      loginSchema.parse({
        email: "  Danny@Example.COM ",
        password: validPassword,
      }).email
    ).toBe("danny@example.com")
  })

  it("valide une inscription complète", () => {
    expect(
      registerSchema.safeParse({
        fullName: "Danny Labulu",
        email: "danny@example.com",
        password: validPassword,
        confirmPassword: validPassword,
        acceptTerms: "on",
      }).success
    ).toBe(true)
  })

  it.each([
    ["ndoa2026", "majuscule"],
    ["NDOA2026", "minuscule"],
    ["NdoaSecure", "chiffre"],
    ["Nd1", "8 caractères"],
  ])("refuse un mot de passe sans %s", (password, expectedMessage) => {
    const result = registerSchema.safeParse({
      fullName: "Danny Labulu",
      email: "danny@example.com",
      password,
      confirmPassword: password,
      acceptTerms: "on",
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues.some((issue) =>
        issue.message.includes(expectedMessage)
      )).toBe(true)
    }
  })

  it("refuse des mots de passe différents", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: validPassword,
        confirmPassword: `${validPassword}!`,
      }).success
    ).toBe(false)
  })

  it("refuse une inscription sans acceptation des conditions", () => {
    expect(
      registerSchema.safeParse({
        fullName: "Danny Labulu",
        email: "danny@example.com",
        password: validPassword,
        confirmPassword: validPassword,
      }).success
    ).toBe(false)
  })

  it("valide une demande de réinitialisation sans révéler de compte", () => {
    expect(
      forgotPasswordSchema.parse({ email: " USER@EXAMPLE.COM " })
    ).toEqual({ email: "user@example.com" })
  })
})
