// pages/signup.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1) Create Auth account
    const { data, error: signError } = await supabase.auth.signUp({ email, password })
    if (signError) {
      setError(signError.message)
      setLoading(false)
      return
    }
    const userId = data.user.id

    // 2) Generate my referral code
    const myReferralCode = uuidv4().slice(0,8).toUpperCase()

    // 3) Insert user into your table
    await supabase
      .from('users')
      .insert([{
        id:           userId,
        email,
        has_paid:     false,
        referral_code: myReferralCode,
        referred_by:  null
      }], { ignoreDuplicates: true })

    // 4) If a ref param is present, log it
    const refCode = router.query.ref
    if (refCode) {
      const { data: refUser } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', refCode)
        .single()

      if (refUser?.id) {
        // log referral
        await supabase.from('referrals').insert([{
          referrer_id: refUser.id,
          referred_id: userId,
          status:      'unpaid'
        }])
        // update referred_by on user
        await supabase
          .from('users')
          .update({ referred_by: refUser.id })
          .eq('id', userId)
      }
    }

    setLoading(false)
    router.push('/verify-email')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSignup} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Create an Account</h1>
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
          className={`w-full py-2 text-white rounded ${
            loading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? 'Signing Up…' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}


