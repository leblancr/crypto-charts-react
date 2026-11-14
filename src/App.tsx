import {useEffect, useState} from 'react'
import AuthModal from './AuthModal'
import './App.css'
import Watchlist from './Watchlist'
import PriceChart from './PriceChart'

type AuthMode = 'login' | 'register' | null
type TopCoin = { id: string; symbol: string; name: string }

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // Public landing-page demonstration
  const [demoSelected, setDemoSelected] = useState('bitcoin')
  const [demoCoins, setDemoCoins] = useState([
    'bitcoin',
    'ethereum',
    'solana',
  ])
  const [topCoins, setTopCoins] = useState<TopCoin[]>([])
  const [newDemoCoin, setNewDemoCoin] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('username')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsername(storedUser)
    }

    fetch('http://127.0.0.1:9000/coins/top50')
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


      {loggedIn ? (
        <div className="demo-layout">
          <Watchlist
            onCoinSelected={setSelected}
            onUnauthorized={logout}
          />
          <div className="demo-chart-panel">
            {selected && <PriceChart symbol={selected}/>}
          </div>
        </div>
      ) : (
        <div className="demo-layout">
          <section className="demo-watchlist">
            <h3>Your Watchlist</h3>
            <div className="demo-coin-list">
              {demoCoins.map((id) => {
                const coin = topCoins.find((c) => c.id === id)
                return (
                  <button
                    type="button"
                    key={id}
                    className={demoSelected === id ? 'demo-coin selected' : 'demo-coin'}
                    onClick={() => setDemoSelected(id)}
                  >
                    <strong>
                      {coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : id.toUpperCase()}
                    </strong>
                  </button>
                )
              })}
            </div>

            <div className="demo-controls">
              <select
                value={newDemoCoin}
                onChange={(e) => setNewDemoCoin(e.target.value)}
              >
                <option value="">Add coin...</option>
                {topCoins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol.toUpperCase()} - {coin.name}
                  </option>
                ))}
              </select>
              <button onClick={addDemoCoin} disabled={!newDemoCoin}>
                Add Coin
              </button>
            </div>
          </section>

          <div className="demo-chart-panel">
            <PriceChart symbol={demoSelected}/>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
