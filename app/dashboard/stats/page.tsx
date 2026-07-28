import { ChartNoAxesCombined } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function StatsPage() {
  return (
    <ModulePlaceholder
      title="Statistiques"
      description="Les indicateurs seront alimentés par les invitations envoyées, ouvertes et les réponses RSVP réellement enregistrées."
      icon={ChartNoAxesCombined}
    />
  )
}
