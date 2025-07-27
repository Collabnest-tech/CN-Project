import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

export default function ProfileReferrals() {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [payoutInfo, setPayoutInfo] = useState({
    email: '',
    fullName: '',
    country: '',
    paypalEmail: ''
  })
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const countries = [
    'United States',
    'Canada', 
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Belgium',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Austria',
    'Switzerland',
    'Ireland',
    'Portugal',
    'Poland',
    'Czech Republic',
    'Hungary',
    'Slovenia',
    'Slovakia',
    'Estonia',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Cyprus',
    'Greece',
    'Bulgaria',
    'Romania',
    'Croatia',
    'Japan',
    'Singapore',
    'Hong Kong',
    'New Zealand',
    'South Korea',
    'Taiwan',
    'Israel',
    'United Arab Emirates',
    'Saudi Arabia',
    'Kuwait',
    'Qatar',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'Egypt',
    'South Africa',
    'Kenya',
    'Nigeria',
    'Ghana',
    'Morocco',
    'Tunisia',
    'Algeria',
    'Brazil',
    'Mexico',
    'Argentina',
    'Chile',
    'Colombia',
    'Peru',
    'Uruguay',
    'Paraguay',
    'Bolivia',
    'Ecuador',
    'Venezuela',
    'Costa Rica',
    'Panama',
    'Guatemala',
    'Honduras',
    'El Salvador',
    'Nicaragua',
    'Dominican Republic',
    'Jamaica',
    'Trinidad and Tobago',
    'Barbados',
    'Bahamas',
    'India',
    'Malaysia',
    'Thailand',
    'Philippines',
    'Indonesia',
    'Vietnam',
    'Cambodia',
    'Laos',
    'Myanmar',
    'Bangladesh',
    'Sri Lanka',
    'Nepal',
    'Bhutan',
    'Maldives',
    'Pakistan',
    'Afghanistan',
    'Kazakhstan',
    'Uzbekistan',
    'Kyrgyzstan',
    'Tajikistan',
    'Turkmenistan',
    'Mongolia',
    'China',
    'Russia',
    'Ukraine',
    'Belarus',
    'Moldova',
    'Georgia',
    'Armenia',
    'Azerbaijan',
    'Turkey',
    'Cyprus',
    'Albania',
    'Bosnia and Herzegovina',
    'Montenegro',
    'Serbia',
    'North Macedonia',
    'Kosovo'
  ].sort()

  useEffect(() => {
    checkUserSession()
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    
    if (session) {
      await Promise.all([
        checkUserPayment(session.user.id),
        fetchReferralData(session.user.id),
        fetchPayoutInfo(session.user.id)
      ])
    }
    setLoading(false)
  }

  async function checkUserPayment(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('has_paid, referral_code')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setUserPaid(data.has_paid)
      setReferralCode(data.referral_code || generateReferralCode())
    }
  }

  async function fetchReferralData(userId) {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
    
    if (!error && data) {
      setReferralCount(data.length)
      const totalEarnings = data.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0)
      setEarnings(totalEarnings)
    }
  }

  async function fetchPayoutInfo(userId) {
    const { data, error } = await supabase
      .from('payout_info')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!error && data) {
      setPayoutInfo({
        email: data.email || '',
        fullName: data.full_name || '',
        country: data.country || '',
        paypalEmail: data.paypal_email || ''
      })
    }
  }

  function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function savePayoutInfo() {
    if (!session) return

    if (!payoutInfo.email || !payoutInfo.fullName || !payoutInfo.country || !payoutInfo.paypalEmail) {
      alert('Please fill in all fields')
      return
    }

    const { error } = await supabase
      .from('payout_info')
      .upsert({
        user_id: session.user.id,
        email: payoutInfo.email,
        full_name: payoutInfo.fullName,
        country: payoutInfo.country,
        paypal_email: payoutInfo.paypalEmail,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving payout info:', error)
      alert('Error saving payout information')
    } else {
      alert('Payout information saved successfully!')
      setShowPayoutForm(false)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center text-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
            Log In
          </a>
        </div>
      </div>
    )
  }

  const referralLink = `${window.location.origin}?ref=${referralCode}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Image
            src="/logo.jpeg"
            alt="Collab-Nest Logo"
            width={60}
            height={60}
            className="rounded-full shadow-lg mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Profile & Referrals</h1>
          <p className="text-blue-200 text-sm">Manage your account and earn commissions</p>
        </div>

        {/* Profile Section */}
        <div className="bg-[#181e29] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-blue-200 text-sm">Email</label>
              <div className="bg-gray-700 p-3 rounded-lg text-white">{session.user.email}</div>
            </div>
            <div>
              <label className="text-blue-200 text-sm">Course Access</label>
              <div className={`p-3 rounded-lg ${userPaid ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {userPaid ? '✅ Full Access' : '❌ Not Purchased'}
              </div>
            </div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Referral Dashboard</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{referralCount}</div>
              <div className="text-blue-200 text-sm">Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${earnings.toFixed(2)}</div>
              <div className="text-blue-200 text-sm">Earned</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-blue-200 text-sm">Your Referral Code</label>
              <div className="bg-gray-700 p-3 rounded-lg text-white font-mono text-center text-lg">
                {referralCode}
              </div>
            </div>
            
            <div>
              <label className="text-blue-200 text-sm">Referral Link</label>
              <div className="bg-gray-700 p-3 rounded-lg text-white text-xs break-all">
                {referralLink}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(referralLink)}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-all"
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Payout Information */}
        <div className="bg-[#181e29] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Payout Information</h2>
            <button
              onClick={() => setShowPayoutForm(!showPayoutForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              {showPayoutForm ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {showPayoutForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={payoutInfo.email}
                  onChange={(e) => setPayoutInfo({...payoutInfo, email: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  value={payoutInfo.fullName}
                  onChange={(e) => setPayoutInfo({...payoutInfo, fullName: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">Country</label>
                <select
                  value={payoutInfo.country}
                  onChange={(e) => setPayoutInfo({...payoutInfo, country: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">PayPal Email</label>
                <input
                  type="email"
                  value={payoutInfo.paypalEmail}
                  onChange={(e) => setPayoutInfo({...payoutInfo, paypalEmail: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  placeholder="paypal@email.com"
                />
              </div>

              <button
                onClick={savePayoutInfo}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all"
              >
                Save Payout Information
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-blue-200 text-sm">Email</label>
                <div className="bg-gray-700 p-3 rounded-lg text-white">
                  {payoutInfo.email || 'Not set'}
                </div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">Full Name</label>
                <div className="bg-gray-700 p-3 rounded-lg text-white">
                  {payoutInfo.fullName || 'Not set'}
                </div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">Country</label>
                <div className="bg-gray-700 p-3 rounded-lg text-white">
                  {payoutInfo.country || 'Not set'}
                </div>
              </div>
              <div>
                <label className="text-blue-200 text-sm">PayPal Email</label>
                <div className="bg-gray-700 p-3 rounded-lg text-white">
                  {payoutInfo.paypalEmail || 'Not set'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How Referrals Work */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">How Referrals Work</h2>
          <div className="space-y-2 text-sm text-blue-200">
            <p>• Share your referral link with friends</p>
            <p>• Earn $5 commission for each successful purchase</p>
            <p>• Minimum payout threshold: $25</p>
            <p>• Payments sent via PayPal monthly</p>
            <p>• Track your earnings in real-time</p>
          </div>
        </div>
      </div>
    </div>
  )
}