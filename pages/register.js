import { useUrdu } from '../components/UrduTranslate'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Register() {
  const { t } = useUrdu()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSignUp(e) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError(t("Passwords don't match"))
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Insert user data into custom users table WITHOUT referral code
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            has_paid: false,
            referral_code: null, // No referral code until they purchase
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting user data:', insertError)
        }

        setMessage(t('Registration successful! Please check your email to verify your account.'))
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }

    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred during registration')
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t("Create Account")}</h1>
            <p className="text-blue-200 text-sm sm:text-base">{t("Join thousands learning AI for income")}</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-900 border border-green-600 rounded-lg p-3 mb-4">
              <p className="text-green-200 text-sm">{message}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">{t("Full Name")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">{t("Email Address")}</label>
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
              <label className="block text-blue-200 text-sm font-medium mb-2">{t("Password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">{t("Confirm Password")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
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
              {loading ? t("Creating Account") + '...' : t("Create Account")}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-blue-200 text-sm">
              {t("Already have an account?")}{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                {t("Sign In")}
              </a>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg">
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{t("What you get:")}</h3>
            <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
              <li>✓ {t("Access to 8 comprehensive AI modules")}</li>
              <li>✓ {t("Lifetime course access")}</li>
              <li>✓ {t("Referral program - earn $5 per referral")}</li>
              <li>✓ {t("Real income-generating strategies")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}