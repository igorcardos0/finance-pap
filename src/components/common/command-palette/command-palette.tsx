"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Home,
  List,
  CreditCard,
  Target,
  Settings,
  FileText,
  AlertCircle,
  Plus,
  Search,
  Download,
  Upload,
  Palette,
  Languages,
  BarChart3,
  Globe,
} from "lucide-react"
import { useTransactionDialog } from "../app-shell"
import { useLanguage } from "@/lib/i18n"
import { t } from "@/lib/i18n"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpen: setTransactionDialogOpen } = useTransactionDialog()
  const lang = useLanguage()

  const navigation = [
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

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  const handleNewTransaction = () => {
    setTransactionDialogOpen(true)
    onOpenChange(false)
  }

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "k" && e.metaKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onOpenChange])

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Navegue rapidamente pela aplicação"
      className="bg-zinc-900 border-zinc-800"
    >
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Navegação">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                className={pathname === item.href ? "bg-zinc-800" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
                {pathname === item.href && (
                  <CommandShortcut className="ml-auto">Atual</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ações">
          <CommandItem onSelect={handleNewTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            <span>{t("btn.new.transaction", lang)}</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Buscar Transações</span>
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Configurações">
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("nav.settings", lang)}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Alterar Tema</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Languages className="mr-2 h-4 w-4" />
            <span>Alterar Idioma</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Dados">
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar Dados</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Importar Dados</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

