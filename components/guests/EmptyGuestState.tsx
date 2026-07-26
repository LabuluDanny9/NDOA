import React from "react"
import { Plus } from "lucide-react"

export default function EmptyGuestState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-8">
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
        <Plus />
      </div>
      <div className="text-lg font-semibold">Aucun invité</div>
      <div className="text-sm text-muted-foreground">Commencez par ajouter vos invités manuellement ou importez un fichier CSV / Excel.</div>
      <div>
        <button className="btn mt-2" onClick={onAdd}>Ajouter un invité</button>
      </div>
    </div>
  )
}
