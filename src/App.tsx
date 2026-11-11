
import { useState } from 'react'
import AuthModal from './AuthModal'
import './App.css'

type AuthMode = 'login' | 'register' | null

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [username, setUsername] = useState('')

  function handleLoginSuccess(token: string, username: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    setUsername(username)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Crypto Charts</h1>

        <nav className="auth-buttons">
          {username ? (
            <span>{username}</span>
          ) : (
            <>
              <button onClick={() => setAuthMode('login')}>
                Login
              </button>
              <span>|</span>
              <button onClick={() => setAuthMode('register')}>
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      <section className="app-content">
        <p>Cryptocurrency market dashboard</p>
      </section>

      {authMode && (
        <AuthModal
          isRegister={authMode === 'register'}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setAuthMode(null)}
        />
      )}
    </main>
  )
}

export default App
