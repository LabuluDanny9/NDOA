"use client"

import { motion } from "framer-motion"
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { WeddingFormValues } from "@/components/wedding/wedding-form-schema"

interface StorySectionProps {
  control: Control<WeddingFormValues>
  register: UseFormRegister<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
}

export default function StorySection({
  control,
  register,
  errors,
}: StorySectionProps) {
  const story = useWatch({ control, name: "story" })
  const count = story.length

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
            <CardTitle className="text-3xl font-semibold text-slate-900">Notre histoire</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Racontez l’histoire du couple avec un maximum de 5000 caractères.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <label className="block space-y-3 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Histoire</span>
            <Textarea
              rows={10}
              maxLength={5000}
              aria-invalid={Boolean(errors.story)}
              {...register("story")}
              placeholder="Décrivez les moments forts qui ont mené à ce jour spécial."
            />
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Maximum 5000 caractères.</span>
              <span>{count} / 5000</span>
            </div>
            {errors.story?.message ? (
              <span role="alert" className="text-sm text-rose-600">
                {errors.story.message}
              </span>
            ) : null}
          </label>
        </CardContent>
      </Card>
    </motion.div>
  )
}
