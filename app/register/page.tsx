import { UserRoundPlus } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function RegisterPage() {
  return (
    <InfoPage
      title="Création de compte bientôt disponible"
      description="Le parcours d’inscription sera activé avec l’authentification et la persistance des données. Vous pouvez déjà explorer le prototype du tableau de bord."
      icon={UserRoundPlus}
      backHref="/dashboard"
      backLabel="Explorer le tableau de bord"
    />
  )
}
