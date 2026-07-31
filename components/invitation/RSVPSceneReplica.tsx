import { CheckCircle2, Heart, MessageCircle, Smartphone } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type RSVPSceneReplicaProps = {
  className?: string
  compact?: boolean
  images?: string[]
  couple?: {
    bride: string
    groom: string
    date?: string
    location?: string
  }
}

function formatSceneDate(value?: string) {
  if (!value) return "Date à confirmer"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function RSVPSceneReplica({
  className,
  compact = false,
  images = [],
  couple,
}: RSVPSceneReplicaProps) {
  const mainPhoto = images.find(Boolean)
  const secondPhoto = images.find((image) => image !== mainPhoto)
  const names = couple ? `${couple.groom} & ${couple.bride}` : "Samuel & Ariane"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-blue-950",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_78%_22%,rgba(212,175,55,0.30),transparent_26%),linear-gradient(135deg,rgba(23,37,84,0.98),rgba(29,78,216,0.76),rgba(212,175,55,0.34))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute -left-24 top-16 size-72 rounded-full border border-amber-200/25" />
      <div className="absolute -bottom-24 right-10 size-96 rounded-full border border-white/15" />
      <div className="absolute left-[8%] top-[28%] h-36 w-36 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute right-[12%] top-[18%] h-48 w-48 rounded-full bg-blue-200/20 blur-3xl" />

      <div
        className={cn(
          "absolute overflow-hidden rounded-[2rem] border border-white/20 bg-white/15 p-5 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl",
          compact
            ? "left-4 top-5 w-44 rotate-[-7deg] scale-75"
            : "left-[7%] top-[18%] w-72 rotate-[-6deg]",
        )}
      >
        {secondPhoto ? (
          <Image
            src={secondPhoto}
            alt=""
            fill
            unoptimized
            sizes="18rem"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/60 to-amber-500/35" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-300 text-blue-950">
              <Heart className="size-5 fill-current" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100">Invitation</p>
              <p className="font-semibold">{names}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 text-sm text-blue-50">
            <span className="rounded-full bg-white/15 px-4 py-2">{formatSceneDate(couple?.date)}</span>
            <span className="rounded-full bg-white/15 px-4 py-2">{couple?.location ?? "Lubumbashi"}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute rounded-[2.5rem] border border-white/25 bg-slate-950/70 p-4 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl",
          compact
            ? "bottom-2 right-2 h-72 w-44 rotate-[5deg]"
            : "bottom-[8%] right-[12%] h-[30rem] w-72 rotate-[4deg]",
        )}
      >
        <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white to-blue-50 p-4 text-slate-950">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
          <div className="relative overflow-hidden rounded-[1.5rem] bg-blue-700 p-4 text-white">
            {mainPhoto ? (
              <Image
                src={mainPhoto}
                alt=""
                fill
                unoptimized
                sizes="18rem"
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-700/60 to-amber-400/45" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.24em] text-blue-100">NDOA</p>
                <Smartphone className="size-4 text-amber-200" />
              </div>
              <p className="mt-5 text-2xl font-semibold leading-tight">Confirmer votre présence</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {["Prénom", "Nom", "Téléphone", "Mot pour les mariés"].map((label) => (
              <div key={label} className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-500">
                {label}
              </div>
            ))}
            <div className="rounded-2xl bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-blue-950">
              Envoyer ma réponse
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute rounded-[1.75rem] border border-white/25 bg-white/95 p-4 text-slate-950 shadow-2xl shadow-blue-950/20",
          compact
            ? "bottom-16 left-8 w-48 scale-75"
            : "bottom-[18%] left-[18%] w-64",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Réponse enregistrée</p>
            <p className="text-xs text-slate-500">Présence confirmée</p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute rounded-full border border-amber-200/30 bg-amber-200/20 px-5 py-3 text-sm font-medium text-amber-50 shadow-xl backdrop-blur",
          compact ? "right-7 top-14 scale-75" : "right-[28%] top-[22%]",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="size-4" />
          RSVP simple
        </span>
      </div>
    </div>
  )
}
