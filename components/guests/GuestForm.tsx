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
import { categories, type Guest } from "./types"

function genId() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const integerString = z
  .string()
  .regex(/^\d*$/u, "Saisissez un nombre entier positif")

const guestSchema = z.object({
  lastName: z.string().trim().min(1, "Nom requis"),
  middleName: z.string().trim(),
  firstName: z.string().trim().min(1, "Prénom requis"),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine(
      (email) => email === "" || z.string().email().safeParse(email).success,
      "Email invalide"
    ),
  city: z.string().trim(),
  category: z.string(),
  tableNumber: integerString,
  guestsCount: integerString,
  rsvpStatus: z.enum(["present", "absent", "pending", "maybe"]),
})

type FormData = z.infer<typeof guestSchema>

const emptyValues: FormData = {
  lastName: "",
  middleName: "",
  firstName: "",
  phone: "",
  email: "",
  city: "",
  category: "",
  tableNumber: "",
  guestsCount: "0",
  rsvpStatus: "pending",
}

function guestToFormData(guest?: Guest | null): FormData {
  if (!guest) return emptyValues

  return {
    lastName: guest.lastName,
    middleName: guest.middleName ?? "",
    firstName: guest.firstName,
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    city: guest.city ?? "",
    category: guest.category ?? "",
    tableNumber:
      guest.tableNumber === null || guest.tableNumber === undefined
        ? ""
        : String(guest.tableNumber),
    guestsCount: String(guest.guestsCount ?? 0),
    rsvpStatus: guest.rsvpStatus ?? "pending",
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
      middleName: data.middleName || undefined,
      firstName: data.firstName,
      phone: data.phone || undefined,
      email: data.email || undefined,
      city: data.city || undefined,
      category: data.category || undefined,
      vip: data.category === "VIP",
      tableNumber:
        data.tableNumber === "" ? null : Number(data.tableNumber),
      guestsCount: Number(data.guestsCount || 0),
      rsvpStatus: data.rsvpStatus,
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
            Les informations sont conservées localement dans cette démonstration.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(save)}
          className="grid gap-4"
        >
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
            <GuestField label="Postnom" error={errors.middleName?.message}>
              <Input {...register("middleName")} />
            </GuestField>
            <GuestField label="Téléphone" error={errors.phone?.message}>
              <Input type="tel" autoComplete="tel" {...register("phone")} />
            </GuestField>
            <GuestField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </GuestField>
            <GuestField label="Ville" error={errors.city?.message}>
              <Input autoComplete="address-level2" {...register("city")} />
            </GuestField>
            <GuestField label="Catégorie" error={errors.category?.message}>
              <select
                className="min-h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                {...register("category")}
              >
                <option value="">Sans catégorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </GuestField>
            <GuestField label="Statut RSVP" error={errors.rsvpStatus?.message}>
              <select
                className="min-h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                {...register("rsvpStatus")}
              >
                <option value="pending">En attente</option>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="maybe">Peut-être</option>
              </select>
            </GuestField>
            <GuestField label="Numéro de table" error={errors.tableNumber?.message}>
              <Input inputMode="numeric" {...register("tableNumber")} />
            </GuestField>
            <GuestField label="Accompagnants" error={errors.guestsCount?.message}>
              <Input inputMode="numeric" {...register("guestsCount")} />
            </GuestField>
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
