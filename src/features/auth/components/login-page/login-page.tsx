"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Terminal, Github, Chrome } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { t, useLanguage } from "@/lib/i18n"

export function LoginPage() {
  // Login page should use full viewport
  const [email, setEmail] = useState("")
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const router = useRouter()
  const savedLang = useLanguage()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")
  }, [])

  const handleMagicLink = () => {
    if (email.toLowerCase() === "devpap") {
      router.push("/dashboard")
    } else {
      alert("Magic link sent! Check your email.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleMagicLink()
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error)
    }
  }

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Terminal className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-mono font-bold text-emerald-500">DevFinance_</h1>
          </div>
          <p className="text-zinc-400 text-sm font-mono">{t("login.subtitle", lang)}</p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 h-14 text-base glow-effect hover:border-emerald-500/50 transition-all"
          >
            <Github className="w-5 h-5 mr-3" />
            {t("login.github", lang)}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 h-14 text-base hover:border-zinc-700 transition-all"
          >
            <Chrome className="w-5 h-5 mr-3" />
            {t("login.google", lang)}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-mono">{t("login.or", lang)}</span>
            </div>
          </div>

          {/* Terminal-style Email Input */}
          <div className="space-y-3">
            <div className="bg-black border border-emerald-500/30 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-500 font-mono text-sm">user@email:~$</span>
              </div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t("login.email", lang)}
                className="bg-transparent border-0 text-emerald-400 font-mono focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
              />
              <div className="flex items-center mt-2">
                <span className="w-2 h-4 bg-emerald-500 terminal-cursor"></span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleMagicLink}
              className="w-full hover:opacity-90 text-zinc-950 font-semibold h-12 glow-effect"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {t("login.magic", lang)}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center">
          <p className="text-xs text-zinc-500 font-mono">{t("login.terms", lang)}</p>
        </div>
      </div>
    </div>
  )
}
