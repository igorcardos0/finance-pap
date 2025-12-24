"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages, Palette, Bell, Shield, Key, Download, Upload, Globe, Check, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { t, useLanguage, setLanguage } from "@/lib/i18n"
import { useFinanceData } from "@/hooks/use-finance-data"
import { useTheme, setTheme } from "@/hooks/use-theme"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { toast } from "@/lib/toast"
import { CategoriesSettings } from "@/features/settings/components/categories-settings"
import { BudgetsSettings } from "@/features/settings/components/budgets-settings"
import { parseJSONImport, parseCSVImport, validateImportData } from "@/lib/import-utils"
import { useAutoBackup, type BackupFrequency } from "@/hooks/use-auto-backup"

type Theme = "matrix-green" | "cyber-violet" | "neon-blue"

export function SettingsView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const savedLang = useLanguage()
  const { theme, setTheme: setThemeState } = useTheme()
  const [budgetAlerts, setBudgetAlerts] = useLocalStorage<boolean>("devfinance_budget_alerts", true)
  const [billReminders, setBillReminders] = useLocalStorage<boolean>("devfinance_bill_reminders", false)
  const [apiKey, setApiKey] = useLocalStorage<string>("devfinance_api_key", "")
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge")
  const financeData = useFinanceData()
  const {
    enabled: autoBackupEnabled,
    setEnabled: setAutoBackupEnabled,
    frequency: autoBackupFrequency,
    setFrequency: setAutoBackupFrequency,
    lastBackup,
    performBackup,
  } = useAutoBackup()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [savedLang])

  // Generate API key if it doesn't exist
  useEffect(() => {
    if (!apiKey) {
      const newKey = `dvf_sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setApiKey(newKey)
    }
  }, [apiKey, setApiKey])

  const handleLanguageChange = (newLang: "pt" | "en" | "es") => {
    setLang(newLang)
    setLanguage(newLang)
    toast.success("Idioma alterado", `O idioma foi alterado para ${newLang === "pt" ? "Português" : newLang === "en" ? "English" : "Español"}.`)
    window.dispatchEvent(new Event("languageChange"))
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setThemeState(newTheme)
    const themeNames: Record<Theme, string> = {
      "matrix-green": "Matrix Green",
      "cyber-violet": "Cyber Violet",
      "neon-blue": "Neon Blue",
    }
    toast.success("Tema alterado", `O tema foi alterado para ${themeNames[newTheme]}.`)
    window.dispatchEvent(new Event("themeChange"))
  }

  const handleToggleBudgetAlerts = () => {
    setBudgetAlerts(!budgetAlerts)
  }

  const handleToggleBillReminders = () => {
    setBillReminders(!billReminders)
  }

  const generateNewApiKey = () => {
    const newKey = `dvf_sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiKey(newKey)
    toast.success("Chave API gerada", "Uma nova chave de API foi gerada com sucesso.")
  }

  const handleExportJSON = () => {
    try {
      const data = {
        transactions: financeData.transactions,
        creditCards: financeData.creditCards,
        financialGoals: financeData.financialGoals,
        debts: financeData.debts,
        emergencyFund: financeData.emergencyFund,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `devfinance_backup_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Exportação concluída", "Seus dados foram exportados em formato JSON.")
    } catch (error) {
      toast.error("Erro na exportação", "Não foi possível exportar os dados. Tente novamente.")
    }
  }

  const handleExportCSV = () => {
    try {
      // Export transactions to CSV
      const headers = ["Date", "Description", "Category", "Tags", "Account", "Amount"]
      const rows = financeData.transactions.map((t) => [
        t.date,
        t.description,
        t.category,
        t.tags.join("; "),
        t.account,
        t.amount.toString(),
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `devfinance_transactions_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Exportação concluída", "Suas transações foram exportadas em formato CSV.")
    } catch (error) {
      toast.error("Erro na exportação", "Não foi possível exportar os dados. Tente novamente.")
    }
  }

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileContent = await file.text()
      const data = parseJSONImport(fileContent)
      
      // Validate data
      const validation = validateImportData(data)
      if (!validation.valid) {
        toast.error("Erro na validação", validation.errors.join(", "))
        return
      }

      // Import data
      financeData.importData(
        {
          transactions: data.transactions,
          creditCards: data.creditCards,
          financialGoals: data.financialGoals,
          debts: data.debts,
          emergencyFund: data.emergencyFund,
        },
        importMode
      )

      const itemCounts = []
      if (data.transactions) itemCounts.push(`${data.transactions.length} transações`)
      if (data.creditCards) itemCounts.push(`${data.creditCards.length} cartões`)
      if (data.financialGoals) itemCounts.push(`${data.financialGoals.length} metas`)
      if (data.debts) itemCounts.push(`${data.debts.length} dívidas`)

      toast.success(
        "Importação concluída",
        `${itemCounts.join(", ")} foram ${importMode === "replace" ? "substituídos" : "adicionados"} com sucesso.`
      )
      
      setImportDialogOpen(false)
    } catch (error) {
      toast.error("Erro na importação", error instanceof Error ? error.message : "Não foi possível importar os dados.")
    } finally {
      // Reset input
      event.target.value = ""
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileContent = await file.text()
      const { transactions } = parseCSVImport(fileContent)

      // Import transactions
      financeData.importData({ transactions }, importMode)

      toast.success(
        "Importação concluída",
        `${transactions.length} transações foram ${importMode === "replace" ? "substituídas" : "adicionadas"} com sucesso.`
      )
      
      setImportDialogOpen(false)
    } catch (error) {
      toast.error("Erro na importação", error instanceof Error ? error.message : "Não foi possível importar os dados.")
    } finally {
      // Reset input
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-theme-primary" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.language", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Selecione o <strong>idioma</strong> da interface do aplicativo.
                      As traduções são aplicadas dinamicamente para melhorar sua experiência.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.language.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => handleLanguageChange("pt")}
              variant={lang === "pt" ? "default" : "outline"}
              className={
                lang === "pt"
                  ? "text-zinc-950 font-semibold hover:opacity-90"
                  : "border-zinc-800 bg-transparent hover:bg-zinc-800"
              }
              style={lang === "pt" ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            >
              <Globe className="w-4 h-4 mr-2" />
              Português
            </Button>
            <Button
              onClick={() => handleLanguageChange("en")}
              variant={lang === "en" ? "default" : "outline"}
              className={
                lang === "en"
                  ? "text-zinc-950 font-semibold hover:opacity-90"
                  : "border-zinc-800 bg-transparent hover:bg-zinc-800"
              }
              style={lang === "en" ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            >
              <Globe className="w-4 h-4 mr-2" />
              English
            </Button>
            <Button
              onClick={() => handleLanguageChange("es")}
              variant={lang === "es" ? "default" : "outline"}
              className={
                lang === "es"
                  ? "text-zinc-950 font-semibold hover:opacity-90"
                  : "border-zinc-800 bg-transparent hover:bg-zinc-800"
              }
              style={lang === "es" ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            >
              <Globe className="w-4 h-4 mr-2" />
              Español
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-theme-accent" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.theme", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Altere o <strong>tema visual</strong> da aplicação. Escolha entre diferentes esquemas de cores
                      para personalizar sua experiência e deixar o DevFinance_ com a sua cara.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.theme.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange("matrix-green")}
              className={`border rounded-lg p-4 text-center transition-all ${
                theme === "matrix-green"
                  ? "border-theme-primary/50 bg-zinc-950 ring-2 ring-theme-primary/30"
                  : "border-zinc-800 bg-zinc-950 hover:border-theme-primary/50 cursor-pointer"
              }`}
            >
              <div className="w-full h-20 bg-gradient-to-br from-theme-primary/20 to-zinc-900 rounded mb-2"></div>
              <Label className={`font-mono text-sm ${theme === "matrix-green" ? "text-theme-primary" : "text-zinc-400"}`}>
                Matrix Green
              </Label>
              {theme === "matrix-green" && (
                <p className="text-xs text-theme-primary mt-1">Atual</p>
              )}
            </button>
            <button
              onClick={() => handleThemeChange("cyber-violet")}
              className={`border rounded-lg p-4 text-center transition-all ${
                theme === "cyber-violet"
                  ? "border-theme-primary/50 bg-zinc-950 ring-2 ring-theme-primary/30"
                  : "border-zinc-800 bg-zinc-950 hover:border-theme-primary/50 cursor-pointer"
              }`}
            >
              <div className="w-full h-20 bg-gradient-to-br from-theme-primary/20 to-zinc-900 rounded mb-2"></div>
              <Label className={`font-mono text-sm ${theme === "cyber-violet" ? "text-theme-primary" : "text-zinc-400"}`}>
                Cyber Violet
              </Label>
              {theme === "cyber-violet" && (
                <p className="text-xs text-theme-primary mt-1">Atual</p>
              )}
            </button>
            <button
              onClick={() => handleThemeChange("neon-blue")}
              className={`border rounded-lg p-4 text-center transition-all ${
                theme === "neon-blue"
                  ? "border-theme-primary/50 bg-zinc-950 ring-2 ring-theme-primary/30"
                  : "border-zinc-800 bg-zinc-950 hover:border-theme-primary/50 cursor-pointer"
              }`}
            >
              <div className="w-full h-20 bg-gradient-to-br from-theme-primary/20 to-zinc-900 rounded mb-2"></div>
              <Label className={`font-mono text-sm ${theme === "neon-blue" ? "text-theme-primary" : "text-zinc-400"}`}>
                Neon Blue
              </Label>
              {theme === "neon-blue" && (
                <p className="text-xs text-theme-primary mt-1">Atual</p>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-500" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.notifications", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Configure as <strong>notificações</strong> para receber alertas sobre seu orçamento
                      e lembretes de contas a pagar. Mantenha-se informado sobre suas finanças.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.notifications.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <Label className="text-zinc-100">Budget alerts</Label>
              <p className="text-xs text-zinc-500 font-mono">console.log() overspending</p>
            </div>
            <Button
              size="sm"
              onClick={handleToggleBudgetAlerts}
              className={budgetAlerts ? "bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/20" : "border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800"}
            >
              {budgetAlerts ? <Check className="w-4 h-4 mr-2" /> : null}
              {budgetAlerts ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <Label className="text-zinc-100">Bill reminders</Label>
              <p className="text-xs text-zinc-500 font-mono">Push notifications 3 days before</p>
            </div>
            <Button
              size="sm"
              onClick={handleToggleBillReminders}
              className={billReminders ? "bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/20" : "border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800"}
            >
              {billReminders ? <Check className="w-4 h-4 mr-2" /> : null}
              {billReminders ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-rose-500" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.security", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Gerencie as <strong>configurações de segurança</strong> da sua conta.
                      Altere sua senha e ative a autenticação de dois fatores (2FA) para proteger seus dados.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.security.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full border-zinc-800 bg-transparent hover:bg-zinc-800">
            Change Password
          </Button>
          <Button variant="outline" className="w-full border-zinc-800 bg-transparent hover:bg-zinc-800">
            Enable 2FA
          </Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-cyan-500" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.api", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Gerencie suas <strong>chaves de API</strong> para integrar o DevFinance_ com outros serviços.
                      Use com cautela, pois as chaves dão acesso aos seus dados financeiros.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.api.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-black border border-theme-primary/20 rounded-lg font-mono text-sm">
            <p className="text-zinc-500 mb-2">API Key:</p>
            <p className="text-theme-primary break-all">{apiKey || "dvf_sk_live_a1b2c3d4e5f6g7h8i9j0"}</p>
          </div>
          <Button
            variant="outline"
            onClick={generateNewApiKey}
            className="w-full border-zinc-800 bg-transparent hover:bg-zinc-800"
          >
            Generate New Key
          </Button>
        </CardContent>
      </Card>

      {/* Categories Settings */}
      <CategoriesSettings />

      {/* Budgets Settings */}
      <BudgetsSettings />

      {/* Auto Backup */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-green-500" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                Backup Automático
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      <strong>Backup Automático</strong> salva seus dados automaticamente em intervalos regulares.
                      Configure a frequência e mantenha seus dados sempre seguros.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                Configure backups automáticos dos seus dados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <Label className="text-zinc-100">Ativar Backup Automático</Label>
              <p className="text-xs text-zinc-500 font-mono">Backups periódicos dos seus dados</p>
            </div>
            <Button
              size="sm"
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={autoBackupEnabled ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800"}
            >
              {autoBackupEnabled ? <Check className="w-4 h-4 mr-2" /> : null}
              {autoBackupEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {autoBackupEnabled && (
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-300 text-sm mb-2 block">Frequência</Label>
                <Select
                  value={autoBackupFrequency}
                  onValueChange={(value) => setAutoBackupFrequency(value as BackupFrequency)}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {lastBackup && (
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 font-mono mb-1">Último backup:</p>
                  <p className="text-sm text-zinc-300 font-mono">
                    {new Date(lastBackup).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={performBackup}
                className="w-full border-zinc-800 bg-transparent hover:bg-zinc-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Fazer Backup Agora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-blue-500" />
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                {t("settings.backup", lang)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Faça <strong>backup e exporte</strong> seus dados financeiros.
                      Você pode exportar para JSON ou CSV para manter um registro seguro ou usar em outras ferramentas.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-sm">
                {t("settings.backup.desc", lang)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleExportJSON}
              className="border-zinc-800 bg-transparent hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-zinc-800 bg-transparent hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="pt-3 border-t border-zinc-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 text-sm">Importar Dados</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  className="border-zinc-800 bg-transparent hover:bg-zinc-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                Importe dados de backup JSON ou transações de CSV
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Importar Dados</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Escolha um arquivo JSON ou CSV para importar seus dados financeiros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Modo de Importação</Label>
              <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as "merge" | "replace")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="merge" id="merge" className="border-zinc-700" />
                  <Label htmlFor="merge" className="text-zinc-300 cursor-pointer">
                    Mesclar (adicionar aos dados existentes)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" className="border-zinc-700" />
                  <Label htmlFor="replace" className="text-zinc-300 cursor-pointer">
                    Substituir (substituir todos os dados)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-zinc-500 font-mono">
                {importMode === "merge"
                  ? "Os dados importados serão adicionados aos dados existentes."
                  : "⚠️ Todos os dados atuais serão substituídos pelos dados importados."}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-zinc-300 text-sm mb-2 block">Importar JSON (Backup Completo)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJSON}
                    className="hidden"
                    id="import-json"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("import-json")?.click()}
                    className="border-zinc-800 bg-transparent hover:bg-zinc-800 flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar JSON
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Importa transações, cartões, metas, dívidas e fundo de emergência
                </p>
              </div>

              <div>
                <Label className="text-zinc-300 text-sm mb-2 block">Importar CSV (Apenas Transações)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCSV}
                    className="hidden"
                    id="import-csv"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("import-csv")?.click()}
                    className="border-zinc-800 bg-transparent hover:bg-zinc-800 flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar CSV
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Colunas: Date, Description, Category, Tags, Account, Amount
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              className="border-zinc-800 bg-transparent"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
