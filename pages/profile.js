import React, { useState, useEffect } from 'react';

const BankDetails = () => {
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

  // Replace the handleUpdateBankDetails function with this updated version:
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

  // Add function to load existing bank details:
  const loadBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('bank_details')
        .eq('id', session.user.id)
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

  // Add this useEffect to load bank details when session is available:
  useEffect(() => {
    if (session) {
      loadBankDetails()
    }
  }, [session])

  return (
    <div className="bg-[#181e29] rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Bank Account Details</h3>
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

        {/* Routing Number (Optional) */}
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
  );
};

export default BankDetails;