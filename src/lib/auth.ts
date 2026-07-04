import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const isProd = process.env.ENV === "production";

export const sessionCookieName = `${isProd ? "__Secure-" : ""}${process.env.COOKIE_PREFIX}-next-auth.session-token`;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
    callbackUrl: {
      name: `${isProd ? "__Secure-" : ""}${process.env.COOKIE_PREFIX}-next-auth.callback-url`,
      options: { sameSite: "lax", path: "/", secure: isProd },
    },
    csrfToken: {
      name: `${process.env.COOKIE_PREFIX}-next-auth.csrf-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
