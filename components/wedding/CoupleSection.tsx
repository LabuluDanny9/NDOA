"use client"

import { motion } from "framer-motion"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface CoupleSectionProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
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
          <Field label="Nom du mariage" error={errors.weddingName?.message as string | undefined}>
            <Input type="text" placeholder="Nom du mariage" {...register("weddingName")} />
          </Field>

          <div className="grid gap-6 lg:grid-cols-2">
            <Field label="Nom du marié" error={errors.groomName?.message as string | undefined}>
              <Input type="text" placeholder="Nom du marié" {...register("groomName")} />
            </Field>
            <Field label="Nom de la mariée" error={errors.brideName?.message as string | undefined}>
              <Input type="text" placeholder="Nom de la mariée" {...register("brideName")} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Date du mariage" error={errors.date?.message as string | undefined}>
              <Input type="date" {...register("date")} />
            </Field>
            <Field label="Heure du mariage" error={errors.time?.message as string | undefined}>
              <Input type="time" {...register("time")} />
            </Field>
          </div>

          <Field label="Citation du mariage" error={errors.slogan?.message as string | undefined}>
            <Input
              type="text"
              placeholder="Un amour écrit dans les étoiles"
              {...register("slogan")}
            />
          </Field>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface FieldProps {
  label: string
  children: React.ReactNode
  error?: string
}

function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block space-y-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  )
}
