import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { getToken } from "next-auth/jwt"
import { sessionCookieName } from "@/lib/auth"

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ["/artists", "/concerts", "/map"]
const ADMIN_PATHS = ["/admin"]
const ROOT_PATH_REGEX = /^\/(fr|en)\/?$/

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.match(new RegExp(`^/(fr|en)${path}(/.*)?$`))
  )
  const isAdminPath = ADMIN_PATHS.some((path) =>
    pathname.match(new RegExp(`^/(fr|en)${path}(/.*)?$`))
  )
  const isRoot = ROOT_PATH_REGEX.test(pathname)

  if (isProtected || isAdminPath || isRoot) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: sessionCookieName,
    })
    const locale = pathname.split("/")[1] || routing.defaultLocale

    // Signed-in users land on the map instead of the marketing homepage.
    if (isRoot) {
      if (token) {
        const url = req.nextUrl.clone()
        url.pathname = `/${locale}/map`
        return NextResponse.redirect(url)
      }
      return intlMiddleware(req)
    }

    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}/auth/signin`
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    if (isAdminPath && token.email !== process.env.ADMIN_EMAIL) {
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}`
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
