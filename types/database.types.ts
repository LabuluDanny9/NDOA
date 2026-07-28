export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = "admin" | "organizer" | "guest"
export type AccountStatus = "active" | "suspended" | "disabled"
export type WeddingStatus = "draft" | "published" | "archived"
export type WeddingMemberRole = "owner" | "planner" | "editor" | "viewer"
export type EventType =
  | "ceremony"
  | "reception"
  | "rehearsal"
  | "civil"
  | "religious"
  | "other"
export type RsvpResponse = "pending" | "accepted" | "declined" | "maybe"
export type InvitationStatus =
  | "draft"
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "failed"
export type MessageChannel = "email" | "sms" | "whatsapp" | "in_app"
export type DeliveryStatus =
  | "draft"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled"
export type QrPurpose = "invitation" | "rsvp" | "check_in" | "gift"

type TableDefinition<Row, Insert> = {
  Row: Row
  Insert: Insert
  Update: Partial<Row>
  Relationships: []
}

type UserRow = {
  id: string
  email: string | null
  status: AccountStatus
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
}

type ProfileRow = {
  user_id: string
  display_name: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_path: string | null
  city: string | null
  country: string | null
  locale: string
  timezone: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

type UserRoleRow = {
  user_id: string
  role: AppRole
  assigned_by: string | null
  assigned_at: string
}

type WeddingRow = {
  id: string
  owner_id: string
  name: string
  slug: string
  partner_one_name: string
  partner_two_name: string
  wedding_date: string | null
  ceremony_time: string | null
  timezone: string
  status: WeddingStatus
  published_at: string | null
  description: string | null
  theme: Json
  settings: Json
  version: number
  created_at: string
  updated_at: string
}

type WeddingMemberRow = {
  id: string
  wedding_id: string
  user_id: string
  role: WeddingMemberRole
  invited_by: string | null
  joined_at: string
  created_at: string
  updated_at: string
}

type EventRow = {
  id: string
  wedding_id: string
  type: EventType
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  venue_name: string | null
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  maps_url: string | null
  position: number
  is_public: boolean
  created_at: string
  updated_at: string
}

type ProgramRow = {
  id: string
  wedding_id: string
  event_id: string | null
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  position: number
  is_public: boolean
  created_at: string
  updated_at: string
}

type GuestGroupRow = {
  id: string
  wedding_id: string
  name: string
  description: string | null
  color: string | null
  position: number
  created_at: string
  updated_at: string
}

type GuestTableRow = {
  id: string
  wedding_id: string
  name: string
  capacity: number
  shape: string | null
  location: string | null
  position: number
  created_at: string
  updated_at: string
}

type GuestRow = {
  id: string
  wedding_id: string
  group_id: string | null
  table_id: string | null
  invited_by: string | null
  first_name: string
  last_name: string
  middle_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  category: string | null
  language: string
  allowed_companions: number
  rsvp_status: RsvpResponse
  invitation_status: InvitationStatus
  checked_in_at: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

type RsvpRow = {
  id: string
  wedding_id: string
  guest_id: string
  response: RsvpResponse
  companions_count: number
  companion_names: string[]
  comments: string | null
  dietary_requirements: string | null
  source: string
  responded_at: string
  version: number
  created_at: string
  updated_at: string
}

type GalleryRow = {
  id: string
  wedding_id: string
  title: string
  slug: string
  description: string | null
  is_public: boolean
  position: number
  created_at: string
  updated_at: string
}

type AlbumRow = {
  id: string
  wedding_id: string
  gallery_id: string
  title: string
  description: string | null
  cover_photo_id: string | null
  is_public: boolean
  position: number
  created_at: string
  updated_at: string
}

type PhotoRow = {
  id: string
  wedding_id: string
  album_id: string | null
  uploaded_by: string | null
  storage_path: string
  thumbnail_path: string | null
  original_filename: string | null
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  alt_text: string | null
  caption: string | null
  position: number
  is_public: boolean
  captured_at: string | null
  created_at: string
  updated_at: string
}

type MessageRow = {
  id: string
  wedding_id: string
  guest_id: string | null
  created_by: string | null
  channel: MessageChannel
  recipient: string
  subject: string | null
  body: string
  status: DeliveryStatus
  provider_message_id: string | null
  scheduled_at: string | null
  sent_at: string | null
  delivered_at: string | null
  failed_at: string | null
  error_code: string | null
  created_at: string
  updated_at: string
}

type NotificationRow = {
  id: string
  user_id: string
  wedding_id: string | null
  type: string
  title: string
  body: string
  data: Json
  read_at: string | null
  created_at: string
}

type GiftRegistryRow = {
  id: string
  wedding_id: string
  name: string
  description: string | null
  image_url: string | null
  external_url: string | null
  currency: string
  unit_price: number | null
  target_quantity: number
  purchased_quantity: number
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

type QrCodeRow = {
  id: string
  wedding_id: string
  guest_id: string | null
  purpose: QrPurpose
  token_hash: string
  token_hint: string | null
  expires_at: string | null
  usage_limit: number
  use_count: number
  last_used_at: string | null
  revoked_at: string | null
  created_by: string | null
  created_at: string
}

type ActivityLogRow = {
  id: number
  wedding_id: string
  actor_user_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  metadata: Json
  occurred_at: string
}

type Optional<Row, Keys extends keyof Row> = Omit<Row, Keys> &
  Partial<Pick<Row, Keys>>

export type Database = {
  public: {
    Tables: {
      users: TableDefinition<
        UserRow,
        Optional<
          UserRow,
          "email" | "status" | "last_sign_in_at" | "created_at" | "updated_at"
        >
      >
      profiles: TableDefinition<
        ProfileRow,
        Optional<
          ProfileRow,
          | "first_name"
          | "last_name"
          | "phone"
          | "avatar_path"
          | "city"
          | "country"
          | "locale"
          | "timezone"
          | "onboarding_completed"
          | "created_at"
          | "updated_at"
        >
      >
      user_roles: TableDefinition<
        UserRoleRow,
        Optional<UserRoleRow, "role" | "assigned_by" | "assigned_at">
      >
      weddings: TableDefinition<
        WeddingRow,
        Optional<
          WeddingRow,
          | "id"
          | "wedding_date"
          | "ceremony_time"
          | "timezone"
          | "status"
          | "published_at"
          | "description"
          | "theme"
          | "settings"
          | "version"
          | "created_at"
          | "updated_at"
        >
      >
      wedding_members: TableDefinition<
        WeddingMemberRow,
        Optional<
          WeddingMemberRow,
          "id" | "invited_by" | "joined_at" | "created_at" | "updated_at"
        >
      >
      events: TableDefinition<
        EventRow,
        Optional<
          EventRow,
          | "id"
          | "type"
          | "description"
          | "ends_at"
          | "venue_name"
          | "address"
          | "city"
          | "country"
          | "latitude"
          | "longitude"
          | "maps_url"
          | "position"
          | "is_public"
          | "created_at"
          | "updated_at"
        >
      >
      programs: TableDefinition<
        ProgramRow,
        Optional<
          ProgramRow,
          | "id"
          | "event_id"
          | "description"
          | "duration_minutes"
          | "location"
          | "position"
          | "is_public"
          | "created_at"
          | "updated_at"
        >
      >
      guest_groups: TableDefinition<
        GuestGroupRow,
        Optional<
          GuestGroupRow,
          "id" | "description" | "color" | "position" | "created_at" | "updated_at"
        >
      >
      guest_tables: TableDefinition<
        GuestTableRow,
        Optional<
          GuestTableRow,
          "id" | "shape" | "location" | "position" | "created_at" | "updated_at"
        >
      >
      guests: TableDefinition<
        GuestRow,
        Optional<
          GuestRow,
          | "id"
          | "group_id"
          | "table_id"
          | "invited_by"
          | "middle_name"
          | "email"
          | "phone"
          | "city"
          | "category"
          | "language"
          | "allowed_companions"
          | "rsvp_status"
          | "invitation_status"
          | "checked_in_at"
          | "notes"
          | "tags"
          | "created_at"
          | "updated_at"
        >
      >
      rsvps: TableDefinition<
        RsvpRow,
        Optional<
          RsvpRow,
          | "id"
          | "companions_count"
          | "companion_names"
          | "comments"
          | "dietary_requirements"
          | "source"
          | "responded_at"
          | "version"
          | "created_at"
          | "updated_at"
        >
      >
      gallery: TableDefinition<
        GalleryRow,
        Optional<
          GalleryRow,
          | "id"
          | "title"
          | "slug"
          | "description"
          | "is_public"
          | "position"
          | "created_at"
          | "updated_at"
        >
      >
      albums: TableDefinition<
        AlbumRow,
        Optional<
          AlbumRow,
          | "id"
          | "description"
          | "cover_photo_id"
          | "is_public"
          | "position"
          | "created_at"
          | "updated_at"
        >
      >
      photos: TableDefinition<
        PhotoRow,
        Optional<
          PhotoRow,
          | "id"
          | "album_id"
          | "uploaded_by"
          | "thumbnail_path"
          | "original_filename"
          | "width"
          | "height"
          | "alt_text"
          | "caption"
          | "position"
          | "is_public"
          | "captured_at"
          | "created_at"
          | "updated_at"
        >
      >
      messages: TableDefinition<
        MessageRow,
        Optional<
          MessageRow,
          | "id"
          | "guest_id"
          | "created_by"
          | "subject"
          | "status"
          | "provider_message_id"
          | "scheduled_at"
          | "sent_at"
          | "delivered_at"
          | "failed_at"
          | "error_code"
          | "created_at"
          | "updated_at"
        >
      >
      notifications: TableDefinition<
        NotificationRow,
        Optional<
          NotificationRow,
          "id" | "wedding_id" | "data" | "read_at" | "created_at"
        >
      >
      gift_registry: TableDefinition<
        GiftRegistryRow,
        Optional<
          GiftRegistryRow,
          | "id"
          | "description"
          | "image_url"
          | "external_url"
          | "currency"
          | "unit_price"
          | "target_quantity"
          | "purchased_quantity"
          | "priority"
          | "is_active"
          | "created_at"
          | "updated_at"
        >
      >
      qr_codes: TableDefinition<
        QrCodeRow,
        Optional<
          QrCodeRow,
          | "id"
          | "guest_id"
          | "token_hint"
          | "expires_at"
          | "usage_limit"
          | "use_count"
          | "last_used_at"
          | "revoked_at"
          | "created_by"
          | "created_at"
        >
      >
      activity_logs: TableDefinition<
        ActivityLogRow,
        Optional<
          ActivityLogRow,
          | "id"
          | "actor_user_id"
          | "entity_id"
          | "metadata"
          | "occurred_at"
        >
      >
    }
    Views: Record<never, never>
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_public_invitation: {
        Args: { target_slug: string }
        Returns: Json
      }
      submit_public_rsvp: {
        Args: {
          target_slug: string
          guest_full_name: string
          guest_email: string
          target_response: RsvpResponse
          target_companions_count?: number
          target_comments?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: AppRole
      account_status: AccountStatus
      wedding_status: WeddingStatus
      wedding_member_role: WeddingMemberRole
      event_type: EventType
      rsvp_response: RsvpResponse
      invitation_status: InvitationStatus
      message_channel: MessageChannel
      delivery_status: DeliveryStatus
      qr_purpose: QrPurpose
    }
    CompositeTypes: Record<never, never>
  }
}

type PublicSchema = Database["public"]

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof PublicSchema["Enums"],
> = PublicSchema["Enums"][EnumName]
