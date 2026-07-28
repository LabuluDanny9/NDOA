import { Settings } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Paramètres"
      description="Les préférences du compte, les notifications et les réglages de confidentialité seront configurables ici."
      icon={Settings}
    />
  )
}
