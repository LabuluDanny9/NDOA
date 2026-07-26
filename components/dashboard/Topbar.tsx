"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Bell,
  ChevronDown,
  Plus,
  Search,
} from "lucide-react"
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
  userAvatar?: string
}

export default function Topbar({
  className,
  title = "Dashboard",
  userName = "Danny Labulu",
  userAvatar,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-gray-200/70 bg-white/95 backdrop-blur-sm",
        className
      )}
      style={{ minHeight: 72 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-1 flex-col justify-center gap-1">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Dashboard
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bienvenue, Danny 👋</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <div className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Rechercher"
                className="w-80 rounded-full border-gray-200 bg-slate-100 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-amber-300"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-foreground transition hover:bg-gray-100"
            aria-label="Recherche"
          >
            <Search className="size-5" />
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-foreground transition hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 !h-5 !min-w-[20px] !rounded-full px-1.5 text-[10px]"
            >
              3
            </Badge>
          </motion.button>

          <motion.div whileHover={{ y: -1 }}>
            <Button
              className="hidden h-12 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white shadow-md shadow-amber-200 transition hover:bg-amber-600 md:inline-flex"
              size="sm"
            >
              <Plus className="size-4" />
              Créer un mariage
            </Button>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full border border-gray-200/80 bg-white px-3 py-2 text-left transition hover:bg-gray-50 md:px-4"
              >
                <Avatar className="h-10 w-10">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} />
                  ) : (
                    <AvatarFallback>DL</AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden sm:flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground">Administrateur</span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Link href="/dashboard/profile">Mon profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/settings">Paramètres</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Link href="/logout">Déconnexion</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </header>
  )
}
