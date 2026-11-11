import {useEffect, useRef, useState} from 'react'
import Chart from 'chart.js/auto'
import {API_BASE} from './lib/constants'

type Props = { symbol: string; ticker?: string | null }

export default function PriceChart({symbol, ticker = null}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [days, setDays] = useState('30')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadChart() {
      const resp = await fetch(`${API_BASE}/coins/${symbol}/history?days=${days}`)
      if (cancelled) return
      if (!resp.ok) {
        setErrorMessage(
          resp.status === 429
            ? '⚠️ Too many requests — please wait a moment and try again.'
            : `⚠️ Error loading chart: ${resp.statusText}`
        )
        return
      }
      setErrorMessage(null)

      const data = await resp.json()
      if (cancelled || !canvasRef.current) return

      const labels = data.map((d: any) => new Date(d.timestamp).toLocaleString())
      const values = data.map((d: any) => d.price)

      chartRef.current?.destroy()
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: ticker ? `${ticker.toUpperCase()} / ${symbol}` : symbol.toUpperCase(),
              data: values,
              borderColor: 'rgba(43,245,39,0.75)',
              backgroundColor: 'rgba(54,162,235,0.1)',
              borderWidth: 2,
              fill: true,
              pointRadius: 0,
              tension: 0.2,
            },
          ],
        },
        options: {responsive: true, maintainAspectRatio: false},
      })
    }

    loadChart()
    return () => {
      cancelled = true
    }
  }, [symbol, days])

  useEffect(() => {
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  return (
    <>
      {errorMessage && (
        <div style={{
          margin: '1rem',
          padding: '0.5rem',
          background: '#fee',
          color: '#900',
          border: '1px solid #c00',
          borderRadius: 6
        }}>
          {errorMessage}
        </div>
      )}

      <div style={{marginTop: '1rem'}}>
        <label htmlFor="days">Range:</label>{' '}
        <select id="days" value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="1">1 day (minute data)</option>
          <option value="7">7 days (hourly)</option>
          <option value="30">30 days (hourly)</option>
          <option value="90">90 days (hourly)</option>
          <option value="365">365 days (daily)</option>
        </select>
      </div>

      <div style={{height: 400, marginTop: '1rem'}}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  )
}