import { CircleUserRound } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function ProfilePage() {
  return (
    <ModulePlaceholder
      title="Mon profil"
      description="Les informations du profil seront disponibles dès que le parcours d’authentification sera connecté."
      icon={CircleUserRound}
    />
  )
}
