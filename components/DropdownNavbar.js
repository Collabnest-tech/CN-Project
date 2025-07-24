import { useState, useEffect } from 'react'
import { createPortal }       from 'react-dom'
import Link                   from 'next/link'
import { supabase }           from '../lib/supabase'
import Image                  from 'next/image'

export default function DropdownNavbar({ session }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!mounted) return null

  // the overlay + nav panel
  const menu = (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setOpen(false)}
      />
      {/* side‑panel */}
      <nav className="relative ml-auto mt-16 mr-4 w-64 h-fit bg-white shadow-lg flex flex-col py-6 px-4 space-y-4 rounded-xl">
        <div className="flex items-center mb-4">
          <Image
            src="/logo.jpeg"
            alt="Collab-Nest Logo"
            width={40}
            height={40}
            className="rounded-full shadow-lg"
          />
          <span className="ml-3 text-lg font-bold text-purple-700">
            Collab-Nest
          </span>
        </div>
        <Link href="/"><a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Home</a></Link>
        <Link href="/courses"><a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Courses</a></Link>
        <Link href="/profile-referrals">
          <a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">
            My Profile & Referrals
          </a>
        </Link>
        {!session ? (
          <>
            <Link href="/login"><a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Log In</a></Link>
            <Link href="/signup"><a className="block px-4 py-2 rounded hover:bg-purple-100 text-purple-700 font-semibold">Sign Up</a></Link>
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
    </div>
  )

  return (
    <>
      {/* trigger button */}
      <button
        className="fixed top-4 right-4 px-4 py-2 bg-purple-700 text-white rounded shadow hover:bg-purple-800 z-[100]"
        onClick={() => setOpen(open => !open)}
        style={{ transition: 'background 0.2s' }}
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>

      {/* portal out the overlay when open */}
      {open && createPortal(menu, document.body)}
    </>
  )
}
