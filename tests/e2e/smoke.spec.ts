import { expect, test } from "@playwright/test"

test("the public home page renders the NDOA heading", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", {
      name: "Créez une invitation de mariage aussi inoubliable que votre grand jour.",
    }),
  ).toBeVisible()
})

test("the guest dashboard renders its management table", async ({ page }) => {
  await page.goto("/dashboard/guests")

  await expect(page.getByRole("heading", { name: "Gestion des invités" })).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()
})
