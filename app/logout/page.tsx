import type { Metadata } from "next"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { signOutAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Déconnexion",
}

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-800">
          <LogOut className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
          Se déconnecter ?
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Votre session locale sera fermée sur cet appareil.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Annuler</Link>
          </Button>
          <form action={signOutAction}>
            <Button
              type="submit"
              className="w-full bg-slate-950 text-white hover:bg-slate-800"
            >
              Confirmer la déconnexion
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
