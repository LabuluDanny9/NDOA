import type { Metadata } from "next"
import Image from "next/image"
import HeroInvitation from "@/components/invitation/HeroInvitation"
import Countdown from "@/components/invitation/Countdown"
import Timeline from "@/components/invitation/Timeline"
import LocationMap from "@/components/invitation/LocationMap"
import RSVPForm from "@/components/invitation/RSVPForm"
import RSVPSceneReplica from "@/components/invitation/RSVPSceneReplica"
import GiftSection from "@/components/invitation/GiftSection"
import FooterInvitation from "@/components/invitation/FooterInvitation"
import FloatingMenu from "@/components/invitation/FloatingMenu"
import ShareButtons from "@/components/invitation/ShareButtons"
import QRCodeCard from "@/components/invitation/QRCodeCard"
import { getPublicInvitation } from "@/lib/invitations/server"
import type { PublicInvitation } from "@/lib/invitations/types"

const demoInvitation = {
  couple: {
    bride: "Ariane Mukeba",
    groom: "Samuel Ndala",
    tagline: "Une célébration intime au coeur de la RDC",
    date: "2026-11-20T17:00:00Z",
    location: "Château des Fleurs, Lubumbashi",
    address: "Avenue Tabora 238, Lubumbashi, RD Congo",
  },
  story: [
    { year: "2018", title: "Première rencontre", description: "Ils se croisent pour la première fois au festival de musique de Lubumbashi." },
    { year: "2020", title: "Première aventure", description: "Un voyage en Tanzanie scelle leur complicité et nourrit leurs rêves." },
    { year: "2023", title: "Demande en mariage", description: "Sous un ciel étoilé, Samuel demande Ariana en mariage au bord du lac." },
    { year: "2026", title: "Le jour J", description: "Ils invitent leurs proches à célébrer l'amour, l'élégance et la lumière." },
  ],
  timeline: [
    { time: "17:00", title: "Cérémonie", description: "Échange de vœux et première bénédiction." },
    { time: "18:30", title: "Cocktail", description: "Champagne, canapés et retrouvailles sous les lanternes." },
    { time: "19:30", title: "Dîner", description: "Menu signature autour de mets raffinés et saveurs locales." },
    { time: "21:00", title: "Soirée dansante", description: "Musique live et danse jusqu'à l'aube." },
  ],
  gallery: [
    "/hero.jpg",
    "/hero.jpg",
    "/hero.jpg",
    "/hero.jpg",
    "/hero.jpg",
  ],
  gifts: [
    { title: "Fleurs et décoration", description: "Aidez-nous à créer un espace élégant et accueillant." },
    { title: "Menu gastronomique", description: "Participer à l'expérience culinaire du mariage." },
    { title: "Voyage de noces", description: "Contribuez à notre première escapade en couple." },
  ],
  music: {
    title: "Hymne de notre amour",
    artist: "NDOA Wedding Ensemble",
    source: "https://cdn.pixabay.com/audio/2023/05/17/audio_3b91f1412c.mp3",
  },
}

function publicInvitationToView(value: PublicInvitation) {
  const firstEvent = value.events[0]
  const date = value.weddingDate
    ? `${value.weddingDate}T${value.ceremonyTime ?? "12:00:00"}+02:00`
    : demoInvitation.couple.date
  const location = value.settings.venueName || firstEvent?.venueName || value.settings.city || "Lieu à confirmer"
  const address = value.settings.address || firstEvent?.address || [value.settings.city, value.settings.country].filter(Boolean).join(", ") || "Adresse à confirmer"
  const timeline = value.events.length > 0
    ? value.events.map((event) => ({ time: new Date(event.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), title: event.title, description: event.description ?? "Retrouvons-nous pour ce moment important." }))
    : value.programs.map((program) => ({ time: new Date(program.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), title: program.title, description: program.description ?? "" }))
  const photos = value.photos.map((photo) => photo.url).filter((url): url is string => Boolean(url))
  return {
    couple: {
      bride: value.partnerTwoName,
      groom: value.partnerOneName,
      tagline: value.description ?? value.settings.slogan ?? "Une célébration intime au cœur de la RDC",
      date,
      location,
      address,
    },
    story: [{ year: "Aujourd’hui", title: value.name, description: value.description ?? "Merci de partager cette célébration avec nous." }],
    timeline: timeline.length > 0 ? timeline : demoInvitation.timeline,
    gallery: photos.length > 0 ? photos : demoInvitation.gallery,
    gifts: value.gifts.map((gift) => ({ title: gift.name, description: gift.description ?? "Une attention pour accompagner notre nouvelle vie." })),
    music: { ...demoInvitation.music, source: value.settings.musicSource ?? demoInvitation.music.source },
  }
}

type InvitationPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
  const { slug } = await params
  const published = await getPublicInvitation(slug)

  return {
    title: published ? `${published.partnerOneName} & ${published.partnerTwoName}` : `Invitation ${slug}`,
    description: published?.description ?? `Invitation au mariage pour ${slug}.`,
  }
}

export default async function InvitationPage({ params, searchParams }: InvitationPageProps) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const published = await getPublicInvitation(slug)
  const invitation = published ? publicInvitationToView(published) : demoInvitation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const eventUrl = new URL(`/invitation/${encodeURIComponent(slug)}`, appUrl).toString()
  const guestCode = typeof query.code === "string" && query.code.trim() ? query.code.trim().toUpperCase() : "NDOA-2026"
  const guestId = typeof query.guest === "string" && query.guest.trim() ? query.guest.trim() : null
  const qrUrl = new URL(eventUrl)
  if (guestId) qrUrl.searchParams.set("guest", guestId)
  if (guestCode) qrUrl.searchParams.set("code", guestCode)

  return (
    <div className="min-h-screen bg-blue-50 text-slate-950">
      <FloatingMenu />
      <div className="relative overflow-hidden">
        <section className="relative isolate min-h-screen overflow-hidden bg-blue-950 text-white">
          <RSVPSceneReplica images={invitation.gallery} couple={invitation.couple} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/70 to-amber-500/30" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.20),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.24),_transparent_28%)]" />
          <div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] items-center gap-8 px-6 py-20 lg:grid-cols-[1.05fr_0.75fr] lg:px-12">
            <div className="space-y-6">
              <HeroInvitation couple={invitation.couple} />
              <div className="grid gap-4 md:grid-cols-2">
                <Countdown targetDate={invitation.couple.date} />
                <ShareButtons url={eventUrl} />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 sm:max-w-xl">
                {invitation.gallery.slice(0, 3).map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 shadow-xl shadow-blue-950/20">
                    <Image src={image} alt="" fill unoptimized sizes="(max-width: 640px) 30vw, 12rem" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <RSVPForm slug={slug} />
              <QRCodeCard
                url={qrUrl.toString()}
                code={guestCode}
                description="Scannez ce QR code a l'entree pour retrouver instantanement l'invitation de cet invite."
              />
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-12 lg:px-12">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <Timeline items={invitation.timeline} />
              <GiftSection gifts={invitation.gifts} />
            </div>
            <aside className="space-y-6">
              <LocationMap location={invitation.couple.location} address={invitation.couple.address} />
            </aside>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Photos</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Notre galerie</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Les images affichées ici sont celles téléversées par l’organisateur pour cette invitation.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {invitation.gallery.slice(0, 5).map((image, index) => (
                <figure key={`${image}-gallery-${index}`} className="group overflow-hidden rounded-[1.5rem] bg-blue-50 shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image}
                      alt={`Photo ${index + 1} du mariage`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 20vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </section>

          <FooterInvitation couple={invitation.couple} />
        </div>
      </div>
    </div>
  )
}
