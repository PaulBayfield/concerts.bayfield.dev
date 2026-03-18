import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { getToken } from "next-auth/jwt"

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ["/artists", "/concerts"]

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.match(new RegExp(`^/(fr|en)${path}(/.*)?$`))
  )

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const locale = pathname.split("/")[1] || routing.defaultLocale
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}/auth/signin`
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
