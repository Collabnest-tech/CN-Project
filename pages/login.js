// pages/login.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Check if user exists in custom users table, if not create entry
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist in custom table, create entry
          const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || '',
              has_paid: false,
              referral_code: referralCode,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('Error creating user entry:', insertError)
          }
        }

        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-[#181e29] rounded-xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Image
              src="/logo.jpeg"
              alt="Collab-Nest Logo"
              width={60}
              height={60}
              className="rounded-full shadow-lg mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-200 text-sm sm:text-base">Sign in to continue your AI journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition-all ${
                loading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-blue-200 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Create Account
              </a>
            </p>
          </div>

          {/* Quick Info */}
          <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg">
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Start earning with AI:</h3>
            <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
              <li>🤖 ChatGPT monetization strategies</li>
              <li>🎨 MidJourney art & design profits</li>
              <li>📹 AI video content creation</li>
              <li>💰 Multiple income streams</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
