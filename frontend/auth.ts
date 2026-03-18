import authConfig from "@/auth.config";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email as string;
        }

        if (token.role) {
          session.user.role = token.role as string;
        }

        if (token.accessToken) {
          session.user.accessToken = token.accessToken as string;
        }

        if (token.companyId) {
          (session.user as any).companyId = token.companyId;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token, user }) {
      // user is defined only on sign in
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.companyId = (user as any).companyId;
        token.sub = user.id;
      }
      return token;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      
      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) {
          // Check role alignment
          const role = auth?.user?.role;
          if (isOnAdmin && role !== "ADMIN") {
             return Response.redirect(new URL("/dashboard", nextUrl));
          }
          if (isOnDashboard && role === "ADMIN") {
             return Response.redirect(new URL("/admin", nextUrl));
          }
          return true;
        }
        return false; // Redirect to login
      }
      return true;
    },
  },
  ...authConfig,
  debug: true
});
