"use client"

import { motion } from "framer-motion"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import FormField from "@/components/wedding/FormField"
import type { WeddingFormValues } from "@/components/wedding/wedding-form-schema"

interface EventSectionProps {
  register: UseFormRegister<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
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
          <FormField label="Nom de la salle" error={errors.venueName?.message}>
            <Input type="text" placeholder="Salle Magnifique" {...register("venueName")} />
          </FormField>

          <FormField label="Adresse" error={errors.address?.message}>
            <Input type="text" placeholder="123 Rue du Bonheur" {...register("address")} />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Ville" error={errors.city?.message}>
              <Input type="text" placeholder="Lubumbashi" {...register("city")} />
            </FormField>
            <FormField label="Province" error={errors.province?.message}>
              <Input type="text" placeholder="Haut-Katanga" {...register("province")} />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Pays" error={errors.country?.message}>
              <Input type="text" placeholder="République démocratique du Congo" {...register("country")} />
            </FormField>
            <FormField label="Coordonnées GPS" error={errors.gpsCoordinates?.message}>
              <Input type="text" placeholder="-11.669, 27.479" {...register("gpsCoordinates")} />
            </FormField>
          </div>

          <FormField label="Lien Google Maps" error={errors.mapsLink?.message}>
            <Input type="url" placeholder="https://goo.gl/maps/..." {...register("mapsLink")} />
          </FormField>
        </CardContent>
      </Card>
    </motion.div>
  )
}
