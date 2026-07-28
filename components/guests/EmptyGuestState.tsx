import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmptyGuestState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-8">
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
        <Plus aria-hidden="true" />
      </div>
      <div className="text-lg font-semibold">Aucun invité</div>
      <p className="text-center text-sm text-muted-foreground">
        Commencez par ajouter vos invités manuellement ou importez un fichier CSV.
      </p>
      <Button type="button" className="mt-2" onClick={onAdd}>
        Ajouter un invité
      </Button>
    </div>
  )
}
