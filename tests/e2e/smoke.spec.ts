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

test("the API fails closed when Supabase is not configured", async ({ request }) => {
  const response = await request.get("/api/weddings")
  expect(response.status()).toBe(503)
  await expect(response.json()).resolves.toMatchObject({
    error: { code: "SUPABASE_NOT_CONFIGURED" },
  })
  expect(response.headers()["x-request-id"]).toBeTruthy()
  const invitationResponse = await request.get("/api/public/invitations/demo")
  expect(invitationResponse.status()).toBe(503)
  await expect(invitationResponse.json()).resolves.toMatchObject({ error: { code: "SUPABASE_NOT_CONFIGURED" } })
})

test("production metadata and readiness routes are exposed safely", async ({ request }) => {
  const home = await request.get("/")
  expect(home.status()).toBe(200)
  expect(home.headers()["x-content-type-options"]).toBe("nosniff")
  expect(home.headers()["x-frame-options"]).toBe("DENY")

  const manifest = await request.get("/manifest.webmanifest")
  expect(manifest.status()).toBe(200)
  await expect(manifest.json()).resolves.toMatchObject({
    short_name: "NDOA",
    display: "standalone",
  })

  const robots = await request.get("/robots.txt")
  expect(robots.status()).toBe(200)
  await expect(robots.text()).resolves.toContain("Disallow: /admin/")

  const sitemap = await request.get("/sitemap.xml")
  expect(sitemap.status()).toBe(200)
  await expect(sitemap.text()).resolves.toContain("http://localhost:3100/")

  const health = await request.get("/api/health")
  expect(health.status()).toBe(503)
  await expect(health.json()).resolves.toMatchObject({
    status: "degraded",
    checks: { app: true, supabaseConfigured: false },
  })
})

test("the wedding manager exposes draft publication and duplication in demo mode", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ndoa:weddings:v1", JSON.stringify([{
      id: "00000000-0000-0000-0000-000000000099",
      name: "NDOA Démo",
      slug: "ndoa-demo",
      partnerOneName: "Danny",
      partnerTwoName: "Julie",
      weddingDate: "2026-08-15",
      status: "draft",
      description: null,
      timezone: "Africa/Lubumbashi",
      createdAt: "2026-07-28T00:00:00.000Z",
      updatedAt: "2026-07-28T00:00:00.000Z",
      source: "local",
      formValues: { weddingName: "NDOA Démo", groomName: "Danny", brideName: "Julie" },
    }]))
  })
  await page.goto("/dashboard/weddings")
  await expect(page.getByRole("heading", { name: "Mes mariages" })).toBeVisible()
  await expect(page.getByText("NDOA Démo")).toBeVisible()
  await page.getByRole("button", { name: "Publier" }).click()
  await expect(page.getByText("Mariage publié")).toBeVisible()
  await page.getByRole("button", { name: "Dupliquer" }).first().click()
  await expect(page.getByText("Mariage dupliqué")).toBeVisible()
})

test("the dashboard renders live KPI charts in demo mode", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page.getByRole("heading", { name: "Vue réelle du mariage" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Réponses RSVP" })).toBeVisible()
  await expect(page.getByLabel("Graphique des réponses RSVP")).toBeVisible()
  await expect(page.getByText("Dernières actions")).toBeVisible()
})

test("the gallery renders its empty state in demo mode", async ({ page }) => {
  await page.goto("/dashboard/gallery")

  await expect(page.getByRole("heading", { name: "Galerie du mariage" })).toBeVisible()
  await expect(page.getByText("Aucune photo pour le moment.")).toBeVisible()
  await expect(page.getByText("Ajouter des photos", { exact: true })).toBeVisible()
})

test("the invitation workspace queues a demo message", async ({ page }) => {
  await page.goto("/dashboard/invitations")

  await expect(page.getByRole("heading", { name: "Envoi des invitations" })).toBeVisible()
  await page.getByLabel("Destinataire").fill("invite@example.com")
  await page.getByLabel("Message").fill("À très bientôt !")
  await page.getByRole("button", { name: "Mettre en file d’envoi" }).click()
  await expect(page.getByText("Message mis en file")).toBeVisible()
  await expect(page.getByText("invite@example.com")).toBeVisible()
})

test("the admin workspace exposes protected controls in demo mode", async ({ page }) => {
  await page.goto("/admin")

  await expect(page.getByRole("heading", { name: "Espace administrateur" })).toBeVisible()
  await expect(page.getByText("Démonstration locale")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Utilisateurs et permissions" })).toBeVisible()
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
  await dialog.getByLabel("Téléphone", { exact: true }).fill("+243 99 000 111")
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
  await page.getByLabel("Prénom").fill("Invité")
  await page.getByLabel("Nom", { exact: true }).fill("Démo")
  await page.getByLabel("Numéro de téléphone").fill("+243 99 000 222")
  await page.getByLabel("Mot pour les mariés").fill("Félicitations aux mariés.")
  await page.getByRole("button", { name: "Envoyer ma réponse" }).click()
  await expect(page.getByText("Merci pour votre réponse !")).toBeVisible()
})

test("the invitation demo reproduces the RSVP scene without embedding the video file", async ({ page }) => {
  await page.goto("/invitation/demo")

  await expect(page.getByText("RSVP simple")).toBeVisible()
  await expect(page.locator('video[src="/rsvp.mp4"]')).toHaveCount(0)
})

test("authentication entry points expose complete account flows", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(
    page.getByRole("heading", { name: "Bon retour" }),
  ).toBeVisible()
  await expect(page.getByLabel("Adresse e-mail")).toBeVisible()
  await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Mot de passe oublié ?" }),
  ).toHaveAttribute("href", "/forgot-password")
  await expect(page.getByText(/Supabase n’est pas configuré/)).toBeVisible()

  await page.goto("/register")
  await expect(
    page.getByRole("heading", { name: "Créez votre espace" }),
  ).toBeVisible()
  await expect(page.getByLabel("Nom complet")).toBeVisible()
  await expect(page.getByLabel("Confirmer le mot de passe")).toBeVisible()

  await page.goto("/forgot-password")
  await expect(
    page.getByRole("heading", { name: "Réinitialisez votre accès" }),
  ).toBeVisible()

  await page.goto("/logout")
  await expect(
    page.getByRole("heading", { name: "Se déconnecter ?" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Confirmer la déconnexion" }),
  ).toBeVisible()
})
