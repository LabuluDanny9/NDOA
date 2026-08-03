"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarDays,
  ChartBar,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Table,
  Users,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "weddings", label: "Mes mariages", href: "/dashboard/weddings", icon: CalendarDays },
  { key: "guests", label: "Invites", href: "/dashboard/guests", icon: Users },
  { key: "tables", label: "Tables", href: "/dashboard/tables", icon: Table },
  { key: "gallery", label: "Galerie", href: "/dashboard/gallery", icon: Images },
  { key: "stats", label: "Statistiques", href: "/dashboard/stats", icon: ChartBar },
  { key: "settings", label: "Parametres", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  activeItem?: string
  className?: string
  userName?: string
  userRole?: string
  userAvatar?: string
}

export default function Sidebar({
  activeItem = "dashboard",
  className,
  userName = "Mode demonstration",
  userRole = "Donnees locales",
  userAvatar,
}: SidebarProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "N"

  const navLinkClass = (isActive: boolean) =>
    cn(
      "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-white/14 text-white shadow-[0_16px_35px_rgba(15,23,42,0.25)] ring-1 ring-white/15"
        : "text-blue-100/72 hover:bg-white/8 hover:text-white",
    )

  return (
    <>
      <div className="lg:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/50 bg-white/80 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="hero-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#1e3a8a)] text-white ring-2 ring-amber-300/60">
              N
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">NDOA</p>
              <p className="text-xs text-muted-foreground">Tableau de bord</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-foreground shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "soft-grid fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,37,89,0.96),rgba(15,23,42,0.94))] text-white shadow-[0_24px_80px_rgba(2,6,23,0.34)] lg:flex",
          className,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="hero-glow flex h-12 w-12 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-xl font-semibold text-white ring-2 ring-amber-300/60">
              N
            </div>
            <div>
              <p className="text-base font-semibold text-white">NDOA</p>
              <p className="text-sm text-blue-100/70">Gestion des mariages</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.key

              return (
                <motion.div
                  key={item.key}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  <Link href={item.href} className={navLinkClass(isActive)} aria-current={isActive ? "page" : undefined}>
                    <Icon
                      className={cn(
                        "size-5 transition-colors duration-150",
                        isActive ? "text-amber-300" : "text-blue-100/60",
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                    {isActive ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.8)]" /> : null}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="surface-card-dark mt-auto rounded-3xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-white/10">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : <AvatarFallback>{initials}</AvatarFallback>}
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-blue-100/70">{userRole}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="mt-4 w-full border-white/15 bg-white/6 text-white hover:bg-white/12" asChild>
              <Link href="/logout" className="inline-flex w-full items-center justify-center gap-2">
                <LogOut className="size-4" />
                Deconnexion
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex bg-slate-950/45 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              className="soft-grid flex h-full w-[280px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,37,89,0.98),rgba(15,23,42,0.97))] text-white shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="hero-glow flex h-11 w-11 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-xl font-semibold text-white ring-2 ring-amber-300/60">
                    N
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">NDOA</p>
                    <p className="text-xs text-blue-100/70">Menu</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Fermer le menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 text-white transition hover:bg-white/10"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeItem === item.key

                    return (
                      <motion.div
                        key={item.key}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 250, damping: 20 }}
                      >
                        <Link
                          href={item.href}
                          className={navLinkClass(isActive)}
                          onClick={() => setDrawerOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "size-5 transition-colors duration-150",
                              isActive ? "text-amber-300" : "text-blue-100/60",
                            )}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              <div className="border-t border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-white/10">
                    {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : <AvatarFallback>{initials}</AvatarFallback>}
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-white">{userName}</p>
                    <p className="text-xs text-blue-100/70">{userRole}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-4 w-full border-white/15 bg-white/6 text-white hover:bg-white/12" asChild>
                  <Link href="/logout" className="inline-flex w-full items-center justify-center gap-2">
                    <LogOut className="size-4" />
                    Deconnexion
                  </Link>
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
