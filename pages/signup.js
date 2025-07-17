// pages/signup.js
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Signup({ supabase }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/verify-email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        {/* ...same styling as before... */}
      </form>
    </div>
  )
}
