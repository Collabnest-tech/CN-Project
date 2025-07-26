import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function PaymentInstructions() {
  const router = useRouter()
  const { id } = router.query
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPaymentIntent()
    }
  }, [id])

  async function fetchPaymentIntent() {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPaymentIntent(data)
    } catch (error) {
      console.error('Error fetching payment intent:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading payment instructions...</div>
      </div>
    )
  }

  if (!paymentIntent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Payment not found</div>
      </div>
    )
  }

  const getPaymentInstructions = () => {
    const { country, payment_method, amount, currency } = paymentIntent

    switch (country) {
      case 'PK':
        return {
          title: 'Pakistan Payment Instructions',
          methods: {
            bank_transfer: {
              title: 'Bank Transfer',
              details: [
                'Bank: HBL Bank',
                'Account Title: Collab-Nest',
                'Account Number: 12345678901',
                'IBAN: PK36HABB0012345678901',
                `Amount: PKR ${amount}`
              ]
            },
            mobile_wallet: {
              title: 'JazzCash / EasyPaisa',
              details: [
                'JazzCash: 03XX-XXXXXXX',
                'EasyPaisa: 03XX-XXXXXXX',
                `Amount: PKR ${amount}`,
                'Send screenshot after payment'
              ]
            }
          }
        }
      case 'BD':
        return {
          title: 'Bangladesh Payment Instructions',
          methods: {
            bank_transfer: {
              title: 'Bank Transfer',
              details: [
                'Bank: Dutch-Bangla Bank',
                'Account Name: Collab-Nest',
                'Account Number: 1234567890',
                `Amount: BDT ${amount}`
              ]
            },
            mobile_wallet: {
              title: 'bKash / Nagad',
              details: [
                'bKash: 01XXX-XXXXXX',
                'Nagad: 01XXX-XXXXXX',
                `Amount: BDT ${amount}`
              ]
            }
          }
        }
      case 'AE':
        return {
          title: 'UAE Payment Instructions',
          methods: {
            bank_transfer: {
              title: 'Bank Transfer',
              details: [
                'Bank: Emirates NBD',
                'Account Name: Collab-Nest',
                'IBAN: AE070331234567890123456',
                `Amount: AED ${amount}`
              ]
            }
          }
        }
      default:
        return {
          title: 'Payment Instructions',
          methods: {
            bank_transfer: {
              title: 'Bank Transfer',
              details: [`Amount: ${currency} ${amount}`]
            }
          }
        }
    }
  }

  const instructions = getPaymentInstructions()
  const selectedMethod = instructions.methods[paymentIntent.payment_method]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#181e29] rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">{instructions.title}</h1>
          
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{selectedMethod?.title}</h2>
            <div className="space-y-2">
              {selectedMethod?.details.map((detail, index) => (
                <p key={index} className="text-blue-200">{detail}</p>
              ))}
            </div>
          </div>

          <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-yellow-400 mb-2">📋 Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-yellow-200">
              <li>Complete the payment using above details</li>
              <li>Take a screenshot of payment confirmation</li>
              <li>Send screenshot to: payments@collab-nest.com</li>
              <li>Include your email and payment ID: {paymentIntent.id}</li>
              <li>Access will be granted within 24 hours</li>
            </ol>
          </div>

          <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg mb-6">
            <p className="text-red-200 text-sm">
              ⚠️ Payment ID: <strong>{paymentIntent.id}</strong><br/>
              Please include this ID in your payment confirmation email.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
            >
              I Have Completed Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}