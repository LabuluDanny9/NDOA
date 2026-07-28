import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import {
  canAccessPath,
  getAuthenticatedRole,
  getRoleHome,
  isProtectedPath,
} from "@/lib/auth/roles"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import type { Database } from "@/types/database.types"

const AUTH_ENTRY_PATHS = ["/login", "/register", "/forgot-password"]

function redirectWithSession(
  request: NextRequest,
  pathname: string,
  sessionResponse: NextResponse
) {
  const destination = request.nextUrl.clone()
  destination.pathname = pathname
  destination.search = ""

  if (pathname === "/login" && isProtectedPath(request.nextUrl.pathname)) {
    destination.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )
  }

  const redirectResponse = NextResponse.redirect(destination)

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  for (const headerName of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(headerName)

    if (value) {
      redirectResponse.headers.set(headerName, value)
    }
  }

  return redirectResponse
}

export async function updateSupabaseSession(request: NextRequest) {
  const environment = getOptionalSupabaseEnvironment()
  let response = NextResponse.next({ request })

  if (!environment) {
    return response
  }

  const supabase = createServerClient<Database>(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getClaims()
  const role = error ? null : getAuthenticatedRole(data?.claims)
  const pathname = request.nextUrl.pathname

  if (isProtectedPath(pathname) && !role) {
    return redirectWithSession(request, "/login", response)
  }

  if (role && !canAccessPath(role, pathname)) {
    return redirectWithSession(request, "/unauthorized", response)
  }

  if (role && AUTH_ENTRY_PATHS.includes(pathname)) {
    return redirectWithSession(request, getRoleHome(role), response)
  }

  return response
}
