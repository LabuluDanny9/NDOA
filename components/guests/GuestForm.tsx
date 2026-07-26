"use client"

import React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Guest } from "./types"
// lightweight id generator to avoid extra dependency in mock
function genId() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const guestSchema = z.object({
  id: z.string().optional(),
  lastName: z.string().min(1, "Nom requis"),
  middleName: z.string().optional(),
  firstName: z.string().min(1, "Prénom requis"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  city: z.string().optional(),
  tableNumber: z.number().nullable().optional(),
  guestsCount: z.number().min(0).optional(),
  rsvpStatus: z.enum(["present", "absent", "pending", "maybe"]).optional(),
})

type FormData = z.infer<typeof guestSchema>

export default function GuestForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialData?: Guest | null
  onSave?: (g: Guest) => void
}) {
  const isEdit = Boolean(initialData)

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: initialData ?? {},
  })

  React.useEffect(() => {
    reset(initialData ?? {})
  }, [initialData, reset])

  function save(data: FormData) {
    const guest: Guest = {
      id: data.id ?? genId(),
      lastName: data.lastName,
      middleName: data.middleName,
      firstName: data.firstName,
      phone: data.phone,
      email: data.email,
      address: "",
      city: data.city,
      province: "",
      country: "",
      gender: "other",
      dateOfBirth: undefined,
      category: undefined,
      family: false,
      friends: false,
      colleagues: false,
      vip: false,
      witnesses: false,
      bridesmaids: 0,
      groomsmen: 0,
      children: false,
      tableNumber: data.tableNumber ?? null,
      guestsCount: data.guestsCount ?? 0,
      rsvpStatus: data.rsvpStatus ?? "pending",
      arrivalTime: null,
      message: undefined,
      qrCode: undefined,
      inviteCode: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave?.(guest)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'invité" : "Ajouter un invité"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((d) => save(d))}
          className="grid gap-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Nom" {...register("lastName")} />
            <Input placeholder="Prénom" {...register("firstName")} />
            <Input placeholder="Postnom" {...register("middleName")} />
            <Input placeholder="Téléphone" {...register("phone")} />
            <Input placeholder="Email" {...register("email")} />
            <Input placeholder="Ville" {...register("city")} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">{isEdit ? "Enregistrer" : "Ajouter"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
