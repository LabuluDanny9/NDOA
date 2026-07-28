"use client"

import { motion } from "framer-motion"
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import FormField from "@/components/wedding/FormField"
import type { WeddingFormValues } from "@/components/wedding/wedding-form-schema"

interface RSVPSettingsProps {
  control: Control<WeddingFormValues>
  register: UseFormRegister<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
}

export default function RSVPSettings({
  control,
  register,
  errors,
}: RSVPSettingsProps) {
  const [allowChildren, allowComments] = useWatch({
    control,
    name: ["allowChildren", "allowComments"],
  })

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
            <CardTitle className="text-3xl font-semibold text-slate-900">Configuration RSVP</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Définissez les limites et le message de confirmation pour vos invités.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Date limite RSVP" error={errors.rsvpDeadline?.message}>
              <Input type="date" {...register("rsvpDeadline")} />
            </FormField>
            <FormField label="Nombre maximum d’accompagnants" error={errors.maxGuests?.message}>
              <Input type="number" min={1} max={20} {...register("maxGuests", { valueAsNumber: true })} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" {...register("allowChildren")} />
              Autoriser les enfants
            </label>
            <label className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" {...register("allowComments")} />
              Autoriser les commentaires
            </label>
          </div>

          <FormField label="Message de confirmation" error={errors.confirmationMessage?.message}>
            <textarea
              {...register("confirmationMessage")}
              rows={5}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Merci d’avoir répondu. Nous sommes impatients de partager ce moment avec vous."
            />
          </FormField>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Statut actuel</p>
            <p className="mt-2 text-sm text-slate-600">Enfants {allowChildren ? "autorisés" : "non autorisés"}, commentaires {allowComments ? "activés" : "désactivés"}.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
