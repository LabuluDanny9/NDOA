import { ShieldX } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function UnauthorizedPage() {
  return (
    <InfoPage
      title="Accès non autorisé"
      description="Votre compte est authentifié, mais son rôle ne permet pas d’ouvrir cet espace."
      icon={ShieldX}
      backHref="/"
      backLabel="Retour à l’accueil"
    />
  )
}
