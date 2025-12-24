/**
 * Hook for fetching and managing currency exchange rates
 */

import { useState, useEffect, useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface ExchangeRate {
  code: string
  name: string
  rate: number
  change24h?: number
  lastUpdated: string
}

export interface ExchangeRatesData {
  base: string
  rates: ExchangeRate[]
  lastUpdated: string
}

// Main currencies to track
const MAIN_CURRENCIES = [
  { code: "USD", name: "Dólar Americano", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "Libra Esterlina", flag: "🇬🇧" },
  { code: "JPY", name: "Iene Japonês", flag: "🇯🇵" },
  { code: "CNY", name: "Yuan Chinês", flag: "🇨🇳" },
  { code: "CAD", name: "Dólar Canadense", flag: "🇨🇦" },
  { code: "AUD", name: "Dólar Australiano", flag: "🇦🇺" },
  { code: "CHF", name: "Franco Suíço", flag: "🇨🇭" },
  { code: "ARS", name: "Peso Argentino", flag: "🇦🇷" },
  { code: "BTC", name: "Bitcoin", flag: "₿" },
]

const STORAGE_KEY = "devfinance_exchange_rates"
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export function useExchangeRates() {
  const [rates, setRates] = useLocalStorage<ExchangeRatesData | null>(STORAGE_KEY, null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if we have cached data that's still fresh
      if (rates?.lastUpdated) {
        const lastUpdate = new Date(rates.lastUpdated).getTime()
        const now = Date.now()
        if (now - lastUpdate < CACHE_DURATION) {
          setLoading(false)
          return rates
        }
      }

      // Fetch from API com BRL como base (mais preciso e alinhado com Google)
      // Esta API retorna valores com BRL como base, similar ao Google
      let apiResponse: any = null
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        // API que retorna cotações com BRL como base (1 BRL = X moeda)
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/BRL`,
          { 
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          }
        )
        
        clearTimeout(timeoutId)

        if (response.ok) {
          apiResponse = await response.json()
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (apiError) {
        console.warn("Primary API failed, using fallback:", apiError)
        // Fallback com valores aproximados
        apiResponse = {
          rates: {
            BRL: 1,
            USD: 0.179, // 1 BRL = 0.179 USD, então 1 USD = 5.59 BRL
            EUR: 0.152,
            GBP: 0.133,
            JPY: 27.92,
            CNY: 1.26,
            CAD: 0.245,
            AUD: 0.267,
            CHF: 0.141,
            ARS: 259.89,
          },
        }
      }

      // Convert API response to our format
      // A API retorna: 1 BRL = X moeda
      // Nós queremos: 1 moeda = ? BRL
      // Então: rate = 1 / (valor da API)
      const exchangeRates: ExchangeRate[] = MAIN_CURRENCIES.map((currency) => {
        let rate = 1 // Default for BRL
        
        if (currency.code === "BTC") {
          // Para Bitcoin, calcular via USD
          // API retorna 1 BRL = X USD, então 1 USD = 1/X BRL
          const brlToUsd = apiResponse.rates?.USD || 0.179
          const usdToBrl = 1 / brlToUsd
          const btcToUsd = 65000 // Aproximado - em produção usar API de cripto
          rate = btcToUsd * usdToBrl
        } else if (currency.code === "USD") {
          // API retorna 1 BRL = X USD, então 1 USD = 1/X BRL
          const brlToUsd = apiResponse.rates?.USD || 0.179
          rate = 1 / brlToUsd
        } else if (apiResponse.rates && apiResponse.rates[currency.code]) {
          // API retorna 1 BRL = X moeda, então 1 moeda = 1/X BRL
          const brlToCurrency = apiResponse.rates[currency.code]
          rate = 1 / brlToCurrency
        } else {
          // Fallback para moedas não encontradas
          const fallbackBrlRates: Record<string, number> = {
            EUR: 0.152,
            GBP: 0.133,
            JPY: 27.92,
            CNY: 1.26,
            CAD: 0.245,
            AUD: 0.267,
            CHF: 0.141,
            ARS: 259.89,
          }
          const fallbackBrlRate = fallbackBrlRates[currency.code]
          if (fallbackBrlRate) {
            rate = 1 / fallbackBrlRate
          }
        }

        return {
          code: currency.code,
          name: currency.name,
          rate: parseFloat(rate.toFixed(4)), // Arredondar para 4 casas decimais
          lastUpdated: new Date().toISOString(),
        }
      })

      const ratesData: ExchangeRatesData = {
        base: "BRL",
        rates: exchangeRates,
        lastUpdated: new Date().toISOString(),
      }

      setRates(ratesData)
      setLoading(false)
      return ratesData
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch exchange rates")
      setLoading(false)
      
      // Return cached data if available, even if stale
      if (rates) {
        return rates
      }
      
      throw err
    }
  }, [rates, setRates])

  // Fetch rates on mount and periodically
  useEffect(() => {
    fetchRates().catch(() => {
      // Error already handled in fetchRates
    })

    // Refresh every hour
    const interval = setInterval(() => {
      fetchRates().catch(() => {
        // Error already handled in fetchRates
      })
    }, CACHE_DURATION)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const refreshRates = useCallback(() => {
    return fetchRates()
  }, [fetchRates])

  return {
    rates,
    loading,
    error,
    refreshRates,
    currencies: MAIN_CURRENCIES,
  }
}

