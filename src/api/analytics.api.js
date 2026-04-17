import axios from 'axios'

const coinGecko     = axios.create({ baseURL: 'https://api.coingecko.com/api/v3', timeout: 10000 })
const restCountries = axios.create({ baseURL: 'https://restcountries.com/v3.1',   timeout: 10000 })

export const analyticsApi = {
  getCryptoPrices: () =>
    coinGecko.get('/coins/markets', {
      params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 10, page: 1, sparkline: true, price_change_percentage: '24h,7d' },
    }),
  getMarketGlobal: () => coinGecko.get('/global'),
  getCoinHistory:  (coinId = 'bitcoin', days = 30) =>
    coinGecko.get(`/coins/${coinId}/market_chart`, { params: { vs_currency: 'usd', days } }),
  getTrending:     () => coinGecko.get('/search/trending'),
  getCountries:    () => restCountries.get('/all?fields=name,population,region,flags,area,cca3'),
  getWebsiteAnalytics: () => Promise.resolve({
    data: {
      activeUsers: 342,
      pageViews: 124500,
      uniqueVisitors: 45200,
      bounceRate: 42.5,
      avgSessionDuration: '2m 45s',
      dailyVisitors: Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.floor(2000 + Math.random() * 1500)
        };
      }),
      weeklyTraffic: Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(15000 + Math.random() * 5000)
        };
      }),
      visitorsByCountry: [
        { id: 'USA', name: 'United States', value: 15400 },
        { id: 'GBR', name: 'United Kingdom', value: 8200 },
        { id: 'IND', name: 'India', value: 6500 },
        { id: 'CAN', name: 'Canada', value: 4300 },
        { id: 'DEU', name: 'Germany', value: 3800 },
        { id: 'AUS', name: 'Australia', value: 2900 },
        { id: 'FRA', name: 'France', value: 2100 },
        { id: 'BRA', name: 'Brazil', value: 1500 },
      ],
      trafficSources: [
        { name: 'Organic Search', value: 45 },
        { name: 'Direct', value: 25 },
        { name: 'Social', value: 20 },
        { name: 'Referral', value: 10 },
      ]
    }
  })
}