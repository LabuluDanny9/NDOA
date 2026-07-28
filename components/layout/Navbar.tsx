"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MenuIcon } from "lucide-react"

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

/**
 * Navbar component
 * - Sticky, semi-transparent white background with backdrop blur
 * - Desktop: horizontal menu
 * - Mobile: hamburger opens a Sheet (shadcn/ui)
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="backdrop-blur-sm bg-white/70 border-b border-gray-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Image
                    src="/logo.png"
                    alt="NDOA logo"
                    width={48}
                    height={48}
                    priority
                    loading="eager"
                    className="h-12 w-12 object-contain"
                  />
                  <span className="text-xs font-semibold tracking-wide text-foreground">NDOA</span>
                </div>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex md:items-center md:space-x-6">
              <Link href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                Accueil
              </Link>
              <Link href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                Fonctionnalités
              </Link>
              <Link href="#start" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                Commencer
              </Link>
              <Link href="#demo" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                Démonstration
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex md:items-center md:gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md",
                    "hover:from-amber-500 hover:to-amber-700",
                    "px-4 py-1.5"
                  )}
                >
                  <Link href="/register">Créer mon mariage</Link>
                </Button>
              </div>

              {/* Mobile hamburger */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger>
                    <span
                      aria-hidden={false}
                      role="button"
                      aria-label="Ouvrir le menu"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/0 text-foreground/90 hover:bg-muted"
                    >
                      <MenuIcon className="size-5" />
                    </span>
                  </SheetTrigger>

                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>NDOA</SheetTitle>
                      <SheetDescription>Navigation</SheetDescription>
                    </SheetHeader>

                    <div className="mt-4 flex flex-col gap-4 px-4">
                      <Link href="#" className="text-base font-medium">
                        Accueil
                      </Link>
                      <Link href="#features" className="text-base font-medium">
                        Fonctionnalités
                      </Link>
                      <Link href="#start" className="text-base font-medium">
                        Commencer
                      </Link>
                      <Link href="#demo" className="text-base font-medium">
                        Démonstration
                      </Link>
                    </div>

                    <SheetFooter>
                      <div className="flex w-full flex-col gap-3 px-4">
                        <Button variant="ghost" asChild>
                          <Link href="/login">Connexion</Link>
                        </Button>

                            <Button
                              asChild
                              className="w-full bg-amber-500 text-white hover:bg-amber-600 px-4 py-2"
                            >
                              <Link href="/register">Créer mon mariage</Link>
                            </Button>

                        <div className="flex justify-end">
                          <SheetClose>
                            Fermer
                          </SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
