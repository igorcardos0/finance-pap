import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      // Aqui tentamos ler o nome que você colocou na Vercel OU o nome padrão
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn() {
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  // O Auth.js v5 já busca o AUTH_SECRET automaticamente, 
  // mas manter aqui por segurança não faz mal
  secret: process.env.AUTH_SECRET,
})
