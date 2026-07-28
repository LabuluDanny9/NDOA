import type { MessageItem } from "@/lib/notifications/client"

const storageKey = (weddingId: string) => `ndoa:messages:v1:${weddingId}`

export function readLocalMessages(weddingId: string): MessageItem[] {
  if (typeof window === "undefined") return []
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(weddingId)) ?? "[]")
    return Array.isArray(value) ? value as MessageItem[] : []
  } catch { return [] }
}

export function saveLocalMessage(weddingId: string, message: MessageItem) {
  if (typeof window === "undefined") return message
  window.localStorage.setItem(storageKey(weddingId), JSON.stringify([message, ...readLocalMessages(weddingId)].slice(0, 100)))
  return message
}
