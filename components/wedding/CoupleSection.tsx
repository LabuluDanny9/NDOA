"use client"

import { motion } from "framer-motion"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import FormField from "@/components/wedding/FormField"
import type { WeddingFormValues } from "@/components/wedding/wedding-form-schema"

interface CoupleSectionProps {
  register: UseFormRegister<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
}

export default function CoupleSection({ register, errors }: CoupleSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <Card className="rounded-[2rem] border-none bg-transparent shadow-none">
        <CardHeader className="space-y-4 rounded-t-[2rem] bg-slate-50 px-8 py-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-semibold text-slate-900">
              Informations sur les futurs mariés
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Commençons par les informations principales du mariage.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <FormField label="Nom du mariage" error={errors.weddingName?.message}>
            <Input type="text" placeholder="Nom du mariage" {...register("weddingName")} />
          </FormField>

          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Nom du marié" error={errors.groomName?.message}>
              <Input type="text" placeholder="Nom du marié" {...register("groomName")} />
            </FormField>
            <FormField label="Nom de la mariée" error={errors.brideName?.message}>
              <Input type="text" placeholder="Nom de la mariée" {...register("brideName")} />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Date du mariage" error={errors.date?.message}>
              <Input type="date" {...register("date")} />
            </FormField>
            <FormField label="Heure du mariage" error={errors.time?.message}>
              <Input type="time" {...register("time")} />
            </FormField>
          </div>

          <FormField label="Citation du mariage" error={errors.slogan?.message}>
            <Input
              type="text"
              placeholder="Un amour écrit dans les étoiles"
              {...register("slogan")}
            />
          </FormField>
        </CardContent>
      </Card>
    </motion.div>
  )
}
