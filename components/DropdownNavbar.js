// components/DropdownNavbar.js
import React, { useState, useEffect } from 'react'
import { createPortal }       from 'react-dom'

function DropdownNavbar({ session }) {
  const [open,   setOpen]   = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null   // prevent render on server

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const menu = (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Nav panel */}
      <nav className="relative ml-auto mt-16 mr-4 w-64 h-auto bg-white shadow-xl rounded-lg p-6 space-y-4">
        {/* … your links & buttons … */}
      </nav>
    </div>
  )

  return (
    <>
      <button
        className="fixed top-4 right-4 z-[10000] bg-purple-700 px-4 py-2 rounded text-white"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Close Menu' : 'Open Menu'}
      </button>

      {open && createPortal(menu, document.body)}
    </>
  )
}

export default DropdownNavbar
