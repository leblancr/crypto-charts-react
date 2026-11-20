import {useEffect, useState} from 'react'
import CoinSidebar from './CoinSidebar'
import type {TopCoin} from './CoinSidebar'
import {authFetch} from './lib/authFetch'
import {API_BASE} from './lib/constants'

type Props = {
  topCoins: TopCoin[]
  onCoinSelected: (coin: string | null) => void
  onUnauthorized?: () => void
}

export default function Watchlist({topCoins, onCoinSelected, onUnauthorized}: Props) {
  const [coinIds, setCoinIds] = useState<string[]>([])
  const [newCoin, setNewCoin] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  function select(coin: string | null) {
    setSelected(coin)
    onCoinSelected(coin)
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

    const list: { coingecko_id: string }[] = await resp.json()
    setCoinIds(list.map((c) => c.coingecko_id))
    select(list[0]?.coingecko_id ?? null)
  }

  async function addCoin() {
    if (!localStorage.getItem('token')) {
      setStatusMsg('Not logged in.')
      return
    }
    if (!newCoin) return

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

  async function removeCoin(id: string) {
    const resp = await authFetch(`/watchlist/${id}`, {method: 'DELETE'})
    if (resp.ok) {
      await loadWatchlist()
    } else {
      console.error('Remove failed:', await resp.text())
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [])

  return (
    <CoinSidebar
      coinIds={coinIds}
      topCoins={topCoins}
      selected={selected}
      onSelect={select}
      newCoin={newCoin}
      onNewCoinChange={setNewCoin}
      onAdd={addCoin}
      onRemove={removeCoin}
      statusMsg={statusMsg}
    />
  )
}