import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { detectAnomalies, computeTrendLine } from '@/utils/aiHelpers'

export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn:  () => analyticsApi.getCryptoPrices().then((r) => r.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useMarketGlobal() {
  return useQuery({
    queryKey: ['market-global'],
    queryFn:  () => analyticsApi.getMarketGlobal().then((r) => r.data.data),
    refetchInterval: 120_000,
    staleTime: 60_000,
  })
}

export function useCoinHistory(coinId = 'bitcoin', days = 30) {
  return useQuery({
    queryKey: ['coin-history', coinId, days],
    queryFn: async () => {
      const res = await analyticsApi.getCoinHistory(coinId, days)
      const raw = res.data.prices.map(([ts, v]) => ({
        date:  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(v.toFixed(2)),
      }))
      return computeTrendLine(detectAnomalies(raw))
    },
    staleTime: 60_000,
  })
}

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn:  () => analyticsApi.getTrending().then((r) => r.data),
    staleTime: 300_000,
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn:  () => analyticsApi.getCountries().then((r) => r.data),
    staleTime: 3_600_000,
  })
}

export function useWebsiteAnalytics() {
  return useQuery({
    queryKey: ['website-analytics'],
    queryFn: () => analyticsApi.getWebsiteAnalytics().then(r => r.data),
    staleTime: 300_000,
  })
}