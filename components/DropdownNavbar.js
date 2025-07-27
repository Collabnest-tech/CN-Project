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
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200"
        aria-label="Menu"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <nav className="fixed top-12 sm:top-16 right-4 w-56 sm:w-64 bg-white shadow-xl flex flex-col py-4 sm:py-6 px-3 sm:px-4 space-y-3 sm:space-y-4 z-[101] rounded-xl transition-all">
          <div className="flex items-center mb-3 sm:mb-4">
            <Image
              src="/logo.jpeg"
              alt="Collab-Nest Logo"
              width={32}
              height={32}
              className="rounded-full shadow-lg sm:w-10 sm:h-10"
            />
            <span className="ml-2 sm:ml-3 text-base sm:text-lg font-bold text-purple-700">Collab-Nest</span>
          </div>
          
          <Link href="/">
            <a className="block px-3 sm:px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-sm sm:text-base" onClick={() => setOpen(false)}>
              Home
            </a>
          </Link>
          
          <Link href="/courses">
            <a className="block px-3 sm:px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-sm sm:text-base" onClick={() => setOpen(false)}>
              Courses
            </a>
          </Link>
          
          <Link href="/profile-referrals">
            <a className="block px-3 sm:px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-sm sm:text-base" onClick={() => setOpen(false)}>
              Profile & Referrals
            </a>
          </Link>
          
          {session ? (
            <>
              <div className="border-t pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Signed in as:</p>
                <p className="text-xs sm:text-sm font-semibold text-purple-700 truncate">{session.user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 sm:px-4 py-2 rounded hover:bg-red-100 text-red-600 font-semibold text-sm sm:text-base"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="block px-3 sm:px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-sm sm:text-base" onClick={() => setOpen(false)}>
                  Login
                </a>
              </Link>
              <Link href="/register">
                <a className="block px-3 sm:px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold text-sm sm:text-base" onClick={() => setOpen(false)}>
                  Sign Up
                </a>
              </Link>
            </>
          )}
        </nav>
      )}
    </div>
  )
}