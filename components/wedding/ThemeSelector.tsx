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

interface ThemeSelectorProps {
  control: Control<WeddingFormValues>
  register: UseFormRegister<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
}

const styles = ["Classic", "Luxury", "Floral", "Minimaliste", "Royal"] as const

export default function ThemeSelector({
  control,
  register,
  errors,
}: ThemeSelectorProps) {
  const [primaryColor, secondaryColor, textColor, style, font] = useWatch({
    control,
    name: ["primaryColor", "secondaryColor", "textColor", "style", "font"],
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
            <CardTitle className="text-3xl font-semibold text-slate-900">Personnalisation</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Choisissez l’ambiance graphique du mariage et visualisez le rendu en direct.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Couleur principale" error={errors.primaryColor?.message}>
              <Input type="color" {...register("primaryColor")} />
            </FormField>
            <FormField label="Couleur secondaire" error={errors.secondaryColor?.message}>
              <Input type="color" {...register("secondaryColor")} />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Couleur du texte" error={errors.textColor?.message}>
              <Input type="color" {...register("textColor")} />
            </FormField>
            <FormField label="Police" error={errors.font?.message}>
              <select
                {...register("font")}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>Inter</option>
                <option>Playfair Display</option>
                <option>Raleway</option>
                <option>Montserrat</option>
                <option>Crimson Pro</option>
              </select>
            </FormField>
          </div>

          <FormField label="Style" error={errors.style?.message}>
            <div className="grid gap-3 sm:grid-cols-3">
              {styles.map((item) => (
                <label
                  key={item}
                  className="inline-flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-amber-300"
                >
                  <input
                    type="radio"
                    value={item}
                    {...register("style")}
                    className="h-4 w-4 rounded-full border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          </FormField>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div
              className="rounded-[1.5rem] border px-6 py-8"
              style={{ backgroundColor: primaryColor, color: textColor, fontFamily: font }}
            >
              <p className="text-sm uppercase tracking-[0.24em]">Aperçu</p>
              <h3 className="mt-4 text-2xl font-semibold">Mariage de rêve</h3>
              <p className="mt-2 max-w-lg text-sm text-white/90">Style {style} • {font}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 text-xs text-white shadow-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
                Couleurs appliquées
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
