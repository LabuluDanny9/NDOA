"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
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
import {
  defaultWeddingValues,
  stepValidationMap,
  weddingFormSchema,
  type WeddingFormValues,
} from "@/components/wedding/wedding-form-schema"

const stepLabels = [
  "Informations générales",
  "Lieu",
  "Photos",
  "Notre histoire",
  "Programme",
  "RSVP",
  "Personnalisation",
] as const

export default function WeddingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: defaultWeddingValues,
    mode: "onTouched",
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = form

  const [weddingName, groomName, brideName] = useWatch({
    control,
    name: ["weddingName", "groomName", "brideName"],
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

  const onSubmit: SubmitHandler<WeddingFormValues> = () => {
    setSubmitted(true)
  }

  const preview = weddingName || "Votre mariage"
  const couple = `${groomName || "Marié"} & ${brideName || "Mariée"}`

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
