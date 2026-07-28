import { Mail } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function ContactPage() {
  return (
    <InfoPage
      title="Contacter NDOA"
      description="Le formulaire de contact sera connecté au service de support avant la mise en production."
      icon={Mail}
    />
  )
}
