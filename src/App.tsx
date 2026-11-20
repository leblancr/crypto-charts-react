import {useEffect, useState} from 'react'
import AuthModal from './AuthModal'
import './App.css'
import Watchlist from './Watchlist'
import CoinSidebar from './CoinSidebar'
import type {TopCoin} from './CoinSidebar'
import PriceChart from './PriceChart'
import {API_BASE} from './lib/constants'

type AuthMode = 'login' | 'register' | null

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // Logged-out demo watchlist
  const [demoSelected, setDemoSelected] = useState('bitcoin')
  const [demoCoins, setDemoCoins] = useState(['bitcoin', 'ethereum', 'solana'])
  const [newDemoCoin, setNewDemoCoin] = useState('')

  const [topCoins, setTopCoins] = useState<TopCoin[]>([])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('username')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsername(storedUser)
    }

    fetch(`${API_BASE}/coins/top50`)
      .then((resp) => resp.json())
      .then(setTopCoins)
      .catch(console.error)
  }, [])

  function handleLoginSuccess(newToken: string, newUsername: string) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
    setAuthMode(null)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
    setSelected(null)
    setAuthMode('login')
  }

  function addDemoCoin() {
    if (!newDemoCoin || demoCoins.includes(newDemoCoin)) return
    setDemoCoins([...demoCoins, newDemoCoin])
    setDemoSelected(newDemoCoin)
    setNewDemoCoin('')
  }

  function removeDemoCoin(id: string) {
    const remaining = demoCoins.filter((c) => c !== id)
    setDemoCoins(remaining)
    if (demoSelected === id) setDemoSelected(remaining[0] ?? '')
  }

  const loggedIn = Boolean(username && token)

  return (
    <main className="app">
      <header className="app-header">
        <h1>Crypto Charts</h1>

        <nav className="auth-buttons">
          {username ? (
            <>
              <span>Logged in as <strong>{username}</strong></span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setAuthMode('login')}>Login</button>
              <span>|</span>
              <button onClick={() => setAuthMode('register')}>Register</button>
            </>
          )}
        </nav>
      </header>

      {authMode && (
        <AuthModal
          isRegister={authMode === 'register'}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setAuthMode(null)}
        />
      )}

      <div className="demo-layout">
        {loggedIn ? (
          <Watchlist
            topCoins={topCoins}
            onCoinSelected={setSelected}
            onUnauthorized={logout}
          />
        ) : (
          <CoinSidebar
            coinIds={demoCoins}
            topCoins={topCoins}
            selected={demoSelected}
            onSelect={setDemoSelected}
            newCoin={newDemoCoin}
            onNewCoinChange={setNewDemoCoin}
            onAdd={addDemoCoin}
            onRemove={removeDemoCoin}
          />
        )}

        <div className="demo-chart-panel">
          {loggedIn
            ? selected && <PriceChart symbol={selected}/>
            : demoSelected && <PriceChart symbol={demoSelected}/>}
        </div>
      </div>
    </main>
  )
}

export default App