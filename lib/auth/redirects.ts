const DEFAULT_AUTHENTICATED_PATH = "/dashboard"

export function getSafeRedirectPath(
  value: unknown,
  fallback = DEFAULT_AUTHENTICATED_PATH
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\0")
  ) {
    return fallback
  }

  return value
}

export function getApplicationOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!configured) {
    return "http://localhost:3000"
  }

  const url = new URL(configured)

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL doit utiliser le protocole HTTP ou HTTPS."
    )
  }

  return url.origin
}
