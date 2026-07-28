export type RSVPStatus = "present" | "absent" | "pending" | "maybe"

export interface GuestFilterValues {
  category?: string
  rsvp?: RSVPStatus
  city?: string
}

export interface Guest {
  id: string
  lastName: string
  middleName?: string
  firstName: string
  phone?: string
  email?: string
  address?: string
  city?: string
  province?: string
  country?: string
  gender?: "male" | "female" | "other"
  dateOfBirth?: string
  category?: string
  family?: boolean
  friends?: boolean
  colleagues?: boolean
  vip?: boolean
  witnesses?: boolean
  bridesmaids?: number
  groomsmen?: number
  children?: boolean
  tableNumber?: number | null
  guestsCount?: number
  rsvpStatus?: RSVPStatus
  arrivalTime?: string | null
  message?: string
  qrCode?: string
  inviteCode?: string
  createdAt: string
  updatedAt: string
}

export const categories = [
  "Family",
  "Friends",
  "Colleagues",
  "VIP",
  "Other",
] as const
