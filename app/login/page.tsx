import { LogIn } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function LoginPage() {
  return (
    <InfoPage
      title="Connexion bientôt disponible"
      description="L’authentification n’est pas encore reliée à un fournisseur d’identité. Le tableau de bord reste accessible en mode démonstration pendant cette phase."
      icon={LogIn}
      backHref="/dashboard"
      backLabel="Ouvrir la démonstration"
    />
  )
}
