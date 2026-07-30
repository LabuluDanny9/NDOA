import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NDOA — Mariages et invitations numériques",
    short_name: "NDOA",
    description: "Créez et gérez une invitation de mariage élégante.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf0",
    theme_color: "#f59e0b",
    lang: "fr",
    icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }, { src: "/logo.png", sizes: "512x512", type: "image/png" }],
  }
}
