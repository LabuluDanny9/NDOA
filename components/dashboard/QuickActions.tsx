"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface QuickAction {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Actions rapides
        </p>
        <p className="max-w-2xl text-base text-slate-600">
          Accédez rapidement aux principales fonctionnalités.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <motion.div
              key={action.title}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Card className="h-full overflow-hidden rounded-[1.5rem] border border-gray-200/70 bg-white p-5 transition hover:border-amber-300">
                <Link href={action.href} className="block h-full">
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 shadow-sm">
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {action.title}
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-2xl border-gray-200 text-slate-700 hover:bg-slate-100"
                      >
                        Ouvrir
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
