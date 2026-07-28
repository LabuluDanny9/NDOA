import { ShieldCheck } from "lucide-react"
import InfoPage from "@/components/shared/InfoPage"

export default function AdminPage() {
  return (
    <InfoPage
      title="Espace administrateur"
      description="La frontière de rôle est active. Les fonctions de gestion des utilisateurs, du journal et de la configuration seront livrées à l’étape 13."
      icon={ShieldCheck}
      backHref="/dashboard"
      backLabel="Ouvrir le dashboard"
    />
  )
}
