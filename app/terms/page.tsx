import { ScrollText } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function TermsPage() {
  return (
    <InfoPage
      title="Conditions d’utilisation"
      description="Les conditions contractuelles seront finalisées avec les fonctionnalités de compte, de paiement et d’hébergement."
      icon={ScrollText}
    />
  )
}
