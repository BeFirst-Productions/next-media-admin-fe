import React, { useRef, useEffect, useState, useMemo } from 'react'
import Globe from 'react-globe.gl'
import { scaleLinear } from 'd3-scale'
import { useThemeStore } from '@/store/themeStore'

export function WorldMap({ data }) {
  const globeEl = useRef()
  const containerRef = useRef()
  const [countries, setCountries] = useState({ features: [] })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { theme } = useThemeStore()

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries)
  }, [])

  useEffect(() => {
    const ob = new ResizeObserver((entries) => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: Math.max(400, entries[0].contentRect.height)
      })
    })
    if (containerRef.current) ob.observe(containerRef.current)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.5
      globeEl.current.pointOfView({ altitude: 2.2 })
    }
  }, [dimensions])

  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const colorScale = useMemo(() => scaleLinear().domain([0, maxValue]).range(['#a5b8fc', '#4f46e5']), [maxValue])

  return (
    <div ref={containerRef} className="w-full h-full relative min-h-[400px] bg-transparent rounded-xl overflow-hidden flex items-center justify-center cursor-move">
      {dimensions.width > 0 && countries.features.length > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={theme === 'dark' ? "//unpkg.com/three-globe/example/img/earth-night.jpg" : "//unpkg.com/three-globe/example/img/earth-day.jpg"}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          polygonsData={countries.features.filter(d => d.properties.ISO_A3 !== 'AQ')}
          polygonAltitude={d => {
            const countryData = data.find(c => c.id === d.properties.ISO_A3)
            return countryData ? 0.01 + (countryData.value / maxValue) * 0.05 : 0.005
          }}
          polygonCapColor={d => {
            const countryData = data.find(c => c.id === d.properties.ISO_A3)
            return countryData ? colorScale(countryData.value) : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
          }}
          polygonSideColor={() => theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'}
          polygonStrokeColor={() => theme === 'dark' ? '#111' : '#ccc'}
          polygonLabel={({ properties: d }) => {
            const countryData = data.find(c => c.id === d.ISO_A3)
            const val = countryData ? countryData.value.toLocaleString() : 0
            return `
              <div class="bg-gray-900/90 text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-gray-700/50 backdrop-blur-sm">
                <p class="font-bold mb-1">${d.ADMIN}</p>
                <p class="text-gray-300">Visitors: <span class="font-semibold text-brand-400">${val}</span></p>
              </div>
            `
          }}
        />
      )}
    </div>
  )
}

