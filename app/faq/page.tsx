import { CircleHelp } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function FaqPage() {
  return (
    <InfoPage
      title="Questions fréquentes"
      description="La base d’aide est en préparation. Elle couvrira la création d’invitations, la gestion des invités et le suivi des réponses."
      icon={CircleHelp}
    />
  )
}
