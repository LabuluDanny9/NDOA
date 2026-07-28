import { TableProperties } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function TablesPage() {
  return (
    <ModulePlaceholder
      title="Plan de tables"
      description="Ce module permettra d’organiser les tables, leurs capacités et l’affectation des invités."
      icon={TableProperties}
    />
  )
}
