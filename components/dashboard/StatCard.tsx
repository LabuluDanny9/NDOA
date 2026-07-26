"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const colorStyles: Record<
  "gold" | "green" | "blue" | "red" | "purple",
  { bg: string; text: string }
> = {
  gold: { bg: "bg-amber-100/90", text: "text-amber-600" },
  green: { bg: "bg-emerald-100/90", text: "text-emerald-600" },
  blue: { bg: "bg-sky-100/90", text: "text-sky-600" },
  red: { bg: "bg-rose-100/90", text: "text-rose-600" },
  purple: { bg: "bg-violet-100/90", text: "text-violet-600" },
}

interface Trend {
  value: string
  positive: boolean
}

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  color: "gold" | "green" | "blue" | "red" | "purple"
  trend?: Trend
  className?: string
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend,
  className,
}: StatCardProps) {
  const palette = colorStyles[color]

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Card className={cn("rounded-3xl bg-white shadow-sm", className)}>
        <CardHeader className="space-y-4 px-6 pt-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-3xl", palette.bg)}>
              <Icon className={cn("size-6", palette.text)} aria-hidden="true" />
            </div>
            {trend ? (
              <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs font-medium text-muted-foreground">
                {trend.positive ? (
                  <ArrowUp className="size-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="size-4 text-rose-500" />
                )}
                <span className={trend.positive ? "text-emerald-600" : "text-rose-600"}>
                  {trend.value}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            <p className="text-4xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
