// pages/signup.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)
    if (signError) {
      setError(signError.message)
    } else {
      // Go to verify‑email page
      router.push('/verify-email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-purple-700 mb-6">
          Create an Account
        </h1>

        {error && (
          <p className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        <label className="block text-gray-700 mb-2">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-gray-700 mb-2">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading
              ? 'bg-purple-300'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? 'Signing Up…' : 'Sign Up'}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login">
            <a className="text-purple-600 hover:underline">
              Log in
            </a>
          </Link>
        </p>
      </form>
    </div>
  )
}

