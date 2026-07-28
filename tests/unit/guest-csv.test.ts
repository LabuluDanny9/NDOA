import { describe, expect, it } from "vitest"
import {
  createGuestCsv,
  neutralizeSpreadsheetFormula,
  parseCsvRows,
  parseGuestCsv,
} from "@/components/guests/guest-csv"
import type { Guest } from "@/components/guests/types"

const baseGuest: Guest = {
  id: "guest-1",
  lastName: "Mukendi",
  firstName: "Danny",
  phone: "+243 99 123 4567",
  email: "danny@example.com",
  city: "Lubumbashi",
  category: "Family",
  tableNumber: 3,
  guestsCount: 2,
  rsvpStatus: "present",
  createdAt: "2026-07-28T00:00:00.000Z",
  updatedAt: "2026-07-28T00:00:00.000Z",
}

describe("guest CSV", () => {
  it("analyse les virgules, guillemets et retours à la ligne échappés", () => {
    expect(
      parseCsvRows(
        'lastName,firstName,message\r\n"Doe, Sr.","Jane","Bonjour\r\nà tous"'
      )
    ).toEqual([
      ["lastName", "firstName", "message"],
      ["Doe, Sr.", "Jane", "Bonjour\r\nà tous"],
    ])
  })

  it.each(["=1+1", "+cmd", "-2+3", "@SUM(A1)", "  =HYPERLINK()"])(
    "neutralise une formule de tableur: %s",
    (value) => {
      expect(neutralizeSpreadsheetFormula(value)).toBe(`'${value}`)
    }
  )

  it("échappe les données dangereuses et les guillemets à l’export", () => {
    const csv = createGuestCsv([
      { ...baseGuest, lastName: '=HYPERLINK("https://evil.test")' },
    ])

    expect(csv).toContain(`"'=HYPERLINK(""https://evil.test"")"`)
  })

  it("importe un export valide sans perdre les champs principaux", () => {
    const [guest] = parseGuestCsv(createGuestCsv([baseGuest]))

    expect(guest).toMatchObject({
      lastName: "Mukendi",
      firstName: "Danny",
      phone: "+243 99 123 4567",
      email: "danny@example.com",
      tableNumber: 3,
      rsvpStatus: "present",
    })
  })
})
