import {useEffect, useRef, useState} from 'react'
import Chart from 'chart.js/auto'
import {API_BASE} from './lib/constants'
import './PriceChart.css'

type Props = { symbol: string; ticker?: string | null }

export default function PriceChart({symbol, ticker = null}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [days, setDays] = useState('365')
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadChart() {
      try {
        const [historyResp, currentResp] = await Promise.all([
          fetch(`${API_BASE}/coins/${symbol}/history?days=${days}`),
          fetch(`${API_BASE}/coins/current?symbols=${symbol}`)
        ])

        if (cancelled) return

        if (!historyResp.ok) {
          throw new Error(`Chart request failed: ${historyResp.status}`)
        }

        const data = await historyResp.json()

        if (!data.length) {
          throw new Error('No historical price data available.')
        }

        const currentData = currentResp.ok
          ? await currentResp.json()
          : null

        if (cancelled) return

        setCurrentPrice(currentData?.[symbol]?.usd ?? null)
        setErrorMessage(null)

        const labels = data.map((d: any) =>
          new Date(d.timestamp).toLocaleDateString()
        )
        const values = data.map((d: any) => d.price)

        chartRef.current?.destroy()

        if (!canvasRef.current) return

        chartRef.current = new Chart(canvasRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: ticker ? `${ticker.toUpperCase()} / ${symbol}` : symbol.toUpperCase(),
              data: values,
              borderColor: 'rgba(43,245,39,0.85)',
              backgroundColor: 'rgba(54,162,235,0.12)',
              borderWidth: 2,
              fill: true,
              pointRadius: 0,
              tension: 0.2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              legend: {
                labels: {
                  color: '#888'
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: '#888',
                  autoSkip: true,
                  maxTicksLimit: 8,
                  maxRotation: 0
                },
                grid: {
                  color: 'rgba(128,128,128,0.08)'
                }
              },
              y: {
                ticks: {
                  color: '#888',
                  callback: (value) =>
                    '$' + Number(value).toLocaleString()
                },
                grid: {
                  color: 'rgba(128,128,128,0.08)'
                }
              }
            }
          }
        })
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load chart.'
          )
        }
      }
    }

    loadChart()

    return () => {
      cancelled = true
    }
  }, [symbol, days, ticker])

  useEffect(() => {
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  return (
    <section className="price-chart">
      <div className="chart-heading">
        <div>
          <h2>{ticker ? ticker.toUpperCase() : symbol.toUpperCase()} Price</h2>
          {currentPrice !== null && (
            <p className="current-price">
              ${currentPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
            </p>
          )}
        </div>

        <div className="chart-range">
          <label htmlFor="days">Range:</label>
          <select
            id="days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="1">1 day (minute data)</option>
            <option value="7">7 days (hourly)</option>
            <option value="30">30 days (hourly)</option>
            <option value="90">90 days (hourly)</option>
            <option value="365">365 days (daily)</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <p className="chart-error">{errorMessage}</p>
      )}

      <div className="chart-canvas">
        <canvas ref={canvasRef}></canvas>
      </div>
    </section>
  )
}
