import { Heart } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function GuestPage() {
  return (
    <InfoPage
      title="Espace invité"
      description="Votre rôle invité est reconnu. Le suivi RSVP personnalisé sera connecté aux données lors des étapes 8 et 9."
      icon={Heart}
      backHref="/"
      backLabel="Retour à l’invitation"
    />
  )
}
