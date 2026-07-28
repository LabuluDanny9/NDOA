import { CalendarDays } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function WeddingsPage() {
  return (
    <ModulePlaceholder
      title="Mes mariages"
      description="La liste multi-mariages, les statuts de publication et l’archivage seront construits sur le futur modèle de données."
      icon={CalendarDays}
    />
  )
}
