import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/home/Hero"
import Features from "@/components/home/Features"
import Demo from "@/components/home/Demo"
import CTA from "@/components/home/CTA"
import Footer from "@/components/layout/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Demo />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
