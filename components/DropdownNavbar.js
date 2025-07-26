import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../lib/supabase'

export default function DropdownNavbar({ session }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.dropdown-container')) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    window.location.href = '/'
  }

  return (
    <div className="dropdown-container fixed top-4 right-4 z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <nav className="fixed top-16 right-4 w-64 bg-white shadow-lg flex flex-col py-6 px-4 space-y-4 z-[101] rounded-xl transition-all">
          <div className="flex items-center mb-4">
            <Image
              src="/logo.jpeg"
              alt="Collab-Nest Logo"
              width={40}
              height={40}
              className="rounded-full shadow-lg"
            />
            <span className="ml-3 text-lg font-bold text-purple-700">Collab-Nest</span>
          </div>
          <Link href="/">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => setOpen(false)}>Home</a>
          </Link>
          <Link href="/courses">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => setOpen(false)}>Courses</a>
          </Link>
          <Link href="/profile-referrals">
            <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => setOpen(false)}>Profile & Referrals</a>
          </Link>
          {session ? (
            <>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Signed in as:</p>
                <p className="text-sm font-semibold text-purple-700">{session.user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 rounded hover:bg-red-100 text-red-600 font-semibold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => setOpen(false)}>Login</a>
              </Link>
              <Link href="/register">
                <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => setOpen(false)}>Register</a>
              </Link>
            </>
          )}
        </nav>
      )}
    </div>
  )
}