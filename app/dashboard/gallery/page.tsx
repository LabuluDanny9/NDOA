import { Images } from "lucide-react"
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder"

export default function GalleryPage() {
  return (
    <ModulePlaceholder
      title="Galerie"
      description="La médiathèque centralisera les photos du couple et les images affichées sur l’invitation."
      icon={Images}
    />
  )
}
