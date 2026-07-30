"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import RSVPSceneReplica from "@/components/invitation/RSVPSceneReplica"
import {
  defaultWeddingValues,
  stepValidationMap,
  weddingFormSchema,
  type WeddingFormValues,
} from "@/components/wedding/wedding-form-schema"
import { useToast } from "@/components/ui/toast"
import {
  createWedding,
  updateWedding,
  WeddingClientError,
} from "@/lib/weddings/client"
import {
  createLocalWedding,
  updateLocalWedding,
} from "@/lib/weddings/local-store"

interface WeddingFormProps {
  weddingId?: string
  initialValues?: WeddingFormValues
  localMode?: boolean
  onSaved?: (weddingId: string) => void
}

const stepLabels = [
  "Informations générales",
  "Lieu",
  "Photos",
  "Notre histoire",
  "Programme",
  "RSVP",
  "Personnalisation",
] as const

export default function WeddingForm({ weddingId, initialValues, localMode = false, onSaved }: WeddingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: initialValues ?? defaultWeddingValues,
    mode: "onTouched",
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    if (initialValues) reset(initialValues)
  }, [initialValues, reset])

  const [
    weddingName,
    groomName,
    brideName,
    weddingDate,
    weddingTime,
    slogan,
    venueName,
    city,
    primaryColor,
    secondaryColor,
    programs,
  ] = useWatch({
    control,
    name: ["weddingName", "groomName", "brideName", "date", "time", "slogan", "venueName", "city", "primaryColor", "secondaryColor", "programs"],
  })

  const renderCurrentSection = () => {
    switch (currentStep) {
      case 0:
        return <CoupleSection register={register} errors={errors} />
      case 1:
        return <EventSection register={register} errors={errors} />
      case 2:
        return (
          <GalleryUploader
            control={control}
            errors={errors}
            setValue={setValue}
          />
        )
      case 3:
        return (
          <StorySection
            control={control}
            register={register}
            errors={errors}
          />
        )
      case 4:
        return <ProgramSection control={control} register={register} errors={errors} />
      case 5:
        return (
          <RSVPSettings
            control={control}
            register={register}
            errors={errors}
          />
        )
      case 6:
        return (
          <ThemeSelector
            control={control}
            register={register}
            errors={errors}
          />
        )
      default:
        return null
    }
  }

  const progress = Math.round(((currentStep + 1) / stepLabels.length) * 100)

  const isLastStep = currentStep === stepLabels.length - 1

  const goNext = async () => {
    const fieldNames = stepValidationMap[currentStep] ?? []
    const valid = await trigger(fieldNames, { shouldFocus: true })
    if (!valid) return
    setCurrentStep((value) => Math.min(stepLabels.length - 1, value + 1))
  }

  const goPrevious = () => {
    setCurrentStep((value) => Math.max(0, value - 1))
  }

  const onSubmit: SubmitHandler<WeddingFormValues> = async (values) => {
    setSubmitted(false)
    try {
      let savedId = weddingId
      if (weddingId && localMode) {
        const updated = updateLocalWedding(weddingId, values)
        if (!updated) throw new Error("Mariage local introuvable.")
      } else {
        try {
          const saved = weddingId
            ? await updateWedding(weddingId, values)
            : await createWedding(values)
          savedId = saved.id
        } catch (error) {
          if (!(error instanceof WeddingClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") throw error
          const saved = weddingId ? updateLocalWedding(weddingId, values) : createLocalWedding(values)
          if (!saved) throw new Error("Mariage local introuvable.")
          savedId = saved.id
        }
      }
      setSubmitted(true)
      toast({
        title: weddingId ? "Mariage enregistré" : "Mariage créé",
        description: "Les informations sont prêtes à être gérées depuis votre espace.",
        variant: "success",
      })
      if (savedId) onSaved?.(savedId)
    } catch (error) {
      toast({
        title: "Enregistrement impossible",
        description: error instanceof WeddingClientError ? error.message : "Vérifiez les informations puis réessayez.",
        variant: "error",
      })
    }
  }

  const preview = weddingName || "Votre mariage"
  const couple = `${groomName || "Marié"} & ${brideName || "Mariée"}`
  const formattedDate = weddingDate
    ? new Date(`${weddingDate}T${weddingTime || "12:00"}`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date à définir"
  const previewProgram = Array.isArray(programs) ? programs.slice(0, 2) : []

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

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-amber-400 transition-all duration-300" style={{ width: `${progress}%` }} />
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
                {renderCurrentSection()}

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
                      type={isLastStep ? "submit" : "button"}
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={isLastStep ? undefined : goNext}
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

        <aside className="space-y-6 rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-blue-950 p-6 text-white shadow-xl">
            <RSVPSceneReplica compact className="opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/70 to-amber-500/30" />
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.24em] text-amber-200">Aperçu invitation</p>
              <h2 className="mt-4 text-2xl font-semibold">{preview}</h2>
              <p className="mt-2 text-sm text-blue-50">{couple}</p>
              <p className="mt-4 text-sm leading-6 text-blue-50">{slogan || "Votre slogan apparaîtra ici."}</p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-white/95 px-4 py-3 text-sm text-slate-900">
                  <span className="font-semibold text-blue-700">Date</span> : {formattedDate}
                  {weddingTime ? ` à ${weddingTime}` : ""}
                </div>
                <div className="rounded-3xl bg-white/95 px-4 py-3 text-sm text-slate-900">
                  <span className="font-semibold text-blue-700">Lieu</span> : {[venueName, city].filter(Boolean).join(", ") || "Lieu à définir"}
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <span className="h-8 flex-1 rounded-full border border-white/30" style={{ backgroundColor: primaryColor || "#1d4ed8" }} />
                <span className="h-8 flex-1 rounded-full border border-white/30" style={{ backgroundColor: secondaryColor || "#d4af37" }} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Programme aperçu</p>
            <div className="mt-4 space-y-3">
              {previewProgram.length ? previewProgram.map((program, index) => (
                <div key={`${program.eventName}-${index}`} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-950">{program.time || "Heure"}</span> · {program.eventName || "Événement"}
                </div>
              )) : (
                <p className="text-sm text-slate-600">Ajoutez le programme pour le voir dans l’aperçu.</p>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Enregistré en local</p>
            <p className="mt-3 text-sm text-slate-600">
              {localMode
                ? "Ce mariage est enregistré dans le navigateur pour le mode démonstration."
                : "Les données sont validées puis envoyées à l’API Supabase sécurisée."}
            </p>
          </div>
        </aside>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 bg-slate-50 px-8 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>{submitted ? "Modifications enregistrées." : "Enregistrement sécurisé et réversible."}</p>
        <p>{localMode ? "Mode démonstration local." : "API REST multi-tenant."}</p>
      </CardFooter>
    </Card>
  )
}
