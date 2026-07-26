"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface ActivityItem {
  id: number
  icon: LucideIcon
  title: string
  time: string
  color: string
}

interface ActivityProps {
  items: ActivityItem[]
}

export default function Activity({ items }: ActivityProps) {
  return (
    <Card className="rounded-[1.75rem] bg-white shadow-sm shadow-slate-200/50">
      <CardContent className="space-y-5 px-6 py-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-foreground">Activité récente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Suivez les dernières actions réalisées dans votre espace.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          {items.map((activity) => {
            const Icon = activity.icon
            return (
              <motion.div
                key={activity.id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="rounded-3xl border border-gray-200/70 bg-slate-50 p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <Icon className={`size-5 ${activity.color}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
