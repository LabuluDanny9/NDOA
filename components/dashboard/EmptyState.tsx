"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                Aucun mariage créé
              </CardTitle>
              <CardDescription className="max-w-lg text-base leading-7 text-slate-600">
                Commencez par créer votre premier mariage afin de gérer vos invitations.
              </CardDescription>
            </div>

            <Button
              className="rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-amber-500/30 transition hover:bg-amber-600"
              size="lg"
            >
              Créer mon premier mariage
            </Button>
          </div>

          <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-slate-100 p-6 shadow-inner">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-amber-100/80 blur-2xl" />
            <div className="absolute right-0 top-8 h-20 w-20 rounded-full bg-sky-100/80 blur-2xl" />
            <div className="absolute -bottom-6 right-10 h-24 w-24 rounded-full bg-rose-100/80 blur-2xl" />

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative flex h-full w-full flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-200 shadow-[0_25px_60px_rgba(251,191,36,0.25)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
                  <span className="text-3xl">♡</span>
                </div>
              </div>

              <div className="mt-8 flex w-full flex-col gap-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                    Nouveau
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Créez votre premier événement.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4 text-center text-sm text-slate-600 shadow-sm">
                    Invitations
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-4 text-center text-sm text-slate-600 shadow-sm">
                    Liste d’invités
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
