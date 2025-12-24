"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"

type Language = "pt" | "en" | "es"

interface Translations {
  [key: string]: {
    pt: string
    en: string
    es: string
  }
}

export const translations: Translations = {
  // Navigation
  "nav.dashboard": { pt: "Painel", en: "Dashboard", es: "Panel" },
  "nav.summary": { pt: "Resumo", en: "Summary", es: "Resumen" },
  "nav.transactions": { pt: "Transações", en: "Transactions", es: "Transacciones" },
  "nav.cards": { pt: "Cartões", en: "Credit Cards", es: "Tarjetas" },
  "nav.debts": { pt: "Dívidas", en: "Debts", es: "Deudas" },
  "nav.planning": { pt: "Planejamento", en: "Planning & Goals", es: "Planificación" },
  "nav.settings": { pt: "Configurações", en: "Settings", es: "Configuración" },

  // Dashboard
  "dashboard.runway": { pt: "Runway Mensal", en: "Monthly Runway", es: "Pista Mensual" },
  "dashboard.runway.months": { pt: "meses de sobrevivência", en: "months of survival", es: "meses de supervivencia" },
  "dashboard.networth": { pt: "Patrimônio Líquido", en: "Net Worth YTD", es: "Patrimonio Neto" },
  "dashboard.revenue": { pt: "Receita Total", en: "Total Revenue", es: "Ingresos Totales" },
  "dashboard.burn": { pt: "Queima Total", en: "Total Burn", es: "Quema Total" },
  "dashboard.vs.last": { pt: "vs mês passado", en: "vs last month", es: "vs mes pasado" },
  "dashboard.vs.year": { pt: "vs ano passado", en: "vs last year", es: "vs año pasado" },
  "dashboard.spending.alert": { pt: "alerta de gastos", en: "spending alert", es: "alerta de gastos" },
  "dashboard.chart.title": { pt: "Receita vs Despesas", en: "Revenue vs Expenses", es: "Ingresos vs Gastos" },
  "dashboard.chart.subtitle": {
    pt: "Desempenho dos últimos 12 meses",
    en: "Last 12 months performance",
    es: "Rendimiento de los últimos 12 meses",
  },
  "dashboard.heatmap": { pt: "Mapa de Calor de Gastos", en: "Spending Heatmap", es: "Mapa de Calor de Gastos" },
  "dashboard.daily": { pt: "Atividade diária", en: "Daily activity", es: "Actividad diaria" },

  // Transactions
  "transactions.title": { pt: "Transações", en: "Transactions", es: "Transacciones" },
  "transactions.search": { pt: "Buscar transações...", en: "Search transactions...", es: "Buscar transacciones..." },
  "transactions.filters": { pt: "Filtros", en: "Filters", es: "Filtros" },
  "transactions.date": { pt: "Data", en: "Date", es: "Fecha" },
  "transactions.description": { pt: "Descrição", en: "Description", es: "Descripción" },
  "transactions.category": { pt: "Categoria", en: "Category", es: "Categoría" },
  "transactions.tags": { pt: "Tags", en: "Tags", es: "Etiquetas" },
  "transactions.account": { pt: "Conta", en: "Account", es: "Cuenta" },
  "transactions.amount": { pt: "Valor", en: "Amount", es: "Monto" },

  // Login
  "login.title": { pt: "Iniciar Sessão", en: "Sign In", es: "Iniciar Sesión" },
  "login.subtitle": {
    pt: "Gestão financeira para devs",
    en: "Financial management for devs",
    es: "Gestión financiera para devs",
  },
  "login.email": { pt: "Digite seu e-mail", en: "Enter your email", es: "Ingresa tu correo" },
  "login.magic": { pt: "Enviar Magic Link", en: "Send Magic Link", es: "Enviar Magic Link" },
  "login.or": { pt: "ou continue com", en: "or continue with", es: "o continúa con" },
  "login.github": { pt: "GitHub", en: "GitHub", es: "GitHub" },
  "login.google": { pt: "Google", en: "Google", es: "Google" },
  "login.terms": {
    pt: "Ao continuar, você concorda com nossos Termos de Serviço",
    en: "By continuing, you agree to our Terms of Service",
    es: "Al continuar, aceptas nuestros Términos de Servicio",
  },

  // Settings
  "settings.title": { pt: "Configurações", en: "Settings", es: "Configuración" },
  "settings.language": { pt: "Idioma", en: "Language", es: "Idioma" },
  "settings.language.desc": {
    pt: "Escolha o idioma da interface",
    en: "Choose interface language",
    es: "Elige el idioma de la interfaz",
  },
  "settings.theme": { pt: "Tema", en: "Theme", es: "Tema" },
  "settings.theme.desc": { pt: "Personalizar aparência", en: "Customize appearance", es: "Personalizar apariencia" },
  "settings.notifications": { pt: "Notificações", en: "Notifications", es: "Notificaciones" },
  "settings.notifications.desc": {
    pt: "Gerenciar preferências de notificação",
    en: "Manage notification preferences",
    es: "Gestionar preferencias de notificación",
  },
  "settings.security": { pt: "Segurança", en: "Security", es: "Seguridad" },
  "settings.security.desc": {
    pt: "Senhas e autenticação",
    en: "Passwords and authentication",
    es: "Contraseñas y autenticación",
  },
  "settings.api": { pt: "Chaves API", en: "API Keys", es: "Claves API" },
  "settings.api.desc": {
    pt: "Gerenciar integrações e webhooks",
    en: "Manage integrations and webhooks",
    es: "Gestionar integraciones y webhooks",
  },
  "settings.backup": { pt: "Backup & Exportar", en: "Backup & Export", es: "Backup y Exportar" },
  "settings.backup.desc": { pt: "Baixar seus dados", en: "Download your data", es: "Descargar tus datos" },

  // Button Actions
  "btn.new.transaction": { pt: "Nova Transação", en: "New Transaction", es: "Nueva Transacción" },
  "btn.save": { pt: "Salvar", en: "Save", es: "Guardar" },
  "btn.cancel": { pt: "Cancelar", en: "Cancel", es: "Cancelar" },
  "btn.export": { pt: "Exportar", en: "Export", es: "Exportar" },

  // User status
  "user.online": { pt: "Online", en: "Online", es: "En línea" },
  "user.offline": { pt: "Offline", en: "Offline", es: "Desconectado" },

  // Categories
  "category.income": { pt: "Receita", en: "Income", es: "Ingresos" },
  "category.food": { pt: "Alimentação", en: "Food", es: "Comida" },
  "category.housing": { pt: "Moradia", en: "Housing", es: "Vivienda" },
  "category.fixed": { pt: "Conta Fixa", en: "Fixed", es: "Fija" },
  "category.education": { pt: "Educação", en: "Education", es: "Educación" },
  "category.health": { pt: "Saúde", en: "Health", es: "Salud" },
  "category.transport": { pt: "Transporte", en: "Transport", es: "Transporte" },
  "category.leisure": { pt: "Lazer", en: "Leisure", es: "Ocio" },
  "category.utilities": { pt: "Utilidades", en: "Utilities", es: "Servicios" },
  "category.debt": { pt: "Dívida", en: "Debt", es: "Deuda" },
}

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key
}

export function useLanguage() {
  const [lang] = useLocalStorage<Language>("devfinance_lang", "pt")
  return lang
}

export function setLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("devfinance_lang", JSON.stringify(lang))
    window.dispatchEvent(new Event("languageChange"))
  }
}

/**
 * Translate category name based on category ID
 * Returns translated name for default categories, or original name for custom categories
 */
export function translateCategoryName(categoryIdOrName: string, lang: Language): string {
  const translationKey = `category.${categoryIdOrName.toLowerCase()}`
  const translated = translations[translationKey]?.[lang]
  
  // If translation exists, return it
  if (translated) {
    return translated
  }
  
  // Otherwise return the original name (for custom categories or unknown categories)
  return categoryIdOrName
}
