"use client"

import React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type Guest } from "./types"

function genId() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const guestSchema = z.object({
  lastName: z.string().trim().min(1, "Nom requis"),
  firstName: z.string().trim().min(1, "Prénom requis"),
  phone: z.string().trim().min(6, "Numéro requis"),
})

type FormData = z.infer<typeof guestSchema>

const emptyValues: FormData = {
  lastName: "",
  firstName: "",
  phone: "",
}

function guestToFormData(guest?: Guest | null): FormData {
  if (!guest) return emptyValues

  return {
    lastName: guest.lastName,
    firstName: guest.firstName,
    phone: guest.phone ?? "",
  }
}

export default function GuestForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialData?: Guest | null
  onSave: (guest: Guest) => void
}) {
  const isEdit = Boolean(initialData)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: emptyValues,
    mode: "onTouched",
  })

  React.useEffect(() => {
    if (open) reset(guestToFormData(initialData))
  }, [initialData, open, reset])

  function save(data: FormData) {
    const timestamp = new Date().toISOString()
    const guest: Guest = {
      ...initialData,
      id: initialData?.id ?? genId(),
      lastName: data.lastName,
      firstName: data.firstName,
      phone: data.phone,
      rsvpStatus: initialData?.rsvpStatus ?? "pending",
      createdAt: initialData?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    onSave(guest)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l’invité" : "Ajouter un invité"}
          </DialogTitle>
          <DialogDescription>
            Saisissez uniquement le nom, le prénom et le numéro de téléphone de l’invité.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(save)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <GuestField label="Nom" error={errors.lastName?.message}>
              <Input
                autoComplete="family-name"
                aria-invalid={Boolean(errors.lastName)}
                {...register("lastName")}
              />
            </GuestField>
            <GuestField label="Prénom" error={errors.firstName?.message}>
              <Input
                autoComplete="given-name"
                aria-invalid={Boolean(errors.firstName)}
                {...register("firstName")}
              />
            </GuestField>
            <div className="sm:col-span-2">
              <GuestField label="Téléphone" error={errors.phone?.message}>
                <Input
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="+243 ..."
                  {...register("phone")}
                />
              </GuestField>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GuestField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  )
}
