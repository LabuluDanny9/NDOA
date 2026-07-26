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
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "weddings",
    label: "Mes mariages",
    href: "/dashboard/weddings",
    icon: CalendarDays,
  },
  {
    key: "guests",
    label: "Invités",
    href: "/dashboard/guests",
    icon: Users,
  },
  {
    key: "tables",
    label: "Tables",
    href: "/dashboard/tables",
    icon: Table,
  },
  {
    key: "gallery",
    label: "Galerie",
    href: "/dashboard/gallery",
    icon: Images,
  },
  {
    key: "stats",
    label: "Statistiques",
    href: "/dashboard/stats",
    icon: ChartBar,
  },
  {
    key: "settings",
    label: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
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
  userName = "Julie Dupont",
  userRole = "Organisatrice",
  userAvatar,
}: SidebarProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <>
      <div className="lg:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-gray-200/70 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-foreground shadow-sm transition hover:bg-gray-50"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "hidden lg:flex h-full min-h-screen w-[280px] flex-col border-r border-gray-200/70 bg-white",
          className
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-500 text-xl font-semibold text-white shadow-sm">
              N
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">NDOA</p>
              <p className="text-sm text-muted-foreground">Gestion des mariages</p>
            </div>
          </div>

          <nav className="space-y-1">
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
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-amber-100 text-amber-700 shadow-sm"
                        : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "size-5 transition-colors duration-150",
                        isActive ? "text-amber-600" : "text-muted-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-gray-200/80 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : (
                  <AvatarFallback>{userName.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/logout" className="inline-flex w-full items-center justify-center gap-2">
                <LogOut className="size-4" />
                Déconnexion
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex bg-black/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              className="flex h-full w-[280px] flex-col border-r border-gray-200/70 bg-white shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-amber-500 text-xl font-semibold text-white shadow-sm">
                    N
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">NDOA</p>
                    <p className="text-xs text-muted-foreground">Menu</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Fermer le menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 text-foreground transition hover:bg-gray-100"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <nav className="space-y-1">
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
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-150",
                            isActive
                              ? "bg-amber-100 text-amber-700 shadow-sm"
                              : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                          )}
                          onClick={() => setDrawerOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "size-5 transition-colors duration-150",
                              isActive ? "text-amber-600" : "text-muted-foreground"
                            )}
                            aria-hidden="true"
                          />
                          {item.label}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              <div className="border-t border-gray-200/80 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={userName} />
                    ) : (
                      <AvatarFallback>{userName.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href="/logout" className="inline-flex w-full items-center justify-center gap-2">
                    <LogOut className="size-4" />
                    Déconnexion
                  </Link>
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
