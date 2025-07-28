import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const Profile = () => {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    swiftCode: '',
    accountNumber: '',
    routingNumber: '',
    bankAddress: '',
    currency: ''
  });

  const [updating, setUpdating] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);

  // ✅ Check session on component mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      setSession(session)
      
      // Load bank details after session is set
      if (session) {
        await loadBankDetails(session.user.id)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Updated to accept userId parameter
  const loadBankDetails = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('bank_details')
        .eq('id', userId)
        .single()
    
      if (error) throw error
    
      if (data?.bank_details) {
        const parsedDetails = JSON.parse(data.bank_details)
        setBankDetails(parsedDetails)
        setHasBankDetails(true)
      } else {
        setHasBankDetails(false)
      }
    } catch (error) {
      console.error('Error loading bank details:', error)
      setHasBankDetails(false)
    }
  }

  const handleUpdateBankDetails = async () => {
    // Validate required fields
    const requiredFields = ['bankName', 'accountHolder', 'swiftCode', 'accountNumber', 'bankAddress', 'currency']
    const missingFields = requiredFields.filter(field => !bankDetails[field]?.trim())
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    setUpdating(true)
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
        .eq('id', session.user.id)
      
      if (error) throw error
      
      setHasBankDetails(true)
      console.log('Bank details saved:', bankDetails)
      alert('Bank details saved successfully! 🏦')
    } catch (error) {
      console.error('Error saving bank details:', error)
      alert('Error saving bank details. Please try again.')
    } finally {
      setUpdating(false)
    }
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // ✅ Don't render if no session
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Profile & Referrals</h1>
            <p className="text-blue-200">Manage your account and earnings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-900/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">$100.00</div>
              <div className="text-green-200">Total Earnings</div>
            </div>
            <div className="bg-blue-900/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">20</div>
              <div className="text-blue-200">Successful Referrals</div>
            </div>
            <div className="bg-purple-900/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$5</div>
              <div className="text-purple-200">Per Referral</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ✅ Bank Account Details Section */}
            <div className="bg-[#181e29] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Bank Account Details</h3>
                {hasBankDetails && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    ✓ Saved
                  </span>
                )}
              </div>
              <p className="text-blue-200 text-sm mb-6">
                Provide your bank details for international wire transfers when withdrawing earnings.
              </p>
              
              <div className="space-y-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    placeholder="Enter your bank name"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                    placeholder="Full name as on bank account"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* SWIFT/BIC Code */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    SWIFT/BIC Code *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.swiftCode}
                    onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                    placeholder="e.g. ABCDUS33XXX"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Account Number/IBAN */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Account Number / IBAN *
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    placeholder="Your account number or IBAN"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Routing Number */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Routing Number
                    <span className="text-gray-500 text-xs ml-1">(US banks only)</span>
                  </label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                    placeholder="9-digit routing number"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bank Address */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bank Address *
                  </label>
                  <textarea
                    value={bankDetails.bankAddress}
                    onChange={(e) => setBankDetails({...bankDetails, bankAddress: e.target.value})}
                    placeholder="Complete bank address including country"
                    rows="3"
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Account Currency *
                  </label>
                  <select
                    value={bankDetails.currency}
                    onChange={(e) => setBankDetails({...bankDetails, currency: e.target.value})}
                    className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-lg">🔒</span>
                  <div>
                    <h4 className="text-blue-300 font-semibold text-sm">Secure & Encrypted</h4>
                    <p className="text-blue-200 text-xs mt-1">
                      Your banking information is encrypted and stored securely. We only use this for processing your referral earnings withdrawals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateBankDetails}
                  disabled={updating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Bank Details'}
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
                  Clear
                </button>
              </div>
            </div>

            {/* Referral Program */}
            <div className="bg-[#181e29] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Referral Program</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Your Referral Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="LOADING..."
                      readOnly
                      className="flex-1 px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white"
                    />
                    <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="bg-purple-900/30 rounded-lg p-4">
                  <h4 className="text-purple-300 font-semibold mb-2">Your Referral Link:</h4>
                  <p className="text-purple-200 text-sm break-all">
                    https://www.collab-nest.com?ref=LOADING
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">How It Works:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Share your referral link with friends
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      They get $5 off their purchase
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      You earn $5 for each successful referral
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      Earnings are tracked automatically
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Referrals List */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6">Your Referrals (0)</h3>
            <div className="bg-[#181e29] rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h4 className="text-xl font-semibold text-white mb-2">No referrals yet</h4>
              <p className="text-gray-400">Start sharing your referral link to earn commissions!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
};

export default Profile;