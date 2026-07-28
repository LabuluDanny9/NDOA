import { describe, expect, it } from "vitest"
import { notificationTemplates, renderNotificationTemplate } from "@/lib/notifications/templates"

describe("templates de communication", () => {
  it("remplace les variables sans conserver les marqueurs", () => {
    const rendered = renderNotificationTemplate("invitation", { name: "Ariane", weddingName: "Danny & Julie", invitationUrl: "https://ndoa.test/demo" })
    expect(rendered.subject).toBe(notificationTemplates.invitation.subject)
    expect(rendered.body).toContain("Bonjour Ariane")
    expect(rendered.body).toContain("Danny & Julie")
    expect(rendered.body).not.toContain("{{")
  })
})
