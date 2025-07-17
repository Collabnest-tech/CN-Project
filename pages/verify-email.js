// pages/verify-email.js
import Link from 'next/link'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-700 mb-6">
          We’ve sent a confirmation link to your email address.<br/>
          Please check your inbox (and spam folder) and click the link to complete your registration.
        </p>
        <Link href="/login">
          <a className="inline-block px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            I’ve confirmed, take me to Log In
          </a>
        </Link>
        <p className="mt-4 text-sm text-gray-600">
          Didn’t receive an email?&nbsp;
          <button
            onClick={() => window.location.reload()}
            className="text-purple-600 hover:underline"
          >
            Resend link
          </button>
        </p>
      </div>
    </div>
  )
}
