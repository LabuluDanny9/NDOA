import { describe, expect, it } from "vitest"
import {
  getOptionalSupabaseEnvironment,
  getSupabaseEnvironment,
} from "@/lib/supabase/env"

const validEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_test_key_for_ndoa_local_development",
}

describe("configuration Supabase", () => {
  it("accepte une configuration publique complète", () => {
    expect(getSupabaseEnvironment(validEnvironment)).toEqual({
      url: validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey:
        validEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    })
  })

  it("considère deux valeurs absentes ou vides comme non configurées", () => {
    expect(getOptionalSupabaseEnvironment({})).toBeNull()
    expect(
      getOptionalSupabaseEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: " ",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      })
    ).toBeNull()
  })

  it("refuse une configuration partielle", () => {
    expect(() =>
      getOptionalSupabaseEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
      })
    ).toThrow(/Configuration Supabase invalide/)
  })

  it("refuse une URL non HTTP", () => {
    expect(() =>
      getSupabaseEnvironment({
        ...validEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: "ftp://supabase.example.test",
      })
    ).toThrow(/protocole HTTP ou HTTPS/)
  })

  it.each(["sb_secret_do_not_expose_this_key", "service_role_is_private"])(
    "refuse une clé secrète dans une variable publique: %s",
    (publishableKey) => {
      expect(() =>
        getSupabaseEnvironment({
          ...validEnvironment,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
        })
      ).toThrow(/clé secrète ou service_role/)
    }
  )

  it("échoue explicitement quand un client exige une configuration absente", () => {
    expect(() => getSupabaseEnvironment({})).toThrow(
      /Supabase n’est pas configuré/
    )
  })
})
