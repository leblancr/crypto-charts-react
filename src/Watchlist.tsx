import {useEffect, useState} from 'react'
import {authFetch} from './lib/authFetch'
import {API_BASE} from './lib/constants'

type Coin = { coingecko_id: string; price?: number | null }
type TopCoin = { id: string; symbol: string; name: string }

type Props = {
  onCoinSelected: (coin: string | null) => void
  onUnauthorized?: () => void
}

export default function Watchlist({onCoinSelected, onUnauthorized}: Props) {
  const [watchlist, setWatchlist] = useState<Coin[]>([])
  const [topCoins, setTopCoins] = useState<TopCoin[]>([])
  const [newCoin, setNewCoin] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  function select(coin: string | null) {
    setSelected(coin)
    onCoinSelected(coin)
  }

  async function loadTopCoins() {
    const resp = await fetch(`${API_BASE}/coins/top50`)
    if (resp.ok) setTopCoins(await resp.json())
  }

  async function addPrices(list: Coin[]) {
    if (!list.length) return
    const ids = list.map((c) => c.coingecko_id).join(',')
    const resp = await fetch(`${API_BASE}/coins/current?symbols=${ids}`)
    if (resp.ok) {
      const data = await resp.json()
      setWatchlist(
        list.map((c) => ({...c, price: data[c.coingecko_id]?.usd || null}))
      )
    }
  }

  async function loadWatchlist() {
    const token = localStorage.getItem('token')
    if (!token) return

    const resp = await fetch(`${API_BASE}/watchlist/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (resp.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      onUnauthorized?.()
      return
    }
    if (!resp.ok) {
      console.error('Load failed:', resp.status, await resp.text())
      return
    }

    const list: Coin[] = await resp.json()
    setWatchlist(list)
    select(list[0]?.coingecko_id ?? null)
    await addPrices(list)
  }

  async function addCoin() {
    if (!localStorage.getItem('token')) {
      setStatusMsg('Not logged in.')
      return
    }
    if (!newCoin) {
      setStatusMsg('Select a coin first.')
      return
    }

    const resp = await authFetch(`/watchlist/${newCoin}`, {method: 'POST'})
    const data = await resp.json().catch(() => null)

    if (resp.ok) {
      setStatusMsg(data?.detail ?? 'Added.')
      const added = newCoin
      setNewCoin('')
      await loadWatchlist()
      select(added)
    }
  }

  async function removeCoin() {
    if (!selected) return
    const resp = await authFetch(`/watchlist/${selected}`, {method: 'DELETE'})
    if (resp.ok) {
      select(null)
      await loadWatchlist()
    } else {
      console.error('Remove failed:', await resp.text())
    }
  }

  useEffect(() => {
    loadTopCoins()
    loadWatchlist()
  }, [])

  return (
    <>
      <div>
        <select value={newCoin} onChange={(e) => setNewCoin(e.target.value)}>
          <option value="">-- Select coin --</option>
          {topCoins.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol.toUpperCase()} - {c.name}
            </option>
          ))}
        </select>
        <button onClick={addCoin}>Add Coin</button>
        <button onClick={removeCoin} disabled={!selected}>Remove</button>
        {statusMsg && <p style={{border: '1px solid #000', padding: 4}}>{statusMsg}</p>}
      </div>

      <div style={{marginTop: '1rem'}}>
        {watchlist.map((coin) => (
          <button
            key={coin.coingecko_id}
            className={coin.coingecko_id === selected ? 'selected' : ''}
            onClick={() => select(coin.coingecko_id)}
          >
            {coin.coingecko_id.toUpperCase()}
            {coin.price ? ` $${coin.price.toLocaleString()}` : ''}
          </button>
        ))}
      </div>
    </>
  )
}