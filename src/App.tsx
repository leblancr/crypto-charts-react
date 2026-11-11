import {useEffect, useState} from 'react'
import AuthModal from './AuthModal'
import './App.css'
import Watchlist from './Watchlist'
import PriceChart from './PriceChart'

type AuthMode = 'login' | 'register' | null

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // restore login after refresh (same as onMount in the Svelte page)
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('username')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUsername(storedUser)
    }
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

      {username && token && (
        <Watchlist onCoinSelected={setSelected} onUnauthorized={logout}/>
      )}

      {selected && <PriceChart symbol={selected}/>}
    </main>
  )
}

export default App