
import { useState } from 'react'
import { API_BASE } from './lib/constants'
import './AuthModal.css'

type AuthModalProps = {
  isRegister?: boolean
  onLoginSuccess: (token: string, username: string) => void
  onClose: () => void
}

type AuthMode = 'login' | 'register' | 'forgot'

function AuthModal({
  isRegister = false,
  onLoginSuccess,
  onClose,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(
    isRegister ? 'register' : 'login',
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode(newMode: AuthMode) {
    setMode(newMode)
    setErrorMessage(null)
    setMessage(null)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setNewPassword('')
  }

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setMessage(null)

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    const endpoint = mode === 'register' ? 'register' : 'login'

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.detail || 'Authentication failed')
        return
      }

      if (mode === 'register') {
        setMessage('User created, now log in!')
        setMode('login')
        setPassword('')
      } else {
        onLoginSuccess(data.access_token, username)
        onClose()
      }
    } catch {
      setErrorMessage('Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setMessage(null)
    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE}/auth/reset-password-direct`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            new_password: newPassword,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.detail || 'Reset failed')
        return
      }

      setMessage('Password updated. You can log in with the new password.')
      setMode('login')
      setPassword('')
      setNewPassword('')
    } catch {
      setErrorMessage('Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        {mode === 'login' && (
          <>
            <h2>Login</h2>
            <form onSubmit={handleAuth}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Login'}
              </button>
            </form>

            {errorMessage && (
              <>
                <p className="auth-error">{errorMessage}</p>
                <button
                  className="auth-link"
                  onClick={() => switchMode('forgot')}
                >
                  Forgot password?
                </button>
              </>
            )}
          </>
        )}

        {mode === 'register' && (
          <>
            <h2>Register</h2>
            <form onSubmit={handleAuth}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Register'}
              </button>
            </form>
            <button
              className="auth-link"
              onClick={() => switchMode('login')}
            >
              Already have an account? Login
            </button>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2>Reset Password</h2>
            <form onSubmit={handleReset}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Update password'}
              </button>
            </form>
            <button
              className="auth-link"
              onClick={() => switchMode('login')}
            >
              Back to login
            </button>
          </>
        )}

        {errorMessage && mode !== 'login' && (
          <p className="auth-error">{errorMessage}</p>
        )}

        {message && <p className="auth-message">{message}</p>}

        <button className="auth-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default AuthModal
