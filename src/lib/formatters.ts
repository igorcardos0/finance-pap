/**
 * Utility functions for formatting financial data
 */

/**
 * Formats a number as currency in Brazilian Real (BRL)
 * @param value - The numeric value to format
 * @param locale - The locale string (default: "pt-BR")
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number, locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats a date string or Date object to a localized date string
 * @param date - The date to format (string or Date object)
 * @param locale - The locale string (default: "pt-BR")
 * @returns Formatted date string (e.g., "01/01/2024")
 */
export function formatDate(date: string | Date, locale: string = "pt-BR"): string {
  return new Date(date).toLocaleDateString(locale)
}

/**
 * Formats a number as a percentage
 * @param value - The numeric value to format (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "75.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formats a number with thousand separators
 * @param value - The numeric value to format
 * @param locale - The locale string (default: "pt-BR")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., "1.234,56")
 */
export function formatNumber(value: number, locale: string = "pt-BR", decimals: number = 2): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formats currency without the currency symbol (just the number)
 * @param value - The numeric value to format
 * @param locale - The locale string (default: "pt-BR")
 * @returns Formatted number string with currency format but no symbol (e.g., "1.234,56")
 */
export function formatCurrencyValue(value: number, locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

