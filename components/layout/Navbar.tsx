"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MenuIcon, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

const links = [
  { href: "#", label: "Accueil" },
  { href: "#features", label: "Fonctionnalites" },
  { href: "#start", label: "Commencer" },
  { href: "#demo", label: "Demonstration" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="hero-glow mx-auto max-w-7xl rounded-[1.75rem] border border-white/50 bg-white/78 backdrop-blur-xl"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#1e3a8a)] shadow-[0_15px_30px_rgba(37,99,235,0.24)] ring-2 ring-amber-300/60">
                <Image
                  src="/logo.png"
                  alt="NDOA logo"
                  width={34}
                  height={34}
                  priority
                  loading="eager"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-[0.22em] text-blue-900">NDOA</span>
                <span className="text-xs text-muted-foreground">Mariages, RSVP, QR</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 rounded-full border border-white/55 bg-white/65 px-2 py-2 shadow-inner shadow-slate-200/40 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/78 transition duration-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 md:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>

                <Button asChild size="lg" className={cn("px-5")}>
                  <Link href="/register">
                    <Sparkles className="size-4" />
                    Creer mon mariage
                  </Link>
                </Button>
              </div>

              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger>
                    <span
                      aria-hidden={false}
                      role="button"
                      aria-label="Ouvrir le menu"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-foreground shadow-sm backdrop-blur-md transition duration-300 hover:bg-white"
                    >
                      <MenuIcon className="size-5" />
                    </span>
                  </SheetTrigger>

                  <SheetContent side="right" className="border-white/60 bg-white/90 backdrop-blur-xl">
                    <SheetHeader>
                      <SheetTitle>NDOA</SheetTitle>
                      <SheetDescription>Navigation rapide</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 flex flex-col gap-3 px-4">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-2xl border border-slate-100 bg-white/75 px-4 py-3 text-base font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <SheetFooter>
                      <div className="flex w-full flex-col gap-3 px-4">
                        <Button variant="ghost" asChild>
                          <Link href="/login">Connexion</Link>
                        </Button>

                        <Button asChild className="w-full">
                          <Link href="/register">Creer mon mariage</Link>
                        </Button>

                        <div className="flex justify-end">
                          <SheetClose>Fermer</SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}
