import nlp from 'compromise'

const INTENT_MAP = [
  { patterns: ['user','admin','member','people','staff','role'],  route: '/users',     label: 'Users' },
  { patterns: ['content','post','article','blog','page','draft'], route: '/content',   label: 'Content' },
  { patterns: ['analytics','stats','metric','chart','data','market','crypto','bitcoin'], route: '/analytics', label: 'Analytics' },
  { patterns: ['dashboard','home','overview','summary','main'],   route: '/dashboard', label: 'Dashboard' },
  { patterns: ['setting','profile','account','password','theme','preference'], route: '/settings', label: 'Settings' },
]

export function detectSearchIntent(query) {
  if (!query?.trim()) return null
  const words = nlp(query.toLowerCase()).terms().out('array')
  for (const { patterns, route, label } of INTENT_MAP) {
    if (words.some((w) => patterns.some((p) => w.includes(p)))) return { route, label }
  }
  return null
}

export function detectAnomalies(dataPoints) {
  if (!dataPoints || dataPoints.length < 3) return dataPoints ?? []
  const values = dataPoints.map((d) => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const std  = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length)
  return dataPoints.map((d) => ({
    ...d,
    isAnomaly: std > 0 && Math.abs(d.value - mean) > 2.2 * std,
    zScore: std > 0 ? parseFloat(((d.value - mean) / std).toFixed(2)) : 0,
  }))
}

export function computeTrendLine(dataPoints) {
  if (!dataPoints || dataPoints.length < 2) return dataPoints ?? []
  const n   = dataPoints.length
  const xs  = dataPoints.map((_, i) => i)
  const ys  = dataPoints.map((d) => d.value)
  const sx  = xs.reduce((a, b) => a + b, 0)
  const sy  = ys.reduce((a, b) => a + b, 0)
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const sx2 = xs.reduce((a, x) => a + x * x, 0)
  const slope     = (n * sxy - sx * sy) / (n * sx2 - sx ** 2) || 0
  const intercept = (sy - slope * sx) / n
  return dataPoints.map((d, i) => ({ ...d, trend: parseFloat((slope * i + intercept).toFixed(2)) }))
}

const POS = ['good','great','excellent','amazing','love','best','awesome','fantastic','perfect','wonderful','brilliant','outstanding']
const NEG = ['bad','terrible','awful','hate','worst','horrible','poor','wrong','fail','error','broken','useless','slow','bug']

export function scoreContentSentiment(text) {
  if (!text) return { score: 0, label: 'neutral' }
  const words = nlp(text.toLowerCase()).terms().out('array')
  let score = 0
  words.forEach((w) => { if (POS.includes(w)) score++; if (NEG.includes(w)) score-- })
  return { score, label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral' }
}