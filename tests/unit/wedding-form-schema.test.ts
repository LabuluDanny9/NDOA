import { describe, expect, it } from "vitest"
import {
  defaultWeddingValues,
  MAX_IMAGE_SIZE,
  stepValidationMap,
  weddingFormSchema,
} from "@/components/wedding/wedding-form-schema"

function validValues() {
  return {
    ...defaultWeddingValues,
    weddingName: "Mariage de Julie et Marc",
    groomName: "Marc",
    brideName: "Julie",
    date: "2027-06-12",
    time: "14:00",
    venueName: "Salle Magnifique",
    address: "123 Rue du Bonheur",
    city: "Lubumbashi",
    province: "Haut-Katanga",
    country: "RDC",
    coverPhoto: new File(["image"], "couple.jpg", { type: "image/jpeg" }),
    story: "Une histoire qui a commencé il y a plusieurs années.",
    programs: [
      {
        eventName: "Cérémonie",
        date: "2027-06-12",
        time: "14:00",
        location: "Jardin principal",
        description: "Accueil des invités et cérémonie.",
      },
    ],
    rsvpDeadline: "2027-05-12",
    confirmationMessage: "Merci pour votre réponse, à très bientôt.",
  }
}

describe("weddingFormSchema", () => {
  it("accepte un formulaire complet", () => {
    expect(weddingFormSchema.safeParse(validValues()).success).toBe(true)
  })

  it("refuse un fichier trop volumineux", () => {
    const values = validValues()
    values.coverPhoto = new File(
      [new Uint8Array(MAX_IMAGE_SIZE + 1)],
      "large.jpg",
      { type: "image/jpeg" }
    )

    expect(weddingFormSchema.safeParse(values).success).toBe(false)
  })

  it("valide le programme avant de quitter son étape", () => {
    expect(stepValidationMap[4]).toEqual(["programs"])
  })
})
