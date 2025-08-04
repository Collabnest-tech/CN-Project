import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useUrdu } from '../components/UrduTranslate'

export default function ProfileReferrals() {
  const router = useRouter()
  const { t } = useUrdu()
  const [user, setUser] = useState(null)
  const [referredUsers, setReferredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })

  // ✅ Bank Details State
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    swiftCode: '',
    accountNumber: '',
    routingNumber: '',
    bankAddress: '',
    currency: ''
  })
  const [hasBankDetails, setHasBankDetails] = useState(false)
  const [updatingBank, setUpdatingBank] = useState(false)

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  const checkUserAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      // Get user data including referral info and bank details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        setError('Failed to load user data')
      } else {
        setUser(userData)
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || ''
        })

        // ✅ Load bank details if they exist
        if (userData.bank_details) {
          try {
            const parsedDetails = JSON.parse(userData.bank_details)
            setBankDetails(parsedDetails)
            setHasBankDetails(true)
          } catch (e) {
            console.error('Error parsing bank details:', e)
          }
        }
      }

      // Get users referred by this user
      const { data: referrals, error: referralsError } = await supabase
        .from('users')
        .select('id, full_name, email, payment_date, referred_by_code')
        .eq('referred_by', session.user.id)
        .order('payment_date', { ascending: false })

      if (!referralsError) {
        setReferredUsers(referrals || [])
      }

    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      setUser(prev => ({
        ...prev,
        full_name: formData.full_name.trim()
      }))

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)

    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  // ✅ Bank Details Update Function
  const handleUpdateBankDetails = async () => {
    // Validate required fields
    const requiredFields = ['bankName', 'accountHolder', 'swiftCode', 'accountNumber', 'bankAddress', 'currency']
    const missingFields = requiredFields.filter(field => !bankDetails[field]?.trim())
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
      setTimeout(() => setError(''), 5000)
      return
    }
    
    setUpdatingBank(true)
    setMessage('')
    setError('')

    try {
      // Convert bank details object to JSON string for storage in users table
      const bankDetailsJson = JSON.stringify({
        ...bankDetails,
        updatedAt: new Date().toISOString()
      })
      
      // Save to users table bank_details column
      const { error } = await supabase
        .from('users')
        .update({ bank_details: bankDetailsJson })
        .eq('id', user.id)
      
      if (error) throw error
      
      setHasBankDetails(true)
      setMessage('Bank details saved successfully! 🏦')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving bank details:', error)
      setError('Error saving bank details. Please try again.')
    } finally {
      setUpdatingBank(false)
    }
  }

  const copyReferralCode = () => {
    if (user?.referral_code) {
      const referralUrl = `https://www.collab-nest.com?ref=${user.referral_code}`
      navigator.clipboard.writeText(referralUrl)
      setMessage('Referral link copied to clipboard!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t("Profile & Referrals")}</h1>
          <Link href="/courses">
            <a className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              {t("Back to Courses")}
            </a>
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-900 border border-green-400 rounded-lg">
            <p className="text-green-200">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-400 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-900 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ${(user?.referral_earnings || 0).toFixed(2)}
            </div>
            <div className="text-green-200">{t("Total Earnings")}</div>
          </div>
          <div className="bg-blue-900 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {user?.referral_count || 0}
            </div>
            <div className="text-blue-200">{t("Successful Referrals")}</div>
          </div>
          <div className="bg-purple-900 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">$5</div>
            <div className="text-purple-200">{t("Per Referral")}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Account Details */}
          <div className="bg-[#1a2233] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">{t("Account Details")}</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Full Name")}
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder={t("Enter your full name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Email Address")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t("Email cannot be changed. Contact support if needed.")}
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {updating ? t("Updating...") : t("Update Profile")}
              </button>
            </form>

            {/* Sign Out Button */}
            <div className="mt-6 pt-6 border-t border-gray-600">
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("Sign Out")}
              </button>
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-[#1a2233] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">{t("Referral Program")}</h2>
            
            {/* Referral Code */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Your Referral Code")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={user?.referral_code || 'Loading...'}
                    readOnly
                    className="flex-1 px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white font-mono"
                  />
                  <button
                    onClick={copyReferralCode}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
                  >
                    {t("Copy Link")}
                  </button>
                </div>
              </div>

              <div className="bg-purple-900 rounded-lg p-4">
                <h3 className="font-bold text-purple-200 mb-2">{t("Your Referral Link")}:</h3>
                <code className="text-xs text-purple-300 break-all">
                  https://www.collab-nest.com?ref={user?.referral_code || 'LOADING'}
                </code>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-200">{t("How It Works")}:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  {t("Share your referral link with friends")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  {t("They get $5 off their purchase")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  {t("You earn $5 for each successful referral")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">•</span>
                  {t("Earnings are tracked automatically")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ✅ Bank Account Details Section */}
        <div className="bg-[#1a2233] rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{t("Bank Account Details")}</h2>
            {hasBankDetails && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                ✓ {t("Saved")}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-6">
            {t("Provide your bank details for international wire transfers when withdrawing earnings.")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("Bank Name")} *
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                placeholder={t("Enter your bank name")}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("Account Holder Name")} *
              </label>
              <input
                type="text"
                value={bankDetails.accountHolder}
                onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                placeholder={t("Full name as on bank account")}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* SWIFT/BIC Code */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("SWIFT/BIC Code")} *
              </label>
              <input
                type="text"
                value={bankDetails.swiftCode}
                onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                placeholder={t("e.g. ABCDUS33XXX")}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Account Number/IBAN */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("Account Number / IBAN")} *
              </label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                placeholder={t("Your account number or IBAN")}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Routing Number */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("Routing Number")}
                <span className="text-gray-500 text-xs ml-1">({t("US banks only")})</span>
              </label>
              <input
                type="text"
                value={bankDetails.routingNumber}
                onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                placeholder={t("9-digit routing number")}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t("Account Currency")} *
              </label>
              <select
                value={bankDetails.currency}
                onChange={(e) => setBankDetails({...bankDetails, currency: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t("Select currency")}</option>
                <option value="USD">{t("USD - US Dollar")}</option>
                <option value="EUR">{t("EUR - Euro")}</option>
                <option value="GBP">{t("GBP - British Pound")}</option>
                <option value="CAD">{t("CAD - Canadian Dollar")}</option>
                <option value="AUD">{t("AUD - Australian Dollar")}</option>
                <option value="OTHER">{t("Other")}</option>
              </select>
            </div>
          </div>

          {/* Bank Address - Full Width */}
          <div className="mt-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t("Bank Address")} *
            </label>
            <textarea
              value={bankDetails.bankAddress}
              onChange={(e) => setBankDetails({...bankDetails, bankAddress: e.target.value})}
              placeholder={t("Complete bank address including country")}
              rows="3"
              className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">🔒</span>
              <div>
                <h4 className="text-blue-300 font-semibold text-sm">{t("Secure & Encrypted")}</h4>
                <p className="text-blue-200 text-xs mt-1">
                  {t("Your banking information is encrypted and stored securely. We only use this for processing your referral earnings withdrawals.")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdateBankDetails}
              disabled={updatingBank}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {updatingBank ? t("Updating...") : t("Save Bank Details")}
            </button>
            
            <button
              onClick={() => setBankDetails({
                bankName: '',
                accountHolder: '',
                swiftCode: '',
                accountNumber: '',
                routingNumber: '',
                bankAddress: '',
                currency: ''
              })}
              className="px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              {t("Clear")}
            </button>
          </div>
        </div>

        {/* Referred Users */}
        <div className="bg-[#1a2233] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">{t("Your Referrals")} ({referredUsers.length})</h2>
          
          {referredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">{t("No referrals yet")}</div>
              <p className="text-sm text-gray-500">
                {t("Start sharing your referral link to earn money!")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3">{t("Name")}</th>
                    <th className="text-left py-3">{t("Email")}</th>
                    <th className="text-left py-3">{t("Date")}</th>
                    <th className="text-left py-3">{t("Earnings")}</th>
                  </tr>
                </thead>
                <tbody>
                  {referredUsers.map((referral, index) => (
                    <tr key={referral.id} className="border-b border-gray-700">
                      <td className="py-3">
                        {referral.full_name || t("Anonymous")}
                      </td>
                      <td className="py-3 text-gray-300">
                        {referral.email}
                      </td>
                      <td className="py-3 text-gray-300">
                        {new Date(referral.payment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-green-400 font-semibold">
                        +$5.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}