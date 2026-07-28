import { Send } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function InvitationsPage() {
  return (
    <ModulePlaceholder
      title="Envoi des invitations"
      description="L’envoi par courriel, WhatsApp et lien individuel sera ajouté avec le suivi de livraison."
      icon={Send}
    />
  )
}
