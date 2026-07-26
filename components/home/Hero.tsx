"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
	FileText,
	CheckCircle,
	Image as ImageIcon,
	QrCode,
	ChevronDown,
	Sparkles,
} from "lucide-react"

const container = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.12,
		},
	},
}

const item = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/**
 * Hero section for the home page.
 * - Full-width background image with dark gradient overlay
 * - Staggered entrance animations via Framer Motion
 */
export default function Hero() {
	return (
		<section className="relative w-full overflow-hidden">
			{/* Background image */}
			<div className="absolute inset-0 -z-10 h-full w-full">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						  backgroundImage: "url('/hero.jpg')",
					}}
				/>
				{/* Gradient overlay for legibility (darkened) */}
				<div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/60 to-black/30" />
			</div>

			<div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
				<motion.div initial="hidden" animate="visible" variants={container} className="grid gap-8 md:grid-cols-2 md:items-center">
					<div className="max-w-2xl">
						<motion.div variants={item} className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-amber-100">
							<Sparkles className="mr-2 size-4 text-amber-200" />
							<span>✨ La nouvelle génération d'invitations de mariage</span>
						</motion.div>

						<motion.h1 variants={item} className="mt-6 text-3xl font-heading font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
							Créez une invitation de mariage aussi inoubliable que votre grand jour.
						</motion.h1>

						<motion.p variants={item} className="mt-4 max-w-xl text-lg text-amber-100/90">
							Concevez une invitation numérique élégante, partagez-la en un clic et gérez
							facilement les confirmations de présence de tous vos invités.
						</motion.p>

						<motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Link
									href="/register"
									className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-gradient-to-r from-amber-400 to-amber-600 text-white")}
									aria-label="Créer mon mariage"
								>
									Créer mon mariage
								</Link>
							</motion.div>

							<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
								<Link
									href="#demo"
									className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "text-white/90 border-white/10")}
									aria-label="Voir une démonstration"
								>
									Voir une démonstration
								</Link>
							</motion.div>
						</motion.div>

						{/* Stats cards */}
						<motion.div variants={item} className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:max-w-lg">
							<StatCardAnimated icon={<FileText />} title="Invitations numériques" value="120k+" />
							<StatCardAnimated icon={<CheckCircle />} title="RSVP en temps réel" value="Instantané" />
							<StatCardAnimated icon={<ImageIcon />} title="Galerie photos" value="Partage facile" />
							<StatCardAnimated icon={<QrCode />} title="QR Code sécurisé" value="100% sécurisé" />
						</motion.div>
					</div>

					{/* Right side intentionally left empty for a clean, minimal layout on larger screens */}
				</motion.div>
			</div>

			{/* Scroll hint */}
			<div className="absolute inset-x-0 bottom-6 flex justify-center">
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 1.6, repeat: Infinity }}
					className="flex items-center justify-center rounded-full bg-white/10 p-2"
				>
					<ChevronDown className="size-5 text-white/90" />
				</motion.div>
			</div>
		</section>
	)
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
	return (
		<div className="flex items-center gap-3 rounded-lg bg-white/6 p-3 text-white">
			<div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
				{React.cloneElement(icon as any, { className: "size-5 text-amber-200" })}
			</div>
			<div>
				<div className="text-sm font-medium">{title}</div>
				<div className="text-xs text-amber-100/80">{value}</div>
			</div>
		</div>
	)
}

function StatCardAnimated({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
	return (
		<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="rounded-lg">
			<StatCard icon={icon} title={title} value={value} />
		</motion.div>
	)
}

