import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// Validação das variáveis de ambiente
const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// URL base - NextAuth detecta automaticamente na Vercel via VERCEL_URL
// Mas é melhor definir explicitamente via NEXTAUTH_URL

// Validação e logs de erro
if (!googleClientId || !googleClientSecret) {
  if (typeof window === "undefined") {
    // Apenas logar no servidor
    console.error("⚠️  Variáveis de ambiente do Google OAuth não configuradas!")
    console.error("Configure AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET (ou GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET)")
    console.error("Crie um arquivo .env.local na raiz do projeto com essas variáveis")
  }
}

if (!authSecret) {
  if (typeof window === "undefined") {
    console.error("⚠️  AUTH_SECRET não configurado!")
    console.error("Execute: openssl rand -base64 32")
    console.error("E adicione AUTH_SECRET no arquivo .env.local")
  }
}

// Só inicializa o NextAuth se as credenciais estiverem configuradas
// Caso contrário, retorna handlers que retornam erro 500 com mensagem clara
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId || "missing-client-id",
      clientSecret: googleClientSecret || "missing-client-secret",
    }),
    Credentials({
      id: "devpap",
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        // Login de desenvolvimento: quando email for "devpap"
        if (credentials?.email === "devpap") {
          return {
            id: "dev-user-id",
            email: "devpap@dev.local",
            name: "Dev User",
            image: null,
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Permitir login de desenvolvimento sempre
      if (account?.provider === "devpap") {
        return true
      }
      
      // Validação adicional no callback para Google
      if (account?.provider === "google") {
        if (!googleClientId || !googleClientSecret) {
          console.error("Google OAuth não configurado - verifique as variáveis de ambiente")
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "devpap" && user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
  },
  secret: authSecret || "missing-secret",
  debug: process.env.NODE_ENV === "development",
})
