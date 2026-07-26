"use client"

import { motion } from "framer-motion"
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ThemeSelectorProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  watch: UseFormWatch<any>
}

const styles = ["Classic", "Luxury", "Floral", "Minimaliste", "Royal"] as const

export default function ThemeSelector({ register, errors, watch }: ThemeSelectorProps) {
  const primaryColor = (watch("primaryColor") as unknown as string) || "#fbbf24"
  const secondaryColor = (watch("secondaryColor") as unknown as string) || "#0f172a"
  const textColor = (watch("textColor") as unknown as string) || "#0f172a"
  const style = (watch("style") as unknown as string) || "Classic"
  const font = (watch("font") as unknown as string) || "Inter"

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
            <Field label="Couleur principale" error={errors.primaryColor?.message as string | undefined}>
              <Input type="color" {...register("primaryColor")} />
            </Field>
            <Field label="Couleur secondaire" error={errors.secondaryColor?.message as string | undefined}>
              <Input type="color" {...register("secondaryColor")} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Couleur du texte" error={errors.textColor?.message as string | undefined}>
              <Input type="color" {...register("textColor")} />
            </Field>
            <Field label="Police" error={errors.font?.message as string | undefined}>
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
            </Field>
          </div>

          <Field label="Style" error={errors.style?.message as string | undefined}>
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
          </Field>

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
