import Link from "next/link"
import { ArrowUp, Globe, Send, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200/70 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-4">
            <div className="text-2xl font-semibold">NDOA</div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              NDOA simplifie la création d’invitations numériques de mariage avec RSVP intelligent.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">Navigation</h3>
            <nav className="mt-4 space-y-3 text-sm text-muted-foreground" aria-label="Footer navigation">
              <Link href="#" className="block hover:text-foreground">
                Accueil
              </Link>
              <Link href="#features" className="block hover:text-foreground">
                Fonctionnalités
              </Link>
              <Link href="#start" className="block hover:text-foreground">
                Commencer
              </Link>
              <Link href="#demo" className="block hover:text-foreground">
                Démonstration
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">Support</h3>
            <nav className="mt-4 space-y-3 text-sm text-muted-foreground" aria-label="Footer support links">
              <Link href="/contact" className="block hover:text-foreground">
                Contact
              </Link>
              <Link href="/faq" className="block hover:text-foreground">
                FAQ
              </Link>
              <Link href="/privacy" className="block hover:text-foreground">
                Confidentialité
              </Link>
              <Link href="/terms" className="block hover:text-foreground">
                Conditions d’utilisation
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">Suivez-nous</h3>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <Link
                href="https://facebook.com"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3 py-2 text-sm text-muted-foreground transition hover:border-amber-300 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Facebook
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-3 text-muted-foreground">
              <Link
                href="https://instagram.com"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3 py-2 text-sm text-muted-foreground transition hover:border-amber-300 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                Instagram
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-3 text-muted-foreground">
              <Link
                href="https://wa.me/"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3 py-2 text-sm text-muted-foreground transition hover:border-amber-300 hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-gray-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">© 2026 NDOA. Tous droits réservés.</p>

          <Button variant="outline" size="sm" asChild>
            <Link href="#top" className="inline-flex items-center gap-2">
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Retour en haut
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}
