import type { Metadata } from "next"
import HeroInvitation from "@/components/invitation/HeroInvitation"
import Countdown from "@/components/invitation/Countdown"
import CoupleGallery from "@/components/invitation/CoupleGallery"
import LoveStory from "@/components/invitation/LoveStory"
import Timeline from "@/components/invitation/Timeline"
import LocationMap from "@/components/invitation/LocationMap"
import RSVPForm from "@/components/invitation/RSVPForm"
import GiftSection from "@/components/invitation/GiftSection"
import PhotoGallery from "@/components/invitation/PhotoGallery"
import FooterInvitation from "@/components/invitation/FooterInvitation"
import MusicPlayer from "@/components/invitation/MusicPlayer"
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
    gallery: value.photos.length > 0 ? value.photos.map(() => "/hero.jpg") : demoInvitation.gallery,
    gifts: value.gifts.map((gift) => ({ title: gift.name, description: gift.description ?? "Une attention pour accompagner notre nouvelle vie." })),
    music: { ...demoInvitation.music, source: value.settings.musicSource ?? demoInvitation.music.source },
  }
}

type InvitationPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
  const { slug } = await params
  const published = await getPublicInvitation(slug)

  return {
    title: published ? `${published.partnerOneName} & ${published.partnerTwoName}` : `Invitation ${slug}`,
    description: published?.description ?? `Invitation au mariage pour ${slug}.`,
  }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params
  const published = await getPublicInvitation(slug)
  const invitation = published ? publicInvitationToView(published) : demoInvitation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const eventUrl = new URL(`/invitation/${encodeURIComponent(slug)}`, appUrl).toString()

  return (
    <div className="min-h-screen bg-[#08060f] text-white">
      <FloatingMenu />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,199,102,0.16),_transparent_25%)]" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col gap-16 px-6 py-10 lg:px-12">
          <header className="grid gap-10 lg:grid-cols-[0.9fr_0.8fr]">
            <div className="space-y-8">
              <HeroInvitation couple={invitation.couple} />
              <div className="grid gap-4 md:grid-cols-2">
                <Countdown targetDate={invitation.couple.date} />
                <ShareButtons url={eventUrl} />
              </div>
            </div>
            <div className="space-y-6">
              <MusicPlayer track={invitation.music} />
              <QRCodeCard url={eventUrl} code="NDOA-2026" />
            </div>
          </header>

          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <CoupleGallery images={invitation.gallery} />
              <LoveStory story={invitation.story} />
              <Timeline items={invitation.timeline} />
              <PhotoGallery images={invitation.gallery} />
            </div>
            <aside className="space-y-8">
              <LocationMap location={invitation.couple.location} address={invitation.couple.address} />
              <RSVPForm slug={slug} />
              <GiftSection gifts={invitation.gifts} />
            </aside>
          </section>

          <FooterInvitation couple={invitation.couple} />
        </div>
      </div>
    </div>
  )
}
