export interface PublicInvitationEvent {
  id: string
  type: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string | null
  venueName: string | null
  address: string | null
  city: string | null
  country: string | null
  mapsUrl: string | null
  isPublic: boolean
}

export interface PublicInvitationProgram {
  id: string
  eventId: string | null
  title: string
  description: string | null
  scheduledAt: string
  durationMinutes: number | null
  location: string | null
  isPublic: boolean
}

export interface PublicInvitationGift {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  externalUrl: string | null
  currency: string
  unitPrice: number | null
  targetQuantity: number
  purchasedQuantity: number
}

export interface PublicInvitation {
  id: string
  slug: string
  name: string
  partnerOneName: string
  partnerTwoName: string
  weddingDate: string | null
  ceremonyTime: string | null
  timezone: string
  description: string | null
  theme: Record<string, string | null>
  settings: Record<string, string | null>
  events: PublicInvitationEvent[]
  programs: PublicInvitationProgram[]
  photos: Array<{ id: string; storagePath: string; thumbnailPath: string | null; altText: string | null; caption: string | null }>
  gifts: PublicInvitationGift[]
}
