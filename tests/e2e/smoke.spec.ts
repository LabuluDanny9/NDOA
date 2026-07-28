import { expect, test } from "@playwright/test"

test("the public home page renders the NDOA heading", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", {
      name: "Créez une invitation de mariage aussi inoubliable que votre grand jour.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Créer mon mariage" }).first(),
  ).toHaveAttribute("href", "/register")
})

test("the guest dashboard renders its management table", async ({ page }) => {
  await page.goto("/dashboard/guests")

  await expect(page.getByRole("heading", { name: "Gestion des invités" })).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()
})

test("an organizer can add and search for a local guest", async ({ page }) => {
  await page.goto("/dashboard/guests")
  await page.getByRole("button", { name: "Ajouter un invité" }).click()

  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Nom", { exact: true }).fill("Validation")
  await dialog.getByLabel("Prénom", { exact: true }).fill("E2E")
  await dialog.getByRole("button", { name: "Ajouter" }).click()

  await expect(page.getByText("Invité ajouté")).toBeVisible()
  await page.getByRole("searchbox", { name: "Rechercher un invité" }).fill(
    "Validation",
  )
  await expect(page.getByRole("cell", { name: /Validation E2E/ })).toBeVisible()
})

test("the invitation QR contains the resolved Next.js slug", async ({ page }) => {
  await page.goto("/invitation/demo")

  await expect(
    page.getByRole("heading", { name: /Samuel Ndala.*Ariane Mukeba/ }),
  ).toBeVisible()
  await expect(
    page.getByLabel(/QR code pour .*\/invitation\/demo/),
  ).toBeVisible()
})

test("visible authentication links resolve to explicit pages", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(
    page.getByRole("heading", { name: "Connexion bientôt disponible" }),
  ).toBeVisible()

  await page.goto("/register")
  await expect(
    page.getByRole("heading", {
      name: "Création de compte bientôt disponible",
    }),
  ).toBeVisible()
})
