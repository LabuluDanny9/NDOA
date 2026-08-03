"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bell, ChevronDown, Plus, Search, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TopbarProps {
  className?: string
  title?: string
  userName?: string
  userRole?: string
  userAvatar?: string
}

export default function Topbar({
  className,
  title = "Dashboard",
  userName = "Mode demonstration",
  userRole = "Donnees locales",
  userAvatar,
}: TopbarProps) {
  const firstName = userName.split(" ")[0]
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "N"

  return (
    <header className={cn("sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="surface-card hero-glow mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
            <Sparkles className="size-3.5 text-amber-500" />
            Espace organisateur
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">Bienvenue, {firstName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Input
              type="search"
              placeholder="Rechercher un mariage, un invite..."
              className="h-11 w-80 rounded-2xl border-white/60 bg-white/75 pr-10 shadow-inner shadow-blue-100/40 backdrop-blur-md"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-foreground shadow-sm backdrop-blur-md transition duration-300 hover:bg-white"
            aria-label="Recherche"
          >
            <Search className="size-5" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-foreground shadow-sm backdrop-blur-md transition duration-300 hover:bg-white"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <Badge variant="destructive" className="absolute -right-1 -top-1 !h-5 !min-w-[20px] !rounded-full px-1.5 text-[10px]">
              3
            </Badge>
          </motion.button>

          <motion.div whileHover={{ y: -1 }}>
            <Button asChild className="hidden md:inline-flex" size="lg">
              <Link href="/dashboard/create-wedding">
                <Plus className="size-4" />
                Creer un mariage
              </Link>
            </Button>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur-md transition duration-300 hover:bg-white md:px-4">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : <AvatarFallback>{initials}</AvatarFallback>}
              </Avatar>
              <div className="hidden sm:flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/60 bg-white/92 backdrop-blur-xl">
              <DropdownMenuItem>
                <Link href="/dashboard/profile">Mon profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/settings">Parametres</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Link href="/logout">Deconnexion</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </header>
  )
}
