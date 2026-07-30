import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return ["/", "/faq", "/contact", "/privacy", "/terms"].map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.5 }))
}
