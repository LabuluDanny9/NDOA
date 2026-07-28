import type { MessageChannel } from "@/types/database.types"

export type NotificationTemplateKey = "invitation" | "reminder" | "rsvp_confirmation"

export const notificationTemplates: Record<NotificationTemplateKey, { label: string; subject: string; body: string }> = {
  invitation: {
    label: "Invitation initiale",
    subject: "Votre invitation de mariage",
    body: "Bonjour {{name}},\n\nNous serions heureux de vous compter parmi nous pour le mariage de {{weddingName}}.\n\nDécouvrez votre invitation : {{invitationUrl}}",
  },
  reminder: {
    label: "Rappel RSVP",
    subject: "Petit rappel pour votre RSVP",
    body: "Bonjour {{name}},\n\nVotre réponse pour le mariage de {{weddingName}} nous aiderait à préparer votre accueil.\n\nRépondre : {{invitationUrl}}",
  },
  rsvp_confirmation: {
    label: "Confirmation RSVP",
    subject: "Votre réponse est bien enregistrée",
    body: "Bonjour {{name}},\n\nMerci pour votre réponse au mariage de {{weddingName}}. Au plaisir de vous retrouver bientôt !",
  },
}

export function renderNotificationTemplate(key: NotificationTemplateKey, values: Record<string, string>) {
  const template = notificationTemplates[key]
  const replace = (value: string) => value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, token: string) => values[token] ?? "")
  return { subject: replace(template.subject), body: replace(template.body) }
}

export function channelLabel(channel: MessageChannel) {
  return { email: "Email", sms: "SMS", whatsapp: "WhatsApp", in_app: "Notification interne" }[channel]
}
