"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CoupleSection from "@/components/wedding/CoupleSection"
import EventSection from "@/components/wedding/EventSection"
import GalleryUploader from "@/components/wedding/GalleryUploader"
import StorySection from "@/components/wedding/StorySection"
import ProgramSection from "@/components/wedding/ProgramSection"
import RSVPSettings from "@/components/wedding/RSVPSettings"
import ThemeSelector from "@/components/wedding/ThemeSelector"

const programItemSchema = z.object({
  eventName: z.string().min(2, "Nom requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  location: z.string().min(2, "Lieu requis"),
  description: z.string().min(5, "Description requise"),
})

const weddingFormSchema = z.object({
  weddingName: z.string().min(3, "Nom du mariage requis"),
  groomName: z.string().min(2, "Nom du marié requis"),
  brideName: z.string().min(2, "Nom de la mariée requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  slogan: z.string().max(120, "Maximum 120 caractères").optional(),
  venueName: z.string().min(2, "Nom de la salle requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  province: z.string().min(2, "Province requise"),
  country: z.string().min(2, "Pays requis"),
  gpsCoordinates: z.string().optional().or(z.literal("")),
  mapsLink: z.string().url("Lien Google Maps invalide").optional().or(z.literal("")),
  coverPhoto: z.any().refine((file) => file instanceof File, "Photo de couverture requise"),
  galleryPhotos: z.array(z.instanceof(File)).optional(),
  story: z.string().min(20, "Racontez votre histoire en quelques mots"),
  programs: z.array(programItemSchema).min(1, "Ajoutez au moins une cérémonie"),
  rsvpDeadline: z.string().min(1, "Date limite requise"),
  maxGuests: z.coerce.number().min(1, "Nombre maximal d'accompagnants requis"),
  allowChildren: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  confirmationMessage: z.string().min(10, "Message de confirmation requis"),
  primaryColor: z.string().min(4, "Couleur principale requise"),
  secondaryColor: z.string().min(4, "Couleur secondaire requise"),
  textColor: z.string().min(4, "Couleur du texte requise"),
  font: z.string().min(2, "Police requise"),
  style: z.string().min(2, "Style requis"),
})

type WeddingFormValues = z.infer<typeof weddingFormSchema>

const stepLabels = [
  "Informations générales",
  "Lieu",
  "Photos",
  "Notre histoire",
  "Programme",
  "RSVP",
  "Personnalisation",
] as const

const defaultValues: WeddingFormValues = {
  weddingName: "",
  groomName: "",
  brideName: "",
  date: "",
  time: "",
  slogan: "",
  venueName: "",
  address: "",
  city: "",
  province: "",
  country: "",
  gpsCoordinates: "",
  mapsLink: "",
  coverPhoto: null as unknown as File,
  galleryPhotos: [],
  story: "",
  programs: [
    {
      eventName: "Cérémonie",
      date: "",
      time: "",
      location: "",
      description: "",
    },
  ],
  rsvpDeadline: "",
  maxGuests: 1,
  allowChildren: false,
  allowComments: false,
  confirmationMessage: "",
  primaryColor: "#f59e0b",
  secondaryColor: "#0f172a",
  textColor: "#0f172a",
  font: "Inter",
  style: "Classic",
}

export default function WeddingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [savedValues, setSavedValues] = useState<WeddingFormValues>(defaultValues)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues,
    mode: "onTouched",
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "programs",
  })

  const currentSection = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <CoupleSection register={register} errors={errors} />
      case 1:
        return <EventSection register={register} errors={errors} />
      case 2:
        return <GalleryUploader register={register} errors={errors} watch={watch} setValue={setValue} />
      case 3:
        return <StorySection register={register} errors={errors} watch={watch} />
      case 4:
        return <ProgramSection control={control} register={register} errors={errors} />
      case 5:
        return <RSVPSettings register={register} errors={errors} watch={watch} />
      case 6:
        return <ThemeSelector register={register} errors={errors} watch={watch} />
      default:
        return null
    }
  }, [currentStep, control, errors, register, setValue, watch])

  const progress = Math.round(((currentStep + 1) / stepLabels.length) * 100)

  const stepValidationMap: Record<number, Array<keyof WeddingFormValues>> = {
    0: ["weddingName", "groomName", "brideName", "date", "time"],
    1: ["venueName", "address", "city", "province", "country", "mapsLink"],
    2: ["coverPhoto"],
    3: ["story"],
    4: [],
    5: ["rsvpDeadline", "maxGuests", "confirmationMessage"],
    6: ["primaryColor", "secondaryColor", "textColor", "font", "style"],
  }

  const isLastStep = currentStep === stepLabels.length - 1

  const goNext = async () => {
    const fieldNames = stepValidationMap[currentStep] ?? []
    const valid = fieldNames.length > 0 ? await trigger(fieldNames as any) : await trigger()
    if (!valid) return
    setSavedValues(form.getValues())
    setCurrentStep((value) => Math.min(stepLabels.length - 1, value + 1))
  }

  const goPrevious = () => {
    setCurrentStep((value) => Math.max(0, value - 1))
  }

  const onSubmit = (values: WeddingFormValues) => {
    setSavedValues(values)
    setSubmitted(true)
    reset(values)
  }

  const preview = watch("weddingName") || "Votre mariage"
  const couple = `${watch("groomName") || "Marié"} & ${watch("brideName") || "Mariée"}`

  return (
    <Card className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <CardHeader className="space-y-4 bg-slate-50 px-8 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-3xl font-semibold text-slate-900">Assistant création de mariage</CardTitle>
            <CardDescription className="max-w-3xl text-sm text-slate-600">
              Suivez les étapes pour créer un mariage, ajouter des informations détaillées et préparer votre événement.
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">Étape {currentStep + 1} / {stepLabels.length}</p>
            <p className="text-xs text-slate-500">Progression {progress}%</p>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 px-8 py-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentSection}

                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={currentStep === 0}
                    onClick={goPrevious}
                  >
                    <ArrowLeft className="size-4" />
                    Précédent
                  </Button>

                  <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                    <p className="text-sm text-slate-500">
                      {isLastStep ? "Vérifiez puis finalisez le mariage." : "Remplissez la section pour passer à la suivante."}
                    </p>
                    <Button
                      type="button"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={isLastStep ? handleSubmit(onSubmit) : goNext}
                      disabled={isSubmitting}
                    >
                      {isLastStep ? (
                        <>{submitted ? "Terminé" : "Finaliser"}</>
                      ) : (
                        <>
                          Suivant
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Aperçu</p>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">{preview}</h2>
            <p className="mt-2 text-sm text-slate-600">{couple}</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">Entreprise</span> : NDOA
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">Étape actuelle</span> : {stepLabels[currentStep]}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Enregistré en local</p>
            <p className="mt-3 text-sm text-slate-600">
              Les données sont conservées dans l’état React. L’architecture est prête pour une future intégration Supabase.
            </p>
          </div>
        </aside>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 bg-slate-50 px-8 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>Prêt pour une connexion backend dans un second temps.</p>
        <p>Formulaire entièrement local, sans envoi externe.</p>
      </CardFooter>
    </Card>
  )
}
