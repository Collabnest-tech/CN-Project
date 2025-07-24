import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

export default function DropdownNavbar({ session }) {
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="relative">
      {/* Logo top left */}
      <div className="absolute top-4 left-4 z-20">
        <Image
          src="/logo.jpeg"
          alt="Collab-Nest Logo"
          width={48}
          height={48}
          className="rounded-full shadow-lg"
        />
      </div>
      <button
        className="m-4 ml-20 px-4 py-2 bg-purple-700 text-white rounded shadow hover:bg-purple-800 z-30"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>
      {open && (
        <nav className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg flex flex-col py-8 px-4 space-y-4 z-50 rounded transition-all">
          <Link href="/">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Home</a>
          </Link>          
          <Link href="/courses">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Courses</a>
          </Link>
          <Link href="/profile-referrals">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">My Profile & Referrals</a>
          </Link>
          {/* Adaptive Auth Buttons */}
          {!session ? (
            <>
              <Link href="/login">
                <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Log In</a>
              </Link>
              <Link href="/signup">
                <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Sign Up</a>
              </Link>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-left"
            >
              Sign Out
            </button>
          )}
        </nav>
      )}
    </div>
  )
}