import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileReferrals() {
  const [session, setSession] = useState(null)
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    country: 'US'
  })
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayouts: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    
    if (session) {
      await Promise.all([
        loadBankDetails(session.user.id),
        loadReferralStats(session.user.id)
      ])
    }
    setLoading(false)
  }

  async function loadBankDetails(userId) {
    const { data, error } = await supabase
      .from('bank_details')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!error && data) {
      setBankDetails(data)
    }
  }

  async function loadReferralStats(userId) {
    // This would integrate with Stripe's referral system
    // For now, showing placeholder data
    setReferralStats({
      totalReferrals: 0,
      totalEarnings: 0,
      pendingPayouts: 0
    })
  }

  async function handleSaveBankDetails(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('bank_details')
        .upsert({
          user_id: session.user.id,
          ...bankDetails,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setMessage('Bank details saved successfully!')
    } catch (error) {
      console.error('Error saving bank details:', error)
      setMessage('Error saving bank details. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleInputChange(field, value) {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Please log in to access this page.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Referral Dashboard
        </h1>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#181e29] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-400">{referralStats.totalReferrals}</div>
            <div className="text-blue-200">Total Referrals</div>
          </div>
          <div className="bg-[#181e29] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-green-400">${referralStats.totalEarnings}</div>
            <div className="text-blue-200">Total Earnings</div>
          </div>
          <div className="bg-[#181e29] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-400">${referralStats.pendingPayouts}</div>
            <div className="text-blue-200">Pending Payouts</div>
          </div>
        </div>

        {/* Bank Details Form */}
        <div className="bg-[#181e29] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🏦 Bank Details for Payouts
          </h2>
          
          <form onSubmit={handleSaveBankDetails} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-300 font-semibold mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.account_holder}
                  onChange={(e) => handleInputChange('account_holder', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-blue-300 font-semibold mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-300 font-semibold mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-blue-300 font-semibold mb-2">
                  Routing Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.routing_number}
                  onChange={(e) => handleInputChange('routing_number', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-300 font-semibold mb-2">
                  Country
                </label>
                <select
                  value={bankDetails.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-200 flex items-center"
              >
                {saving && <svg className="animate-spin h-5 w-5 mr-3 ..." xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path></svg>}
                Save Bank Details
              </button>
            </div>
          </form>

          {message && (
            <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}