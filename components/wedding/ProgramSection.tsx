"use client"

import { motion } from "framer-motion"
import { Control, FieldErrors, UseFormRegister, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProgramSectionProps {
  control: any
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export default function ProgramSection({ control, register, errors }: ProgramSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "programs" as const,
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
            <CardTitle className="text-3xl font-semibold text-slate-900">Programme</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Créez plusieurs cérémonies et ajoutez des détails pour chacun des moments clés.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 py-8">
          {fields.map((field, index) => {
            const itemErrors = ((errors as any).programs?.[index] ?? {}) as Record<string, any>
            return (
              <div key={field.id} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Cérémonie {index + 1}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-11 rounded-full"
                    onClick={() => remove(index)}
                  >
                    Supprimer
                  </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Nom" error={itemErrors.eventName?.message as string | undefined}>
                    <Input
                      type="text"
                      placeholder="Cérémonie civile"
                      {...register(`programs.${index}.eventName` as const)}
                    />
                  </Field>
                  <Field label="Date" error={itemErrors.date?.message as string | undefined}>
                    <Input type="date" {...register(`programs.${index}.date` as const)} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Heure" error={itemErrors.time?.message as string | undefined}>
                    <Input type="time" {...register(`programs.${index}.time` as const)} />
                  </Field>
                  <Field label="Lieu" error={itemErrors.location?.message as string | undefined}>
                    <Input type="text" placeholder="Jardin principal" {...register(`programs.${index}.location` as const)} />
                  </Field>
                </div>

                <Field label="Description" error={itemErrors.description?.message as string | undefined}>
                  <textarea
                    {...register(`programs.${index}.description` as const)}
                    rows={4}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    placeholder="Décrivez cette étape du programme."
                  />
                </Field>
              </div>
            )
          })}

          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="rounded-full"
              onClick={() => append({ eventName: "", date: "", time: "", location: "", description: "" })}
            >
              Ajouter une cérémonie
            </Button>
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
