// pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // If already logged in, send straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')  
    setLoading(true)

    const { error: loginError } = await supabase
      .auth
      .signInWithPassword({ email, password })

    setLoading(false)
    if (loginError) {
      setError(loginError.message)
    } else {
      // On success, redirect to homepage
      router.replace('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Log In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-2 text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded focus:ring-purple-500 focus:outline-none"
        />

        <label className="block mb-2 text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-6 border rounded focus:ring-purple-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-purple-700 underline">Sign Up</a>
        </p>
      </form>
    </div>
  )
}

