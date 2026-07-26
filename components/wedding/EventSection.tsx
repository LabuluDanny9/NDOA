"use client"

import { motion } from "framer-motion"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface EventSectionProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export default function EventSection({ register, errors }: EventSectionProps) {
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
            <CardTitle className="text-3xl font-semibold text-slate-900">Lieu</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Fournissez l’adresse complète et les coordonnées du lieu.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <Field label="Nom de la salle" error={errors.venueName?.message as string | undefined}>
            <Input type="text" placeholder="Salle Magnifique" {...register("venueName")} />
          </Field>

          <Field label="Adresse" error={errors.address?.message as string | undefined}>
            <Input type="text" placeholder="123 Rue du Bonheur" {...register("address")} />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ville" error={errors.city?.message as string | undefined}>
              <Input type="text" placeholder="Lubumbashi" {...register("city")} />
            </Field>
            <Field label="Province" error={errors.province?.message as string | undefined}>
              <Input type="text" placeholder="Haut-Katanga" {...register("province")} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Pays" error={errors.country?.message as string | undefined}>
              <Input type="text" placeholder="République démocratique du Congo" {...register("country")} />
            </Field>
            <Field label="Coordonnées GPS" error={errors.gpsCoordinates?.message as string | undefined}>
              <Input type="text" placeholder="-11.669, 27.479" {...register("gpsCoordinates")} />
            </Field>
          </div>

          <Field label="Lien Google Maps" error={errors.mapsLink?.message as string | undefined}>
            <Input type="url" placeholder="https://goo.gl/maps/..." {...register("mapsLink")} />
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
