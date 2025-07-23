import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setMessage('')
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    setLoading(false)
    if (signupError) {
      setError(signupError.message)
    } else {
      setMessage('Check your email for a confirmation link to complete your registration.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSignup} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}
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
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-purple-700 underline">Log In</a>
        </p>
      </form>
    </div>
  )
}