import { ShieldCheck } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Politique de confidentialité"
      description="La politique complète sera publiée avant toute collecte de données personnelles en production."
      icon={ShieldCheck}
    />
  )
}
