"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  List,
  CreditCard,
  Target,
  Settings,
  Terminal,
  Plus,
  ChevronRight,
  FileText,
  AlertCircle,
  BarChart3,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { t, useLanguage } from "@/lib/i18n"
import { AddTransactionDialog } from "@/features/transactions/components/add-transaction-dialog"
import { CommandPalette } from "@/components/common/command-palette"
import { NotificationsPanel } from "@/components/common/notifications-panel"

const TransactionDialogContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export const useTransactionDialog = () => useContext(TransactionDialogContext)

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const savedLang = useLanguage()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    // Listen for language changes
    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange)
    }
  }, [savedLang])

  const navigation = getNavigation(lang)

  return (
    <TransactionDialogContext.Provider
      value={{ open: transactionDialogOpen, setOpen: setTransactionDialogOpen }}
    >
      <AddTransactionDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
      <div className="h-screen bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-hidden hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>DevFinance_</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "border"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
                  )}
                  style={isActive ? {
                    backgroundColor: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
                    color: 'var(--theme-primary)',
                    borderColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'
                  } : undefined}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-zinc-800">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-zinc-900 font-mono" style={{ color: 'var(--theme-primary)' }}>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">John Dev</p>
              <p className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--theme-primary)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
                {t("user.online", lang)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-3 md:px-6 bg-zinc-950 flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm flex-1 min-w-0">
            <span className="text-zinc-500 font-mono hidden sm:inline">{">"}</span>
            <span className="text-zinc-400 font-mono hidden sm:inline">home</span>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-zinc-600 hidden sm:inline" />
            <span className="text-zinc-100 font-mono truncate">
              {navigation.find((n) => n.href === pathname)?.name || "Dashboard"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <NotificationsPanel />
            <Button
              onClick={() => setTransactionDialogOpen(true)}
              className="text-white font-semibold glow-effect hover:opacity-90 text-xs md:text-sm px-2 md:px-4 flex-shrink-0"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">{t("btn.new.transaction", lang)}</span>
              <span className="sm:hidden">+</span>
              <kbd className="hidden lg:inline ml-3 px-2 py-0.5 text-xs font-mono bg-violet-600/50 rounded">Cmd+K</kbd>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 min-h-0">{children}</main>
      </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </TransactionDialogContext.Provider>
  )
}

const getNavigation = (lang: "pt" | "en" | "es") => [
  { name: t("nav.dashboard", lang), href: "/dashboard", icon: Home },
  { name: "Resumo", href: "/dashboard/summary", icon: FileText },
  { name: t("nav.transactions", lang), href: "/dashboard/transactions", icon: List },
  { name: t("nav.cards", lang), href: "/dashboard/cards", icon: CreditCard },
  { name: "Dívidas", href: "/dashboard/debts", icon: AlertCircle },
  { name: t("nav.planning", lang), href: "/dashboard/planning", icon: Target },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Cotações", href: "/dashboard/exchange-rates", icon: Globe },
  { name: t("nav.settings", lang), href: "/dashboard/settings", icon: Settings },
]
